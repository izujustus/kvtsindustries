// import { auth } from '@/auth';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { Calendar, Bell, Gift, Megaphone, Cake, Sparkles, Settings } from 'lucide-react'; // Added Settings icon for bottom card
import AnnouncementFeed from './announcement-feed'; // <--- NEW IMPORT

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role || 'USER';
  const userName = session?.user?.name || 'Staff Member';

  // 1. Fetch Announcements
  // Updated take: 10 so the scrollable list has more content
  const announcements = await prisma.announcement.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 10, 
    include: { createdBy: true }
  });

  // 2. Fetch Employees & Filter Birthdays (Robust Logic)
  const employees = await prisma.employee.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, firstName: true, lastName: true, department: true, dateOfBirth: true }
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  // Process birthdays
  let birthdaysToday: any[] = [];
  let birthdaysUpcoming: any[] = [];

  employees.forEach(emp => {
    if (!emp.dateOfBirth) return;
    
    const dob = new Date(emp.dateOfBirth);
    // Calculate birthday for current year using UTC to avoid timezone issues
    const bDayThisYear = new Date(today.getFullYear(), dob.getUTCMonth(), dob.getUTCDate());
    
    // Handle end-of-year wrap-around
    if (bDayThisYear < today) {
      bDayThisYear.setFullYear(today.getFullYear() + 1);
    }

    const empWithDate = { ...emp, birthdayThisYear: bDayThisYear };

    if (bDayThisYear.getTime() === today.getTime()) {
      birthdaysToday.push(empWithDate);
    } else if (bDayThisYear > today && bDayThisYear <= nextWeek) {
      birthdaysUpcoming.push(empWithDate);
    }
  });

  // Sort upcoming by date
  birthdaysUpcoming.sort((a, b) => a.birthdayThisYear.getTime() - b.birthdayThisYear.getTime());


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

  const hasBirthdays = birthdaysToday.length > 0 || birthdaysUpcoming.length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* WELCOME BANNER */}
      <div className="bg-gradient-to-r from-black to-gray-900 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#E30613] rounded-full blur-[120px] opacity-20 -mr-20 -mt-20 animate-pulse-slow"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3 tracking-tight">Welcome back, {userName}! 👋</h1>
          <p className="text-gray-300 text-lg">
            Your daily overview is ready. Here is what's happening at KVTS Industries today.
          </p>
          
          <div className="mt-8 inline-flex items-center bg-white/5 backdrop-blur-lg rounded-xl px-5 py-3 border border-white/10 shadow-sm">
            <span className="text-sm font-medium text-gray-300 mr-3">{quickStat.label}:</span>
            <span className="text-xl font-black text-[#E30613]">{quickStat.value}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COL: ANNOUNCEMENTS (Updated to use Client Component) */}
        <AnnouncementFeed announcements={announcements} userRole={userRole} />

        {/* RIGHT COL: BIRTHDAYS & ALERTS */}
        <div className="space-y-6">
          
          {/* CELEBRATIONS CARD */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" /> Celebrations & milestones
              </h3>
            </div>
            
            <div className="p-6">
              {!hasBirthdays ? (
                 <div className="text-center py-8">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300 opacity-50" />
                  <p className="text-sm font-medium text-gray-500">No birthdays coming up in the next 7 days.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* --- TODAY'S SPECIAL BANNER --- */}
                  {birthdaysToday.length > 0 && (
                    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5 text-white shadow-lg">
                      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-soft-light"></div> {/* Optional texture */}
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl animate-pulse"></div>
                      
                      <div className="relative z-10 flex items-start gap-4">
                        <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm shadow-inner">
                           <Cake className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-extrabold flex items-center gap-2">
                             Happy Birthday! <Sparkles className="w-4 h-4 animate-pulse text-yellow-300" />
                          </h4>
                          <p className="font-medium mt-1">
                            {birthdaysToday.map((e: any) => e.firstName + ' ' + e.lastName).join(', ')}
                          </p>
                          <p className="text-sm text-purple-100 mt-2 leading-relaxed">
                            KVTS Industries wishes you a fantastic day and a prosperous year ahead. Thank you for all that you do!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* --- UPCOMING LIST --- */}
                  {birthdaysUpcoming.length > 0 && (
                    <div>
                      {birthdaysToday.length > 0 && <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 pl-1">Also Coming Up</h5>}
                      <ul className="space-y-3">
                        {birthdaysUpcoming.map((emp: any) => (
                          <li key={emp.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors bg-white shadow-sm">
                            <div className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold bg-purple-100 text-purple-700 border border-purple-200">
                              {emp.firstName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-sm">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Turns a year older on <span className="font-medium text-purple-700">{emp.birthdayThisYear.toLocaleDateString(undefined, {month:'long', day:'numeric'})}</span>.
                              </p>
                            </div>
                            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                               {emp.department}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-center text-gray-400 mt-4 italic">Don't forget to wish them well when the day comes!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* HELPER CARD */}
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-500" /> Quick Actions
            </h4>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Need to update your password or personal details? Visit your settings profile to manage your account security.
            </p>
            <a href="/dashboard/settings" className="inline-flex items-center gap-1 text-sm font-bold text-[#E30613] hover:text-red-800 transition-colors">
              Manage Profile &rarr;
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper icon component for the bottom card
function SettingsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}