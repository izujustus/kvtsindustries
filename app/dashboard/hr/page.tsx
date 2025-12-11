// // import { PrismaClient } from '@prisma/client';
// import { Users, DollarSign, Briefcase } from 'lucide-react';
// import HRClientWrapper from './client-wrapper';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function HRPage() {
//   // 1. Fetch Employees
//   const rawEmployees = await prisma.employee.findMany({
//     orderBy: { createdAt: 'desc' }
//   });

//   // TRANSFORM EMPLOYEES: Convert Decimal to Number for the Client
//   const employees = rawEmployees.map(e => ({
//     ...e,
//     basicSalary: Number(e.basicSalary),
//   }));

//   // 2. Fetch Payroll History with Nested Employee Data
//   const rawPayrolls = await prisma.payroll.findMany({
//     take: 50,
//     orderBy: { paymentDate: 'desc' },
//     include: { employee: true } // Fetch the related employee
//   });

//   // TRANSFORM PAYROLLS: Convert Decimals in both Payroll AND Nested Employee
//   const payrolls = rawPayrolls.map(p => ({
//     ...p,
//     // Fix Top-level Decimals
//     basicSalary: Number(p.basicSalary),
//     totalAllowances: Number(p.totalAllowances),
//     totalDeductions: Number(p.totalDeductions),
//     netPay: Number(p.netPay),
    
//     // Fix Nested Employee Decimals (Critical Fix)
//     employee: {
//       ...p.employee,
//       basicSalary: Number(p.employee.basicSalary)
//     }
//   }));

//   // Stats Calculations
//   const totalEmployees = employees.length;
//   const totalPayrollCost = payrolls.reduce((sum, p) => sum + p.netPay, 0);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold text-gray-900">HR & Payroll</h1>
//       </div>

//       {/* STATS CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users className="w-6 h-6"/></div>
//           <div>
//             <p className="text-sm text-gray-500">Total Employees</p>
//             <p className="text-2xl font-bold">{totalEmployees}</p>
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-green-50 text-green-600 rounded-full"><DollarSign className="w-6 h-6"/></div>
//           <div>
//             <p className="text-sm text-gray-500">Total Payroll Disbursed</p>
//             <p className="text-2xl font-bold">₦{totalPayrollCost.toLocaleString()}</p>
//           </div>
//         </div>
//         <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-purple-50 text-purple-600 rounded-full"><Briefcase className="w-6 h-6"/></div>
//           <div>
//             <p className="text-sm text-gray-500">Departments</p>
//             <p className="text-2xl font-bold">5</p>
//           </div>
//         </div>
//       </div>

//       <HRClientWrapper employees={employees} payrolls={payrolls} />
//     </div>
//   );
// }
import { PrismaClient } from '@prisma/client';
import { Users, DollarSign, Briefcase } from 'lucide-react';
import HRClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function HRPage() {
  // 1. Fetch Employees
  const rawEmployees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      department: true,
      subDepartment: true 
    } 
  });

  // TRANSFORM EMPLOYEES
  const employees = rawEmployees.map(e => ({
    ...e,
    basicSalary: Number(e.basicSalary),
    department: e.department?.name || 'N/A', 
    subDepartment: e.subDepartment?.name || ''
  }));

  // 2. Fetch Payroll History
  const rawPayrolls = await prisma.payroll.findMany({
    take: 50,
    orderBy: { paymentDate: 'desc' },
    include: { employee: true }
  });

  const payrolls = rawPayrolls.map(p => ({
    ...p,
    basicSalary: Number(p.basicSalary),
    totalAllowances: Number(p.totalAllowances),
    totalDeductions: Number(p.totalDeductions),
    netPay: Number(p.netPay),
    employee: {
      ...p.employee,
      basicSalary: Number(p.employee.basicSalary)
    }
  }));

  // 3. NEW: Fetch Departments for the Form
  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
    include: { subDepartments: { orderBy: { name: 'asc' } } }
  });

  // Stats
  const totalEmployees = employees.length;
  const totalPayrollCost = payrolls.reduce((sum, p) => sum + p.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">HR & Payroll</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ... (Keep your stats cards same as before) ... */}
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
            <p className="text-2xl font-bold">{departments.length}</p>
          </div>
        </div>
      </div>

      {/* Pass departments to the wrapper */}
      <HRClientWrapper employees={employees} payrolls={payrolls} departments={departments} />
    </div>
  );
}