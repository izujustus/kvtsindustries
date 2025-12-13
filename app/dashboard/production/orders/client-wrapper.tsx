'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, Calendar, CheckCircle, Clock, PlayCircle, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '@/app/ui/users/user-form';
import { WorkOrderForm } from '@/app/ui/production/order-form';
import { updateOrderStatus, deleteOrder } from '@/app/lib/production-order-actions';

export default function OrdersClientWrapper({ 
  orders, 
  products,
  counts,
  currentStatus 
}: any) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabs = ['ALL', 'DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED'];

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'ALL') params.delete('status');
    else params.set('status', status);
    replace(`${pathname}?${params.toString()}`);
  };

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if(confirm('Delete this order?')) await deleteOrder(id);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await updateOrderStatus(id, newStatus);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'PLANNED': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'IN_PROGRESS': return 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse';
      case 'COMPLETED': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-100';
    }
  };

  return (
    <>
      {/* 1. TOP BAR: TABS & ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
        
        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide w-full md:w-auto">
          {tabs.map(tab => {
            const countObj = counts.find((c:any) => c.status === tab);
            const count = tab === 'ALL' ? orders.length : (countObj?._count || 0);
            
            return (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={clsx(
                  "px-4 py-2 text-xs font-bold rounded-lg border transition-all whitespace-nowrap flex items-center gap-2",
                  currentStatus === tab 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-gray-500 border-transparent hover:bg-gray-50"
                )}
              >
                {tab.replace('_', ' ')}
                <span className={clsx("px-1.5 py-0.5 rounded-full text-[10px]", currentStatus === tab ? "bg-gray-700 text-white" : "bg-gray-100 text-gray-600")}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Create Button */}
        <button 
          onClick={() => { setSelectedOrder(null); setModalOpen(true); }}
          className="flex-shrink-0 flex items-center gap-2 rounded-lg bg-[#E30613] px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Order
        </button>
      </div>

      {/* 2. ORDERS LIST */}
      <div className="grid grid-cols-1 gap-4 mt-2">
        {orders.map((order: any) => (
          <div key={order.id} className="group bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             
             {/* Info Section */}
             <div className="flex gap-5 items-start w-full md:w-auto">
               <div className={clsx("w-14 h-14 rounded-xl flex items-center justify-center border shrink-0 shadow-sm", getStatusColor(order.status))}>
                  {order.status === 'COMPLETED' ? <CheckCircle className="w-7 h-7" /> : 
                   order.status === 'IN_PROGRESS' ? <PlayCircle className="w-7 h-7" /> : 
                   <Clock className="w-7 h-7" />}
               </div>
               <div>
                 <div className="flex items-center gap-3 flex-wrap">
                   <h3 className="text-xl font-bold text-gray-900">{order.product.name}</h3>
                   <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">{order.orderNumber}</span>
                 </div>
                 
                 <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded"><Calendar className="w-3.5 h-3.5" /> Start: {new Date(order.startDate).toLocaleDateString()}</span>
                    <span className="font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">Qty: {order.quantity.toLocaleString()}</span>
                    {order.priority === 'HIGH' && <span className="text-red-600 font-bold text-xs uppercase bg-red-50 px-2 py-1 rounded flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> High Priority</span>}
                 </div>
               </div>
             </div>

             {/* Actions Section */}
             <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
               {/* Workflow Buttons */}
               {order.status === 'DRAFT' && (
                 <button onClick={() => handleStatusChange(order.id, 'PLANNED')} className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
                   Plan Order
                 </button>
               )}
               {order.status === 'PLANNED' && (
                 <button onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')} className="px-4 py-2 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 shadow-sm transition-colors flex items-center gap-2">
                   <PlayCircle className="w-3 h-3" /> Start Production
                 </button>
               )}
               {order.status === 'IN_PROGRESS' && (
                 <button onClick={() => handleStatusChange(order.id, 'COMPLETED')} className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors flex items-center gap-2">
                   <CheckCircle className="w-3 h-3" /> Mark Completed
                 </button>
               )}

               <div className="h-8 w-px bg-gray-200 mx-1 hidden md:block"></div>

               <button onClick={() => handleEdit(order)} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors">Edit</button>
               <button onClick={() => handleDelete(order.id)} className="px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
             </div>
          </div>
        ))}
        
        {orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
            <p>No work orders found.</p>
            <button onClick={() => { setSelectedOrder(null); setModalOpen(true); }} className="mt-2 text-[#E30613] font-bold text-sm hover:underline">Create your first order</button>
          </div>
        )}
      </div>
      
      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={selectedOrder ? "Edit Work Order" : "Create Work Order"}>
        <WorkOrderForm 
          order={selectedOrder} 
          products={products} 
          onClose={() => setModalOpen(false)} 
        />
      </Modal>
    </>
  );
}