'use client';

import { useActionState, useEffect } from 'react';
import { postAndGenerateInvoice } from '@/app/lib/invoice-lifecycle';
import { Truck, User, Phone, CheckCircle } from 'lucide-react';

export function DriverDetailsForm({ invoiceId, onClose }: { invoiceId: string, onClose: () => void }) {
  // We wrap the server action to include the specific invoiceId
  const postAction = postAndGenerateInvoice.bind(null, invoiceId);
  const [state, action, isPending] = useActionState(postAction, undefined);

  useEffect(() => {
    if (state?.success) {
      onClose(); // Close modal on success
      // Optional: Trigger a toast notification here
    }
  }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <span className="font-bold">Warning:</span> This action is irreversible. 
              Stock will be deducted, the Invoice Number generated, and the Waybill created.
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Driver Name</label>
        <div className="relative mt-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input name="driverName" required className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-sm" placeholder="e.g. Mr. Okonkwo" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle Number</label>
          <div className="relative mt-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Truck className="h-4 w-4 text-gray-400" />
            </div>
            <input name="vehicleNumber" required className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-sm uppercase" placeholder="KJA-123-XP" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Driver Phone</label>
          <div className="relative mt-1">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-4 w-4 text-gray-400" />
             </div>
             <input name="driverPhone" className="block w-full pl-10 rounded-md border border-gray-300 py-2 text-sm" placeholder="080..." />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 mt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button 
          type="submit" 
          disabled={isPending} 
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-green-700 disabled:opacity-50"
        >
          {isPending ? 'Processing...' : (
            <>
              <CheckCircle className="w-4 h-4" /> Approve & Generate
            </>
          )}
        </button>
      </div>
      
      {state?.message && !state.success && (
        <p className="text-red-600 text-sm text-center mt-2">{state.message}</p>
      )}
    </form>
  );
}