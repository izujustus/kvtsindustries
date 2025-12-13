'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---
const ItemSchema = z.object({
  productId: z.string().min(1, "Product selection is required"), // Specific error
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unitCost: z.coerce.number().min(0, "Cost cannot be negative"),
});

const POSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  date: z.string().min(1, "Date is required"),
  items: z.array(ItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

// 1. GENERATE PO NUMBER
async function generatePONumber() {
  const date = new Date();
  const prefix = `PO-${date.getFullYear().toString().slice(-2)}${String(date.getMonth()+1).padStart(2, '0')}`;
  const count = await prisma.purchaseOrder.count({ where: { poNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

// 2. CREATE PURCHASE ORDER
export async function createPurchaseOrder(prevState: any, formData: FormData) {
  const rawItems = formData.get('items');
  // [FIX] Handle potential JSON parse errors
  let itemsParsed = [];
  try {
    itemsParsed = typeof rawItems === 'string' ? JSON.parse(rawItems) : [];
  } catch (e) {
    return { success: false, message: 'System Error: Invalid items format.' };
  }

  // [FIX] Filter out empty rows (This solves "Validation Failed" if you have an empty row)
  itemsParsed = itemsParsed.filter((i: any) => i.productId && i.productId !== '');

  if (itemsParsed.length === 0) {
    return { success: false, message: 'Please add at least one valid product.' };
  }

  const rawData = {
    supplierId: formData.get('supplierId'),
    date: formData.get('date'),
    items: itemsParsed,
    notes: formData.get('notes'),
  };

  const validated = POSchema.safeParse(rawData);
  
  // [FIX] Detailed Error Reporting
  if (!validated.success) {
    const firstError = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    const itemError = Object.values(validated.error.flatten().fieldErrors.items || {})[0];
    return { success: false, message: `Validation Failed: ${firstError || itemError || 'Check inputs'}` };
  }

  const { supplierId, date, items, notes } = validated.data;
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  try {
    const poNumber = await generatePONumber();
    const systemUser = await prisma.user.findFirst(); 
    if(!systemUser) return { success: false, message: 'System Error: No valid user found.' };

    await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        date: new Date(date),
        status: 'SENT', 
        paymentStatus: 'UNPAID', // New Field
        paidAmount: 0,           // New Field
        totalAmount,
        createdById: systemUser.id, 
        notes: notes || '',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitCost: item.unitCost,
            total: item.quantity * item.unitCost
          }))
        }
      }
    });

    revalidatePath('/dashboard/purchases');
    return { success: true, message: 'Purchase Order Created Successfully' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Database Error: Could not create order.' };
  }
}

// 3. RECEIVE GOODS
export async function receivePurchaseOrder(orderId: string) {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return { success: false, message: 'Order not found' };
    if (order.status === 'RECEIVED') return { success: false, message: 'Already received' };

    await prisma.$transaction(async (tx) => {
      // 1. Update Inventory
      for (const item of order.items) {
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'PURCHASE_RECEIPT',
            quantity: item.quantity,
            referenceId: order.poNumber,
            date: new Date(),
          }
        });
        await tx.product.update({
          where: { id: item.productId },
          data: { stockOnHand: { increment: item.quantity } }
        });
      }

      // 2. Update Supplier Balance
      await tx.supplier.update({
        where: { id: order.supplierId },
        data: { balance: { increment: order.totalAmount } }
      });

      // 3. Update PO Status
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: 'RECEIVED' }
      });
    });

    revalidatePath('/dashboard/purchases');
    return { success: true, message: 'Goods Received & Stock Updated' };
  } catch (e) {
    return { success: false, message: 'Failed to receive goods' };
  }
}

// 4. DELETE PO
export async function deletePurchaseOrder(id: string) {
  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (po?.status === 'RECEIVED') return { success: false, message: 'Cannot delete received orders.' };
    await prisma.purchaseOrder.delete({ where: { id } });
    revalidatePath('/dashboard/purchases');
    return { success: true, message: 'Order Deleted' };
  } catch (e) {
    return { success: false, message: 'Failed to delete' };
  }
}

// 5. [NEW] PAY SUPPLIER (Link Payment to Order)
export async function paySupplierOrder(prevState: any, formData: FormData) {
  const orderId = formData.get('orderId') as string;
  const amount = Number(formData.get('amount'));
  const method = formData.get('method') as any;
  const notes = formData.get('notes') as string;

  if (!amount || amount <= 0) return { success: false, message: 'Invalid Amount' };

  try {
    const order = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: 'Order not found' };

    // Calculate New Status
    const newPaidAmount = Number(order.paidAmount) + amount;
    const isPaid = newPaidAmount >= Number(order.totalAmount);
    const newStatus = isPaid ? 'PAID' : 'PARTIAL';

    // Get Base Currency
    const currency = await prisma.currency.findFirst({ where: { isBaseCurrency: true } });
    if(!currency) throw new Error("No Base Currency");

    await prisma.$transaction(async (tx) => {
        // 1. Create Payment Record linked to PO
        await tx.supplierPayment.create({
            data: {
                paymentNumber: `SP-${Date.now().toString().slice(-6)}`,
                supplierId: order.supplierId,
                purchaseOrderId: order.id, // LINKED HERE
                amount: amount,
                method: method,
                currencyId: currency.id,
                date: new Date(),
                notes: notes
            }
        });

        // 2. Update PO Financials
        await tx.purchaseOrder.update({
            where: { id: order.id },
            data: { 
                paidAmount: { increment: amount },
                paymentStatus: newStatus
            }
        });

        // 3. Reduce Supplier Balance (Ledger)
        await tx.supplier.update({
            where: { id: order.supplierId },
            data: { balance: { decrement: amount } }
        });
    });

    revalidatePath('/dashboard/purchases');
    return { success: true, message: 'Payment Recorded Successfully' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Payment Failed' };
  }
}