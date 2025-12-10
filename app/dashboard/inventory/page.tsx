import { PrismaClient } from '@prisma/client';
import SearchBar from '@/app/ui/users/search';
import { Package, AlertTriangle, ArrowRightLeft, Layers } from 'lucide-react';
// import InventoryClientWrapper from './client-wrapper';
import InventoryClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: { query?: string; tab?: string };
}) {
  const query = searchParams?.query || '';
  const currentTab = searchParams?.tab || 'STOCK'; // STOCK | MOVEMENTS

  // 1. Fetch Products
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { code: { contains: query, mode: 'insensitive' } },
      ]
    },
    orderBy: { type: 'asc' }, // Group Raw Materials & Finished Goods
    include: {
      bomChild: true // See what recipes this material is used in
    }
  });

  // 2. Fetch Movements (Only if tab is MOVEMENTS)
  let movements: any[] = [];
  if (currentTab === 'MOVEMENTS') {
    movements = await prisma.inventoryMovement.findMany({
      take: 100,
      orderBy: { date: 'desc' },
      include: { product: true }
    });
  }

  // 3. Stats Calculation
  const totalStockValue = products.reduce((acc, p) => acc + (Number(p.costPrice) * p.stockOnHand), 0);
  const lowStockCount = products.filter(p => p.stockOnHand <= p.reorderLevel).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
      </div>

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Package className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Total Items</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full"><Layers className="w-6 h-6"/></div>
          <div>
            <p className="text-sm text-gray-500">Total Valuation</p>
            <p className="text-2xl font-bold">₦{totalStockValue.toLocaleString()}</p>
          </div>
        </div>
        <div className={lowStockCount > 0 ? "bg-red-50 p-5 rounded-xl border border-red-200 shadow-sm flex items-center gap-4" : "bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4"}>
          <div className={lowStockCount > 0 ? "p-3 bg-red-100 text-red-600 rounded-full" : "p-3 bg-gray-50 text-gray-600 rounded-full"}><AlertTriangle className="w-6 h-6"/></div>
          <div>
            <p className={lowStockCount > 0 ? "text-sm text-red-600 font-bold" : "text-sm text-gray-500"}>Low Stock Alerts</p>
            <p className="text-2xl font-bold">{lowStockCount}</p>
          </div>
        </div>
      </div>

      {/* PASS DATA TO CLIENT WRAPPER */}
      <InventoryClientWrapper 
        products={products} 
        movements={movements}
        currentTab={currentTab}
      />
    </div>
  );
}