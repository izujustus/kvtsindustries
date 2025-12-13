'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { SupplierForm } from '@/app/ui/suppliers/forms';

export default function SupplierClient() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[#E30613] text-white rounded-md text-sm font-medium hover:bg-red-700 shadow-sm">
        <Plus className="w-4 h-4" /> Add Supplier
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="New Supplier">
        <SupplierForm onClose={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}