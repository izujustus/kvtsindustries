'use client';

import { useActionState, useEffect, useState } from 'react';
import { createPurchaseOrder } from '@/app/lib/purchase-actions';
import { Save, Loader2, Plus, Trash, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// STYLES
const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all";
const LABEL_CLASS = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

type Item = { productId: string; quantity: number; unitCost: number };

export function PurchaseOrderForm({ suppliers, products, onClose }: { suppliers: any[], products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createPurchaseOrder, undefined);
  
  // Item State
  const [items, setItems] = useState<Item[]>([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [total, setTotal] = useState(0);

  // Auto-calculate Total
  useEffect(() => {
    const t = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    setTotal(t);
  }, [items]);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  // Handlers
  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitCost: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  
  const updateItem = (idx: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    // If product changes, auto-fill the cost price from DB
    if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        newItems[idx].unitCost = prod ? Number(prod.costPrice) : 0;
    }
    // @ts-ignore
    newItems[idx][field] = value;
    setItems(newItems);
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      {/* HEADER INFO */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Supplier</label>
          <select name="supplierId" required className={INPUT_CLASS}>
            <option value="">-- Select Supplier --</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Order Date</label>
          <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className={INPUT_CLASS} />
        </div>
      </div>

      {/* ITEMS TABLE */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
           <h4 className="text-xs font-bold text-gray-700 uppercase">Items to Order</h4>
           <button type="button" onClick={addItem} className="text-xs flex items-center gap-1 text-blue-600 font-medium hover:underline">
             <Plus className="w-3 h-3" /> Add Item
           </button>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
           {items.map((item, i) => (
             <div key={i} className="flex gap-2 items-start">
               <div className="flex-1">
                 <select 
                   value={item.productId} 
                   onChange={(e) => updateItem(i, 'productId', e.target.value)}
                   required
                   className={clsx(INPUT_CLASS, "text-xs py-2")}
                 >
                   <option value="">-- Select Material --</option>
                   {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.stockOnHand})</option>)}
                 </select>
               </div>
               <div className="w-20">
                 <input 
                   type="number" 
                   value={item.quantity} 
                   onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                   placeholder="Qty"
                   min="1"
                   className={clsx(INPUT_CLASS, "text-xs py-2")}
                 />
               </div>
               <div className="w-24">
                 <input 
                   type="number" 
                   value={item.unitCost} 
                   onChange={(e) => updateItem(i, 'unitCost', Number(e.target.value))}
                   placeholder="Cost"
                   className={clsx(INPUT_CLASS, "text-xs py-2")}
                 />
               </div>
               <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-400 hover:text-red-600">
                 <Trash className="w-4 h-4" />
               </button>
             </div>
           ))}
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right">
           <span className="text-sm text-gray-500 mr-2">Total Order Value:</span>
           <span className="text-lg font-bold text-gray-900">₦{total.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Notes</label>
        <textarea name="notes" rows={2} className={INPUT_CLASS} placeholder="Delivery instructions..." />
      </div>

      {state?.message && !state.success && (
         <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
           <AlertCircle className="w-4 h-4" /> {state.message}
         </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-6 py-2.5 text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Order
        </button>
      </div>
    </form>
  );
}