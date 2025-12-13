// 'use server';

// import { z } from 'zod';
// import { PrismaClient, ProductType } from '@prisma/client';
// import { revalidatePath } from 'next/cache';

// const prisma = new PrismaClient();

// // SCHEMAS
// const ProductSchema = z.object({
//   code: z.string().min(1, "SKU Code is required"),
//   name: z.string().min(1, "Name is required"),
//   type: z.nativeEnum(ProductType),
//   brand: z.string().optional(),
//   costPrice: z.number().min(0),
//   sellingPrice: z.number().min(0),
//   reorderLevel: z.number().min(0),
// });

// const AdjustmentSchema = z.object({
//   productId: z.string(),
//   type: z.enum(['ADJUSTMENT', 'DAMAGE', 'RETURN']),
//   quantity: z.number(), // Can be negative or positive
//   notes: z.string().optional(),
// });

// // 1. CREATE PRODUCT
// export async function createProduct(prevState: any, formData: FormData) {
//   const validated = ProductSchema.safeParse({
//     code: formData.get('code'),
//     name: formData.get('name'),
//     type: formData.get('type'),
//     brand: formData.get('brand'),
//     costPrice: Number(formData.get('costPrice')),
//     sellingPrice: Number(formData.get('sellingPrice')),
//     reorderLevel: Number(formData.get('reorderLevel')),
//   });

//   if (!validated.success) {
//     return { message: 'Validation Failed', errors: validated.error.flatten().fieldErrors };
//   }

//   try {
//     await prisma.product.create({
//       data: validated.data
//     });
//   } catch (e: any) {
//     if (e.code === 'P2002') return { message: 'Product Code (SKU) already exists.' };
//     return { message: 'Database Error' };
//   }

//   revalidatePath('/dashboard/inventory');
//   return { message: 'Product Created', success: true };
// }

// // 2. ADJUST STOCK (The Audit Trail)
// export async function adjustStock(prevState: any, formData: FormData) {
//   const validated = AdjustmentSchema.safeParse({
//     productId: formData.get('productId'),
//     type: formData.get('type'),
//     quantity: Number(formData.get('quantity')), // User enters +5 or -5
//     notes: formData.get('notes'),
//   });

//   if (!validated.success) return { message: 'Invalid Input' };
//   const { productId, type, quantity, notes } = validated.data;

//   try {
//     await prisma.$transaction(async (tx) => {
//       // A. Create Movement Record
//       await tx.inventoryMovement.create({
//         data: {
//           productId,
//           type,
//           quantity,
//           referenceId: 'MANUAL_ADJ', // Flag for manual edits
//           // We can add a description field to Movement if schema allows, otherwise rely on audit logs
//         }
//       });

//       // B. Update Actual Stock
//       await tx.product.update({
//         where: { id: productId },
//         data: { stockOnHand: { increment: quantity } }
//       });
//     });
//   } catch (e) {
//     return { message: 'Failed to adjust stock' };
//   }

//   revalidatePath('/dashboard/inventory');
//   return { message: 'Stock Adjusted Successfully', success: true };
// }

// // 3. CREATE BOM (Recipe)
// export async function createBOM(prevState: any, formData: FormData) {
//   const parentId = formData.get('parentId') as string;
//   const componentId = formData.get('componentId') as string;
//   const quantity = Number(formData.get('quantity'));

//   if (!parentId || !componentId || quantity <= 0) return { message: 'Invalid Data' };

//   try {
//     await prisma.billOfMaterial.create({
//       data: { parentId, componentId, quantity }
//     });
//   } catch (e) {
//     return { message: 'Failed to link materials' };
//   }

//   revalidatePath('/dashboard/inventory');
//   return { message: 'BOM Linked', success: true };
// }
'use server';

import { z } from 'zod';
import { PrismaClient, ProductType } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// ============================================================================
// SCHEMAS
// ============================================================================

const CategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const SupplierSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

const ProductSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(3, "SKU must be at least 3 chars"),
  name: z.string().min(1, "Name is required"),
  type: z.nativeEnum(ProductType),
  categoryId: z.string().nullable().optional(),
  supplierId: z.string().nullable().optional(),
  brand: z.string().optional(),
  costPrice: z.coerce.number().min(0, "Invalid Cost"),
  sellingPrice: z.coerce.number().min(0, "Invalid Price"),
  reorderLevel: z.coerce.number().min(0),
  description: z.string().optional(),
});

const AdjustmentSchema = z.object({
  productId: z.string(),
  type: z.enum(['ADJUSTMENT', 'DAMAGE', 'RETURN']),
  quantity: z.coerce.number(), 
  notes: z.string().optional(),
});

