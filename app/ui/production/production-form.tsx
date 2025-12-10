'use client';

import { useActionState, useEffect, useState } from 'react';
import { createProductionReport } from '@/app/lib/production-actions';
import { Plus, Trash, AlertTriangle, Calculator } from 'lucide-react';

export function ProductionForm({ products, onClose }: { products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createProductionReport, undefined);
  
  // Local State for Calculation
  const [total, setTotal] = useState(0);
  const [qualified, setQualified] = useState(0);
  const [rejected, setRejected] = useState(0);
  
  // Defect List State
  const [defects, setDefects] = useState<{defectType: string, quantity: number}[]>([]);
  const [currentDefectType, setCurrentDefectType] = useState('BUBBLE');
  const [currentDefectQty, setCurrentDefectQty] = useState(1);

  // Auto-Calculate Rejected based on Defects
  useEffect(() => {
    const totalDefects = defects.reduce((acc, curr) => acc + curr.quantity, 0);
    setRejected(totalDefects);
  }, [defects]);

  useEffect(() => {
     if (state?.success) onClose();
  }, [state, onClose]);

  const addDefect = () => {
    setDefects([...defects, { defectType: currentDefectType, quantity: currentDefectQty }]);
  };

  const removeDefect = (index: number) => {
    setDefects(defects.filter((_, i) => i !== index));
  };

  return (
    <form action={action} className="space-y-5">
      {/* Hidden field to pass JSON defects */}
      <input type="hidden" name="defects" value={JSON.stringify(defects)} />
      
      {/* ROW 1: Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Production Date</label>
          <input name="date" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift</label>
          <select name="shift" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="DAY">Day Shift (6AM - 6PM)</option>
            <option value="NIGHT">Night Shift (6PM - 6AM)</option>
          </select>
        </div>
      </div>

      {/* ROW 2: Product */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Product / Tire Size</label>
        <select name="productId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]">
          <option value="">Select a Product...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.code}) - {p.brand}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Batch Number</label>
        <input name="batchNumber" required placeholder="BATCH-2024-001" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {/* ROW 3: Numbers (The Math Logic) */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
          <Calculator className="w-4 h-4" /> Production Quantities
        </h4>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500">Total Output</label>
            <input 
              name="totalQty" 
              type="number" 
              value={total} 
              onChange={(e) => setTotal(Number(e.target.value))}
              className="mt-1 block w-full text-center font-bold text-lg rounded-md border-gray-300" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-green-600">Qualified (Good)</label>
            <input 
              name="qualifiedQty" 
              type="number" 
              value={qualified}
              onChange={(e) => setQualified(Number(e.target.value))}
              className="mt-1 block w-full text-center font-bold text-lg text-green-600 rounded-md border-green-300 bg-green-50" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-red-600">Rejected (Waste)</label>
            <input 
              name="rejectedQty" 
              type="number" 
              value={rejected}
              readOnly // Auto-calculated from defects
              className="mt-1 block w-full text-center font-bold text-lg text-red-600 rounded-md border-red-300 bg-red-50 cursor-not-allowed" 
            />
          </div>
        </div>
        
        {/* Math Check */}
        {total !== qualified + rejected && (
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 p-2 rounded">
            <AlertTriangle className="w-4 h-4" />
            <span>Mismatch: {qualified + rejected} vs Total {total}</span>
          </div>
        )}
      </div>

      {/* ROW 4: Defect Manager */}
      <div className="border rounded-md p-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">Record Defects</label>
        <div className="flex gap-2 mb-2">
          <select 
            value={currentDefectType}
            onChange={(e) => setCurrentDefectType(e.target.value)}
            className="flex-1 text-sm rounded-md border-gray-300"
          >
            <option value="BUBBLE">Bubble</option>
            <option value="CRACK">Crack</option>
            <option value="MOLDING_SHORT">Short Molding</option>
            <option value="IMPURITY">Impurity</option>
            <option value="UNDER_CURE">Under Cure</option>
            <option value="OTHER">Other</option>
          </select>
          <input 
            type="number" 
            min="1"
            value={currentDefectQty}
            onChange={(e) => setCurrentDefectQty(Number(e.target.value))}
            className="w-20 text-sm rounded-md border-gray-300"
          />
          <button type="button" onClick={addDefect} className="bg-gray-900 text-white px-3 rounded-md text-xs hover:bg-gray-700">Add</button>
        </div>

        {/* Defect List */}
        <div className="space-y-1">
          {defects.map((d, i) => (
            <div key={i} className="flex justify-between items-center bg-red-50 px-3 py-1 rounded text-xs text-red-700 border border-red-100">
              <span>{d.defectType} ({d.quantity})</span>
              <button type="button" onClick={() => removeDefect(i)}><Trash className="w-3 h-3 hover:text-red-900" /></button>
            </div>
          ))}
          {defects.length === 0 && <p className="text-xs text-gray-400 italic">No defects recorded.</p>}
        </div>
      </div>

      {state?.message && !state.success && <p className="text-sm text-red-500">{state.message}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700">
          {isPending ? 'Saving...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
}