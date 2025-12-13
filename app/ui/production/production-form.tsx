// 'use client';

// import { useActionState, useEffect, useState } from 'react';
// import { createProductionReport, generateBatchNumber } from '@/app/lib/production-actions';
// import { Trash, AlertTriangle, Calculator, Search, Check, Wand2, RefreshCcw } from 'lucide-react'; // Added Wand2/RefreshCcw
// import clsx from 'clsx';

// export function ProductionForm({ products, onClose }: { products: any[], onClose: () => void }) {
//   const [state, action, isPending] = useActionState(createProductionReport, undefined);
  
//   // State
//   const [total, setTotal] = useState(0);
//   const [qualified, setQualified] = useState(0);
//   const [rejected, setRejected] = useState(0);
//   const [defects, setDefects] = useState<{defectType: string, quantity: number}[]>([]);
//   const [currentDefectType, setCurrentDefectType] = useState('BUBBLE');
//   const [currentDefectQty, setCurrentDefectQty] = useState(1);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedProductId, setSelectedProductId] = useState('');
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
//   // NEW: Batch Number State
//   const [batchNum, setBatchNum] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);

//   // Helper: Call Server Action to get ID
//   const handleGenerateBatch = async () => {
//     setIsGenerating(true);
//     try {
//       const result = await generateBatchNumber();
//       setBatchNum(result.batchNumber);
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   const selectedProduct = products.find(p => p.id === selectedProductId);
//   const filteredProducts = products.filter(p => 
//     p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
//     p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     p.brand?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   useEffect(() => {
//     const totalDefects = defects.reduce((acc, curr) => acc + curr.quantity, 0);
//     setRejected(totalDefects);
//   }, [defects]);

//   useEffect(() => {
//      if (state?.success) onClose();
//   }, [state, onClose]);

//   const addDefect = () => {
//     setDefects([...defects, { defectType: currentDefectType, quantity: currentDefectQty }]);
//   };

//   const removeDefect = (index: number) => {
//     setDefects(defects.filter((_, i) => i !== index));
//   };

//   return (
//     <form action={action} className="space-y-5">
//       <input type="hidden" name="defects" value={JSON.stringify(defects)} />
//       <input type="hidden" name="productId" value={selectedProductId} />
      
//       {/* ROW 1: Basics */}
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Production Date</label>
//           <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Shift</label>
//           <select name="shift" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
//             <option value="DAY">Day Shift (6AM - 6PM)</option>
//             <option value="NIGHT">Night Shift (6PM - 6AM)</option>
//           </select>
//         </div>
//       </div>

//       {/* ROW 2: SEARCHABLE PRODUCT */}
//       <div className="relative">
//         <label className="block text-sm font-medium text-gray-700">Product / Tire Size</label>
//         <div 
//           className="mt-1 relative cursor-pointer"
//           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//         >
//           <div className="flex items-center justify-between w-full rounded-md border border-gray-300 px-3 py-2 bg-white text-sm focus-within:ring-2 focus-within:ring-[#E30613] focus-within:border-[#E30613]">
//              {selectedProduct ? (
//                <span className="font-medium text-gray-900">{selectedProduct.name} ({selectedProduct.code})</span>
//              ) : (
//                <span className="text-gray-400">Search and select a product...</span>
//              )}
//              <Search className="w-4 h-4 text-gray-400" />
//           </div>
//         </div>

//         {isDropdownOpen && (
//           <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
//             <div className="sticky top-0 bg-white p-2 border-b">
//               <input 
//                 type="text" 
//                 autoFocus
//                 placeholder="Type to filter..." 
//                 className="w-full border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E30613] focus:border-[#E30613]"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             {filteredProducts.map((product) => (
//               <div
//                 key={product.id}
//                 className={clsx(
//                   "cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100",
//                   selectedProductId === product.id ? "bg-red-50 text-[#E30613]" : "text-gray-900"
//                 )}
//                 onClick={() => {
//                   setSelectedProductId(product.id);
//                   setIsDropdownOpen(false);
//                   setSearchTerm('');
//                 }}
//               >
//                 <div className="flex flex-col">
//                   <span className="font-medium">{product.name}</span>
//                   <span className="text-xs text-gray-500">{product.code} • {product.brand}</span>
//                 </div>
//                 {selectedProductId === product.id && (
//                   <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#E30613]">
//                     <Check className="h-4 w-4" />
//                   </span>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* ROW 3: SMART BATCH NUMBER */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Batch Number</label>
//         <div className="flex gap-2 mt-1">
//           <input 
//             name="batchNumber" 
//             required 
//             value={batchNum}
//             onChange={(e) => setBatchNum(e.target.value)}
//             placeholder="e.g. BATCH-20251211-001" 
//             className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" 
//           />
//           <button 
//             type="button" 
//             onClick={handleGenerateBatch}
//             disabled={isGenerating}
//             className="flex items-center gap-2 bg-black text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-800 disabled:bg-gray-400 whitespace-nowrap transition-all"
//           >
//             {isGenerating ? (
//                <RefreshCcw className="w-4 h-4 animate-spin" />
//             ) : (
//                <Wand2 className="w-4 h-4" />
//             )}
//             Auto-Generate
//           </button>
//         </div>
//         <p className="text-xs text-gray-500 mt-1">Click to auto-generate sequence based on today&apos;s date.</p>
//       </div>

