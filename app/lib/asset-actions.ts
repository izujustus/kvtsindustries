'use server';

import { z } from 'zod';
import { PrismaClient, AssetStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// SCHEMAS
const AssetSchema = z.object({
  assetTag: z.string().min(1, "Tag Required"),
  name: z.string().min(1, "Name Required"),
  category: z.string().min(1),
  purchaseDate: z.string(),
  purchaseCost: z.number().min(0),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
});

const MaintenanceSchema = z.object({
  assetId: z.string(),
  date: z.string(),
  description: z.string().min(1),
  cost: z.number().min(0),
  performedBy: z.string().optional(),
});

const AssignmentSchema = z.object({
  assetId: z.string(),
  employeeId: z.string().optional(), // If empty, unassign
});

// 1. CREATE ASSET
export async function createAsset(prevState: any, formData: FormData) {
  const validated = AssetSchema.safeParse({
    assetTag: formData.get('assetTag'),
    name: formData.get('name'),
    category: formData.get('category'),
    purchaseDate: formData.get('purchaseDate'),
    purchaseCost: Number(formData.get('purchaseCost')),
    serialNumber: formData.get('serialNumber'),
    location: formData.get('location'),
    condition: formData.get('condition'),
  });

  if (!validated.success) return { message: 'Validation Failed' };
  const data = validated.data;

  try {
    await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        category: data.category,
        purchaseDate: new Date(data.purchaseDate),
        purchaseCost: data.purchaseCost,
        serialNumber: data.serialNumber,
        location: data.location,
        condition: data.condition,
        status: 'ACTIVE'
      }
    });
  } catch (e: any) {
    if (e.code === 'P2002') return { message: 'Asset Tag or Serial Number already exists.' };
    return { message: 'Database Error' };
  }

  revalidatePath('/dashboard/assets');
  return { message: 'Asset Registered', success: true };
}

// 2. LOG MAINTENANCE
export async function logMaintenance(prevState: any, formData: FormData) {
  const validated = MaintenanceSchema.safeParse({
    assetId: formData.get('assetId'),
    date: formData.get('date'),
    description: formData.get('description'),
    cost: Number(formData.get('cost')),
    performedBy: formData.get('performedBy'),
  });

  if (!validated.success) return { message: 'Invalid Data' };
  const { assetId, date, description, cost, performedBy } = validated.data;

  try {
    await prisma.$transaction([
      // A. Create Record
      prisma.assetMaintenance.create({
        data: {
          assetId,
          maintenanceDate: new Date(date),
          description,
          cost,
          performedBy
        }
      }),
      // B. Update Asset Timestamp
      prisma.asset.update({
        where: { id: assetId },
        data: { 
          lastMaintenance: new Date(date),
          status: 'IN_REPAIR' // Auto-set to repair status? Or keep active. Let's keep active unless manually changed.
        }
      })
    ]);
  } catch (e) {
    return { message: 'Failed to log maintenance' };
  }

  revalidatePath('/dashboard/assets');
  return { message: 'Maintenance Logged', success: true };
}

// 3. ASSIGN ASSET (Check-in / Check-out)
export async function assignAsset(prevState: any, formData: FormData) {
  const assetId = formData.get('assetId') as string;
  const employeeId = formData.get('employeeId') as string; // Can be empty string for "Return"

  try {
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        assignedToEmployeeId: employeeId || null,
        location: employeeId ? 'Assigned to Employee' : 'In Store' // Update location logic
      }
    });
  } catch (e) {
    return { message: 'Failed to update assignment' };
  }

  revalidatePath('/dashboard/assets');
  return { message: 'Asset Assignment Updated', success: true };
}