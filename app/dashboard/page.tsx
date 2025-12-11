// import { auth } from '@/auth';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { Calendar, Bell, Gift, Megaphone } from 'lucide-react';

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'USER';
  const userName = session?.user?.name || 'Staff Member';

  // 1. Fetch Announcements (Active ones, latest first)
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { createdBy: true }
  });

  // 2. Fetch Birthdays (Complex date logic handled in JS for simplicity across DBs)
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  // Fetch all active employees (optimize this with raw SQL in production for huge datasets)
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, department: true, dateOfBirth: true }
  });

  const upcomingBirthdays = employees.filter(emp => {
    if (!emp.dateOfBirth) return false;
    const dob = new Date(emp.dateOfBirth);
    const dobMonth = dob.getMonth() + 1;
    const dobDay = dob.getDate();

    // Check if birthday is today or within next 7 days
    // Simplified logic: matches month and day range
    if (dobMonth === currentMonth) {
      return dobDay >= currentDay && dobDay <= currentDay + 7;
    }
    return false;
  }).sort((a, b) => {
     // Sort by day
     const dayA = new Date(a.dateOfBirth!).getDate();
     const dayB = new Date(b.dateOfBirth!).getDate();
     return dayA - dayB;
  });

  // 3. Role-Based Quick Stat
  let quickStat = { label: 'System Status', value: 'Online' };
  
  if (userRole === 'STORE_KEEPER') {
    const lowStock = await prisma.product.count({ where: { stockOnHand: { lte: 10 } } });
    quickStat = { label: 'Low Stock Alerts', value: lowStock.toString() };
  } else if (userRole === 'SALES_MANAGER') {
    const todaySales = await prisma.salesInvoice.count({ 
      where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } 
    });
    quickStat = { label: 'Invoices Today', value: todaySales.toString() };
  } else if (userRole === 'PRODUCTION_MANAGER') {
    const todayProduction = await prisma.productionReport.count({
      where: { date: { gte: new Date(new Date().setHours(0,0,0,0)) } }
    });
    quickStat = { label: 'Production Batches', value: todayProduction.toString() };
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-black to-gray-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E30613] rounded-full blur-[100px] opacity-20 -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userName}! 👋</h1>
          <p className="text-gray-300">
            Have a productive day at KVTS Industries. Here is your overview for today.
          </p>
          
          <div className="mt-6 inline-flex items-center bg-white/10 backdrop-blur-md rounded-lg px-4 py-2 border border-white/20">
            <span className="text-sm font-medium text-gray-200 mr-2">{quickStat.label}:</span>
            <span className="text-lg font-bold text-[#E30613]">{quickStat.value}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COL: ANNOUNCEMENTS */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#E30613]" /> Company Updates
            </h3>
            {userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' ? (
               <span className="text-xs bg-black text-white px-2 py-1 rounded">Admin Access</span>
            ) : null}
          </div>
          <div className="divide-y divide-gray-100">
            {announcements.length > 0 ? (
              announcements.map((msg) => (
                <div key={msg.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-gray-800">{msg.title}</h4>
                    <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{msg.message}</p>
                  <div className="mt-3 text-xs font-medium text-gray-400 flex items-center gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                      {msg.createdBy.name?.charAt(0) || 'A'}
                    </div>
                    Posted by {msg.createdBy.name || 'Admin'}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                No new announcements.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COL: BIRTHDAYS & ALERTS */}
        <div className="space-y-6">
          
          {/* BIRTHDAY CARD */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-purple-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" /> Celebrations
              </h3>
              <span className="text-xs font-medium text-purple-600 bg-white px-2 py-1 rounded-full shadow-sm">This Week</span>
            </div>
            <div className="p-6">
              {upcomingBirthdays.length > 0 ? (
                <ul className="space-y-4">
                  {upcomingBirthdays.map(emp => {
                    const bDay = new Date(emp.dateOfBirth!);
                    const isToday = bDay.getDate() === currentDay && (bDay.getMonth() + 1) === currentMonth;
                    
                    return (
                      <li key={emp.id} className="flex items-center gap-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isToday ? 'bg-[#E30613] text-white animate-bounce' : 'bg-gray-100 text-gray-600'}`}>
                          {emp.firstName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {emp.firstName} {emp.lastName} 
                            {isToday && <span className="ml-2 text-xs bg-yellow-300 text-yellow-900 px-2 py-0.5 rounded-full">Today! 🎂</span>}
                          </p>
                          <p className="text-xs text-gray-500">{emp.department} • {bDay.toLocaleDateString(undefined, {month:'long', day:'numeric'})}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm text-gray-500">No birthdays coming up this week.</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="bg-[#E30613]/5 border border-[#E30613]/20 rounded-xl p-6">
            <h4 className="font-bold text-[#E30613] mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-4">
              If you encounter any system issues or need to update your profile details (excluding email), please visit the Settings page.
            </p>
            <a href="/dashboard/settings" className="text-sm font-bold text-black underline decoration-[#E30613] decoration-2 underline-offset-4 hover:text-[#E30613]">
              Go to Settings &rarr;
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}