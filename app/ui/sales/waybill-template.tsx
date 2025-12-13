'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';

interface WaybillProps {
  invoice: any; // Contains the waybill relation
}

export const WaybillTemplate = forwardRef<HTMLDivElement, WaybillProps>(({ invoice }, ref) => {
  if (!invoice || !invoice.waybill) return null;

  const { waybill, customer, items } = invoice;

  return (
    <div ref={ref} className="bg-white p-8 max-w-[210mm] mx-auto text-black font-sans border-2 border-gray-800">
      
      {/* HEADER: GATE PASS AUTHORITY */}
      <div className="flex justify-between items-center border-b-4 border-black pb-4 mb-6">
        <div className="flex items-center gap-4">
           <Image src="/logo.png" alt="KVTS Logo" width={80} height={80} className="grayscale" />
           <div>
              <h1 className="text-3xl font-black tracking-tighter uppercase">Gate Pass / Waybill</h1>
              <p className="font-bold text-gray-600">KVTS INDUSTRIES CO., LTD.</p>
           </div>
        </div>
        <div className="text-right">
           <div className="bg-black text-white px-4 py-2 rounded text-xl font-mono font-bold mb-1">
             {waybill.gatePassCode}
           </div>
           <p className="text-xs uppercase font-bold tracking-widest">Security Code</p>
        </div>
      </div>

      {/* LOGISTICS INFO */}
      <div className="grid grid-cols-2 gap-8 mb-6 border-b border-gray-300 pb-6">
        <div>
          <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Dispatch To (Customer):</h3>
          <p className="text-xl font-bold">{customer.name}</p>
          <p className="text-sm">{invoice.destination}</p>
        </div>
        <div className="space-y-2">
           <div className="flex justify-between border-b border-dotted border-gray-400">
             <span className="text-sm font-bold">Waybill #:</span>
             <span className="font-mono">{waybill.waybillNumber}</span>
           </div>
           <div className="flex justify-between border-b border-dotted border-gray-400">
             <span className="text-sm font-bold">Driver Name:</span>
             <span>{waybill.driverName}</span>
           </div>
           <div className="flex justify-between border-b border-dotted border-gray-400">
             <span className="text-sm font-bold">Vehicle Reg:</span>
             <span className="uppercase">{waybill.vehicleNumber}</span>
           </div>
           <div className="flex justify-between border-b border-dotted border-gray-400">
             <span className="text-sm font-bold">Dispatch Date:</span>
             <span>{new Date(waybill.dispatchDate).toLocaleDateString()}</span>
           </div>
        </div>
      </div>

      {/* CARGO MANIFEST (NO PRICES) */}
      <table className="w-full mb-8 border border-black">
        <thead className="bg-gray-200 text-black border-b border-black">
          <tr>
            <th className="p-2 text-center w-12 border-r border-black">S/N</th>
            <th className="p-2 text-left border-r border-black">Item Description</th>
            <th className="p-2 text-center w-24 border-r border-black">Package</th>
            <th className="p-2 text-center w-24">Quantity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {items.map((item: any, idx: number) => (
            <tr key={item.id}>
              <td className="p-3 text-center border-r border-black font-bold">{idx + 1}</td>
              <td className="p-3 border-r border-black">
                 <span className="font-bold block">{item.product.name}</span>
                 <span className="text-xs text-gray-500">{item.product.brand}</span>
              </td>
              <td className="p-3 text-center border-r border-black">{item.packageType || 'Piece'}</td>
              <td className="p-3 text-center font-black text-lg">{item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* CHAIN OF CUSTODY SIGNATURES */}
      <div className="mt-12 grid grid-cols-3 gap-8 text-center text-sm">
        <div>
          <p className="font-bold mb-8">{waybill.preparedBy || 'Warehouse Manager'}</p>
          <div className="border-t-2 border-black pt-2">
            <p className="font-bold uppercase">Authorized Dispatcher</p>
            <p className="text-[10px] text-gray-500">Sign & Date</p>
          </div>
        </div>
        
        <div>
          <p className="font-bold mb-8 text-transparent">.</p>
          <div className="border-t-2 border-black pt-2">
            <p className="font-bold uppercase">Driver Acceptance</p>
            <p className="text-[10px] text-gray-500">I confirm receipt of goods</p>
          </div>
        </div>

        <div>
           <p className="font-bold mb-8 text-transparent">.</p>
           <div className="border-t-2 border-black pt-2">
             <p className="font-bold uppercase">Security Check</p>
             <p className="text-[10px] text-gray-500">Gate Exit Verified</p>
           </div>
        </div>
      </div>

      {/* SECURITY NOTICE */}
      <div className="mt-8 text-center bg-black text-white p-2 text-xs uppercase font-bold">
        Allow Bearer To Pass - Goods Verified - No Commercial Value On This Document
      </div>

    </div>
  );
});

WaybillTemplate.displayName = 'WaybillTemplate';