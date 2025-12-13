'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { CategoryForm } from '@/app/ui/suppliers/forms';
import { deleteCategory } from '@/app/lib/supplier-actions';

export default function CategoryClient({ categories, category, mode = 'HEADER' }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const handleDelete = async (id: string) => {
    if(confirm('Delete this category? Products linked to it might lose their classification.')) {
      await deleteCategory(id);
    }
  };

  if (mode === 'HEADER') {
    return (
      <>
        <button onClick={() => { setIsEdit(false); setIsOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#E30613] text-white rounded-md text-sm font-medium hover:bg-red-700">
          <Plus className="w-4 h-4" /> New Category
        </button>
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Category">
          <CategoryForm onClose={() => setIsOpen(false)} />
        </Modal>
      </>
    );
  }

  return (
    <div className="flex justify-end gap-2">
      <button onClick={() => { setIsEdit(true); setIsOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
      <button onClick={() => handleDelete(category.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
      
      {isOpen && (
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Edit Category">
          <CategoryForm category={category} onClose={() => setIsOpen(false)} />
        </Modal>
      )}
    </div>
  );
}