//       {/* ROW 4: Numbers */}
//       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
//         <h4 className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
//           <Calculator className="w-4 h-4" /> Production Quantities
//         </h4>
        
//         <div className="grid grid-cols-3 gap-4">
//           <div>
//             <label className="block text-xs font-medium text-gray-500">Total Output</label>
//             <input 
//               name="totalQty" 
//               type="number" 
//               value={total} 
//               onChange={(e) => setTotal(Number(e.target.value))}
//               className="mt-1 block w-full text-center font-bold text-lg rounded-md border-gray-300" 
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-green-600">Qualified</label>
//             <input 
//               name="qualifiedQty" 
//               type="number" 
//               value={qualified}
//               onChange={(e) => setQualified(Number(e.target.value))}
//               className="mt-1 block w-full text-center font-bold text-lg text-green-600 rounded-md border-green-300 bg-green-50" 
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-red-600">Rejected</label>
//             <input 
//               name="rejectedQty" 
//               type="number" 
//               value={rejected}
//               readOnly 
//               className="mt-1 block w-full text-center font-bold text-lg text-red-600 rounded-md border-red-300 bg-red-50 cursor-not-allowed" 
//             />
//           </div>
//         </div>
        
//         {total !== qualified + rejected && (
//           <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-100 p-2 rounded">
//             <AlertTriangle className="w-4 h-4" />
//             <span>Mismatch: {qualified + rejected} vs Total {total}</span>
//           </div>
//         )}
//       </div>

//       {/* ROW 5: Defects */}
//       <div className="border rounded-md p-3">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Record Defects</label>
//         <div className="flex gap-2 mb-2">
//           <select 
//             value={currentDefectType}
//             onChange={(e) => setCurrentDefectType(e.target.value)}
//             className="flex-1 text-sm rounded-md border-gray-300"
//           >
//             <option value="BUBBLE">Bubble</option>
//             <option value="CRACK">Crack</option>
//             <option value="MOLDING_SHORT">Short Molding</option>
//             <option value="IMPURITY">Impurity</option>
//             <option value="UNDER_CURE">Under Cure</option>
//             <option value="OTHER">Other</option>
//           </select>
//           <input 
//             type="number" 
//             min="1"
//             value={currentDefectQty}
//             onChange={(e) => setCurrentDefectQty(Number(e.target.value))}
//             className="w-20 text-sm rounded-md border-gray-300"
//           />
//           <button type="button" onClick={addDefect} className="bg-gray-900 text-white px-3 rounded-md text-xs hover:bg-gray-700">Add</button>
//         </div>

//         <div className="space-y-1">
//           {defects.map((d, i) => (
//             <div key={i} className="flex justify-between items-center bg-red-50 px-3 py-1 rounded text-xs text-red-700 border border-red-100">
//               <span>{d.defectType} ({d.quantity})</span>
//               <button type="button" onClick={() => removeDefect(i)}><Trash className="w-3 h-3 hover:text-red-900" /></button>
//             </div>
//           ))}
//           {defects.length === 0 && <p className="text-xs text-gray-400 italic">No defects recorded.</p>}
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
//         <textarea name="notes" placeholder="Any issues during shift?" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//       </div>

//       {state?.errors && (
//          <div className="bg-red-50 p-2 rounded text-xs text-red-600">
//             {JSON.stringify(state.errors)}
//          </div>
//       )}
//       {state?.message && !state.success && <p className="text-sm text-red-500">{state.message}</p>}

//       <div className="flex justify-end gap-3 pt-2">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
//         <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700">
//           {isPending ? 'Saving...' : 'Submit Report'}
//         </button>
//       </div>
//     </form>
//   );
// }
'use client';

