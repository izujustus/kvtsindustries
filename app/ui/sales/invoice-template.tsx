// // 'use client';

// // import React, { forwardRef } from 'react';
// // import Image from 'next/image';
// // import clsx from 'clsx';

// // // Props for the invoice data
// // interface InvoiceProps {
// //   invoice: any; // The full invoice object with customer & items
// // }

// // export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceProps>(({ invoice }, ref) => {
// //   if (!invoice) return null;

// //   const totalQuantity = invoice.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
// //   // Status Stamp Helper
// //   const getStatusStamp = (status: string) => {
// //     const baseClasses = "absolute top-8 right-8 border-4 rounded-lg px-4 py-1 font-black text-xl transform rotate-[-15deg] opacity-80";
// //     if (status === 'PAID') return <div className={clsx(baseClasses, "border-green-600 text-green-600")}>PAID</div>;
// //     if (status === 'PARTIALLY_PAID') return <div className={clsx(baseClasses, "border-yellow-600 text-yellow-600")}>PARTIAL</div>;
// //     return <div className={clsx(baseClasses, "border-red-600 text-red-600")}>{status.replace('_', ' ')}</div>;
// //   };

// //   return (
// //     <div ref={ref} className="relative bg-white p-8 max-w-[210mm] mx-auto text-black font-sans leading-snug overflow-hidden">
      
// //       {/* WATERMARK */}
// //       <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
// //         <Image 
// //           src="/logo.png" 
// //           alt="KVTS Watermark" 
// //           width={600} 
// //           height={600} 
// //           className="opacity-[0.03] grayscale" 
// //         />
// //       </div>

// //       <div className="relative z-10">
// //         {/* STATUS STAMP */}
// //         {getStatusStamp(invoice.status)}

// //         {/* HEADER */}
// //         <div className="flex items-start justify-between border-b-2 border-[#E30613] pb-6 mb-6">
// //           <div className="flex items-center gap-4">
// //              {/* LOGO IN HEADER */}
// //              <Image src="/logo.png" alt="KVTS Logo" width={80} height={80} />
// //              <div>
// //                 <h1 className="text-3xl font-extrabold tracking-widest text-[#E30613]">KVTS INDUSTRIES CO., LTD.</h1>
// //                 <div className="text-xs font-semibold text-gray-600 mt-1 space-y-0.5">
// //                   <p>Plot 15 Industrial Layout, Emene, Enugu East L.G.A., Enugu State</p>
// //                   <p>Tel: 07063451105 | Email: kvtsindustrieslimited@gmail.com</p>
// //                 </div>
// //              </div>
// //           </div>
// //           <div className="text-right">
// //              <h2 className="text-2xl font-black text-gray-900 uppercase">Commercial Invoice</h2>
// //              <p className="font-bold text-[#E30613] mt-1">{invoice.invoiceNumber}</p>
// //              <p className="text-sm">Date: {new Date(invoice.date).toLocaleDateString()}</p>
// //           </div>
// //         </div>

// //         {/* DETAILS GRID */}
// //         <div className="grid grid-cols-2 gap-8 text-sm mb-8">
// //           <div>
// //             <h3 className="font-bold text-[#E30613] mb-2 border-b border-gray-200 pb-1">INVOICE TO:</h3>
// //             <p className="font-bold text-lg">{invoice.customer.name}</p>
// //             <p className="text-gray-600 w-2/3">{invoice.customer.address || 'Address Not Provided'}</p>
// //             <p className="text-gray-600 mt-1">{invoice.customer.email} {invoice.customer.phone && `• ${invoice.customer.phone}`}</p>
// //           </div>
// //           <div className="bg-red-50 p-4 rounded-lg border border-red-100">
// //             <h3 className="font-bold text-[#E30613] mb-2">SHIPMENT DETAILS:</h3>
// //             <div className="grid grid-cols-3 gap-y-2">
// //                <span className="font-semibold">Loading:</span>
// //                <span className="col-span-2">{invoice.loadingLocation}</span>
               
// //                <span className="font-semibold">Destination:</span>
// //                <span className="col-span-2">{invoice.destination}</span>

// //                <span className="font-semibold">Due Date:</span>
// //                <span className="col-span-2">{new Date(invoice.dueDate).toLocaleDateString()}</span>
// //             </div>
// //           </div>
// //         </div>

