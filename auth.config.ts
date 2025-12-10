// auth.config.ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/', // <--- CHANGED: The root is now the sign-in page
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      
      // Check where the user is trying to go
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnRoot = nextUrl.pathname === '/';

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to root (login)
      } else if (isLoggedIn && isOnRoot) {
        // If user is already logged in and visits '/', send them to dashboard immediately
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        // Use type assertion to bypass the TS error until your types file loads
        (session.user as any).role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;