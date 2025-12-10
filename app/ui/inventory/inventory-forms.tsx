'use client';

import { useActionState, useEffect } from 'react';
import { createProduct, adjustStock, createBOM } from '@/app/lib/inventory-actions';

// 1. PRODUCT FORM
export function ProductForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createProduct, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU / Code</label>
          <input name="code" required placeholder="TR-205-55-16" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="FINISHED_GOOD">Finished Good (Tire)</option>
            <option value="RAW_MATERIAL">Raw Material (Rubber, Chem)</option>
            <option value="WORK_IN_PROGRESS">WIP</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Product Name</label>
        <input name="name" required placeholder="KNT Radial 205/55 R16" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input name="brand" placeholder="KVTS" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost Price</label>
          <input name="costPrice" type="number" step="0.01" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price</label>
          <input name="sellingPrice" type="number" step="0.01" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Low Stock Alert Level</label>
        <input name="reorderLevel" type="number" defaultValue="10" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {state?.message && !state.success && <p className="text-red-500 text-sm">{state.message}</p>}
      
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-[#E30613] text-white px-4 py-2 rounded text-sm hover:bg-red-700">
          {isPending ? 'Saving...' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}

// 2. ADJUSTMENT FORM
export function AdjustmentForm({ products, onClose }: { products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(adjustStock, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Product</label>
        <select name="productId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.code} - {p.name} (Stock: {p.stockOnHand})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Reason</label>
          <select name="type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="ADJUSTMENT">Inventory Count Correction</option>
            <option value="DAMAGE">Damaged / Scrap</option>
            <option value="RETURN">Customer Return</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity (+/-)</label>
          <input name="quantity" type="number" required placeholder="-5 or 10" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <p className="text-xs text-gray-500 mt-1">Use negative for loss, positive for gain.</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea name="notes" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Why is this happening?"></textarea>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Processing...' : 'Post Adjustment'}
        </button>
      </div>
    </form>
  );
}

// 3. BOM FORM
export function BOMForm({ products, onClose }: { products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createBOM, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const finishedGoods = products.filter(p => p.type === 'FINISHED_GOOD');
  const rawMaterials = products.filter(p => p.type === 'RAW_MATERIAL');

  return (
    <form action={action} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-2">
        Define recipes here. Example: To make <strong>1 Tire</strong>, we need <strong>X amount</strong> of Raw Material.
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Parent Product (Output)</label>
        <select name="parentId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          {finishedGoods.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Component (Input)</label>
          <select name="componentId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            {rawMaterials.map(p => <option key={p.id} value={p.id}>{p.name} (Cost: {p.costPrice})</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Qty Needed</label>
          <input name="quantity" type="number" step="0.0001" required placeholder="e.g. 2.5" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
          {isPending ? 'Linking...' : 'Save BOM'}
        </button>
      </div>
    </form>
  );
}