'use client';

import { useActionState, useEffect } from 'react';
import { paySupplierOrder } from '@/app/lib/purchase-actions';
import { Loader2 } from 'lucide-react';

const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:ring-1 focus:ring-green-600 outline-none";

export function SupplierPaymentForm({ order, onClose }: { order: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(paySupplierOrder, undefined);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const dueAmount = Number(order.totalAmount) - Number(order.paidAmount);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={order.id} />
      
      <div className="bg-gray-50 p-4 rounded-lg text-sm mb-4">
        <div className="flex justify-between mb-1">
            <span className="text-gray-500">Order Total:</span>
            <span className="font-bold">₦{Number(order.totalAmount).toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-red-600 font-bold">
            <span>Amount Due:</span>
            <span>₦{dueAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount to Pay</label>
            <input name="amount" type="number" step="0.01" max={dueAmount} defaultValue={dueAmount} required className={INPUT_CLASS} />
        </div>
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Method</label>
            <select name="method" className={INPUT_CLASS}>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CASH">Cash</option>
                <option value="CHECK">Check</option>
            </select>
        </div>
      </div>

      <div>
         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Payment Reference</label>
         <input name="notes" placeholder="Ref No / Check No" className={INPUT_CLASS} />
      </div>

      {state?.message && !state.success && <p className="text-red-600 text-sm">{state.message}</p>}

      <div className="flex justify-end gap-2 pt-4">
         <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
         <button disabled={isPending} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 flex items-center gap-2">
           {isPending && <Loader2 className="w-3 h-3 animate-spin"/>} Record Payment
         </button>
      </div>
    </form>
  );
}