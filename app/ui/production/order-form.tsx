'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveProductionOrder } from '@/app/lib/production-order-actions';
import { Save, Loader2, AlertCircle, Calculator, Calendar, AlertTriangle, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

// --- SHARED STYLES (Matching Inventory Form) ---
const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all placeholder:text-gray-400";
const SELECT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all bg-white";
const LABEL_CLASS = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

export function WorkOrderForm({ order, products, onClose }: { order?: any, products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(saveProductionOrder, undefined);
  
  // Estimation State
  const [selectedProdId, setSelectedProdId] = useState(order?.productId || '');
  const [qty, setQty] = useState(order?.quantity || 100);
  const [estimate, setEstimate] = useState<any>(null);

  // Calculate Estimates in Real-time
  useEffect(() => {
    if(!selectedProdId || !qty) {
      setEstimate(null);
      return;
    }
    const prod = products.find(p => p.id === selectedProdId);
    if(prod) {
      const estimatedCost = Number(prod.costPrice) * qty;
      const estimatedRevenue = Number(prod.sellingPrice) * qty;
      setEstimate({ cost: estimatedCost, revenue: estimatedRevenue });
    }
  }, [selectedProdId, qty, products]);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="id" value={order?.id || ''} />
      
      {/* 1. PRODUCT & QTY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={LABEL_CLASS}>Target Product</label>
          <select 
            name="productId" 
            value={selectedProdId}
            onChange={(e) => setSelectedProdId(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="">-- Select Product --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Quantity to Produce</label>
          <input 
            name="quantity" 
            type="number" 
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className={INPUT_CLASS} 
          />
        </div>
      </div>

      {/* 2. ESTIMATION CARD (Smart Feature) */}
      {estimate && (
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
           <div className="flex gap-3 items-center">
             <div className="bg-white border border-gray-200 p-2 rounded-lg text-gray-600"><Calculator className="w-5 h-5" /></div>
             <div>
               <p className="text-xs font-bold text-gray-500 uppercase">Projections</p>
               <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>Cost: ₦{estimate.cost.toLocaleString()}</span>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span className="font-bold text-green-700">Rev: ₦{estimate.revenue.toLocaleString()}</span>
               </div>
             </div>
           </div>
        </div>
      )}

      {/* 3. DATES & PRIORITY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className={LABEL_CLASS}>Start Date</label>
          <div className="relative">
            <input name="startDate" type="date" defaultValue={order?.startDate ? new Date(order.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} className={INPUT_CLASS} />
          </div>
        </div>
        <div>
          <label className={LABEL_CLASS}>Due Date (Optional)</label>
          <input name="dueDate" type="date" defaultValue={order?.dueDate ? new Date(order.dueDate).toISOString().split('T')[0] : ''} className={INPUT_CLASS} />
        </div>
        <div>
          <label className={LABEL_CLASS}>Priority</label>
          <select name="priority" defaultValue={order?.priority || 'NORMAL'} className={SELECT_CLASS}>
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High (Urgent)</option>
          </select>
        </div>
      </div>

      {/* 4. NOTES */}
      <div>
        <label className={LABEL_CLASS}>Production Notes</label>
        <textarea name="notes" rows={3} defaultValue={order?.notes} className={INPUT_CLASS} placeholder="Special instructions for the factory floor..." />
      </div>

      {/* ERROR DISPLAY */}
      {state?.errors && (
         <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 border border-red-100 flex gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <div>
              <strong>Validation Error:</strong> 
              <ul className="list-disc pl-4 mt-1">
                {Object.values(state.errors).map((err:any, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
         </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-6 py-2.5 text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm transition-all flex items-center gap-2">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {order ? 'Update Order' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}