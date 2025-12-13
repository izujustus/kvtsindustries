// 'use client';

// import { useState } from 'react';
// import { Plus } from 'lucide-react';
// import { Modal } from '@/app/ui/users/user-form';
// import { ProductionForm } from '@/app/ui/production/production-form';
// import clsx from 'clsx';

// export default function ProductionClientWrapper({ reports, products }: { reports: any[], products: any[] }) {
//   const [isModalOpen, setModalOpen] = useState(false);

//   // Helper to export CSV
//   const handleExport = () => {
//     const headers = ['Date', 'Batch', 'Product', 'Shift', 'Total', 'Qualified', 'Rejected', 'Defect Types'];
//     const rows = reports.map(r => [
//       new Date(r.date).toLocaleDateString(),
//       r.batchNumber,
//       r.product.name,
//       r.shift,
//       r.totalQty,
//       r.qualifiedQty,
//       r.rejectedQty,
//       r.defects.map((d:any) => `${d.defectType}:${d.quantity}`).join('; ')
//     ]);
    
//     const csvContent = "data:text/csv;charset=utf-8," 
//       + headers.join(",") + "\n" 
//       + rows.map(e => e.join(",")).join("\n");
      
//     const link = document.createElement("a");
//     link.setAttribute("href", encodeURI(csvContent));
//     link.setAttribute("download", "production_report.csv");
//     document.body.appendChild(link);
//     link.click();
//   };

//   return (
//     <>
//       <div className="bg-white px-4 pb-4 border-x border-gray-200 flex justify-end gap-2">
//          <button 
//             onClick={handleExport}
//             className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
//           >
//             Export CSV
//           </button>
//          <button 
//             onClick={() => setModalOpen(true)}
//             className="flex items-center gap-2 rounded-md bg-[#E30613] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
//           >
//             <Plus className="w-4 h-4" /> New Production Report
//           </button>
//       </div>

//       <div className="overflow-hidden rounded-b-xl border border-gray-200 bg-white shadow-sm">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date / Shift</th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Batch Info</th>
//               <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
//               <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Performance</th>
//               <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 bg-white">
//             {reports.map((report) => {
//                const rate = report.totalQty > 0 
//                   ? ((report.qualifiedQty / report.totalQty) * 100).toFixed(0) 
//                   : 0;
//                return (
//               <tr key={report.id} className="hover:bg-gray-50 transition-colors">
//                 <td className="whitespace-nowrap px-6 py-4">
//                   <div className="text-sm font-medium text-gray-900">{new Date(report.date).toLocaleDateString()}</div>
//                   <div className="text-xs text-gray-500 font-bold">{report.shift} SHIFT</div>
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4">
//                   <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
//                     {report.batchNumber}
//                   </span>
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4">
//                   <div className="text-sm text-gray-900">{report.product.name}</div>
//                   <div className="text-xs text-gray-500">{report.product.brand} - {report.product.code}</div>
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4 text-center">
//                    <div className="flex flex-col items-center gap-1">
//                       <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
//                          <div className="h-full bg-green-500" style={{ width: `${rate}%` }}></div>
//                       </div>
//                       <span className="text-xs text-gray-500">{report.qualifiedQty} / {report.totalQty} ({rate}%)</span>
//                    </div>
//                 </td>
//                 <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
//                    {report.rejectedQty > 0 ? (
//                       <span className="text-red-600 font-bold text-xs">{report.rejectedQty} Rejected</span>
//                    ) : (
//                       <span className="text-green-600 font-bold text-xs">Perfect</span>
//                    )}
//                 </td>
//               </tr>
//             )})}
//           </tbody>
//         </table>
        
//         {reports.length === 0 && (
//             <div className="p-10 text-center text-gray-500">
//                 No production reports found.
//             </div>
//         )}
//       </div>

//       <Modal 
//         isOpen={isModalOpen} 
//         onClose={() => setModalOpen(false)} 
//         title="Record Production Output"
//       >
//         <ProductionForm products={products} onClose={() => setModalOpen(false)} />
//       </Modal>
//     </>
//   );
// }
'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { ProductionForm } from '@/app/ui/production/production-form';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import clsx from 'clsx';

