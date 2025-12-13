
// 'use client';

// import { useActionState, useEffect, useState } from 'react';
// import { saveProduct, createCategory, createSupplier, generateSKU, adjustStock, createBOM } from '@/app/lib/inventory-actions';
// import { Plus, X, Loader2, RefreshCw, Save } from 'lucide-react';
// import clsx from 'clsx';

// // --- TYPES ---
// type ActionState = {
//   message?: string;
//   errors?: Record<string, string[]>;
//   success?: boolean;
// } | undefined;

// // --- HELPER COMPONENT: ERROR MESSAGE ---
// function ErrorMsg({ errors }: { errors?: string[] }) {
//   if (!errors || errors.length === 0) return null;
//   return <p className="text-xs text-red-500 mt-1">{errors[0]}</p>;
// }

// // --- HELPER: INLINE FORMS ---
// function InlineForm({ title, action, onClose }: { title: string, action: any, onClose: () => void }) {
//   const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, undefined);
  
//   useEffect(() => { 
//     if (state?.success) onClose(); 
//   }, [state, onClose]);

//   return (
//     <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded animate-in fade-in slide-in-from-top-2">
//       <div className="flex justify-between items-center mb-2">
//         <h4 className="text-xs font-bold uppercase text-gray-500">{title}</h4>
//         <button type="button" onClick={onClose}><X className="w-3 h-3" /></button>
//       </div>
//       <form action={formAction} className="space-y-3">
//         <input name="name" placeholder="Name *" required className="w-full text-sm border-gray-300 rounded" />
//         {title === 'New Supplier' && (
//           <>
//             <input name="email" type="email" placeholder="Email" className="w-full text-sm border-gray-300 rounded" />
//             <input name="phone" placeholder="Phone" className="w-full text-sm border-gray-300 rounded" />
//           </>
//         )}
//         {title === 'New Category' && (
//            <input name="description" placeholder="Description" className="w-full text-sm border-gray-300 rounded" />
//         )}
//         <button disabled={isPending} className="w-full bg-black text-white text-xs py-2 rounded">
//           {isPending ? 'Saving...' : 'Save'}
//         </button>
//       </form>
//     </div>
//   );
// }

// // ============================================================================
// // 1. MAIN PRODUCT FORM
// // ============================================================================
// export function ProductForm({ 
//   product, // Optional: If provided, we are in EDIT mode
//   categories, 
//   suppliers, 
//   brands, 
//   onClose 
// }: { 
//   product?: any,
//   categories: any[], 
//   suppliers: any[], 
//   brands: string[],
//   onClose: () => void 
// }) {
//   const [state, action, isPending] = useActionState<ActionState, FormData>(saveProduct, undefined);
//   const [showCatForm, setShowCatForm] = useState(false);
//   const [showSupForm, setShowSupForm] = useState(false);
//   const [generatedSku, setGeneratedSku] = useState(product?.code || '');
//   const [loadingSku, setLoadingSku] = useState(false);

//   useEffect(() => { 
//     if (state?.success) onClose(); 
//   }, [state, onClose]);

//   const handleGenSku = async () => {
//     setLoadingSku(true);
//     const sku = await generateSKU();
//     setGeneratedSku(sku);
//     setLoadingSku(false);
//   };

//   return (
//     <div className="max-h-[80vh] overflow-y-auto px-1">
//       {/* 1. INLINE CREATORS */}
//       {showCatForm && <InlineForm title="New Category" action={createCategory} onClose={() => setShowCatForm(false)} />}
//       {showSupForm && <InlineForm title="New Supplier" action={createSupplier} onClose={() => setShowSupForm(false)} />}

//       <form action={action} className="space-y-5 pb-4">
//         <input type="hidden" name="id" value={product?.id || ''} />

//         {/* ROW 1: SKU & TYPE */}
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">SKU Code <span className="text-red-500">*</span></label>
//             <div className="flex gap-2">
//               <input 
//                 name="code" 
//                 value={generatedSku} 
//                 onChange={(e) => setGeneratedSku(e.target.value)}
//                 readOnly={!!product} // Read-only if editing
//                 className={clsx("block w-full rounded-md border-gray-300 shadow-sm sm:text-sm", product && "bg-gray-100 text-gray-500 cursor-not-allowed")}
//                 placeholder="PROD-001" 
//               />
//               {!product && (
//                 <button type="button" onClick={handleGenSku} disabled={loadingSku} className="text-xs text-[#E30613] font-medium hover:underline whitespace-nowrap flex items-center gap-1">
//                    {loadingSku ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
//                    Generate
//                 </button>
//               )}
//             </div>
//             <ErrorMsg errors={state?.errors?.code} />
//           </div>
          