// ============================================================================
// ACTIONS
// ============================================================================

// 1. GENERATE SKU
export async function generateSKU() {
  const prefix = "PRD";
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const date = new Date().getFullYear().toString().slice(-2); // Last 2 digits of year
  
  let sku = `${prefix}-${date}-${random}`;
  
  // Ensure uniqueness
  let exists = await prisma.product.findUnique({ where: { code: sku } });
  while (exists) {
     const newRandom = Math.floor(1000 + Math.random() * 9000);
     sku = `${prefix}-${date}-${newRandom}`;
     exists = await prisma.product.findUnique({ where: { code: sku } });
  }
  
  return sku;
}

// 2. SAVE PRODUCT (Create or Update)
export async function saveProduct(prevState: any, formData: FormData) {
  const rawCategoryId = formData.get('categoryId');
  const rawSupplierId = formData.get('supplierId');

  const data = {
    id: formData.get('id'),
    code: formData.get('code'),
    name: formData.get('name'),
    type: formData.get('type'),
    categoryId: rawCategoryId === '' ? null : rawCategoryId,
    supplierId: rawSupplierId === '' ? null : rawSupplierId,
    brand: formData.get('brand'),
    costPrice: formData.get('costPrice'),
    sellingPrice: formData.get('sellingPrice'),
    reorderLevel: formData.get('reorderLevel'),
    description: formData.get('description'),
  };

  const validated = ProductSchema.safeParse(data);

  if (!validated.success) {
    return { 
      message: 'Please fix the errors below.', 
      errors: validated.error.flatten().fieldErrors 
    };
  }

  const { id, ...fields } = validated.data;

  try {
    if (id) {
      // UPDATE
      await prisma.product.update({
        where: { id },
        data: fields
      });
      revalidatePath('/dashboard/inventory');
      return { message: 'Product Updated', success: true };
    } else {
      // CREATE
      await prisma.product.create({
        data: fields
      });
      revalidatePath('/dashboard/inventory');
      return { message: 'Product Created', success: true };
    }
  } catch (e: any) {
    if (e.code === 'P2002') return { message: 'This SKU Code already exists.' };
    console.error(e);
    return { message: 'Database Error: ' + e.message };
  }
}

// 3. DELETE PRODUCT
export async function deleteProduct(productId: string) {
  try {
    const hasSales = await prisma.salesInvoiceItem.findFirst({ where: { productId } });
    if (hasSales) return { success: false, message: "Cannot delete: This product has sales history." };

    await prisma.product.delete({ where: { id: productId } });
    revalidatePath('/dashboard/inventory');
    return { success: true, message: "Product deleted" };
  } catch (e) {
    return { success: false, message: "Delete failed" };
  }
}

// 4. CREATE CATEGORY
export async function createCategory(prevState: any, formData: FormData) {
  const validated = CategorySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
  });

  if (!validated.success) return { message: 'Invalid Input', errors: validated.error.flatten().fieldErrors };

  try {
    await prisma.productCategory.create({ data: validated.data });
    revalidatePath('/dashboard/inventory');
    return { message: 'Category Created', success: true };
  } catch (e) {
    return { message: 'Category already exists' };
  }
}

// 5. CREATE SUPPLIER
export async function createSupplier(prevState: any, formData: FormData) {
  const validated = SupplierSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
  });

  if (!validated.success) return { message: 'Invalid Input', errors: validated.error.flatten().fieldErrors };

  try {
    await prisma.supplier.create({ data: validated.data });
    revalidatePath('/dashboard/inventory');
    return { message: 'Supplier Created', success: true };
  } catch (e) {
    return { message: 'Failed to create supplier' };
  }
}

// 6. ADJUST STOCK
export async function adjustStock(prevState: any, formData: FormData) {
  const validated = AdjustmentSchema.safeParse({
    productId: formData.get('productId'),
    type: formData.get('type'),
    quantity: formData.get('quantity'),
    notes: formData.get('notes'),
  });

  if (!validated.success) return { message: 'Invalid Input' };
  const { productId, type, quantity, notes } = validated.data;

  try {
    await prisma.$transaction(async (tx) => {
      // Record Movement
      await tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantity,
          referenceId: 'MANUAL_ADJ',
        }
      });

      // Update Stock
      await tx.product.update({
        where: { id: productId },
        data: { stockOnHand: { increment: quantity } }
      });
    });
  } catch (e) {
    return { message: 'Failed to adjust stock' };
  }

  revalidatePath('/dashboard/inventory');
  return { message: 'Stock Adjusted', success: true };
}

// 7. CREATE BOM (Bill of Materials)
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
  return { message: 'Recipe (BOM) Linked', success: true };
}