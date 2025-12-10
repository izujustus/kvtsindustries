// auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/auth.config';

const prisma = new PrismaClient();

// Define the User schema for input validation
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = LoginSchema.safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);

          if (!user) return null;

          // Check password
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

          if (passwordsMatch) {
            // Return user object with role to be stored in token
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role, // Important!
            };
          }
        }
        return null;
      },
    }),
  ],
});