//           <div>
//             <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Type</label>
//             <select name="type" defaultValue={product?.type || "FINISHED_GOOD"} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
//               <option value="FINISHED_GOOD">Finished Good (Sales)</option>
//               <option value="RAW_MATERIAL">Raw Material (Production)</option>
//               <option value="WORK_IN_PROGRESS">Work in Progress</option>
//               <option value="SERVICE">Service</option>
//             </select>
//           </div>
//         </div>

//         {/* ROW 2: NAME & BRAND */}
//         <div>
//           <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Name <span className="text-red-500">*</span></label>
//           <input name="name" defaultValue={product?.name} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" placeholder="e.g. KNT Radial Tire" />
//           <ErrorMsg errors={state?.errors?.name} />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//            {/* CATEGORY SELECTOR + ADD */}
//            <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
//               <div className="flex gap-2">
//                 <select name="categoryId" defaultValue={product?.categoryId || ""} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm">
//                   <option value="">-- Uncategorized --</option>
//                   {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                 </select>
//                 <button type="button" onClick={() => setShowCatForm(true)} className="p-2 bg-gray-100 rounded hover:bg-gray-200 border border-gray-300" title="Add Category">
//                   <Plus className="w-4 h-4 text-gray-600" />
//                 </button>
//               </div>
//            </div>

//            {/* BRAND DATALIST */}
//            <div>
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand</label>
//               <input 
//                 name="brand" 
//                 list="brands-list" 
//                 defaultValue={product?.brand} 
//                 className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" 
//                 placeholder="Type or select brand..." 
//               />
//               <datalist id="brands-list">
//                  {brands.map((b, i) => <option key={i} value={b} />)}
//               </datalist>
//            </div>
//         </div>

//         {/* ROW 3: SUPPLIER & PRICING */}
//         <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
//            <div className="col-span-1">
//               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Supplier</label>
//               <div className="flex gap-1">
//                  <select name="supplierId" defaultValue={product?.supplierId || ""} className="block w-full rounded-md border-gray-300 shadow-sm text-xs">
//                     <option value="">-- None --</option>
//                     {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
//                  </select>
//                  <button type="button" onClick={() => setShowSupForm(true)} className="px-2 bg-white rounded border hover:bg-gray-100">
//                    <Plus className="w-3 h-3" />
//                  </button>
//               </div>
//            </div>
//            <div>
//              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cost Price</label>
//              <input name="costPrice" type="number" step="0.01" defaultValue={product?.costPrice || 0} className="block w-full rounded-md border-gray-300 shadow-sm text-xs" />
//              <ErrorMsg errors={state?.errors?.costPrice} />
//            </div>
//            <div>
//              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selling Price</label>
//              <input name="sellingPrice" type="number" step="0.01" defaultValue={product?.sellingPrice || 0} className="block w-full rounded-md border-gray-300 shadow-sm text-xs" />
//              <ErrorMsg errors={state?.errors?.sellingPrice} />
//            </div>
//         </div>

//         {/* ROW 4: REORDER & DESCRIPTION */}
//         <div className="grid grid-cols-3 gap-4">
//            <div className="col-span-2">
//              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
//              <input name="description" defaultValue={product?.description} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
//            </div>
//            <div>
//              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reorder Level</label>
//              <input name="reorderLevel" type="number" defaultValue={product?.reorderLevel || 10} className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm" />
//            </div>
//         </div>

//         {/* FORM FOOTER */}
//         {state?.message && !state.success && (
//           <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md flex items-center gap-2">
//              <span className="font-bold">Error:</span> {state.message}
//           </div>
//         )}

//         <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
//              Cancel
//            </button>
//            <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#E30613] rounded-md hover:bg-red-700 shadow-sm transition-all">
//              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
//              {product ? 'Update Product' : 'Create Product'}
//            </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// // ============================================================================
// // 2. ADJUSTMENT FORM
// // ============================================================================
// export function AdjustmentForm({ products, onClose }: { products: any[], onClose: () => void }) {
//   const [state, action, isPending] = useActionState<ActionState, FormData>(adjustStock, undefined);
  
//   useEffect(() => { 
//     if (state?.success) onClose(); 
//   }, [state, onClose]);