export default function ProductionClientWrapper({ 
  reports, 
  products,
  categories,
  brands,
  currentCategory,
  currentBrand
}: { 
  reports: any[], 
  products: any[],
  categories: any[],
  brands: string[],
  currentCategory: string,
  currentBrand: string
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle Category Filter (Tabs)
  const handleCatFilter = (catId: string) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'ALL') params.delete('category');
    else params.set('category', catId);
    replace(`${pathname}?${params.toString()}`);
  };

  // Handle Brand Filter (Pills)
  const handleBrandFilter = (brand: string) => {
    const params = new URLSearchParams(searchParams);
    if (brand === 'ALL') params.delete('brand');
    else params.set('brand', brand);
    replace(`${pathname}?${params.toString()}`);
  };

  const handleExport = () => {
    const headers = ['Date', 'Batch', 'Product', 'Shift', 'Total', 'Qualified', 'Rejected', 'Defect Types'];
    const rows = reports.map(r => [
      new Date(r.date).toLocaleDateString(),
      r.batchNumber,
      r.product.name,
      r.shift,
      r.totalQty,
      r.qualifiedQty,
      r.rejectedQty,
      r.defects.map((d:any) => `${d.defectType}:${d.quantity}`).join('; ')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "production_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <div className="bg-white px-4 pb-4 border-x border-gray-200 space-y-4">
         
         {/* ROW 1: CATEGORY TABS & ACTIONS */}
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
           {/* Dynamic Category Tabs */}
           <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                 onClick={() => handleCatFilter('ALL')}
                 className={clsx(
                   "px-4 py-1.5 text-sm font-bold rounded-full border transition-all whitespace-nowrap",
                   currentCategory === 'ALL' 
                     ? "bg-gray-900 text-white border-gray-900" 
                     : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                 )}
               >
                 All
               </button>
               {categories.map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => handleCatFilter(cat.id)}
                   className={clsx(
                     "px-4 py-1.5 text-sm font-bold rounded-full border transition-all whitespace-nowrap",
                     currentCategory === cat.id 
                       ? "bg-[#E30613] text-white border-[#E30613]" 
                       : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                   )}
                 >
                   {cat.name}
                 </button>
               ))}
           </div>

           <div className="flex gap-2">
             <button 
                onClick={handleExport}
                className="rounded-lg bg-white border border-gray-300 px-3 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                Export CSV
              </button>
             <button 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-[#E30613] px-4 py-2 text-sm font-bold text-white hover:bg-red-700 shadow-sm"
              >
                <Plus className="w-4 h-4" /> New Report
              </button>
           </div>
         </div>

         {/* ROW 2: BRAND FILTER (Only if brands exist) */}
         {brands.length > 0 && (
           <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide border-t border-gray-100 pt-3">
             <span className="text-xs font-bold text-gray-400 uppercase">Brand:</span>
             <button 
               onClick={() => handleBrandFilter('ALL')}
               className={clsx("text-xs px-2.5 py-1 rounded-md transition-colors font-medium", currentBrand === 'ALL' ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100")}
             >
               All
             </button>
             {brands.map(b => (
               <button 
                 key={b}
                 onClick={() => handleBrandFilter(b)}
                 className={clsx("text-xs px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap", currentBrand === b ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:bg-gray-100")}
               >
                 {b}
               </button>
             ))}
           </div>
         )}
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-b-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Date / Shift</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Batch Info</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500">Product</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500">Performance</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reports.map((report) => {
               const rate = report.totalQty > 0 
                  ? ((report.qualifiedQty / report.totalQty) * 100).toFixed(0) 
                  : 0;
               return (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{new Date(report.date).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 font-medium">{report.shift} SHIFT</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 font-mono">
                    {report.batchNumber}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{report.product.name}</div>
                  <div className="text-xs text-gray-500">{report.product.category?.name} • {report.product.brand}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                   <div className="flex flex-col items-center gap-1.5">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                         <div 
                           className={clsx("h-full rounded-full", Number(rate) > 95 ? "bg-green-500" : Number(rate) > 80 ? "bg-yellow-400" : "bg-red-500")}
                           style={{ width: `${rate}%` }}
                         ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600">{report.qualifiedQty} / {report.totalQty} ({rate}%)</span>
                   </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                   {report.rejectedQty > 0 ? (
                      <span className="bg-red-50 text-red-700 px-2 py-1 rounded-md font-bold text-xs">{report.rejectedQty} Rejected</span>
                   ) : (
                      <span className="text-green-600 font-bold text-xs flex justify-end items-center gap-1">Perfect</span>
                   )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {reports.length === 0 && (
            <div className="p-12 text-center text-gray-500">
                <p>No production reports found.</p>
                {(currentCategory !== 'ALL' || currentBrand !== 'ALL') && <p className="text-xs mt-1 text-red-500 cursor-pointer" onClick={() => replace(pathname)}>Clear Filters</p>}
            </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Record Production Output"
      >
        <ProductionForm 
          products={products} 
          categories={categories} // [NEW] Pass categories to form
          onClose={() => setModalOpen(false)} 
        />
      </Modal>
    </>
  );
}