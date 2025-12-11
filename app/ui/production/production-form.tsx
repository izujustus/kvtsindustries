'use client';

import { useActionState, useEffect, useState } from 'react';
import { createProductionReport, generateBatchNumber } from '@/app/lib/production-actions';
import { Trash, AlertTriangle, Calculator, Search, Check, Wand2, RefreshCcw } from 'lucide-react'; // Added Wand2/RefreshCcw
import clsx from 'clsx';

export function ProductionForm({ products, onClose }: { products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createProductionReport, undefined);
  
  // State
  const [total, setTotal] = useState(0);
  const [qualified, setQualified] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [defects, setDefects] = useState<{defectType: string, quantity: number}[]>([]);
  const [currentDefectType, setCurrentDefectType] = useState('BUBBLE');
  const [currentDefectQty, setCurrentDefectQty] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // NEW: Batch Number State
  const [batchNum, setBatchNum] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper: Call Server Action to get ID
  const handleGenerateBatch = async () => {
    setIsGenerating(true);
    try {
      const result = await generateBatchNumber();
      setBatchNum(result.batchNumber);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <input type="hidden" name="defects" value={JSON.stringify(defects)} />
      <input type="hidden" name="productId" value={selectedProductId} />
      
      {/* ROW 1: Basics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Production Date</label>
          <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Shift</label>
          <select name="shift" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="DAY">Day Shift (6AM - 6PM)</option>
            <option value="NIGHT">Night Shift (6PM - 6AM)</option>
          </select>
        </div>
      </div>

      {/* ROW 2: SEARCHABLE PRODUCT */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700">Product / Tire Size</label>
        <div 
          className="mt-1 relative cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="flex items-center justify-between w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-sm focus-within:ring-2 focus-within:ring-[#E30613] focus-within:border-[#E30613]">
             {selectedProduct ? (
               <span className="font-medium text-gray-900">{selectedProduct.name} ({selectedProduct.code})</span>
             ) : (
               <span className="text-gray-400">Search and select a product...</span>
             )}
             <Search className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {isDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            <div className="sticky top-0 bg-white p-2 border-b">
              <input 
                type="text" 
                autoFocus
                placeholder="Type to filter..." 
                className="w-full border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E30613] focus:border-[#E30613]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={clsx(
                  "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100",
                  selectedProductId === product.id ? "bg-red-50 text-[#E30613]" : "text-gray-900"
                )}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setIsDropdownOpen(false);
                  setSearchTerm('');
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  <span className="text-xs text-gray-500">{product.code} • {product.brand}</span>
                </div>
                {selectedProductId === product.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#E30613]">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ROW 3: SMART BATCH NUMBER */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Batch Number</label>
        <div className="flex gap-2 mt-1">
          <input 
            name="batchNumber" 
            required 
            value={batchNum}
            onChange={(e) => setBatchNum(e.target.value)}
            placeholder="e.g. BATCH-20251211-001" 
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" 
          />
          <button 
            type="button" 
            onClick={handleGenerateBatch}
            disabled={isGenerating}
            className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-800 disabled:bg-gray-400 whitespace-nowrap transition-all"
          >
            {isGenerating ? (
               <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
               <Wand2 className="w-4 h-4" />
            )}
            Auto-Generate
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Click to auto-generate sequence based on today&apos;s date.</p>
      </div>

      {/* ROW 4: Numbers */}
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
            <label className="block text-xs font-medium text-green-600">Qualified</label>
            <input 
              name="qualifiedQty" 
              type="number" 
              value={qualified}
              onChange={(e) => setQualified(Number(e.target.value))}
              className="mt-1 block w-full text-center font-bold text-lg text-green-600 rounded-md border-green-300 bg-green-50" 
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-red-600">Rejected</label>
            <input 
              name="rejectedQty" 
              type="number" 
              value={rejected}
              readOnly 
              className="mt-1 block w-full text-center font-bold text-lg text-red-600 rounded-md border-red-300 bg-red-50 cursor-not-allowed" 
            />
          </div>
        </div>
        
        {total !== qualified + rejected && (
          <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 p-2 rounded">
            <AlertTriangle className="w-4 h-4" />
            <span>Mismatch: {qualified + rejected} vs Total {total}</span>
          </div>
        )}
      </div>

      {/* ROW 5: Defects */}
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

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
        <textarea name="notes" placeholder="Any issues during shift?" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {state?.errors && (
         <div className="bg-red-50 p-2 rounded text-xs text-red-600">
            {JSON.stringify(state.errors)}
         </div>
      )}
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