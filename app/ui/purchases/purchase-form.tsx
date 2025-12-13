'use client';

import { useActionState, useEffect, useState, useMemo } from 'react'; // Added useMemo
import { createPurchaseOrder } from '@/app/lib/purchase-actions';
import { Loader2, Plus, Trash, AlertCircle, Search, X } from 'lucide-react';
import clsx from 'clsx';

const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all";
const LABEL_CLASS = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

type Item = { productId: string; quantity: number; unitCost: number };

export function PurchaseOrderForm({ suppliers, products, onClose }: { suppliers: any[], products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createPurchaseOrder, undefined);
  
  // FORM STATE
  const [items, setItems] = useState<Item[]>([{ productId: '', quantity: 1, unitCost: 0 }]);
  const [total, setTotal] = useState(0);
  const [supplierId, setSupplierId] = useState('');

  // SEARCH STATE
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState<number | null>(null);

  // [FIX] Filter Valid Suppliers & Debug
  // This ensures we only render options that have a valid ID.
  const validSuppliers = useMemo(() => {
    console.log("Raw Suppliers Data:", suppliers); // Check your console (F12) to see this
    return suppliers.filter(s => s && s.id && s.name);
  }, [suppliers]);

  // Auto-calculate Total
  useEffect(() => {
    const t = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
    setTotal(t);
  }, [items]);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitCost: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const updateItem = (idx: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
        const prod = products.find((p: any) => p.id === value);
        newItems[idx].unitCost = prod ? Number(prod.costPrice) : 0;
    }
    // @ts-ignore
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <form action={action} className="space-y-6 h-[80vh] flex flex-col">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="supplierId" value={supplierId} /> 
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        
        {/* HEADER INFO */}
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Supplier</label>
              <select 
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                required 
                className={INPUT_CLASS}
              >
                  <option value="">-- Select Supplier --</option>
                  {validSuppliers.length > 0 ? (
                    validSuppliers.map(s => (
                      // [FIX] Ensured key and value are definitely the ID
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No Valid Suppliers Found</option>
                  )}
              </select>
              {/* Debug Tip for User */}
              {validSuppliers.length < suppliers.length && (
                <p className="text-[10px] text-red-500 mt-1">
                  * Some suppliers were hidden due to missing IDs. Check Database.
                </p>
              )}
            </div>
            <div>
              <label className={LABEL_CLASS}>Order Date</label>
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className={INPUT_CLASS} />
            </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="border border-gray-200 rounded-xl overflow-visible">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
              <h4 className="text-xs font-bold text-gray-700 uppercase">Items</h4>
              <button type="button" onClick={addItem} className="text-xs flex items-center gap-1 text-blue-600 font-medium hover:underline">
                  <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            
            <div className="p-2 space-y-3">
            {items.map((item, i) => {
                const selectedProd = products.find((p: any) => p.id === item.productId);
                
                return (
                    <div key={i} className="flex gap-2 items-start relative">
                    
                    {/* CUSTOM SEARCHABLE SELECT */}
                    <div className="flex-1 relative">
                        {selectedProd ? (
                            <div className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-sm">
                                <span>{selectedProd.name}</span>
                                <button type="button" onClick={() => updateItem(i, 'productId', '')}><X className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"/>
                                <input 
                                    type="text"
                                    placeholder="Search Product..."
                                    className={clsx(INPUT_CLASS, "pl-9")}
                                    onFocus={() => { setActiveSearchIndex(i); setSearchTerm(''); }}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {activeSearchIndex === i && (
                                    <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 shadow-xl rounded-lg max-h-48 overflow-y-auto">
                                        {filteredProducts.map((p: any) => (
                                            <div 
                                                key={p.id} 
                                                onClick={() => { updateItem(i, 'productId', p.id); setActiveSearchIndex(null); }}
                                                className="px-4 py-2 hover:bg-red-50 cursor-pointer text-sm border-b border-gray-50 last:border-0"
                                            >
                                                <div className="font-medium">{p.name}</div>
                                                <div className="text-xs text-gray-500">Stock: {p.stockOnHand}</div>
                                            </div>
                                        ))}
                                        {filteredProducts.length === 0 && <div className="p-3 text-xs text-gray-400">No results found.</div>}
                                        <div className="bg-gray-100 p-2 text-center cursor-pointer text-xs text-blue-600 font-bold" onClick={() => setActiveSearchIndex(null)}>Close</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="w-20">
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                          min="1"
                          className={clsx(INPUT_CLASS)}
                          placeholder="Qty"
                        />
                    </div>
                    <div className="w-24">
                        <input 
                          type="number" 
                          value={item.unitCost} 
                          onChange={(e) => updateItem(i, 'unitCost', Number(e.target.value))}
                          className={clsx(INPUT_CLASS)}
                          placeholder="Cost"
                        />
                    </div>
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-red-400 hover:text-red-600 mt-0.5">
                        <Trash className="w-4 h-4" />
                    </button>
                    </div>
                );
            })}
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right">
              <span className="text-sm text-gray-500 mr-2">Total:</span>
              <span className="text-lg font-bold text-gray-900">₦{total.toLocaleString()}</span>
            </div>
        </div>

        <div>
            <label className={LABEL_CLASS}>Notes</label>
            <textarea name="notes" rows={2} className={INPUT_CLASS} placeholder="Delivery instructions..." />
        </div>

        {/* ERROR DISPLAY */}
        {state?.message && !state.success && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4" /> 
              <span>{state.message}</span>
            </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-auto">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-6 py-2.5 text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Order
        </button>
      </div>
    </form>
  );
}