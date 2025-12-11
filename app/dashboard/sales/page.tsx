import { PrismaClient } from '@prisma/client';
import { Download, CreditCard, Users, TrendingUp } from 'lucide-react';
import SalesClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function SalesPage() {
  // 1. Fetch Raw Invoices
  const rawInvoices = await prisma.salesInvoice.findMany({
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: { 
      customer: true,
      items: { include: { product: true } } 
    }
  });

  // TRANSFORM INVOICES: Convert all Decimals to Numbers
  const invoices = rawInvoices.map(inv => ({
    ...inv,
    exchangeRate: Number(inv.exchangeRate),
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    balanceDue: Number(inv.balanceDue),
    // Fix Customer inside Invoice (Nested Decimal)
    customer: {
      ...inv.customer,
      currentBalance: Number(inv.customer.currentBalance),
      creditLimit: inv.customer.creditLimit ? Number(inv.customer.creditLimit) : 0,
    },
    items: inv.items.map(item => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      total: Number(item.total),
      taxAmount: Number(item.taxAmount),
      product: {
        ...item.product,
        costPrice: Number(item.product.costPrice),
        sellingPrice: Number(item.product.sellingPrice),
      }
    }))
  }));

  // 2. Fetch Raw Customers
  const rawCustomers = await prisma.customer.findMany({
    orderBy: { name: 'asc' }
  });

  // TRANSFORM CUSTOMERS: Convert Decimals to Numbers
  const customers = rawCustomers.map(c => ({
    ...c,
    currentBalance: Number(c.currentBalance), // <--- Fixes the error you saw
    creditLimit: c.creditLimit ? Number(c.creditLimit) : 0,
  }));

  // 3. Fetch Raw Products
  const rawProducts = await prisma.product.findMany({
    where: { type: 'FINISHED_GOOD' }
  });

  // TRANSFORM PRODUCTS
  const products = rawProducts.map(p => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
  }));

  // 4. Fetch Unpaid Invoices (For Payment Form)
  const rawUnpaidInvoices = await prisma.salesInvoice.findMany({
    where: { status: { not: 'PAID' } },
    include: { customer: true }
  });

  // TRANSFORM UNPAID INVOICES
  const unpaidInvoices = rawUnpaidInvoices.map(inv => ({
    ...inv,
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    balanceDue: Number(inv.balanceDue),
    customer: {
      ...inv.customer,
      currentBalance: Number(inv.customer.currentBalance),
      creditLimit: inv.customer.creditLimit ? Number(inv.customer.creditLimit) : 0,
    }
  }));

  // Stats Calculation (Safe to use mapped values now)
  const totalRevenue = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const outstandingDebt = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

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