import { PrismaClient } from '@prisma/client';
// import ProformaClientWrapper from './client-wrapper';
import ProformaClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function ProformaPage() {
  // 1. Fetch Proformas
  const rawProformas = await prisma.proformaInvoice.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      customer: true,
      items: { include: { product: true } }
    }
  });

  // 2. Transform Decimals to Numbers
  const proformas = rawProformas.map(p => ({
    ...p,
    subTotal: Number(p.subTotal),
    taxAmount: Number(p.taxAmount),
    totalAmount: Number(p.totalAmount),
    items: p.items.map(i => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total),
      product: {
        ...i.product,
        sellingPrice: Number(i.product.sellingPrice),
        stockOnHand: i.product.stockOnHand
      }
    }))
  }));

  // 3. Fetch Dependencies
  const rawCustomers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
  const customers = rawCustomers.map(c => ({...c, currentBalance: Number(c.currentBalance)}));

  const rawProducts = await prisma.product.findMany({ where: { type: 'FINISHED_GOOD' } });
  const products = rawProducts.map(p => ({...p, sellingPrice: Number(p.sellingPrice)}));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
            <p className="text-sm text-gray-500">Quotations & Preliminary Invoices (Non-Binding)</p>
        </div>
      </div>
      
      <ProformaClientWrapper 
        proformas={proformas} 
        customers={customers} 
        products={products} 
      />
    </div>
  );
}