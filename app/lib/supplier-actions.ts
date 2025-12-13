'use server';

import { z } from 'zod';
import { PrismaClient, PaymentMethod } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// --- SCHEMAS ---

const CategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const SupplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
});

const PaymentSchema = z.object({
  supplierId: z.string(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  currencyId: z.string().min(1, "Currency is required"),
  method: z.nativeEnum(PaymentMethod),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// 1. CATEGORY ACTIONS
// ============================================================================

export async function saveCategory(prevState: any, formData: FormData) {
  const data = {
    id: formData.get('id'),
    name: formData.get('name'),
    description: formData.get('description'),
  };

  const validated = CategorySchema.safeParse(data);
  if (!validated.success) return { message: 'Invalid Input', errors: validated.error.flatten().fieldErrors };

  try {
    if (data.id) {
      await prisma.productCategory.update({
        where: { id: data.id as string },
        data: { name: validated.data.name, description: validated.data.description }
      });
    } else {
      await prisma.productCategory.create({
        data: { name: validated.data.name, description: validated.data.description }
      });
    }
    revalidatePath('/dashboard/inventory/categories');
    return { success: true, message: 'Category Saved' };
  } catch (e) {
    return { success: false, message: 'Database Error: Name might already exist' };
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.productCategory.delete({ where: { id } });
    revalidatePath('/dashboard/inventory/categories');
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Cannot delete: Category might contain products.' };
  }
}

// ============================================================================
// 2. SUPPLIER ACTIONS
// ============================================================================

export async function saveSupplier(prevState: any, formData: FormData) {
  const data = {
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  };

  const validated = SupplierSchema.safeParse(data);
  if (!validated.success) return { message: 'Invalid Input', errors: validated.error.flatten().fieldErrors };

  try {
    if (data.id) {
      await prisma.supplier.update({
        where: { id: data.id as string },
        data: validated.data
      });
    } else {
      await prisma.supplier.create({
        data: validated.data
      });
    }
    revalidatePath('/dashboard/suppliers');
    return { success: true, message: 'Supplier Saved' };
  } catch (e) {
    return { success: false, message: 'Database Error' };
  }
}

export async function deleteSupplier(id: string) {
  try {
    await prisma.supplier.delete({ where: { id } });
    revalidatePath('/dashboard/suppliers');
    return { success: true };
  } catch (e) {
    return { success: false, message: 'Cannot delete: Supplier has linked records.' };
  }
}

// ============================================================================
// 3. SUPPLIER PAYMENT ACTIONS
// ============================================================================

export async function recordSupplierPayment(prevState: any, formData: FormData) {
  const validated = PaymentSchema.safeParse({
    supplierId: formData.get('supplierId'),
    amount: formData.get('amount'),
    currencyId: formData.get('currencyId'),
    method: formData.get('method'),
    reference: formData.get('reference'),
    notes: formData.get('notes'),
  });

  if (!validated.success) return { message: 'Validation Failed', errors: validated.error.flatten().fieldErrors };

  const { supplierId, amount, currencyId, method, reference, notes } = validated.data;
  
  // Generate Payment Number (SP-YYMM-XXXX)
  const dateStr = new Date().toISOString().slice(2, 7).replace('-', '');
  const random = Math.floor(1000 + Math.random() * 9000);
  const paymentNumber = `SP-${dateStr}-${random}`;

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      await tx.supplierPayment.create({
        data: {
          paymentNumber,
          supplierId,
          amount,
          currencyId,
          method,
          reference,
          notes
        }
      });

      // 2. Update Supplier Balance (Decrease what we owe them)
      // Assuming 'balance' represents debt to supplier. Payment reduces debt.
      await tx.supplier.update({
        where: { id: supplierId },
        data: {
          balance: { decrement: amount }
        }
      });
    });
    
    revalidatePath(`/dashboard/suppliers/${supplierId}`);
    return { success: true, message: 'Payment Recorded Successfully' };
  } catch (e) {
    console.error(e);
    return { success: false, message: 'Failed to record payment' };
  }
}