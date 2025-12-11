import { PrismaClient } from '@prisma/client';
import SettingsClientWrapper from './client-wrapper';
// import { auth } from '@/auth'; // or '@/lib/auth' depending on your setup
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.email) return <div>Access Denied</div>;

  // 1. Fetch Current User
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) return <div>User not found</div>;

  // 2. Fetch System Settings (Create default if missing)
  let settings = await prisma.systemSetting.findFirst();
  if (!settings) {
    settings = await prisma.systemSetting.create({
      data: {
        companyName: 'KVTS INDUSTRIES CO., LTD.',
        companyAddress: 'Plot 15 Industrial Layout, Emene, Enugu State',
        defaultTaxRate: 7.5
      }
    });
  }

  // Transform Decimal to Number for the Client
  const safeSettings = {
    ...settings,
    defaultTaxRate: Number(settings.defaultTaxRate)
  };

  // 3. Fetch Announcements
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // 4. FETCH DEPARTMENTS (This was missing)
  // We need to fetch departments AND their sub-departments to show the hierarchy
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: {
      subDepartments: {
        orderBy: { name: 'asc' }
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      
      <SettingsClientWrapper 
        user={user} 
        settings={safeSettings} 
        announcements={announcements} 
        departments={departments} // <--- Pass the data here
      />
    </div>
  );
}