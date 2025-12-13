// 'use server';

// import { z } from 'zod';
// import { PrismaClient } from '@prisma/client';
// import { revalidatePath } from 'next/cache';

// const prisma = new PrismaClient();

// const DefectSchema = z.object({
//   defectType: z.string().min(1),
//   quantity: z.number().min(1),
// });

// const ProductionSchema = z.object({
//   date: z.string().min(1, "Date is required"),
//   shift: z.enum(['DAY', 'NIGHT']),
//   productId: z.string().min(1, "Product is required"),
//   batchNumber: z.string().min(1, "Batch Number is required"),
//   totalQty: z.coerce.number().min(1, "Total Qty must be at least 1"), // coerce handles String -> Number
//   qualifiedQty: z.coerce.number().min(0),
//   rejectedQty: z.coerce.number().min(0),
  
//   // FIX: .nullish() allows null, undefined, or string. 
//   // This prevents the "expected string, received null" error.
//   notes: z.string().nullish(), 
  
//   defects: z.array(DefectSchema).optional(),
// });

// export async function createProductionReport(prevState: any, formData: FormData) {
//   // 1. Extract Raw Data
//   const rawData = {
//     date: formData.get('date'),
//     shift: formData.get('shift'),
//     productId: formData.get('productId'),
//     batchNumber: formData.get('batchNumber'),
//     totalQty: formData.get('totalQty'),
//     qualifiedQty: formData.get('qualifiedQty'),
//     rejectedQty: formData.get('rejectedQty'),
//     notes: formData.get('notes'),
//     defects: formData.get('defects'),
//   };

//   console.log("📝 Received Production Data:", rawData);

//   // 2. Parse JSON Defects safely
//   let parsedDefects = [];
//   try {
//     const d = formData.get('defects') as string;
//     if (d) parsedDefects = JSON.parse(d);
//   } catch (e) {
//     console.error("❌ JSON Parse Error on defects:", e);
//     return { message: 'Invalid Defects Data' };
//   }

//   // 3. Validate
//   const validated = ProductionSchema.safeParse({
//     ...rawData,
//     defects: parsedDefects,
//   });

//   if (!validated.success) {
//     // Log errors to terminal
//     console.error("❌ Validation Failed:", validated.error.flatten().fieldErrors);
//     return { 
//       errors: validated.error.flatten().fieldErrors, 
//       message: 'Validation Failed: Please check your inputs.' 
//     };
//   }

//   const data = validated.data;

//   // 4. Integrity Math Check
//   if (data.totalQty !== data.qualifiedQty + data.rejectedQty) {
//     return { message: `Math Error: Total (${data.totalQty}) does not match Good (${data.qualifiedQty}) + Bad (${data.rejectedQty})` };
//   }

//   try {
//     await prisma.$transaction(async (tx) => {
//       // Create Report
//       const report = await tx.productionReport.create({
//         data: {
//           date: new Date(data.date),
//           shift: data.shift as any, // Cast to any to satisfy Prisma enum type if strictly typed
//           productId: data.productId,
//           batchNumber: data.batchNumber,
//           totalQty: data.totalQty,
//           qualifiedQty: data.qualifiedQty,
//           rejectedQty: data.rejectedQty,
//           notes: data.notes || '', // Convert null/undefined to empty string for DB
//           defects: {
//             create: data.defects?.map(d => ({
//               defectType: d.defectType,
//               quantity: d.quantity
//             }))
//           }
//         }
//       });

//       // Update Inventory (Only Add Good Stock)
//       if (data.qualifiedQty > 0) {
//         await tx.inventoryMovement.create({
//           data: {
//             productId: data.productId,
//             type: 'PRODUCTION_OUTPUT',
//             quantity: data.qualifiedQty,
//             referenceId: report.id,
//             date: new Date(data.date),
//           }
//         });
        
//         await tx.product.update({
//           where: { id: data.productId },
//           data: { stockOnHand: { increment: data.qualifiedQty } }
//         });
//       }
//     });

//   } catch (error: any) {
//     console.error("❌ Database Error:", error);
//     if (error.code === 'P2002') return { message: 'Batch Number already exists!' };
//     return { message: 'Database Error: Failed to save report.' };
//   }

//   revalidatePath('/dashboard/production');
//   return { message: 'Production Report Saved Successfully', success: true };
// }

// // ... existing imports and code ...

// // 5. GENERATE NEXT BATCH NUMBER
// export async function generateBatchNumber() {
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const day = String(date.getDate()).padStart(2, '0');
  
//   // Format: BATCH-YYYYMMDD
//   const prefix = `BATCH-${year}${month}${day}`;

//   // Find how many batches exist for TODAY
//   // We use "startsWith" filter on the batchNumber field
//   const count = await prisma.productionReport.count({
//     where: {
//       batchNumber: {
//         startsWith: prefix
//       }
//     }
//   });

//   // Generate Sequence: 001, 002, etc.
//   const sequence = String(count + 1).padStart(3, '0');
  
//   return { batchNumber: `${prefix}-${sequence}` };
// }

