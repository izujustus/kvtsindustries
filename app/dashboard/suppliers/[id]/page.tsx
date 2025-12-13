import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Building2, Phone, Mail, Clock, Wallet, Package } from 'lucide-react';
import SupplierDetailClient from './client';
// import SupplierDetailClient from './client'; // Handles Payment Modal

const prisma = new PrismaClient();

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      products: true,
      payments: { orderBy: { date: 'desc' }, include: { currency: true } },
      purchaseOrders: { orderBy: { date: 'desc' }, take: 5 }
    }
  });

  const currencies = await prisma.currency.findMany({ where: { isActive: true } });

  if (!supplier) notFound();

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex gap-4">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{supplier.name}</h1>
            <div className="flex flex-col sm:flex-row gap-3 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {supplier.email || 'N/A'}</span>
              <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {supplier.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
           <p className="text-sm text-gray-500 uppercase font-bold tracking-wide">Current Balance</p>
           <p className={`text-3xl font-bold ${Number(supplier.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
             ₦{Number(supplier.balance).toLocaleString()}
           </p>
           <SupplierDetailClient supplier={supplier} currencies={currencies} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COL: Products */}
        <div className="lg:col-span-2 space-y-6">
           {/* PRODUCTS LIST */}
           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <h3 className="font-bold text-gray-800">Supplied Products</h3>
             </div>
             <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-500">Product</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-500">Cost</th>
                    <th className="px-4 py-2 text-center text-xs font-bold text-gray-500">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {supplier.products.map(p => (
                     <tr key={p.id}>
                       <td className="px-4 py-3 text-sm text-gray-900">{p.name} <span className="text-gray-400 text-xs">({p.code})</span></td>
                       <td className="px-4 py-3 text-sm text-right">₦{Number(p.costPrice).toLocaleString()}</td>
                       <td className="px-4 py-3 text-sm text-center">{p.stockOnHand}</td>
                     </tr>
                   ))}
                   {supplier.products.length === 0 && (
                     <tr><td colSpan={3} className="p-4 text-center text-sm text-gray-500">No products linked yet.</td></tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>

        {/* RIGHT COL: Payments & History */}
        <div className="space-y-6">
           
           {/* PAYMENTS CARD */}
           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-gray-500" />
                <h3 className="font-bold text-gray-800">Payment History</h3>
             </div>
             <div className="max-h-[300px] overflow-y-auto">
               {supplier.payments.length === 0 ? (
                 <p className="p-4 text-sm text-gray-500">No payments recorded.</p>
               ) : (
                 <ul className="divide-y divide-gray-100">
                   {supplier.payments.map(pay => (
                     <li key={pay.id} className="p-4 hover:bg-gray-50">
                       <div className="flex justify-between items-center">
                         <span className="font-bold text-gray-900">-{pay.currency.symbol}{Number(pay.amount).toLocaleString()}</span>
                         <span className="text-xs text-gray-500">{new Date(pay.date).toLocaleDateString()}</span>
                       </div>
                       <div className="flex justify-between mt-1 text-xs text-gray-500">
                         <span>{pay.method.replace('_', ' ')}</span>
                         <span>{pay.reference || '#'}</span>
                       </div>
                     </li>
                   ))}
                 </ul>
               )}
             </div>
           </div>

           {/* RECENT ORDERS (Placeholder for now) */}
           <div className="bg-white rounded-xl border border-gray-200 overflow-hidden opacity-70">
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <h3 className="font-bold text-gray-800">Recent POs</h3>
             </div>
             <div className="p-4 text-sm text-gray-500">
               Purchase Order module coming soon.
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}