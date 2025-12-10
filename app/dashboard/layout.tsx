
import { redirect } from 'next/navigation';
import DashboardShell from '@/app/ui/dashboard/dashboard-shell';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Fetch Session on Server
  const session = await auth();

  // 2. Security Check
  if (!session?.user) {
    redirect('/');
  }

  // 3. Extract Role (Safely)
  const userRole = (session.user as any).role || 'USER';

  // 4. Render Client Shell
  return (
    <DashboardShell userRole={userRole}>
      {children}
    </DashboardShell>
  );
}