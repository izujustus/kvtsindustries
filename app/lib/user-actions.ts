'use server';

import { z } from 'zod';
import { PrismaClient, Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 1. Validation Schema
const UserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role),
  isActive: z.enum(['true', 'false']).transform((val) => val === 'true'),
});

const CreateUserSchema = UserSchema.omit({ id: true }).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const UpdateUserSchema = UserSchema;

// 2. CREATE USER
export async function createUser(prevState: any, formData: FormData) {
  // Validate Fields
  const validatedFields = CreateUserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    password: formData.get('password'),
    isActive: formData.get('isActive'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create User.',
    };
  }

  const { name, email, role, password, isActive } = validatedFields.data;

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role,
        passwordHash: hashedPassword,
        isActive,
      },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Create User. Email might be in use.' };
  }

  revalidatePath('/dashboard/users');
  return { message: 'Success', success: true };
}

// 3. UPDATE USER
export async function updateUser(prevState: any, formData: FormData) {
  const validatedFields = UpdateUserSchema.safeParse({
    id: formData.get('id'),
    name: formData.get('name'),
    email: formData.get('email'),
    role: formData.get('role'),
    isActive: formData.get('isActive'),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors, message: 'Validation Error' };
  }

  const { id, name, email, role, isActive } = validatedFields.data;

  try {
    await prisma.user.update({
      where: { id },
      data: { name, email, role, isActive },
    });
  } catch (error) {
    return { message: 'Database Error: Failed to Update User.' };
  }

  revalidatePath('/dashboard/users');
  return { message: 'User Updated', success: true };
}

// 4. RESET PASSWORD (Admin Override)
export async function resetUserPassword(prevState: any, formData: FormData) {
  const id = formData.get('id') as string;
  const newPassword = formData.get('password') as string;

  if (!newPassword || newPassword.length < 6) {
    return { message: 'Password must be at least 6 chars' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    await prisma.user.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });
  } catch (error) {
    return { message: 'Failed to reset password' };
  }

  revalidatePath('/dashboard/users');
  return { message: 'Password Reset Successfully', success: true };
}