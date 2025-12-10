import { PrismaClient } from '@prisma/client';
import { Download, CreditCard, Users, TrendingUp } from 'lucide-react';
// import SalesClientWrapper from './client-wrapper';
import SalesClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function SalesPage() {
  // 1. Fetch Invoices (Recent 50)
  const invoices = await prisma.salesInvoice.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  });

  // 2. Fetch Customers (All)
  const customers = await prisma.customer.findMany({
    orderBy: { name: 'asc' }
  });

  // 3. Fetch Products (For invoice creation form)
  const products = await prisma.product.findMany({
    where: { type: 'FINISHED_GOOD' }
  });

  // 4. Fetch Unpaid Invoices (For payment form)
  const unpaidInvoices = await prisma.salesInvoice.findMany({
    where: { status: { not: 'PAID' } },
    include: { customer: true }
  });

  // Stats
  const totalRevenue = invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0);
  const outstandingDebt = invoices.reduce((sum, i) => sum + Number(i.balanceDue), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales & Finance</h1>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><TrendingUp className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold">₦{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full"><CreditCard className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Outstanding Debt</p>
            <p className="text-2xl font-bold">₦{outstandingDebt.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Active Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
        </div>
      </div>

      <SalesClientWrapper 
        invoices={invoices} 
        customers={customers} 
        products={products}
        unpaidInvoices={unpaidInvoices}
      />
    </div>
  );
}