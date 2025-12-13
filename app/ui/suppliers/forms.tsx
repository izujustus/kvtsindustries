'use client';

import { useActionState, useEffect } from 'react';
import { saveCategory, saveSupplier, recordSupplierPayment } from '@/app/lib/supplier-actions';
import { Save, Loader2, AlertCircle, DollarSign } from 'lucide-react';

// --- STYLES ---
const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all";
const LABEL_CLASS = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

// --- CATEGORY FORM ---
export function CategoryForm({ category, onClose }: { category?: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(saveCategory, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={category?.id || ''} />
      <div>
        <label className={LABEL_CLASS}>Category Name</label>
        <input name="name" defaultValue={category?.name} required className={INPUT_CLASS} />
      </div>
      <div>
        <label className={LABEL_CLASS}>Description</label>
        <textarea name="description" rows={3} defaultValue={category?.description} className={INPUT_CLASS} />
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save
        </button>
      </div>
    </form>
  );
}

// --- SUPPLIER FORM ---
export function SupplierForm({ supplier, onClose }: { supplier?: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(saveSupplier, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={supplier?.id || ''} />
      <div>
        <label className={LABEL_CLASS}>Company Name</label>
        <input name="name" defaultValue={supplier?.name} required className={INPUT_CLASS} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Email</label>
          <input name="email" type="email" defaultValue={supplier?.email} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Phone</label>
          <input name="phone" defaultValue={supplier?.phone} className={INPUT_CLASS} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 text-sm bg-[#E30613] text-white rounded-md hover:bg-red-700 flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Supplier
        </button>
      </div>
    </form>
  );
}

// --- PAYMENT RECORDING FORM ---
export function PaymentForm({ supplierId, currencies, onClose }: { supplierId: string, currencies: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(recordSupplierPayment, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="supplierId" value={supplierId} />
      
      <div className="bg-blue-50 p-3 rounded-lg flex gap-3 border border-blue-100">
         <DollarSign className="w-5 h-5 text-blue-600" />
         <div className="text-xs text-blue-800">
           This will record a payment sent to the supplier and <strong>deduct</strong> from their outstanding balance.
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>Amount</label>
          <input name="amount" type="number" step="0.01" required className={INPUT_CLASS} placeholder="0.00" />
        </div>
        <div>
          <label className={LABEL_CLASS}>Currency</label>
          <select name="currencyId" required className={INPUT_CLASS}>
             {currencies.map(c => <option key={c.id} value={c.id}>{c.code} - {c.symbol}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Payment Method</label>
        <select name="method" className={INPUT_CLASS}>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CASH">Cash</option>
          <option value="CHECK">Check</option>
          <option value="CREDIT_FROM_OVERPAYMENT">Credit (Overpayment)</option>
        </select>
      </div>

      <div>
        <label className={LABEL_CLASS}>Reference / Trans ID</label>
        <input name="reference" className={INPUT_CLASS} placeholder="e.g. TRF-20239991" />
      </div>

      <div>
        <label className={LABEL_CLASS}>Notes</label>
        <textarea name="notes" className={INPUT_CLASS} placeholder="Payment for invoice #..." />
      </div>
      
      {state?.message && !state.success && (
         <div className="text-xs text-red-600 bg-red-50 p-2 rounded">{state.message}</div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Record Payment
        </button>
      </div>
    </form>
  );
}