//   return (
//     <form action={action} className="space-y-4">
//       <div>
//         <label className="block text-sm font-medium text-gray-700">Select Product</label>
//         <select name="productId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
//           {products.map(p => (
//             <option key={p.id} value={p.id}>{p.code} - {p.name} (Stock: {p.stockOnHand})</option>
//           ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Reason</label>
//           <select name="type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
//             <option value="ADJUSTMENT">Inventory Count Correction</option>
//             <option value="DAMAGE">Damaged / Scrap</option>
//             <option value="RETURN">Customer Return</option>
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Quantity (+/-)</label>
//           <input name="quantity" type="number" required placeholder="-5 or 10" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//           <p className="text-xs text-gray-500 mt-1">Negative for removal, Positive for addition.</p>
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Notes</label>
//         <textarea name="notes" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Reason for adjustment..."></textarea>
//       </div>

//       <div className="flex justify-end gap-2 pt-2">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
//         <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
//           {isPending ? 'Processing...' : 'Post Adjustment'}
//         </button>
//       </div>
//     </form>
//   );
// }

// // ============================================================================
// // 3. BOM FORM
// // ============================================================================
// export function BOMForm({ products, onClose }: { products: any[], onClose: () => void }) {
//   const [state, action, isPending] = useActionState<ActionState, FormData>(createBOM, undefined);
  
//   useEffect(() => { 
//     if (state?.success) onClose(); 
//   }, [state, onClose]);

//   const finishedGoods = products.filter(p => p.type === 'FINISHED_GOOD');
//   const rawMaterials = products.filter(p => p.type !== 'FINISHED_GOOD'); // Includes Raw & WIP

//   return (
//     <form action={action} className="space-y-4">
//       <div className="bg-blue-50 p-3 rounded text-xs text-blue-800 mb-2">
//         Link ingredients to a product. Example: To make <strong>1 Tire</strong>, we need <strong>X kg of Rubber</strong>.
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700">Parent Product (Output)</label>
//         <select name="parentId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
//           {finishedGoods.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
//         </select>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Component (Input)</label>
//           <select name="componentId" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
//             {rawMaterials.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockOnHand})</option>)}
//           </select>
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Qty Needed</label>
//           <input name="quantity" type="number" step="0.0001" required placeholder="e.g. 2.5" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
//         </div>
//       </div>

//       <div className="flex justify-end gap-2 pt-2">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
//         <button disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
//           {isPending ? 'Linking...' : 'Save BOM'}
//         </button>
//       </div>
//     </form>
//   );
// }

'use client';

