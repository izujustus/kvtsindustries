// 'use client';

// import { useState } from 'react';
// import { useRouter, usePathname, useSearchParams } from 'next/navigation';
// import { Plus, ArrowRightLeft, Link as LinkIcon, AlertCircle } from 'lucide-react';
// import clsx from 'clsx';
// import { Modal } from '@/app/ui/users/user-form';
// import { ProductForm, AdjustmentForm, BOMForm } from '@/app/ui/inventory/inventory-forms';
// import SearchBar from '@/app/ui/users/search';

// export default function InventoryClientWrapper({ products, movements, currentTab }: any) {
//   const [modalType, setModalType] = useState<'PRODUCT' | 'ADJUST' | 'BOM' | null>(null);
//   const { replace } = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // Tab Handler (Updates URL)
//   const setTab = (tab: string) => {
//     const params = new URLSearchParams(searchParams);
//     params.set('tab', tab);
//     replace(`${pathname}?${params.toString()}`);
//   };

//   return (
//     <>
//       {/* TABS & ACTIONS */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        
//         {/* Tab Buttons */}
//         <div className="flex gap-4">
//           <button 
//             onClick={() => setTab('STOCK')}
//             className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", currentTab === 'STOCK' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700")}
//           >
//             Current Stock
//           </button>
//           <button 
//             onClick={() => setTab('MOVEMENTS')}
//             className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", currentTab === 'MOVEMENTS' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700")}
//           >
//             Movement History
//           </button>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-2">
//           <button onClick={() => setModalType('ADJUST')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
//             <ArrowRightLeft className="w-4 h-4" /> Adjust Stock
//           </button>
//           <button onClick={() => setModalType('BOM')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
//             <LinkIcon className="w-4 h-4" /> Link BOM
//           </button>
//           <button onClick={() => setModalType('PRODUCT')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm font-medium hover:bg-red-700">
//             <Plus className="w-4 h-4" /> New Item
//           </button>
//         </div>
//       </div>

//       {/* SEARCH */}
//       <div className="py-4 max-w-md">
//         <SearchBar />
//       </div>

//       {/* CONTENT: STOCK TABLE */}
//       {currentTab === 'STOCK' && (
//         <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Item</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Cost / Price</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Stock Level</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {products.map((p: any) => (
//                 <tr key={p.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4">
//                     <div className="font-medium text-gray-900">{p.name}</div>
//                     <div className="text-xs text-gray-500">{p.code} • {p.brand}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={clsx(
//                       "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
//                       p.type === 'FINISHED_GOOD' ? "bg-green-50 text-green-700 ring-green-600/20" : 
//                       p.type === 'RAW_MATERIAL' ? "bg-blue-50 text-blue-700 ring-blue-600/20" : 
//                       "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
//                     )}>
//                       {p.type.replace('_', ' ')}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-right">
//                     <div className="text-sm text-gray-900">Cost: {p.costPrice}</div>
//                     <div className="text-xs text-gray-500">Sell: {p.sellingPrice}</div>
//                   </td>
//                   <td className="px-6 py-4 text-center">
//                     <div className="flex items-center justify-center gap-2">
//                        <span className={clsx(
//                          "font-bold text-lg",
//                          p.stockOnHand <= p.reorderLevel ? "text-red-600" : "text-gray-900"
//                        )}>
//                          {p.stockOnHand}
//                        </span>
//                       {p.stockOnHand <= p.reorderLevel && (
//                             <div title="Low Stock!">
//                                 <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
//                             </div>
//                             )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {products.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
//         </div>
//       )}

//       {/* CONTENT: MOVEMENTS TABLE */}
//       {currentTab === 'MOVEMENTS' && (
//         <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Change</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {movements.map((m: any) => (
//                 <tr key={m.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {new Date(m.date).toLocaleString()}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
//                       {m.type}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                     {m.product.name}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold">
//                     <span className={m.quantity > 0 ? "text-green-600" : "text-red-600"}>
//                       {m.quantity > 0 ? '+' : ''}{m.quantity}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {movements.length === 0 && <div className="p-8 text-center text-gray-500">No history found.</div>}
//         </div>
//       )}

