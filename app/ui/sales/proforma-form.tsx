'use client';

import { useActionState, useEffect, useState, useRef } from 'react';

import { Plus, Trash, Search, X, ChevronDown, Save } from 'lucide-react'; 
import clsx from 'clsx';
import { saveProforma } from '@/app/lib/lib/proforma-actions';

export function ProformaForm({ customers, products, onClose, initialData }: any) {
  const [state, action, isPending] = useActionState(saveProforma, undefined);

  // ITEMS STATE
  const [items, setItems] = useState<{productId: string, quantity: number, unitPrice: number, description?: string}[]>(
    initialData ? initialData.items.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      description: i.description || ''
    })) : []
  );

  // META STATE
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialData ? initialData.customerId : '');
  const [customerSearch, setCustomerSearch] = useState(initialData ? initialData.customer.name : '');
  const [date, setDate] = useState(initialData ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(initialData ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '');
  const [notes, setNotes] = useState(initialData?.notes || 'Valid for 30 days. Goods released only upon full payment.');

  // DROPDOWN UI
  const [isCustOpen, setIsCustOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // PRODUCT BUILDER
  const [prodSearch, setProdSearch] = useState('');
  const [prodId, setProdId] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodQty, setProdQty] = useState(1);
  const [isProdOpen, setIsProdOpen] = useState(false);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  // Add Item Logic
  const addItem = () => {
    if(!prodId) return;
    setItems([...items, { productId: prodId, quantity: prodQty, unitPrice: prodPrice }]);
    setProdId(''); setProdSearch(''); setProdQty(1); setProdPrice(0);
  };

  // Totals
  const total = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);

  const filteredCustomers = customers.filter((c: any) => c.name.toLowerCase().includes(customerSearch.toLowerCase()));
  const filteredProducts = products.filter((p: any) => p.name.toLowerCase().includes(prodSearch.toLowerCase()));

  return (
    <form action={action} className="flex flex-col h-[80vh]">
      <input type="hidden" name="id" value={initialData?.id || ''} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <input type="hidden" name="customerId" value={selectedCustomerId} />

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-12">
        {/* CUSTOMER & DATES */}
        <div className="grid grid-cols-2 gap-4">
            <div className="relative">
                <label className="text-sm font-medium text-gray-700">Customer</label>
                <input 
                    type="text" 
                    value={customerSearch} 
                    onChange={(e) => { setCustomerSearch(e.target.value); setIsCustOpen(true); }}
                    className="w-full mt-1 rounded-md border-gray-300 text-sm focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Search Customer..."
                />
                {isCustOpen && (
                    <div className="absolute z-10 w-full bg-white border shadow-lg max-h-40 overflow-auto mt-1 rounded">
                        {filteredCustomers.map((c: any) => (
                            <div key={c.id} onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(c.name); setIsCustOpen(false); }} className="p-2 hover:bg-purple-50 cursor-pointer text-sm">
                                {c.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full mt-1 rounded-md border-gray-300 text-sm" />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-700">Valid Until</label>
                    <input name="expiryDate" type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full mt-1 rounded-md border-gray-300 text-sm" />
                </div>
            </div>
        </div>

        {/* ADD ITEM */}
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
            <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                    <label className="text-xs font-medium text-gray-500">Product</label>
                    <input 
                        value={prodSearch}
                        onChange={(e) => { setProdSearch(e.target.value); setIsProdOpen(true); }}
                        placeholder="Search Product..."
                        className="w-full text-sm rounded-md border-gray-300"
                    />
                    {isProdOpen && (
                        <div className="absolute z-10 w-full bg-white border shadow-lg max-h-40 overflow-auto mt-1 rounded">
                            {filteredProducts.map((p: any) => (
                                <div key={p.id} onClick={() => { setProdId(p.id); setProdSearch(p.name); setProdPrice(p.sellingPrice); setIsProdOpen(false); }} className="p-2 hover:bg-purple-50 cursor-pointer text-sm flex justify-between">
                                    <span>{p.name}</span>
                                    <span className="font-mono">₦{p.sellingPrice}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="w-20">
                    <label className="text-xs font-medium text-gray-500">Qty</label>
                    <input type="number" value={prodQty} onChange={(e) => setProdQty(Number(e.target.value))} className="w-full text-sm rounded-md border-gray-300" />
                </div>
                <div className="w-24">
                    <label className="text-xs font-medium text-gray-500">Price</label>
                    <input type="number" value={prodPrice} readOnly className="w-full text-sm rounded-md border-gray-300 bg-gray-200 text-gray-500" />
                </div>
                <button type="button" onClick={addItem} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700"><Plus className="w-4 h-4"/></button>
            </div>
        </div>

        {/* LIST */}
        <div className="space-y-1">
            {items.map((item, idx) => {
                const pName = products.find((p: any) => p.id === item.productId)?.name;
                return (
                    <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 border rounded">
                        <span>{item.quantity} x {pName}</span>
                        <div className="flex items-center gap-3">
                            <span className="font-mono">₦{(item.quantity * item.unitPrice).toLocaleString()}</span>
                            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))}><Trash className="w-3 h-3 text-red-500"/></button>
                        </div>
                    </div>
                )
            })}
        </div>

        <div className="pt-2">
            <label className="text-sm font-medium text-gray-700">Terms & Notes</label>
            <textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full mt-1 rounded-md border-gray-300 text-sm h-20" />
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 mt-auto">
        <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-gray-700">Total Estimate:</span>
            <span className="text-xl font-bold text-purple-700">₦{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
            <button disabled={isPending || !items.length || !selectedCustomerId} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50">
                {isPending ? 'Saving...' : <><Save className="w-4 h-4"/> Save Proforma</>}
            </button>
        </div>
      </div>
    </form>
  );
}