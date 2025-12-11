'use server';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

// 1. UPDATE USER PROFILE
export async function updateProfile(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;

  if (!id || !name || !email) return { message: 'Missing Fields' };

  try {
    await prisma.user.update({
      where: { id },
      data: { name, email }
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

  // Verify Old Password
  const passwordsMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!passwordsMatch) return { message: 'Current password is incorrect.' };

  // Hash New Password
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
    // We use findFirst/update or create because there is only ONE settings row
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
  // Also revalidate Sales where invoice is generated
  revalidatePath('/dashboard/sales'); 
  return { message: 'System Configuration Saved', success: true };
}
// ... existing imports
// import { auth } from '@/auth'; // You might need to import auth to get the user ID securely

// ... existing actions (updateProfile, changePassword, updateSystemSettings) ...

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

  revalidatePath('/dashboard'); // Update Dashboard
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