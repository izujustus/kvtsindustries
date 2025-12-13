import { PrismaClient } from '@prisma/client';
import PurchasesClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';

  // 1. Fetch & Transform Data for Dropdowns
  const rawSuppliers = await prisma.supplier.findMany({ 
    select: { id: true, name: true } 
  });
  
  const rawProducts = await prisma.product.findMany({ 
    select: { id: true, name: true, stockOnHand: true, costPrice: true } 
  });

  // [FIX] Convert Decimal to Number for Client Component
  const products = rawProducts.map(p => ({
    ...p,
    costPrice: Number(p.costPrice)
  }));

  // 2. Fetch & Transform POs
  const rawOrders = await prisma.purchaseOrder.findMany({
    where: {
      OR: [
        { poNumber: { contains: query, mode: 'insensitive' } },
        { supplier: { name: { contains: query, mode: 'insensitive' } } }
      ]
    },
    include: { 
      supplier: true, // Includes Decimal balance
      items: true     // Includes Decimal unitCost & total
    },
    orderBy: { date: 'desc' }
  });

  // [FIX] Deep conversion of Decimals for Orders
  const orders = rawOrders.map(order => ({
    ...order,
    totalAmount: Number(order.totalAmount),
    supplier: {
      ...order.supplier,
      balance: Number(order.supplier.balance)
    },
    items: order.items.map(item => ({
      ...item,
      unitCost: Number(item.unitCost),
      total: Number(item.total)
    }))
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement</h1>
          <p className="text-sm text-gray-500">Order raw materials and track supplier deliveries.</p>
        </div>
      </div>

      <PurchasesClientWrapper 
         orders={orders} 
         suppliers={rawSuppliers} 
         products={products} 
      />
    </div>
  );
}