// //         {/* TABLE */}
// //         <div className="mb-8">
// //           <table className="w-full border-collapse text-xs">
// //             <thead>
// //               <tr className="bg-[#E30613] text-white">
// //                 <th className="p-3 text-center rounded-tl-md w-12">S/N</th>
// //                 <th className="p-3 text-left">Brand / Description</th>
// //                 <th className="p-3 text-center">Package</th>
// //                 <th className="p-3 text-center">Qty</th>
// //                 <th className="p-3 text-right">Unit Price (₦)</th>
// //                 <th className="p-3 text-right rounded-tr-md">Amount (₦)</th>
// //               </tr>
// //             </thead>
// //             <tbody className="divide-y divide-gray-200 border border-gray-200 border-t-0">
// //               {invoice.items.map((item: any, idx: number) => (
// //                 <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
// //                   <td className="p-3 text-center text-gray-500">{idx + 1}</td>
// //                   <td className="p-3">
// //                      <p className="font-bold">{item.product.brand || 'KVTS'}</p>
// //                      <p>{item.product.name}</p>
// //                   </td>
// //                   <td className="p-3 text-center">{item.packageType || 'Piece'}</td>
// //                   <td className="p-3 text-center font-bold">{item.quantity}</td>
// //                   <td className="p-3 text-right">{Number(item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
// //                   <td className="p-3 text-right font-bold">{Number(item.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //         </div>

// //         {/* TOTALS SUMMARY */}
// //         <div className="flex justify-end mb-12">
// //           <div className="w-5/12 bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3 text-sm">
// //             <div className="flex justify-between text-gray-600">
// //               <span>Total Quantity:</span>
// //               <span className="font-semibold">{totalQuantity} Units</span>
// //             </div>
// //             <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2">
// //                <span>Subtotal:</span>
// //                <span className="font-semibold">₦{Number(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
// //             </div>
            
// //             <div className="flex justify-between items-center pt-1">
// //               <span className="font-bold text-lg text-[#E30613]">TOTAL AMOUNT:</span>
// //               <span className="font-black text-2xl text-[#E30613]">₦{Number(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
// //             </div>

// //             {invoice.paidAmount > 0 && (
// //                <div className="flex justify-between text-green-600 pt-2 border-t border-gray-200">
// //                   <span className="font-bold">Amount Paid:</span>
// //                   <span className="font-bold">₦{Number(invoice.paidAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
// //                </div>
// //             )}
// //              {invoice.balanceDue > 0 && (
// //                <div className="flex justify-between text-red-600">
// //                   <span className="font-bold">Balance Due:</span>
// //                   <span className="font-bold">₦{Number(invoice.balanceDue).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
// //                </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* FOOTER / SIGNATURE */}
// //         <div className="flex justify-between mt-auto pt-16 px-4 border-t border-gray-200">
// //           <div className="text-center">
// //             <div className="border-t-2 border-black w-48 pt-2">
// //               <p className="text-xs font-bold uppercase">Authorized Signature</p>
// //             </div>
// //           </div>
// //           <div className="text-center">
// //             <div className="border-t-2 border-black w-48 pt-2">
// //               <p className="text-xs font-bold uppercase">Customer Acceptance</p>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="text-center text-[10px] text-gray-500 mt-8">
// //           <p>Thank you for your business!</p>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // });

// // InvoiceTemplate.displayName = 'InvoiceTemplate';


// 'use client';

// import React, { forwardRef } from 'react';
// import Image from 'next/image';
// import clsx from 'clsx';

// // Props for the invoice data
// interface InvoiceProps {
//   invoice: any; // The full invoice object with customer & items
// }

// export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceProps>(({ invoice }, ref) => {
//   if (!invoice) return null;

//   const totalQuantity = invoice.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
//   // Status Stamp Helper
//   const getStatusStamp = (status: string) => {
//     const baseClasses = "absolute top-8 right-8 border-4 rounded-lg px-4 py-1 font-black text-xl transform rotate-[-15deg] opacity-80";
//     if (status === 'PAID') return <div className={clsx(baseClasses, "border-green-600 text-green-600")}>PAID</div>;
//     if (status === 'PARTIALLY_PAID') return <div className={clsx(baseClasses, "border-yellow-600 text-yellow-600")}>PARTIAL</div>;
//     return <div className={clsx(baseClasses, "border-red-600 text-red-600")}>{status.replace('_', ' ')}</div>;
//   };

//   return (
//     <div ref={ref} className="relative bg-white p-8 max-w-[210mm] mx-auto text-black font-sans leading-snug overflow-hidden">
      
