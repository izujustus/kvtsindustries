// import { auth } from '@/auth';
import { auth } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await auth();
  
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {session?.user?.name}
      </h1>
      <p className="text-gray-500">
        Here is your overview for today.
      </p>
      
      {/* Placeholder Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Production</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">2,340</p>
          <span className="text-xs text-green-500">+12% from last month</span>
        </div>
        {/* Add more cards as we build them */}
      </div>
    </div>
  );
}