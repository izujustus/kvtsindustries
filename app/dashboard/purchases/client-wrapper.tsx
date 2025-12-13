'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Check, Trash2, Truck, Eye, CreditCard, X } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '@/app/ui/users/user-form';
import { PurchaseOrderForm } from '@/app/ui/purchases/purchase-form';
import { PurchaseOrderPrint } from '@/app/ui/purchases/print-view';
// import { SupplierPaymentForm } from '@/app/ui/purchases/payment-form'; // New Import
import { SupplierPaymentForm } from '@/app/ui/purchases/payment-form';
import { receivePurchaseOrder, deletePurchaseOrder } from '@/app/lib/purchase-actions';
import SearchBar from '@/app/ui/users/search';

export default function PurchasesClientWrapper({ orders, suppliers, products }: any) {
  const [modal, setModal] = useState<'CREATE' | 'PAY' | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const { refresh } = useRouter();

  const handleReceive = async (id: string) => {
    if(confirm('Confirm delivery? This will add items to Inventory.')) {
      const res = await receivePurchaseOrder(id);
      if(!res.success) alert(res.message);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this order?')) await deletePurchaseOrder(id);
  };

  const openPayment = (order: any) => {
    setSelectedOrder(order);
    setModal('PAY');
  }

  return (
    <div className="w-full space-y-6">
      
      {/* TOP BAR */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="w-full md:w-1/3">
            <SearchBar />
         </div>
         <button 
            onClick={() => setModal('CREATE')}
            className="flex items-center gap-2 rounded-lg bg-[#E30613] px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 shadow-sm transition-all"
         >
            <Plus className="w-4 h-4" /> Create PO
         </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden w-full">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">PO Number</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Logistics</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Payment</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500">Total</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {orders.map((po: any) => (
              <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-700">{po.poNumber}</span>
                  <div className="text-xs text-gray-400 mt-1">{new Date(po.date).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{po.supplier.name}</td>
                
                {/* STATUS: LOGISTICS */}
                <td className="px-6 py-4">
                  <span className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border",
                    po.status === 'RECEIVED' ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-50 text-blue-700 border-blue-200"
                  )}>
                    {po.status === 'RECEIVED' ? <Check className="w-3 h-3" /> : <Truck className="w-3 h-3" />}
                    {po.status}
                  </span>
                </td>

                {/* STATUS: PAYMENT */}
                <td className="px-6 py-4">
                   <span className={clsx(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border",
                    po.paymentStatus === 'PAID' ? "bg-green-100 text-green-700 border-green-200" : 
                    po.paymentStatus === 'PARTIAL' ? "bg-yellow-100 text-yellow-700 border-yellow-200" : "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {po.paymentStatus}
                  </span>
                  {po.paymentStatus !== 'PAID' && (
                     <div className="text-xs text-gray-400 mt-1">Due: ₦{(Number(po.totalAmount) - Number(po.paidAmount)).toLocaleString()}</div>
                  )}
                </td>

                <td className="px-6 py-4 text-right font-bold text-gray-900">₦{Number(po.totalAmount).toLocaleString()}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => setViewOrder(po)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View"><Eye className="w-4 h-4" /></button>
                    
                    {/* PAY BUTTON */}
                    {po.paymentStatus !== 'PAID' && (
                         <button onClick={() => openPayment(po)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Pay Supplier"><CreditCard className="w-4 h-4" /></button>
                    )}

                    {po.status !== 'RECEIVED' && (
                      <button onClick={() => handleReceive(po.id)} className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 shadow-sm">Receive</button>
                    )}
                    
                    <button onClick={() => handleDelete(po.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-12 text-center text-gray-500">No purchase orders found.</div>}
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'CREATE'} onClose={() => setModal(null)} title="Create Purchase Order">
        <PurchaseOrderForm suppliers={suppliers} products={products} onClose={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'PAY'} onClose={() => setModal(null)} title="Record Payment to Supplier">
        <SupplierPaymentForm order={selectedOrder} onClose={() => setModal(null)} />
      </Modal>

      {/* PRINT VIEW */}
      {viewOrder && <PurchaseOrderPrint order={viewOrder} onClose={() => setViewOrder(null)} />}
    </div>
  );
}