//       {/* WATERMARK */}
//       <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
//         <Image 
//           src="/logo.png" 
//           alt="KVTS Watermark" 
//           width={600} 
//           height={600} 
//           className="opacity-[0.03] grayscale" 
//         />
//       </div>

//       <div className="relative z-10">
//         {/* STATUS STAMP */}
//         {getStatusStamp(invoice.status)}

//         {/* HEADER */}
//         <div className="flex items-start justify-between border-b-2 border-[#E30613] pb-6 mb-6">
//           <div className="flex items-center gap-4">
//              {/* LOGO IN HEADER */}
//              <Image src="/logo.png" alt="KVTS Logo" width={80} height={80} />
//              <div>
//                 <h1 className="text-3xl font-extrabold tracking-widest text-[#E30613]">KVTS INDUSTRIES CO., LTD.</h1>
//                 <div className="text-xs font-semibold text-gray-600 mt-1 space-y-0.5">
//                   <p>Plot 15 Industrial Layout, Emene, Enugu East L.G.A., Enugu State</p>
//                   <p>Tel: 07063451105 | Email: kvtsindustrieslimited@gmail.com</p>
//                 </div>
//              </div>
//           </div>
//           <div className="text-right">
//              <h2 className="text-2xl font-black text-gray-900 uppercase">Commercial Invoice</h2>
//              <p className="font-bold text-[#E30613] mt-1">{invoice.invoiceNumber}</p>
//              <p className="text-sm">Date: {new Date(invoice.date).toLocaleDateString()}</p>
//           </div>
//         </div>

//         {/* DETAILS GRID */}
//         <div className="grid grid-cols-2 gap-8 text-sm mb-8">
//           <div>
//             <h3 className="font-bold text-[#E30613] mb-2 border-b border-gray-200 pb-1">INVOICE TO:</h3>
//             <p className="font-bold text-lg">{invoice.customer.name}</p>
//             <p className="text-gray-600 w-2/3">{invoice.customer.address || 'Address Not Provided'}</p>
//             <p className="text-gray-600 mt-1">{invoice.customer.email} {invoice.customer.phone && `• ${invoice.customer.phone}`}</p>
//           </div>
//           <div className="bg-red-50 p-4 rounded-lg border border-red-100">
//             <h3 className="font-bold text-[#E30613] mb-2">SHIPMENT DETAILS:</h3>
//             <div className="grid grid-cols-3 gap-y-2">
//                <span className="font-semibold">Loading:</span>
//                <span className="col-span-2">{invoice.loadingLocation}</span>
               
//                <span className="font-semibold">Destination:</span>
//                <span className="col-span-2">{invoice.destination}</span>

//                <span className="font-semibold">Due Date:</span>
//                <span className="col-span-2">{new Date(invoice.dueDate).toLocaleDateString()}</span>
//             </div>
//           </div>
//         </div>

//         {/* TABLE */}
//         <div className="mb-8">
//           <table className="w-full border-collapse text-xs">
//             <thead>
//               <tr className="bg-[#E30613] text-white">
//                 <th className="p-3 text-center rounded-tl-md w-12">S/N</th>
//                 <th className="p-3 text-left">Brand / Description</th>
//                 <th className="p-3 text-center">Package</th>
//                 <th className="p-3 text-center">Qty</th>
//                 <th className="p-3 text-right">Unit Price (₦)</th>
//                 <th className="p-3 text-right rounded-tr-md">Amount (₦)</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 border border-gray-200 border-t-0">
//               {invoice.items.map((item: any, idx: number) => (
//                 <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                   <td className="p-3 text-center text-gray-500">{idx + 1}</td>
//                   <td className="p-3">
//                      <p className="font-bold">{item.product.brand || 'KVTS'}</p>
//                      <p>{item.product.name}</p>
//                   </td>
//                   <td className="p-3 text-center">{item.packageType || 'Piece'}</td>
//                   <td className="p-3 text-center font-bold">{item.quantity}</td>
//                   <td className="p-3 text-right">{Number(item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
//                   <td className="p-3 text-right font-bold">{Number(item.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* TOTALS SUMMARY */}
//         <div className="flex justify-end mb-12">
//           <div className="w-5/12 bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3 text-sm">
//             <div className="flex justify-between text-gray-600">
//               <span>Total Quantity:</span>
//               <span className="font-semibold">{totalQuantity} Units</span>
//             </div>
            
