import { PrismaClient } from '@prisma/client';
import { Truck, Wrench, User } from 'lucide-react';
import AssetsClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function AssetsPage() {
  // 1. Fetch Raw Assets
  // We use 'raw' because we need to process the Decimal fields
  const rawAssets = await prisma.asset.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      assignedTo: true // To see who has it
    }
  });

  // 2. TRANSFORM: Convert Prisma Decimals to Numbers
  // This step fixes the "Plain objects" error
  const assets = rawAssets.map(asset => ({
    ...asset,
    purchaseCost: Number(asset.purchaseCost), // Converting Decimal -> Number
  }));

  // 3. Fetch Employees (For assignment dropdown)
  const employees = await prisma.employee.findMany({
    orderBy: { firstName: 'asc' }
  });

  // 4. Stats Calculations (Using the transformed 'assets' array)
  const totalValue = assets.reduce((sum, a) => sum + a.purchaseCost, 0);
  const assignedCount = assets.filter(a => a.assignedToEmployeeId).length;
  const inRepairCount = assets.filter(a => a.status === 'IN_REPAIR').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Truck className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Total Asset Value</p>
            <p className="text-2xl font-bold">₦{totalValue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><User className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Assets Assigned</p>
            <p className="text-2xl font-bold">{assignedCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><Wrench className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">In Maintenance</p>
            <p className="text-2xl font-bold">{inRepairCount}</p>
          </div>
        </div>
      </div>

      <AssetsClientWrapper assets={assets} employees={employees} />
    </div>
  );
}