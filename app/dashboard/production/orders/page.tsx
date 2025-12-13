import { PrismaClient } from '@prisma/client';
import { Plus } from 'lucide-react';
import SearchBar from '@/app/ui/users/search'; 
import OrdersClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function WorkOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const statusFilter = params?.status || 'ALL';

  // 1. Fetch Products (For the Create Form)
  const products = await prisma.product.findMany({
    where: { type: 'FINISHED_GOOD' },
    select: { id: true, name: true, code: true, sellingPrice: true, costPrice: true }
  });

  // 2. Build Filter
  let whereClause: any = {
    OR: [
      { orderNumber: { contains: query, mode: 'insensitive' } },
      { product: { name: { contains: query, mode: 'insensitive' } } }
    ]
  };

  if (statusFilter !== 'ALL') {
    whereClause.status = statusFilter;
  }

  // 3. Fetch Orders
  const orders = await prisma.productionOrder.findMany({
    where: whereClause,
    include: { product: true },
    orderBy: { createdAt: 'desc' }
  });

  // 4. Counts for Tabs
  const counts = await prisma.productionOrder.groupBy({
    by: ['status'],
    _count: true
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
        <p className="text-sm text-gray-500">Plan, track, and manage production schedules.</p>
      </div>

      {/* SEARCH BAR (In its own row now) */}
      <div className="w-full max-w-md">
         <SearchBar  />
      </div>
      
      {/* CONTENT AREA (Tabs + List) */}
      <OrdersClientWrapper 
         orders={orders} 
         products={products} 
         counts={counts}
         currentStatus={statusFilter}
      />
    </div>
  );
}