//       {/* MODALS */}
//       <Modal isOpen={modalType === 'PRODUCT'} onClose={() => setModalType(null)} title="Create New Product">
//         <ProductForm onClose={() => setModalType(null)} />
//       </Modal>
      
//       <Modal isOpen={modalType === 'ADJUST'} onClose={() => setModalType(null)} title="Adjust Stock Level">
//         <AdjustmentForm products={products} onClose={() => setModalType(null)} />
//       </Modal>

//       <Modal isOpen={modalType === 'BOM'} onClose={() => setModalType(null)} title="">
//         <BOMForm products={products} onClose={() => setModalType(null)} />
//       </Modal>
//     </>
//   );
// }'use client';


'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, ArrowRightLeft, Link as LinkIcon, AlertCircle, Edit, Trash2 } from 'lucide-react';
import clsx from 'clsx';
// Ensure these paths match your project structure
import { Modal } from '@/app/ui/users/user-form';
import { ProductForm, AdjustmentForm, BOMForm } from '@/app/ui/inventory/inventory-forms';
import SearchBar from '@/app/ui/users/search';
import { deleteProduct } from '@/app/lib/inventory-actions';

export default function InventoryClientWrapper({ 
  products, 
  movements, 
  currentTab, 
  currentCategory,
  currentBrand,
  categories,
  suppliers,
  brands 
}: any) {
  const [modalType, setModalType] = useState<'PRODUCT' | 'ADJUST' | 'BOM' | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // For Editing
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Tab Handler
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === 'ALL') params.delete(key);
    else params.set(key, value);
    
    // When filtering, reset to STOCK view
    if (key === 'category' || key === 'brand') params.set('tab', 'STOCK'); 
    
    replace(`${pathname}?${params.toString()}`);
  };

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setModalType('PRODUCT');
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    const res = await deleteProduct(id);
    if(!res.success) {
      alert(res.message);
    }
  };

  return (
    <>
      {/* 1. TOP CONTROLS */}
      <div className="space-y-4 border-b border-gray-200 pb-4">
        
        {/* Row 1: Main Toggles & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
             <button 
               onClick={() => updateParam('tab', 'STOCK')} 
               className={clsx("px-4 py-1.5 text-sm font-medium rounded-md transition-all", currentTab === 'STOCK' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900")}
             >
               Stock
             </button>
             <button 
               onClick={() => updateParam('tab', 'MOVEMENTS')} 
               className={clsx("px-4 py-1.5 text-sm font-medium rounded-md transition-all", currentTab === 'MOVEMENTS' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900")}
             >
               History
             </button>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setModalType('ADJUST')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">
              <ArrowRightLeft className="w-4 h-4" /> Adjust
            </button>
            <button onClick={() => setModalType('BOM')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">
              <LinkIcon className="w-4 h-4" /> Link BOM
            </button>
            <button onClick={() => { setSelectedProduct(null); setModalType('PRODUCT'); }} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm font-medium hover:bg-red-700 shadow-sm">
              <Plus className="w-4 h-4" /> New Item
            </button>
          </div>
        </div>

        {/* Row 2: FILTERS (Categories & Brands) */}
        {currentTab === 'STOCK' && (
          <div className="flex flex-col gap-3">
             {/* Categories */}
             <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-hide border-b border-gray-100 min-h-[32px]">
               <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Category:</span>
               
               <button onClick={() => updateParam('category', 'ALL')} className={clsx("text-sm font-medium transition-colors", currentCategory === 'ALL' ? "text-[#E30613]" : "text-gray-500 hover:text-gray-800")}>All</button>
               <button onClick={() => updateParam('category', 'TIRE')} className={clsx("text-sm font-medium transition-colors", currentCategory === 'TIRE' ? "text-[#E30613]" : "text-gray-500 hover:text-gray-800")}>Tires</button>
               <button onClick={() => updateParam('category', 'TUBE')} className={clsx("text-sm font-medium transition-colors", currentCategory === 'TUBE' ? "text-[#E30613]" : "text-gray-500 hover:text-gray-800")}>Tubes</button>
               <button onClick={() => updateParam('category', 'RAW')} className={clsx("text-sm font-medium whitespace-nowrap transition-colors", currentCategory === 'RAW' ? "text-[#E30613]" : "text-gray-500 hover:text-gray-800")}>Raw Materials</button>
               
               {categories.filter((c: any) => !['TIRE','TUBE'].includes(c.name.toUpperCase())).map((c: any) => (
                 <button key={c.id} onClick={() => updateParam('category', c.id)} className={clsx("text-sm font-medium whitespace-nowrap transition-colors", currentCategory === c.id ? "text-[#E30613]" : "text-gray-500 hover:text-gray-800")}>{c.name}</button>
               ))}
             </div>

             {/* Brands */}
             {brands.length > 0 && (
               <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  <span className="text-xs font-bold text-gray-400 uppercase whitespace-nowrap">Brand:</span>
                  <button onClick={() => updateParam('brand', 'ALL')} className={clsx("text-xs px-2.5 py-1 rounded-full border transition-colors", currentBrand === 'ALL' ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>All</button>
                  {brands.map((b: string) => (
                    <button key={b} onClick={() => updateParam('brand', b)} className={clsx("text-xs px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors", currentBrand === b ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300")}>{b}</button>
                  ))}
               </div>
             )}
          </div>
        )}
      </div>

      <div className="py-4 max-w-md">
        <SearchBar />
      </div>

      {/* CONTENT AREA */}
      {currentTab === 'STOCK' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Item Details</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Category</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Stock & Price</th>
                <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex gap-2 items-center">
                       <span className="bg-gray-100 px-1.5 rounded border border-gray-200 font-mono text-[10px]">{p.code}</span>
                       {p.brand && <span>• {p.brand}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                      {p.category?.name || 'Uncategorized'}
                    </span>
                    {p.supplier && <div className="text-[10px] text-gray-400 mt-1">Sup: {p.supplier.name}</div>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2 mb-1">
                       <span className={clsx("font-bold text-sm", p.stockOnHand <= p.reorderLevel ? "text-red-600" : "text-green-600")}>
                         {p.stockOnHand} units
                       </span>
                       {p.stockOnHand <= p.reorderLevel && <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />}
                    </div>
                    <div className="text-xs text-gray-900">₦{p.sellingPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TABLE */}
      {currentTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Action</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Product</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {movements.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(m.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={clsx(
                      "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      m.type === 'RETURN' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' :
                      m.type === 'DAMAGE' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                      'bg-gray-50 text-gray-700 ring-gray-600/20'
                    )}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {m.product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold">
                    <span className={m.quantity > 0 ? "text-green-600" : "text-red-600"}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && <div className="p-12 text-center text-gray-500">No history found.</div>}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={modalType === 'PRODUCT'} onClose={() => setModalType(null)} title={selectedProduct ? "Edit Product" : "Create New Product"}>
        <ProductForm 
          product={selectedProduct} // Pass selected product for editing
          categories={categories} 
          suppliers={suppliers} 
          brands={brands} 
          onClose={() => setModalType(null)} 
        />
      </Modal>
      
      <Modal isOpen={modalType === 'ADJUST'} onClose={() => setModalType(null)} title="Adjust Stock Level">
        <AdjustmentForm products={products} onClose={() => setModalType(null)} />
      </Modal>

      <Modal isOpen={modalType === 'BOM'} onClose={() => setModalType(null)} title="Bill of Materials (BOM)">
        <BOMForm products={products} onClose={() => setModalType(null)} />
      </Modal>
    </>
  );
}