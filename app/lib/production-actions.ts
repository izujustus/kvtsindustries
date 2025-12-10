'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// 1. Validation Schema
const DefectSchema = z.object({
  defectType: z.string().min(1, "Defect type required"),
  quantity: z.number().min(1, "Qty must be > 0"),
});

const ProductionSchema = z.object({
  date: z.string(), // HTML Date input returns string
  shift: z.enum(['DAY', 'NIGHT']),
  productId: z.string().min(1, "Product is required"),
  batchNumber: z.string().min(1, "Batch # required"),
  totalQty: z.number().min(1),
  qualifiedQty: z.number().min(0),
  rejectedQty: z.number().min(0),
  notes: z.string().optional(),
  defects: z.array(DefectSchema).optional(),
});

// 2. CREATE REPORT
export async function createProductionReport(prevState: any, formData: FormData) {
  // Extract complex data from FormData (Defects are passed as JSON string)
  const defectsJson = formData.get('defects') as string;
  const defects = defectsJson ? JSON.parse(defectsJson) : [];

  const rawData = {
    date: formData.get('date'),
    shift: formData.get('shift'),
    productId: formData.get('productId'),
    batchNumber: formData.get('batchNumber'),
    totalQty: Number(formData.get('totalQty')),
    qualifiedQty: Number(formData.get('qualifiedQty')),
    rejectedQty: Number(formData.get('rejectedQty')),
    notes: formData.get('notes'),
    defects: defects,
  };

  const validated = ProductionSchema.safeParse(rawData);

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors, message: 'Validation Failed' };
  }

  const data = validated.data;

  // Integrity Check
  if (data.totalQty !== data.qualifiedQty + data.rejectedQty) {
    return { message: `Math Error: Total (${data.totalQty}) does not equal Qualified (${data.qualifiedQty}) + Rejected (${data.rejectedQty})` };
  }

  try {
    // Transaction: Create Report + Create Defects + (Optional) Update Inventory
    await prisma.$transaction(async (tx) => {
      // 1. Create Report
      const report = await tx.productionReport.create({
        data: {
          date: new Date(data.date),
          shift: data.shift,
          productId: data.productId,
          batchNumber: data.batchNumber,
          totalQty: data.totalQty,
          qualifiedQty: data.qualifiedQty,
          rejectedQty: data.rejectedQty,
          notes: data.notes,
          // Create Defects in same query
          defects: {
            create: data.defects?.map(d => ({
              defectType: d.defectType,
              quantity: d.quantity
            }))
          }
        }
      });

      // 2. AUTO-UPDATE INVENTORY (Advanced Feature)
      // Add Qualified Goods to Stock
      await tx.inventoryMovement.create({
        data: {
          productId: data.productId,
          type: 'PRODUCTION_OUTPUT',
          quantity: data.qualifiedQty, // Only add good tires
          referenceId: report.id,
          date: new Date(data.date),
        }
      });
      
      // Update Product Stock Count Cache
      await tx.product.update({
        where: { id: data.productId },
        data: { stockOnHand: { increment: data.qualifiedQty } }
      });
    });

  } catch (error: any) {
    if (error.code === 'P2002') return { message: 'Batch Number already exists!' };
    return { message: 'Database Error: Failed to save report.' };
  }

  revalidatePath('/dashboard/production');
  return { message: 'Production Report Saved Successfully', success: true };
}