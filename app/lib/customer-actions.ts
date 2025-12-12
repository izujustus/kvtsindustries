'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

const CustomerSchema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.coerce.number().optional(),
});

export async function upsertCustomer(prevState: any, formData: FormData) {
  const id = formData.get('id') as string; // If ID exists, it's an edit
  
  const validated = CustomerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    address: formData.get('address'),
    creditLimit: formData.get('creditLimit'),
  });

  if (!validated.success) return { message: 'Invalid Data', success: false };

  try {
    if (id) {
      // UPDATE
      await prisma.customer.update({
        where: { id },
        data: validated.data,
      });
    } else {
      // CREATE
      await prisma.customer.create({
        data: {
          ...validated.data,
          currentBalance: 0, // Start fresh
        },
      });
    }
  } catch (e) {
    return { message: 'Database Error: Could not save customer.', success: false };
  }

  revalidatePath('/dashboard/customers');
  // If we are on a detail page, we might want to revalidate that too, but general path covers it
  return { message: 'Customer Saved Successfully', success: true };
}