import { useActionState, useEffect, useState } from 'react';
import { createProductionReport, generateBatchNumber } from '@/app/lib/production-actions';
import { Trash, AlertTriangle, Calculator, Search, Check, Wand2, RefreshCcw, AlertCircle, Filter } from 'lucide-react'; 
import clsx from 'clsx';

// --- STYLES ---
const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all placeholder:text-gray-400";
const SELECT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all bg-white";
const LABEL_CLASS = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";

type ActionState = {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
} | undefined;

// --- MAIN COMPONENT ---
export function ProductionForm({ 
  products, 
  categories, // [NEW] Received from parent
  onClose 
}: { 
  products: any[], 
  categories: any[],
  onClose: () => void 
}) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createProductionReport, undefined);
  
  // State
  const [total, setTotal] = useState(0);
  const [qualified, setQualified] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [defects, setDefects] = useState<{defectType: string, quantity: number}[]>([]);
  
  // Filtering State
  const [selectedCatId, setSelectedCatId] = useState(''); // [NEW] Category Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Defect Entry State
  const [currentDefectType, setCurrentDefectType] = useState('BUBBLE');
  const [currentDefectQty, setCurrentDefectQty] = useState(1);
  
  // Batch State
  const [batchNum, setBatchNum] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // 1. Filter Products based on Category Selection + Search Term
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCatId ? p.categoryId === selectedCatId : true;

    return matchesSearch && matchesCategory;
  });

  const selectedProduct = products.find(p => p.id === selectedProductId);

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
    <form action={action} className="flex flex-col h-[80vh]">
      <input type="hidden" name="defects" value={JSON.stringify(defects)} />
      <input type="hidden" name="productId" value={selectedProductId} />
      
      {/* SCROLLABLE BODY */}
      <div className="flex-1 overflow-y-auto px-1 pr-2 space-y-6">
        
        {/* SECTION 1: Time & Batch */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Production Date</label>
            <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className={INPUT_CLASS} />
          </div>
          <div>
            <label className={LABEL_CLASS}>Shift</label>
            <select name="shift" className={SELECT_CLASS}>
              <option value="DAY">Day Shift (6AM - 6PM)</option>
              <option value="NIGHT">Night Shift (6PM - 6AM)</option>
            </select>
          </div>
        </div>

        {/* SECTION 2: PRODUCT SELECTION (Linked to Category) */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
           
           {/* Step A: Select Category */}
           <div>
             <label className={LABEL_CLASS}>1. Filter Category</label>
             <div className="relative">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select 
                  value={selectedCatId} 
                  onChange={(e) => {
                    setSelectedCatId(e.target.value);
                    setSelectedProductId(''); // Reset product when category changes
                  }} 
                  className={clsx(SELECT_CLASS, "pl-9")}
                >
                  <option value="">-- All Categories --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
           </div>

           {/* Step B: Select Product */}
           <div className="relative">
            <label className={LABEL_CLASS}>2. Select Product / Tire Size</label>
            <div 
              className="relative cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className={clsx(
                  "flex items-center justify-between w-full rounded-lg border px-3 py-2 text-sm transition-colors",
                  selectedProduct ? "bg-white border-gray-300" : "bg-white border-dashed border-gray-400",
                  !selectedProduct && "hover:border-[#E30613]"
                )}>
                {selectedProduct ? (
                  <span className="font-bold text-gray-900">{selectedProduct.name} <span className="text-gray-400 font-normal">({selectedProduct.code})</span></span>
                ) : (
                  <span className="text-gray-500 italic">Select a product from the list...</span>
                )}
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full bg-white shadow-xl max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto sm:text-sm border border-gray-100">
                <div className="sticky top-0 bg-white p-2 border-b z-10">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="Type to search..." 
                    className="w-full border-gray-300 rounded-md text-sm p-1.5 focus:ring-[#E30613] focus:border-[#E30613] outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-xs">No products found in this category.</div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={clsx(
                        "cursor-pointer select-none relative py-2.5 pl-3 pr-9 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0",
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
                        <div className="flex gap-2 text-xs text-gray-500">
                           <span>{product.code}</span>
                           <span>•</span>
                           <span>{product.brand || 'No Brand'}</span>
                        </div>
                      </div>
                      {selectedProductId === product.id && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#E30613]">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: BATCH */}
        <div>
          <label className={LABEL_CLASS}>Batch Number</label>
          <div className="flex gap-2 relative">
            <input 
              name="batchNumber" 
              required 
              value={batchNum}
              onChange={(e) => setBatchNum(e.target.value)}
              placeholder="e.g. BATCH-20251211-001" 
              className={clsx(INPUT_CLASS, "pr-32 font-mono")} 
            />
            <button 
              type="button" 
              onClick={handleGenerateBatch}
              disabled={isGenerating}
              className="absolute right-1 top-1 bottom-1 flex items-center gap-1.5 bg-black text-white px-3 py-1 rounded-md text-xs font-bold hover:bg-gray-800 transition-all shadow-sm"
            >
              {isGenerating ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
              Auto-Gen
            </button>
          </div>
        </div>

        {/* SECTION 4: QUANTITIES */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-gray-900 uppercase flex items-center gap-2 border-b border-gray-100 pb-2">
            <Calculator className="w-4 h-4" /> Output Metrics
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1 text-center">Total Output</label>
              <input 
                name="totalQty" 
                type="number" 
                value={total} 
                onChange={(e) => setTotal(Number(e.target.value))}
                className="block w-full text-center font-bold text-xl rounded-lg border-gray-300 py-2 focus:border-blue-500 focus:ring-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-green-600 mb-1 text-center">Qualified</label>
              <input 
                name="qualifiedQty" 
                type="number" 
                value={qualified}
                onChange={(e) => setQualified(Number(e.target.value))}
                className="block w-full text-center font-bold text-xl text-green-700 rounded-lg border-green-200 bg-green-50 py-2 focus:border-green-500 focus:ring-green-500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-red-600 mb-1 text-center">Rejected</label>
              <input 
                name="rejectedQty" 
                type="number" 
                value={rejected}
                readOnly 
                className="block w-full text-center font-bold text-xl text-red-700 rounded-lg border-red-200 bg-red-50 py-2 cursor-not-allowed" 
              />
            </div>
          </div>
          
          {total !== qualified + rejected && (
            <div className="flex items-center gap-2 text-xs font-medium text-orange-700 bg-orange-50 p-2 rounded-lg border border-orange-100 animate-pulse justify-center">
              <AlertTriangle className="w-4 h-4" />
              <span>Mismatch: {qualified + rejected} units vs Total {total}</span>
            </div>
          )}
        </div>

        {/* SECTION 5: DEFECTS */}
        <div className="border border-red-100 rounded-xl p-4 bg-red-50/30">
          <label className="block text-sm font-bold text-red-900 mb-3">Defect Breakdown</label>
          <div className="flex gap-2 mb-3">
            <select 
              value={currentDefectType}
              onChange={(e) => setCurrentDefectType(e.target.value)}
              className="flex-1 text-sm rounded-lg border-gray-300 py-2"
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
              className="w-20 text-sm rounded-lg border-gray-300 py-2"
            />
            <button type="button" onClick={addDefect} className="bg-red-600 text-white px-4 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors">Add</button>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
            {defects.map((d, i) => (
              <div key={i} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg text-sm text-gray-700 border border-red-100 shadow-sm">
                <span className="font-medium">{d.defectType} <span className="text-gray-400">({d.quantity} units)</span></span>
                <button type="button" onClick={() => removeDefect(i)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-700"><Trash className="w-4 h-4" /></button>
              </div>
            ))}
            {defects.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">No defects recorded.</p>}
          </div>
        </div>

        <div>
          <label className={LABEL_CLASS}>Shift Notes</label>
          <textarea name="notes" rows={2} placeholder="Any machinery issues or downtimes?" className={INPUT_CLASS} />
        </div>

        {state?.errors && (
           <div className="bg-red-50 p-3 rounded-lg text-xs text-red-600 border border-red-100">
              <strong>Validation Error:</strong> {Object.keys(state.errors).join(', ')}
           </div>
        )}
        {state?.message && !state.success && (
           <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
             <AlertCircle className="w-4 h-4" /> 
             <span className="font-semibold">Error:</span> {state.message}
           </div>
        )}
      </div>

      {/* STICKY FOOTER */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4 sticky bottom-0 bg-white z-10 pb-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-6 py-2.5 text-sm font-bold rounded-lg hover:bg-red-700 shadow-sm transition-all flex items-center gap-2">
          {isPending && <RefreshCcw className="w-4 h-4 animate-spin" />}
          {isPending ? 'Saving...' : 'Submit Report'}
        </button>
      </div>
    </form>
  );
}