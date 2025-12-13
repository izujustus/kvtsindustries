'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Printer, X, Download } from 'lucide-react';

export function PurchaseOrderPrint({ order, onClose }: { order: any, onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 print:p-0">
      
      {/* ACTION BAR (Hidden when printing) */}
      <div className="fixed top-4 right-4 flex gap-2 print:hidden z-[110]">
        <button 
          onClick={handlePrint} 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 font-bold transition-transform hover:scale-105"
        >
          <Printer className="w-4 h-4" /> Print PO
        </button>
        <button 
          onClick={onClose} 
          className="bg-white text-gray-800 px-3 py-2 rounded-full shadow-lg hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* DOCUMENT CONTAINER */}
      <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl overflow-y-auto max-h-[90vh] print:max-h-none print:w-full print:h-full print:shadow-none print:overflow-visible print:absolute print:inset-0 rounded-sm">
        <div ref={printRef} className="p-10 sm:p-16 space-y-8 text-sm text-gray-800 font-sans">
          
          {/* 1. HEADER */}
          <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6">
            <div className="flex flex-col gap-2">
               {/* Placeholder for Logo */}
               <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 bg-red-600 flex items-center justify-center text-white font-bold rounded">
                    K
                  </div>
                  <span className="text-2xl font-black tracking-tighter text-gray-900">KVTS <span className="text-red-600">IND.</span></span>
               </div>
               <div className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Excellence in Production</div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">PURCHASE ORDER</h1>
              <p className="font-mono text-lg text-gray-600">{order.poNumber}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-gray-100 rounded text-xs font-bold uppercase tracking-wide">
                Status: {order.status}
              </div>
            </div>
          </div>

          {/* 2. INFO GRID */}
          <div className="grid grid-cols-2 gap-12">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">From (Buyer)</h3>
              <p className="font-bold text-lg">KVTS INDUSTRIES CO., LTD.</p>
              <p>Enugu Industrial Layout</p>
              <p>Enugu State, Nigeria</p>
              <p className="mt-2">Phone: +234 800 000 0000</p>
              <p>Email: procurement@kvts.com</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">To (Supplier)</h3>
              <p className="font-bold text-lg">{order.supplier.name}</p>
              <p>{order.supplier.email || 'No Email'}</p>
              <p>{order.supplier.phone || 'No Phone'}</p>
              
              <div className="mt-6 flex justify-between border-t border-gray-100 pt-2">
                <span className="font-bold text-gray-500">Date Issued:</span>
                <span>{new Date(order.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* 3. ITEMS TABLE */}
          <div className="mt-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y-2 border-gray-900">
                  <th className="py-3 px-4 text-left font-bold text-gray-900 uppercase text-xs tracking-wider">Item / Description</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider">Qty</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider">Unit Cost</th>
                  <th className="py-3 px-4 text-right font-bold text-gray-900 uppercase text-xs tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 text-sm">Product ID: {item.productId}</p>
                      {/* Note: Ideally we pass product name, but if only ID is available in 'item' relation, we use that. 
                          If your schema includes product relation in items, use item.product.name */}
                    </td>
                    <td className="py-4 px-4 text-right">{item.quantity}</td>
                    <td className="py-4 px-4 text-right">₦{Number(item.unitCost).toLocaleString()}</td>
                    <td className="py-4 px-4 text-right font-bold">₦{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right font-bold text-gray-500 uppercase text-xs">Total Amount</td>
                  <td className="pt-4 px-4 text-right text-2xl font-black text-gray-900">
                    ₦{Number(order.totalAmount).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 4. FOOTER / NOTES */}
          <div className="grid grid-cols-2 gap-10 mt-12 pt-8 border-t border-gray-200">
             <div>
               <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase">Notes / Instructions</h4>
               <p className="text-gray-500 italic bg-gray-50 p-3 rounded border border-gray-100 min-h-[80px]">
                 {order.notes || "Please include PO Number on all invoices. Delivery expected within 7 days."}
               </p>
             </div>
             <div className="space-y-10">
               <div>
                 <div className="h-px bg-gray-300 w-full mb-2"></div>
                 <p className="text-xs font-bold text-gray-400 uppercase text-center">Authorized Signature</p>
               </div>
             </div>
          </div>

          {/* 5. BRANDING FOOTER */}
          <div className="mt-auto pt-10 text-center text-xs text-gray-400">
            <p>This is a system generated document. KVTS Industries Co., Ltd.</p>
          </div>

        </div>
      </div>

      {/* PRINT CSS: Hides everything except the document */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .fixed {
            position: absolute;
            inset: 0;
            background: white;
          }
          /* Hide custom scrollbars during print */
          ::-webkit-scrollbar {
            display: none;
          }
          /* Target the document container specifically */
          .fixed > div:last-child,
          .fixed > div:last-child * {
            visibility: visible;
          }
          .fixed > div:last-child {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
            overflow: visible;
          }
        }
      `}</style>
    </div>
  );
}