import { useActionState, useEffect, useState } from 'react';
import { saveProduct, createCategory, createSupplier, generateSKU, adjustStock, createBOM } from '@/app/lib/inventory-actions';
import { Plus, X, Loader2, RefreshCw, Save, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

// --- TYPES ---
type ActionState = {
  message?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
} | undefined;

// --- COMMON STYLES ---
const LABEL_CLASS = "block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5";
const INPUT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all placeholder:text-gray-400";
const SELECT_CLASS = "block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] outline-none transition-all bg-white";

// --- HELPER COMPONENT: ERROR MESSAGE ---
function ErrorMsg({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return <p className="text-xs text-red-500 mt-1 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors[0]}</p>;
}

// --- HELPER: INLINE FORMS ---
function InlineForm({ title, action, onClose }: { title: string, action: any, onClose: () => void }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(action, undefined);
  
  useEffect(() => { 
    if (state?.success) onClose(); 
  }, [state, onClose]);

  return (
    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in slide-in-from-top-2 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold uppercase text-gray-700">{title}</h4>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
      </div>
      <form action={formAction} className="space-y-3">
        <div>
          <input name="name" placeholder="Name *" required className={INPUT_CLASS} />
          <ErrorMsg errors={state?.errors?.name} />
        </div>
        {title === 'New Supplier' && (
          <div className="grid grid-cols-2 gap-3">
            <input name="email" type="email" placeholder="Email" className={INPUT_CLASS} />
            <input name="phone" placeholder="Phone" className={INPUT_CLASS} />
          </div>
        )}
        {title === 'New Category' && (
           <input name="description" placeholder="Description (Optional)" className={INPUT_CLASS} />
        )}
        <button disabled={isPending} className="w-full bg-black text-white text-xs font-bold py-2.5 rounded-lg hover:bg-gray-900 transition-colors">
          {isPending ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
}

// ============================================================================
// 1. MAIN PRODUCT FORM
// ============================================================================
export function ProductForm({ 
  product, 
  categories, 
  suppliers, 
  brands, 
  onClose 
}: { 
  product?: any,
  categories: any[], 
  suppliers: any[], 
  brands: string[],
  onClose: () => void 
}) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(saveProduct, undefined);
  const [showCatForm, setShowCatForm] = useState(false);
  const [showSupForm, setShowSupForm] = useState(false);
  const [generatedSku, setGeneratedSku] = useState(product?.code || '');
  const [loadingSku, setLoadingSku] = useState(false);

  useEffect(() => { 
    if (state?.success) onClose(); 
  }, [state, onClose]);

  const handleGenSku = async () => {
    setLoadingSku(true);
    const sku = await generateSKU();
    setGeneratedSku(sku);
    setLoadingSku(false);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      {/* 1. INLINE CREATORS */}
      {showCatForm && <InlineForm title="New Category" action={createCategory} onClose={() => setShowCatForm(false)} />}
      {showSupForm && <InlineForm title="New Supplier" action={createSupplier} onClose={() => setShowSupForm(false)} />}

      <form action={action} className="space-y-6 pb-2">
        <input type="hidden" name="id" value={product?.id || ''} />

        {/* ROW 1: SKU & TYPE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={LABEL_CLASS}>SKU Code <span className="text-red-500">*</span></label>
            <div className="relative">
              <input 
                name="code" 
                value={generatedSku} 
                onChange={(e) => setGeneratedSku(e.target.value)}
                readOnly={!!product} 
                className={clsx(INPUT_CLASS, product && "bg-gray-100 text-gray-500 cursor-not-allowed", !product && "pr-24")}
                placeholder="PROD-001" 
              />
              {!product && (
                <button 
                  type="button" 
                  onClick={handleGenSku} 
                  disabled={loadingSku} 
                  className="absolute right-1 top-1 bottom-1 px-3 text-xs font-medium text-[#E30613] hover:bg-red-50 rounded transition-colors flex items-center gap-1"
                >
                   {loadingSku ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                   Generate
                </button>
              )}
            </div>
            <ErrorMsg errors={state?.errors?.code} />
          </div>
          
          <div>
            <label className={LABEL_CLASS}>Product Type</label>
            <select name="type" defaultValue={product?.type || "FINISHED_GOOD"} className={SELECT_CLASS}>
              <option value="FINISHED_GOOD">Finished Good (Sales)</option>
              <option value="RAW_MATERIAL">Raw Material (Production)</option>
              <option value="WORK_IN_PROGRESS">Work in Progress</option>
              <option value="SERVICE">Service</option>
            </select>
          </div>
        </div>

        {/* ROW 2: NAME */}
        <div>
          <label className={LABEL_CLASS}>Product Name <span className="text-red-500">*</span></label>
          <input name="name" defaultValue={product?.name} className={INPUT_CLASS} placeholder="e.g. KNT Radial Tire 205/55 R16" />
          <ErrorMsg errors={state?.errors?.name} />
        </div>

        {/* ROW 3: CATEGORY & BRAND */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
           <div>
              <label className={LABEL_CLASS}>Category</label>
              <div className="flex gap-2">
                <select name="categoryId" defaultValue={product?.categoryId || ""} className={SELECT_CLASS}>
                  <option value="">-- Uncategorized --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <button 
                  type="button" 
                  onClick={() => setShowCatForm(true)} 
                  className="flex-shrink-0 w-[42px] flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                  title="Add Category"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
           </div>

           <div>
              <label className={LABEL_CLASS}>Brand</label>
              <input 
                name="brand" 
                list="brands-list" 
                defaultValue={product?.brand} 
                className={INPUT_CLASS} 
                placeholder="Select or type brand..." 
              />
              <datalist id="brands-list">
                 {brands.map((b, i) => <option key={i} value={b} />)}
              </datalist>
           </div>
        </div>

        {/* ROW 4: SUPPLIER & PRICING (Grouped) */}
        <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-200">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
             <div className="col-span-1">
                <label className={LABEL_CLASS}>Supplier</label>
                <div className="flex gap-2">
                   <select name="supplierId" defaultValue={product?.supplierId || ""} className={SELECT_CLASS}>
                      <option value="">-- None --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                   <button 
                     type="button" 
                     onClick={() => setShowSupForm(true)} 
                     className="flex-shrink-0 w-[42px] flex items-center justify-center bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                   >
                     <Plus className="w-4 h-4" />
                   </button>
                </div>
             </div>
             <div>
               <label className={LABEL_CLASS}>Cost Price</label>
               <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">₦</span>
                  <input name="costPrice" type="number" step="0.01" defaultValue={product?.costPrice || 0} className={clsx(INPUT_CLASS, "pl-7")} />
               </div>
               <ErrorMsg errors={state?.errors?.costPrice} />
             </div>
             <div>
               <label className={LABEL_CLASS}>Selling Price</label>
               <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-sm">₦</span>
                  <input name="sellingPrice" type="number" step="0.01" defaultValue={product?.sellingPrice || 0} className={clsx(INPUT_CLASS, "pl-7")} />
               </div>
               <ErrorMsg errors={state?.errors?.sellingPrice} />
             </div>
           </div>
        </div>

        {/* ROW 5: DESCRIPTION & REORDER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div className="md:col-span-2">
             <label className={LABEL_CLASS}>Description</label>
             <input name="description" defaultValue={product?.description} className={INPUT_CLASS} placeholder="Optional details..." />
           </div>
           <div>
             <label className={LABEL_CLASS}>Reorder Level</label>
             <input name="reorderLevel" type="number" defaultValue={product?.reorderLevel || 10} className={INPUT_CLASS} />
           </div>
        </div>

        {/* FORM FOOTER */}
        {state?.message && !state.success && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-100">
             <AlertCircle className="w-4 h-4" /> 
             <span className="font-semibold">Error:</span> {state.message}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
           <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
             Cancel
           </button>
           <button type="submit" disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#E30613] rounded-lg hover:bg-red-700 shadow-sm transition-all">
             {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {product ? 'Update Product' : 'Create Product'}
           </button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// 2. ADJUSTMENT FORM
// ============================================================================
export function AdjustmentForm({ products, onClose }: { products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(adjustStock, undefined);
  
  useEffect(() => { 
    if (state?.success) onClose(); 
  }, [state, onClose]);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className={LABEL_CLASS}>Select Product</label>
        <select name="productId" required className={SELECT_CLASS}>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.code} - {p.name} (Stock: {p.stockOnHand})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={LABEL_CLASS}>Reason</label>
          <select name="type" className={SELECT_CLASS}>
            <option value="ADJUSTMENT">Inventory Count Correction</option>
            <option value="DAMAGE">Damaged / Scrap</option>
            <option value="RETURN">Customer Return</option>
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Quantity (+/-)</label>
          <input name="quantity" type="number" required placeholder="-5 or 10" className={INPUT_CLASS} />
          <p className="text-[10px] text-gray-400 mt-1 font-medium">Use negative for removal, positive for addition.</p>
        </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Notes</label>
        <textarea name="notes" rows={3} className={INPUT_CLASS} placeholder="Explain why this adjustment is being made..."></textarea>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button disabled={isPending} className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm">
          {isPending ? 'Processing...' : 'Post Adjustment'}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// 3. BOM FORM
// ============================================================================
export function BOMForm({ products, onClose }: { products: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState<ActionState, FormData>(createBOM, undefined);
  
  useEffect(() => { 
    if (state?.success) onClose(); 
  }, [state, onClose]);

  const finishedGoods = products.filter(p => p.type === 'FINISHED_GOOD');
  const rawMaterials = products.filter(p => p.type !== 'FINISHED_GOOD'); 

  return (
    <form action={action} className="space-y-5">
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3">
         <div className="text-blue-500 mt-0.5"><RefreshCw className="w-4 h-4" /></div>
         <div className="text-xs text-blue-800">
           <span className="font-bold">How it works:</span> Define recipes here. Example: To make <strong>1 Tire</strong>, we need <strong>X kg of Rubber</strong>.
         </div>
      </div>

      <div>
        <label className={LABEL_CLASS}>Parent Product (Output)</label>
        <select name="parentId" required className={SELECT_CLASS}>
          <option value="">-- Select Finished Good --</option>
          {finishedGoods.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className={LABEL_CLASS}>Component (Input)</label>
          <select name="componentId" required className={SELECT_CLASS}>
            <option value="">-- Select Material --</option>
            {rawMaterials.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockOnHand})</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL_CLASS}>Qty Needed</label>
          <input name="quantity" type="number" step="0.0001" required placeholder="e.g. 2.5" className={INPUT_CLASS} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button disabled={isPending} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          {isPending ? 'Linking...' : 'Save BOM'}
        </button>
      </div>
    </form>
  );
}