//             {/* Added Subtotal */}
//             <div className="flex justify-between text-gray-600">
//                <span>Subtotal:</span>
//                <span className="font-semibold">₦{Number(invoice.subTotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>
            
//             {/* Added Tax */}
//             <div className="flex justify-between text-gray-600">
//                <span>Tax ({Number(invoice.taxRate || 0)}%):</span>
//                <span className="font-semibold">₦{Number(invoice.taxAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>

//             {/* Added Logistics */}
//             <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2">
//                <span>Logistics:</span>
//                <span className="font-semibold">₦{Number(invoice.logisticsFee || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>
            
//             <div className="flex justify-between items-center pt-1">
//               <span className="font-bold text-lg text-[#E30613]">TOTAL AMOUNT:</span>
//               <span className="font-black text-2xl text-[#E30613]">₦{Number(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//             </div>

//             {invoice.paidAmount > 0 && (
//                <div className="flex justify-between text-green-600 pt-2 border-t border-gray-200">
//                   <span className="font-bold">Amount Paid:</span>
//                   <span className="font-bold">₦{Number(invoice.paidAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//                </div>
//             )}
//              {invoice.balanceDue > 0 && (
//                <div className="flex justify-between text-red-600">
//                   <span className="font-bold">Balance Due:</span>
//                   <span className="font-bold">₦{Number(invoice.balanceDue).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
//                </div>
//             )}
//           </div>
//         </div>

//         {/* FOOTER / SIGNATURE */}
//         <div className="flex justify-between mt-auto pt-16 px-4 border-t border-gray-200">
//           <div className="text-center">
//             <div className="border-t-2 border-black w-48 pt-2">
//               <p className="text-xs font-bold uppercase">Authorized Signature</p>
//             </div>
//           </div>
//           <div className="text-center">
//             <div className="border-t-2 border-black w-48 pt-2">
//               <p className="text-xs font-bold uppercase">Customer Acceptance</p>
//             </div>
//           </div>
//         </div>
        
//         <div className="text-center text-[10px] text-gray-500 mt-8">
//           <p>Thank you for your business!</p>
//         </div>
//       </div>
//     </div>
//   );
// });

// InvoiceTemplate.displayName = 'InvoiceTemplate';
'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

// Props for the invoice data
interface InvoiceProps {
  invoice: any; 
}