'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const DefectSchema = z.object({
  defectType: z.string().min(1),
  quantity: z.number().min(1),
});

const ProductionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  shift: z.enum(['DAY', 'NIGHT']),
  productId: z.string().min(1, "Product is required"),
  batchNumber: z.string().min(1, "Batch Number is required"),
  totalQty: z.coerce.number().min(1, "Total Qty must be at least 1"), 
  qualifiedQty: z.coerce.number().min(0),
  rejectedQty: z.coerce.number().min(0),
  notes: z.string().nullish(), 
  defects: z.array(DefectSchema).optional(),
});

export async function createProductionReport(prevState: any, formData: FormData) {
  // 1. Extract Raw Data
  const rawData = {
    date: formData.get('date'),
    shift: formData.get('shift'),
    productId: formData.get('productId'),
    batchNumber: formData.get('batchNumber'),
    totalQty: formData.get('totalQty'),
    qualifiedQty: formData.get('qualifiedQty'),
    rejectedQty: formData.get('rejectedQty'),
    notes: formData.get('notes'),
    defects: formData.get('defects'),
  };

  // 2. Parse JSON Defects
  let parsedDefects = [];
  try {
    const d = formData.get('defects') as string;
    if (d) parsedDefects = JSON.parse(d);
  } catch (e) {
    return { message: 'Invalid Defects Data' };
  }

  // 3. Validate
  const validated = ProductionSchema.safeParse({
    ...rawData,
    defects: parsedDefects,
  });

  if (!validated.success) {
    return { 
      errors: validated.error.flatten().fieldErrors, 
      message: 'Validation Failed: Please check your inputs.' 
    };
  }

  const data = validated.data;

  // 4. Integrity Check
  if (data.totalQty !== data.qualifiedQty + data.rejectedQty) {
    return { message: `Math Error: Total (${data.totalQty}) does not match Good (${data.qualifiedQty}) + Bad (${data.rejectedQty})` };
  }

  try {
    // 5. FETCH BOM RECIPE
    // We need to know what ingredients to deduct
    const bomComponents = await prisma.billOfMaterial.findMany({
      where: { parentId: data.productId },
      include: { component: true }
    });

    if (bomComponents.length === 0 && data.totalQty > 0) {
      // Optional warning if no BOM exists (you might want to block this)
      console.warn(`⚠️ Warning: No BOM found for product ${data.productId}. Raw materials will not be deducted.`);
    }

    // 6. TRANSACTION: Create Report + Move Stock
    await prisma.$transaction(async (tx) => {
      // A. Create Report
      const report = await tx.productionReport.create({
        data: {
          date: new Date(data.date),
          shift: data.shift as any, 
          productId: data.productId,
          batchNumber: data.batchNumber,
          totalQty: data.totalQty,
          qualifiedQty: data.qualifiedQty,
          rejectedQty: data.rejectedQty,
          notes: data.notes || '',
          defects: {
            create: data.defects?.map(d => ({
              defectType: d.defectType,
              quantity: d.quantity
            }))
          },
          // We can store a snapshot of materials used if needed, 
          // but for now we just deduct from inventory.
        }
      });

      // B. Add Finished Good to Inventory (Only Qualified)
      if (data.qualifiedQty > 0) {
        await tx.inventoryMovement.create({
          data: {
            productId: data.productId,
            type: 'PRODUCTION_OUTPUT',
            quantity: data.qualifiedQty,
            referenceId: report.id,
            date: new Date(data.date),
          }
        });
        
        await tx.product.update({
          where: { id: data.productId },
          data: { stockOnHand: { increment: data.qualifiedQty } }
        });
      }

      // C. Deduct Raw Materials (Based on Total Qty - waste counts too!)
      // Note: Usually you consume materials for the TOTAL quantity produced, even if rejected.
      if (data.totalQty > 0) {
        for (const item of bomComponents) {
           const qtyNeeded = Number(item.quantity) * data.totalQty;
           
           // Deduct Material
           await tx.inventoryMovement.create({
             data: {
               productId: item.componentId,
               type: 'PRODUCTION_CONSUMPTION',
               quantity: -qtyNeeded, // Negative for usage
               referenceId: report.id,
               date: new Date(data.date),
             }
           });

           await tx.product.update({
             where: { id: item.componentId },
             data: { stockOnHand: { decrement: qtyNeeded } }
           });
        }
      }
    });

  } catch (error: any) {
    console.error("❌ Database Error:", error);
    if (error.code === 'P2002') return { message: 'Batch Number already exists!' };
    return { message: 'Database Error: Failed to save report.' };
  }

  revalidatePath('/dashboard/production');
  revalidatePath('/dashboard/inventory'); // Also update inventory view
  return { message: 'Production Report Saved Successfully', success: true };
}

// GENERATE NEXT BATCH NUMBER
export async function generateBatchNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const prefix = `BATCH-${year}${month}${day}`;

  const count = await prisma.productionReport.count({
    where: { batchNumber: { startsWith: prefix } }
  });

  const sequence = String(count + 1).padStart(3, '0');
  return { batchNumber: `${prefix}-${sequence}` };
}