import { PrismaClient } from '@prisma/client';
import { Users, DollarSign, Briefcase } from 'lucide-react';
// import HRClientWrapper from './client-wrapper';
import HRClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function HRPage() {
  // 1. Fetch Employees
  const rawEmployees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // TRANSFORM
  const employees = rawEmployees.map(e => ({
    ...e,
    basicSalary: Number(e.basicSalary),
  }));

  // 2. Fetch Payroll History
  const rawPayrolls = await prisma.payroll.findMany({
    take: 50,
    orderBy: { paymentDate: 'desc' },
    include: { employee: true }
  });

  // TRANSFORM
  const payrolls = rawPayrolls.map(p => ({
    ...p,
    basicSalary: Number(p.basicSalary),
    totalAllowances: Number(p.totalAllowances),
    totalDeductions: Number(p.totalDeductions),
    netPay: Number(p.netPay),
  }));

  // Stats
  const totalEmployees = employees.length;
  const totalPayrollCost = payrolls.reduce((sum, p) => sum + p.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">HR & Payroll</h1>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-2xl font-bold">{totalEmployees}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><DollarSign className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Total Payroll Disbursed</p>
            <p className="text-2xl font-bold">₦{totalPayrollCost.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><Briefcase className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Departments</p>
            <p className="text-2xl font-bold">5</p>
          </div>
        </div>
      </div>

      <HRClientWrapper employees={employees} payrolls={payrolls} />
    </div>
  );
}