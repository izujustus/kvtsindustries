'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useActionState } from 'react'; // React 19 / Next 15 Hook
import { upsertCustomer } from '@/app/lib/customer-actions'; // We created this above
import { Search, Plus, User, MapPin, Phone, Mail, ArrowRight, Edit } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form'; // Reusing your existing Modal

export default function CustomerClientWrapper({ customers }: { customers: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);

  // Filter Logic
  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const handleEdit = (e: React.MouseEvent, customer: any) => {
    e.preventDefault(); // Prevent navigation to detail page
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-[#E30613] focus:border-[#E30613]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 bg-[#E30613] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => {
          const balance = Number(c.currentBalance);
          return (
            <Link 
              key={c.id} 
              href={`/dashboard/customers/${c.id}`}
              className="group block bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all hover:border-red-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{c.name}</h3>
                    <p className="text-xs text-gray-500">{c.code || 'NO ID'}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => handleEdit(e, c)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3 h-3" /> <span>{c.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> <span className="truncate">{c.address || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex justify-between items-center">
                <div className="text-xs">
                  <span className="text-gray-500">Balance:</span>
                  <div className={balance > 0 ? "text-red-600 font-bold" : balance < 0 ? "text-green-600 font-bold" : "text-gray-900 font-bold"}>
                    {balance < 0 ? `Credit: ₦${Math.abs(balance).toLocaleString()}` : `₦${balance.toLocaleString()}`}
                  </div>
                </div>
                <div className="flex items-center text-xs text-[#E30613] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  View Profile <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No customers found.</div>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}>
        <CustomerFormWrapper 
          customer={editingCustomer} 
          onClose={() => setIsModalOpen(false)} 
        />
      </Modal>
    </>
  );
}

// FORM COMPONENT (Inside wrapper to keep it clean)
function CustomerFormWrapper({ customer, onClose }: { customer?: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(upsertCustomer, undefined);
  
  // Close on success (Checking state)
  if (state?.success) {
     // Small timeout to allow UI update before closing, or use useEffect in parent
     setTimeout(() => onClose(), 100);
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={customer?.id || ''} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer Name</label>
        <input name="name" defaultValue={customer?.name} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
         <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" defaultValue={customer?.email} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
         </div>
         <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input name="phone" defaultValue={customer?.phone} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
         </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <textarea name="address" defaultValue={customer?.address} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div>
         <label className="block text-sm font-medium text-gray-700">Credit Limit (Optional)</label>
         <input name="creditLimit" type="number" defaultValue={customer?.creditLimit} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {state?.message && !state.success && (
        <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{state.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Saving...' : 'Save Customer'}
        </button>
      </div>
    </form>
  )
}