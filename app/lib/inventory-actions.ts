'use server';

import { z } from 'zod';
import { PrismaClient, ProductType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// SCHEMAS
const ProductSchema = z.object({
  code: z.string().min(1, "SKU Code is required"),
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(ProductType),
  brand: z.string().optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  reorderLevel: z.number().min(0),
});

const AdjustmentSchema = z.object({
  productId: z.string(),
  type: z.enum(['ADJUSTMENT', 'DAMAGE', 'RETURN']),
  quantity: z.number(), // Can be negative or positive
  notes: z.string().optional(),
});

// 1. CREATE PRODUCT
export async function createProduct(prevState: any, formData: FormData) {
  const validated = ProductSchema.safeParse({
    code: formData.get('code'),
    name: formData.get('name'),
    type: formData.get('type'),
    brand: formData.get('brand'),
    costPrice: Number(formData.get('costPrice')),
    sellingPrice: Number(formData.get('sellingPrice')),
    reorderLevel: Number(formData.get('reorderLevel')),
  });

  if (!validated.success) {
    return { message: 'Validation Failed', errors: validated.error.flatten().fieldErrors };
  }

  try {
    await prisma.product.create({
      data: validated.data
    });
  } catch (e: any) {
    if (e.code === 'P2002') return { message: 'Product Code (SKU) already exists.' };
    return { message: 'Database Error' };
  }

  revalidatePath('/dashboard/inventory');
  return { message: 'Product Created', success: true };
}

// 2. ADJUST STOCK (The Audit Trail)
export async function adjustStock(prevState: any, formData: FormData) {
  const validated = AdjustmentSchema.safeParse({
    productId: formData.get('productId'),
    type: formData.get('type'),
    quantity: Number(formData.get('quantity')), // User enters +5 or -5
    notes: formData.get('notes'),
  });

  if (!validated.success) return { message: 'Invalid Input' };
  const { productId, type, quantity, notes } = validated.data;

  try {
    await prisma.$transaction(async (tx) => {
      // A. Create Movement Record
      await tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity,
          referenceId: 'MANUAL_ADJ', // Flag for manual edits
          // We can add a description field to Movement if schema allows, otherwise rely on audit logs
        }
      });

      // B. Update Actual Stock
      await tx.product.update({
        where: { id: productId },
        data: { stockOnHand: { increment: quantity } }
      });
    });
  } catch (e) {
    return { message: 'Failed to adjust stock' };
  }

  revalidatePath('/dashboard/inventory');
  return { message: 'Stock Adjusted Successfully', success: true };
}

// 3. CREATE BOM (Recipe)
export async function createBOM(prevState: any, formData: FormData) {
  const parentId = formData.get('parentId') as string;
  const componentId = formData.get('componentId') as string;
  const quantity = Number(formData.get('quantity'));

  if (!parentId || !componentId || quantity <= 0) return { message: 'Invalid Data' };

  try {
    await prisma.billOfMaterial.create({
      data: { parentId, componentId, quantity }
    });
  } catch (e) {
    return { message: 'Failed to link materials' };
  }

  revalidatePath('/dashboard/inventory');
  return { message: 'BOM Linked', success: true };
}