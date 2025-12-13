import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Plus, Phone, Mail, Building2, ChevronRight } from 'lucide-react';
import SupplierClient from './client';
// import SupplierClient from './client'; // Client wrapper for Create Modal

const prisma = new PrismaClient();

export default async function SuppliersPage() {
  const suppliers = await prisma.supplier.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true, purchaseOrders: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-sm text-gray-500">Manage vendors and payment balances</p>
        </div>
        <SupplierClient />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <Link href={`/dashboard/suppliers/${s.id}`} key={s.id} className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:border-[#E30613] transition-all">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-gray-100 p-3 rounded-lg text-gray-600 group-hover:bg-red-50 group-hover:text-[#E30613] transition-colors">
                   <Building2 className="w-6 h-6" />
                </div>
                {Number(s.balance) > 0 ? (
                  <span className="bg-red-50 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    Owing: ₦{Number(s.balance).toLocaleString()}
                  </span>
                ) : (
                   <span className="bg-green-50 text-green-700 text-xs font-bold px-2 py-1 rounded-full">Settled</span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{s.name}</h3>
              
              <div className="space-y-1 text-sm text-gray-500 mb-4">
                 <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {s.email || 'No email'}</div>
                 <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {s.phone || 'No phone'}</div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between text-xs font-medium text-gray-500">
                 <span>{s._count.products} Products</span>
                 <span>{s._count.purchaseOrders} Orders</span>
              </div>
            </div>
          </Link>
        ))}
        {suppliers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No suppliers found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
}