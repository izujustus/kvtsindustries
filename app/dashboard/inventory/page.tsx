import { PrismaClient } from '@prisma/client';
import { Package, AlertTriangle, Layers } from 'lucide-react';
import InventoryClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function InventoryPage({
  searchParams,
}: {
  // FIX 1: Define searchParams as a Promise
  searchParams: Promise<{ query?: string; tab?: string }>;
}) {
  // FIX 2: Await the searchParams
  const params = await searchParams;
  const query = params?.query || '';
  const currentTab = params?.tab || 'STOCK'; // STOCK | MOVEMENTS

  // 1. Fetch Raw Products
  const rawProducts = await prisma.product.findMany({
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

  // FIX 3: Transform Decimals to Numbers for the Client
  const products = rawProducts.map(p => ({
    ...p,
    costPrice: Number(p.costPrice),
    sellingPrice: Number(p.sellingPrice),
  }));

  // 2. Fetch Movements (Only if tab is MOVEMENTS)
  let movements: any[] = [];
  if (currentTab === 'MOVEMENTS') {
    const rawMovements = await prisma.inventoryMovement.findMany({
      take: 100,
      orderBy: { date: 'desc' },
      include: { product: true }
    });

    // Transform nested product decimals inside movements
    movements = rawMovements.map(m => ({
      ...m,
      product: {
        ...m.product,
        costPrice: Number(m.product.costPrice),
        sellingPrice: Number(m.product.sellingPrice),
      }
    }));
  }

  // 3. Stats Calculation (Using the transformed numbers)
  const totalStockValue = products.reduce((acc, p) => acc + (p.costPrice * p.stockOnHand), 0);
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