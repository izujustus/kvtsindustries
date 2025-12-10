'use client';

import { useActionState, useEffect, useState } from 'react';
import { createCustomer, createInvoice, recordPayment } from '@/app/lib/sales-actions';
import { Plus, Trash, Calculator } from 'lucide-react';

// 1. CUSTOMER FORM
export function CustomerForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createCustomer, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Company / Customer Name</label>
        <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Email</label>
           <input name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Phone</label>
           <input name="phone" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Billing Address</label>
        <textarea name="address" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Saving...' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
}

// 2. INVOICE FORM
export function InvoiceForm({ customers, products, onClose }: { customers: any[], products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createInvoice, undefined);
  
  // Cart State
  const [items, setItems] = useState<{productId: string, quantity: number, unitPrice: number}[]>([]);
  const [currentProduct, setCurrentProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const addItem = () => {
    if (!currentProduct) return;
    setItems([...items, { productId: currentProduct, quantity: qty, unitPrice: price }]);
    setCurrentProduct(''); // Reset
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const grandTotal = items.reduce((acc, i) => acc + (i.quantity * i.unitPrice), 0);

  // Update price when product selected
  const handleProductSelect = (pid: string) => {
    setCurrentProduct(pid);
    const prod = products.find(p => p.id === pid);
    if (prod) setPrice(Number(prod.sellingPrice));
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="items" value={JSON.stringify(items)} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Customer</label>
          <select name="customerId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="">Select Customer...</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
          <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      
      <div>
         <label className="block text-sm font-medium text-gray-700">Due Date</label>
         <input name="dueDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {/* Item Builder */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-500">Product</label>
            <select 
              value={currentProduct}
              onChange={(e) => handleProductSelect(e.target.value)}
              className="w-full text-sm rounded-md border-gray-300"
            >
              <option value="">Add Product...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockOnHand})</option>)}
            </select>
          </div>
          <div className="w-20">
            <label className="text-xs font-medium text-gray-500">Qty</label>
            <input type="number" value={qty} min="1" onChange={(e) => setQty(Number(e.target.value))} className="w-full text-sm rounded-md border-gray-300" />
          </div>
          <div className="w-24">
            <label className="text-xs font-medium text-gray-500">Price</label>
            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full text-sm rounded-md border-gray-300" />
          </div>
          <button type="button" onClick={addItem} className="bg-black text-white p-2 rounded-md hover:bg-gray-800"><Plus className="w-4 h-4"/></button>
        </div>

        {/* List */}
        <div className="mt-3 space-y-1">
          {items.map((item, idx) => {
            const pName = products.find(p => p.id === item.productId)?.name;
            return (
              <div key={idx} className="flex justify-between items-center text-sm bg-white p-2 border rounded">
                <span>{item.quantity} x {pName}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono">{(item.quantity * item.unitPrice).toFixed(2)}</span>
                  <button type="button" onClick={() => removeItem(idx)}><Trash className="w-3 h-3 text-red-500"/></button>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-300">
           <span className="font-bold">Total Amount:</span>
           <span className="text-xl font-bold">₦{grandTotal.toLocaleString()}</span>
        </div>
      </div>
      
      {items.length === 0 && <p className="text-xs text-red-500 text-right">Add items to continue.</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending || items.length === 0} className="bg-[#E30613] text-white px-4 py-2 rounded text-sm hover:bg-red-700">
          {isPending ? 'Generating...' : 'Generate Invoice'}
        </button>
      </div>
    </form>
  );
}

// 3. PAYMENT FORM
export function PaymentForm({ invoices, onClose }: { invoices: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(recordPayment, undefined);
  const [selectedInv, setSelectedInv] = useState<any>(null);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const handleInvChange = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    setSelectedInv(inv);
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Outstanding Invoice</label>
        <select name="invoiceId" onChange={(e) => handleInvChange(e.target.value)} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">Select Invoice...</option>
          {invoices.map(inv => (
            <option key={inv.id} value={inv.id}>
              {inv.invoiceNumber} - {inv.customer.name} (Due: {inv.balanceDue})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Amount</label>
          <input name="amount" type="number" step="0.01" defaultValue={selectedInv?.balanceDue} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          {selectedInv && (
            <p className="text-xs text-gray-500 mt-1">
              Due: ₦{selectedInv.balanceDue}. Excess will be stored as credit.
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Method</label>
          <select name="method" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="CASH">Cash</option>
            <option value="CHECK">Check</option>
            <option value="POS">POS</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Reference / Note</label>
        <input name="reference" placeholder="Check No. or Transaction ID" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
          {isPending ? 'Processing...' : 'Record Payment'}
        </button>
      </div>
    </form>
  );
}