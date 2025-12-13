'use client';

import { useState } from 'react';
import { DollarSign, Edit } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { PaymentForm, SupplierForm } from '@/app/ui/suppliers/forms';

export default function SupplierDetailClient({ supplier, currencies }: any) {
  const [showPayment, setShowPayment] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="flex gap-2 justify-end mt-4">
      <button 
        onClick={() => setShowEdit(true)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 flex items-center gap-2"
      >
        <Edit className="w-4 h-4" /> Edit Profile
      </button>

      <button 
        onClick={() => setShowPayment(true)}
        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-bold hover:bg-green-700 shadow-sm flex items-center gap-2"
      >
        <DollarSign className="w-4 h-4" /> Record Payment
      </button>

      {/* MODALS */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title={`Pay ${supplier.name}`}>
         <PaymentForm supplierId={supplier.id} currencies={currencies} onClose={() => setShowPayment(false)} />
      </Modal>

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Supplier">
         <SupplierForm supplier={supplier} onClose={() => setShowEdit(false)} />
      </Modal>
    </div>
  );
}