'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, Trash2, Truck, Eye } from 'lucide-react'; // Added Eye icon
import clsx from 'clsx';
import { Modal } from '@/app/ui/users/user-form';
import { PurchaseOrderForm } from '@/app/ui/purchases/purchase-form';
import { PurchaseOrderPrint } from '@/app/ui/purchases/print-view'; // Imported Print View
import { receivePurchaseOrder, deletePurchaseOrder } from '@/app/lib/purchase-actions';
import SearchBar from '@/app/ui/users/search';

export default function PurchasesClientWrapper({ orders, suppliers, products }: any) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null); // State for viewing/printing
  const { refresh } = useRouter();

  const handleReceive = async (id: string) => {
    if(confirm('Confirm delivery? This will add items to Inventory and update Supplier balance.')) {
      const res = await receivePurchaseOrder(id);
      if(res.success) {
        refresh();
      } else {
        alert(res.message);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this order?')) await deletePurchaseOrder(id);
  };

  return (
    <div className="w-full space-y-6">
      
      {/* 1. TOP BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="w-full md:w-1/3">
            <SearchBar />
         </div>
         <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-[#E30613] px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 shadow-sm whitespace-nowrap transition-all"
         >
            <Plus className="w-4 h-4" /> Create PO
         </button>
      </div>

      {/* 2. DATA TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500">Total Amount</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((po: any) => (
              <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">{po.poNumber}</span>
                  <div className="text-xs text-gray-400 mt-1">{new Date(po.date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{po.supplier.name}</td>
                <td className="px-6 py-4">
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border",
                    po.status === 'RECEIVED' ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {po.status === 'RECEIVED' ? <Check className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                    {po.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-gray-900">₦{Number(po.totalAmount).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    
                    {/* VIEW / PRINT BUTTON */}
                    <button 
                      onClick={() => setViewOrder(po)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View & Print"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {po.status !== 'RECEIVED' && (
                      <button 
                        onClick={() => handleReceive(po.id)}
                        className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 transition-colors shadow-sm"
                        title="Receive Goods"
                      >
                        Receive
                      </button>
                    )}
                    <button onClick={() => handleDelete(po.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-12 text-center text-gray-500">No purchase orders found.</div>}
      </div>

      {/* 3. MODALS */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Create Purchase Order">
        <PurchaseOrderForm suppliers={suppliers} products={products} onClose={() => setModalOpen(false)} />
      </Modal>

      {/* 4. PRINT PREVIEW OVERLAY */}
      {viewOrder && (
        <PurchaseOrderPrint order={viewOrder} onClose={() => setViewOrder(null)} />
      )}
    </div>
  );
}