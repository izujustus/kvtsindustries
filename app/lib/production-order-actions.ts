'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// SCHEMAS
const OrderSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH']),
  startDate: z.string().min(1, "Start Date is required"),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

// 1. GENERATE ORDER NUMBER (WO-YYMM-XXX)
async function generateOrderNumber() {
  const date = new Date();
  const prefix = `WO-${date.getFullYear().toString().slice(-2)}${String(date.getMonth()+1).padStart(2, '0')}`;
  const count = await prisma.productionOrder.count({ where: { orderNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(3, '0')}`;
}

// 2. SAVE ORDER (Draft/Create/Edit)
export async function saveProductionOrder(prevState: any, formData: FormData) {
  const rawData = {
    id: formData.get('id'),
    productId: formData.get('productId'),
    quantity: formData.get('quantity'),
    priority: formData.get('priority'),
    startDate: formData.get('startDate'),
    dueDate: formData.get('dueDate'),
    notes: formData.get('notes'),
  };

  const validated = OrderSchema.safeParse(rawData);
  if (!validated.success) return { errors: validated.error.flatten().fieldErrors, message: "Validation Failed" };

  const { id, ...data } = validated.data;

  try {
    if (id) {
      await prisma.productionOrder.update({
        where: { id },
        data: {
          productId: data.productId,
          quantity: data.quantity,
          priority: data.priority,
          startDate: new Date(data.startDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          notes: data.notes
        }
      });
    } else {
      const orderNumber = await generateOrderNumber();
      await prisma.productionOrder.create({
        data: {
          orderNumber,
          productId: data.productId,
          quantity: data.quantity,
          priority: data.priority,
          startDate: new Date(data.startDate),
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          notes: data.notes,
          status: 'DRAFT'
        }
      });
    }
    revalidatePath('/dashboard/production/orders');
    return { success: true, message: 'Work Order Saved' };
  } catch (e) {
    return { success: false, message: 'Database Error' };
  }
}

// 3. UPDATE STATUS (The Workflow Engine)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    // A. Business Logic Checks
    const order = await prisma.productionOrder.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: 'Order not found' };

    // Prevent going back to Draft if already started
    if (order.status === 'IN_PROGRESS' && newStatus === 'DRAFT') {
      return { success: false, message: 'Cannot revert active order to Draft.' };
    }

    // Update
    await prisma.productionOrder.update({
      where: { id: orderId },
      data: { status: newStatus as any }
    });

    revalidatePath('/dashboard/production/orders');
    return { success: true, message: `Status updated to ${newStatus}` };
  } catch (e) {
    return { success: false, message: 'Failed to update status' };
  }
}

// 4. DELETE ORDER
export async function deleteOrder(id: string) {
  try {
    await prisma.productionOrder.delete({ where: { id } });
    revalidatePath('/dashboard/production/orders');
    return { success: true, message: 'Order Deleted' };
  } catch (e) {
    return { success: false, message: 'Failed to delete' };
  }
}