export const InvoiceTemplate = forwardRef<HTMLDivElement, InvoiceProps>(({ invoice }, ref) => {
  if (!invoice) return null;

  const totalQuantity = invoice.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
  
  // Calculate Overpayment Logic
  const balance = Number(invoice.balanceDue);
  const isOverpaid = balance < 0;
  
  // Status Stamp Helper
  const getStatusStamp = (status: string) => {
    const baseClasses = "absolute top-8 right-8 border-4 rounded-lg px-4 py-1 font-black text-xl transform rotate-[-15deg] opacity-80";
    if (status === 'PAID') return <div className={clsx(baseClasses, "border-green-600 text-green-600")}>PAID</div>;
    if (status === 'PARTIALLY_PAID') return <div className={clsx(baseClasses, "border-yellow-600 text-yellow-600")}>PARTIAL</div>;
    return <div className={clsx(baseClasses, "border-red-600 text-red-600")}>{status.replace('_', ' ')}</div>;
  };

  return (
    <div ref={ref} className="relative bg-white p-8 max-w-[210mm] mx-auto text-black font-sans leading-snug overflow-hidden">
      
      {/* WATERMARK */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none z-0">
        <Image 
          src="/logo.png" 
          alt="KVTS Watermark" 
          width={600} 
          height={600} 
          className="opacity-[0.03] grayscale" 
        />
      </div>

      <div className="relative z-10">
        {getStatusStamp(invoice.status)}

        {/* HEADER */}
        <div className="flex items-start justify-between border-b-2 border-[#E30613] pb-6 mb-6">
          <div className="flex items-center gap-4">
             <Image src="/logo.png" alt="KVTS Logo" width={80} height={80} />
             <div>
                <h1 className="text-3xl font-extrabold tracking-widest text-[#E30613]">KVTS INDUSTRIES CO., LTD.</h1>
                <div className="text-xs font-semibold text-gray-600 mt-1 space-y-0.5">
                  <p>Plot 15 Industrial Layout, Emene, Enugu East L.G.A., Enugu State</p>
                  <p>Tel: 07063451105 | Email: kvtsindustrieslimited@gmail.com</p>
                </div>
             </div>
          </div>
          <div className="text-right">
             <h2 className="text-2xl font-black text-gray-900 uppercase">Commercial Invoice</h2>
             <p className="font-bold text-[#E30613] mt-1">{invoice.invoiceNumber}</p>
             <p className="text-sm">Date: {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-2 gap-8 text-sm mb-8">
          <div>
            <h3 className="font-bold text-[#E30613] mb-2 border-b border-gray-200 pb-1">INVOICE TO:</h3>
            <p className="font-bold text-lg">{invoice.customer.name}</p>
            <p className="text-gray-600 w-2/3">{invoice.customer.address || 'Address Not Provided'}</p>
            <p className="text-gray-600 mt-1">{invoice.customer.email} {invoice.customer.phone && `• ${invoice.customer.phone}`}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="font-bold text-[#E30613] mb-2">SHIPMENT DETAILS:</h3>
            <div className="grid grid-cols-3 gap-y-2">
               <span className="font-semibold">Loading:</span>
               <span className="col-span-2">{invoice.loadingLocation}</span>
               
               <span className="font-semibold">Destination:</span>
               <span className="col-span-2">{invoice.destination}</span>

               <span className="font-semibold">Due Date:</span>
               <span className="col-span-2">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="mb-8 min-h-[200px]">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#E30613] text-white">
                <th className="p-3 text-center rounded-tl-md w-12">S/N</th>
                <th className="p-3 text-left">Brand / Description</th>
                <th className="p-3 text-center">Package</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price (₦)</th>
                <th className="p-3 text-right rounded-tr-md">Amount (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border border-gray-200 border-t-0">
              {invoice.items.map((item: any, idx: number) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 text-center text-gray-500">{idx + 1}</td>
                  <td className="p-3">
                     <p className="font-bold">{item.product.brand || 'KVTS'}</p>
                     <p>{item.product.name}</p>
                  </td>
                  <td className="p-3 text-center">{item.packageType || 'Piece'}</td>
                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                  <td className="p-3 text-right">{Number(item.unitPrice).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                  <td className="p-3 text-right font-bold">{Number(item.total).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTALS SUMMARY */}
        <div className="flex justify-end mb-12">
          <div className="w-6/12 bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Total Quantity:</span>
              <span className="font-semibold">{totalQuantity} Units</span>
            </div>
            
            <div className="flex justify-between text-gray-600">
               <span>Subtotal:</span>
               <span className="font-semibold">₦{Number(invoice.subTotal || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            
            <div className="flex justify-between text-gray-600">
               <span>Tax ({Number(invoice.taxRate || 0)}%):</span>
               <span className="font-semibold">₦{Number(invoice.taxAmount || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>

            <div className="flex justify-between text-gray-600 border-b border-gray-200 pb-2">
               <span>Logistics:</span>
               <span className="font-semibold">₦{Number(invoice.logisticsFee || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>
            
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-lg text-[#E30613]">TOTAL AMOUNT:</span>
              <span className="font-black text-2xl text-[#E30613]">₦{Number(invoice.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>

            {invoice.paidAmount > 0 && (
               <div className="flex justify-between text-green-600 pt-2 border-t border-gray-200">
                  <span className="font-bold">Amount Paid:</span>
                  <span className="font-bold">₦{Number(invoice.paidAmount).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
               </div>
            )}

            {/* BALANCE / CREDIT LOGIC */}
             {!isOverpaid ? (
                // Normal Case: Owing Money or 0
                balance > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span className="font-bold">Balance Due:</span>
                    <span className="font-bold">₦{balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                )
             ) : (
                // Overpaid Case: Show as Credit
                <div className="flex justify-between text-blue-600 bg-blue-50 px-2 py-1 rounded">
                   <span className="font-bold">Credit / Change:</span>
                   <span className="font-bold">₦{Math.abs(balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
             )}

          </div>
        </div>

        {/* FOOTER / SIGNATURE */}
        <div className="flex justify-between mt-auto pt-16 px-4 border-t border-gray-200">
          <div className="text-center">
            <div className="border-t-2 border-black w-48 pt-2">
              <p className="text-xs font-bold uppercase">Authorized Signature</p>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t-2 border-black w-48 pt-2">
              <p className="text-xs font-bold uppercase">Customer Acceptance</p>
            </div>
          </div>
        </div>
        
        <div className="text-center text-[10px] text-gray-500 mt-8">
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
});

InvoiceTemplate.displayName = 'InvoiceTemplate';