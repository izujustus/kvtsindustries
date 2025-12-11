'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// 1. UPDATE USER PROFILE (Email Locked)
export async function updateProfile(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  
  // We do not extract 'email' because disabled fields are not sent, 
  // and we don't want to update it anyway to prevent security issues.

  if (!id || !name) return { message: 'Missing Fields' };

  try {
    await prisma.user.update({
      where: { id },
      data: { name }
    });
  } catch (e) {
    return { message: 'Failed to update profile.' };
  }

  revalidatePath('/dashboard/settings');
  return { message: 'Profile Updated Successfully', success: true };
}

// 2. CHANGE PASSWORD
export async function changePassword(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (newPassword.length < 6) return { message: 'New password must be at least 6 chars.' };

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { message: 'User not found.' };

  const passwordsMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordsMatch) return { message: 'Current password is incorrect.' };

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { passwordHash: hashedPassword }
  });

  revalidatePath('/dashboard/settings');
  return { message: 'Password Changed Successfully', success: true };
}

// 3. UPDATE SYSTEM SETTINGS (Admin Only)
export async function updateSystemSettings(prevState: any, formData: FormData) {
  const companyName = formData.get('companyName') as string;
  const companyAddress = formData.get('companyAddress') as string;
  const companyPhone = formData.get('companyPhone') as string;
  const companyEmail = formData.get('companyEmail') as string;
  const defaultTaxRate = Number(formData.get('defaultTaxRate'));

  try {
    const existing = await prisma.systemSetting.findFirst();

    if (existing) {
      await prisma.systemSetting.update({
        where: { id: existing.id },
        data: { companyName, companyAddress, companyPhone, companyEmail, defaultTaxRate }
      });
    } else {
      await prisma.systemSetting.create({
        data: { companyName, companyAddress, companyPhone, companyEmail, defaultTaxRate }
      });
    }
  } catch (e) {
    return { message: 'Failed to save system settings.' };
  }

  revalidatePath('/dashboard/settings');
  revalidatePath('/dashboard/sales'); 
  return { message: 'System Configuration Saved', success: true };
}

// 4. POST ANNOUNCEMENT
export async function createAnnouncement(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { message: 'Unauthorized' };

  const title = formData.get('title') as string;
  const message = formData.get('message') as string;

  if (!title || !message) return { message: 'Title and Message are required' };

  try {
    await prisma.announcement.create({
      data: {
        title,
        message,
        createdById: session.user.id,
        isActive: true
      }
    });
  } catch (e) {
    return { message: 'Failed to post announcement' };
  }

  revalidatePath('/dashboard'); 
  revalidatePath('/dashboard/settings');
  return { message: 'Announcement Posted Successfully', success: true };
}

// 5. DELETE ANNOUNCEMENT
export async function deleteAnnouncement(announcementId: string) {
  try {
    await prisma.announcement.delete({ where: { id: announcementId } });
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    return { message: 'Deleted' };
  } catch (e) {
    return { message: 'Failed to delete' };
  }
}

// 6. CREATE DEPARTMENT (Main Parent)
export async function createDepartment(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return { message: 'Name is required' };

  try {
    await prisma.department.create({
      data: { name }
    });
  } catch (e: any) {
    if (e.code === 'P2002') return { message: 'Department already exists' };
    return { message: 'Failed to create department' };
  }

  revalidatePath('/dashboard/settings');
  return { message: 'Department Created', success: true };
}

// 7. DELETE DEPARTMENT
export async function deleteDepartment(id: string) {
  try {
    // This will only work if there are no sub-departments/employees unless cascading delete is enabled in schema
    await prisma.department.delete({ where: { id } });
    revalidatePath('/dashboard/settings');
    return { message: 'Deleted' };
  } catch (e) {
    return { message: 'Cannot delete department. It may have active employees or sub-sections.' };
  }
}

// 8. CREATE SUB-DEPARTMENT
export async function createSubDepartment(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const departmentId = formData.get('departmentId') as string;

  if (!name || !departmentId) return { message: 'Name and Parent Department are required' };

  try {
    await prisma.subDepartment.create({
      data: { name, departmentId }
    });
  } catch (e: any) {
    return { message: 'Failed. Name might be duplicate in this department.' };
  }

  revalidatePath('/dashboard/settings');
  return { message: 'Sub-Department Added', success: true };
}

// 9. DELETE SUB-DEPARTMENT
export async function deleteSubDepartment(id: string) {
  try {
    await prisma.subDepartment.delete({ where: { id } });
    revalidatePath('/dashboard/settings');
    return { message: 'Deleted' };
  } catch (e) {
    return { message: 'Failed to delete.' };
  }
}