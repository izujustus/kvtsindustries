'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---
const ItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1),
  unitCost: z.coerce.number().min(0),
});

const POSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  date: z.string().min(1, "Date is required"),
  items: z.array(ItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

// 1. GENERATE PO NUMBER (PO-YYMM-XXX)
async function generatePONumber() {
  const date = new Date();
  const prefix = `PO-${date.getFullYear().toString().slice(-2)}${String(date.getMonth()+1).padStart(2, '0')}`;
  const count = await prisma.purchaseOrder.count({ where: { poNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

// 2. CREATE PURCHASE ORDER
export async function createPurchaseOrder(prevState: any, formData: FormData) {
  // Fix: Correctly parse the JSON string from the hidden input
  const rawItems = formData.get('items');
  const itemsParsed = typeof rawItems === 'string' ? JSON.parse(rawItems) : [];

  const rawData = {
    supplierId: formData.get('supplierId'),
    date: formData.get('date'),
    items: itemsParsed,
    notes: formData.get('notes'),
  };

  const validated = POSchema.safeParse(rawData);
  
  if (!validated.success) {
    console.error("Validation Errors:", validated.error.flatten().fieldErrors);
    return { message: 'Validation Failed. Check inputs.', errors: validated.error.flatten().fieldErrors };
  }

  const { supplierId, date, items, notes } = validated.data;

  // Calculate Total
  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  try {
    const poNumber = await generatePONumber();

    // Fetch a system user to link createdById (Prevents crash if auth missing)
    const systemUser = await prisma.user.findFirst(); 
    if(!systemUser) return { success: false, message: 'System Error: No valid user found in database.' };

    await prisma.purchaseOrder.create({
      data: {
        poNumber,
        supplierId,
        date: new Date(date),
        status: 'SENT', 
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
    return { success: true, message: 'Purchase Order Created' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Database Error: Could not create order.' };
  }
}

// 3. RECEIVE GOODS (The "Supply" Trigger)
export async function receivePurchaseOrder(orderId: string) {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: orderId },
      include: { items: true }
    });

    if (!order) return { success: false, message: 'Order not found' };
    if (order.status === 'RECEIVED') return { success: false, message: 'Already received' };

    await prisma.$transaction(async (tx) => {
      // A. Update Inventory (Add Stock)
      for (const item of order.items) {
        // 1. Create Movement Record
        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'PURCHASE_RECEIPT',
            quantity: item.quantity,
            referenceId: order.poNumber,
            date: new Date(),
          }
        });

        // 2. Update Product Stock
        await tx.product.update({
          where: { id: item.productId },
          data: { 
            stockOnHand: { increment: item.quantity },
            // Optional: Update cost price here if needed
          }
        });
      }

      // B. Update Supplier Balance
      await tx.supplier.update({
        where: { id: order.supplierId },
        data: { balance: { increment: order.totalAmount } }
      });

      // C. Mark PO as Received
      await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: 'RECEIVED' }
      });
    });

    revalidatePath('/dashboard/purchases');
    return { success: true, message: 'Goods Received & Inventory Updated' };
  } catch (e) {
    console.error(e);
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