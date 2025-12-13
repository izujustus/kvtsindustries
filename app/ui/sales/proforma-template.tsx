'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';

export const ProformaTemplate = forwardRef<HTMLDivElement, { proforma: any }>(({ proforma }, ref) => {
  if (!proforma) return null;

  return (
    <div ref={ref} className="bg-white p-10 max-w-[210mm] mx-auto text-black font-sans relative">
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b-2 border-purple-800 pb-6 mb-8">
        <div className="flex items-center gap-4">
             <Image src="/logo.png" alt="KVTS Logo" width={80} height={80} />
             <div>
                <h1 className="text-3xl font-extrabold tracking-widest text-purple-800">KVTS INDUSTRIES</h1>
                <p className="text-xs text-gray-600 mt-1">Enugu, Nigeria</p>
             </div>
        </div>
        <div className="text-right">
             <h2 className="text-2xl font-black text-gray-900 uppercase">Proforma Invoice</h2>
             <p className="font-bold text-purple-600 mt-1">{proforma.proformaNumber}</p>
             <p className="text-sm mt-1">Date: {new Date(proforma.date).toLocaleDateString()}</p>
             <p className="text-sm font-bold text-red-600">Valid Until: {new Date(proforma.expiryDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* BILL TO */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Quotation For:</h3>
        <p className="font-bold text-xl">{proforma.customer.name}</p>
        <p className="text-gray-600">{proforma.customer.address || 'Address not available'}</p>
        <p className="text-gray-600">{proforma.customer.phone}</p>
      </div>

      {/* TABLE */}
      <table className="w-full mb-8 border-collapse">
        <thead>
            <tr className="bg-purple-800 text-white text-xs uppercase">
                <th className="p-3 text-center">S/N</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Amount</th>
            </tr>
        </thead>
        <tbody className="text-sm">
            {proforma.items.map((item: any, i: number) => (
                <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-3 text-center border-b border-gray-100">{i + 1}</td>
                    <td className="p-3 border-b border-gray-100">
                        <span className="font-bold block">{item.product.name}</span>
                        <span className="text-xs text-gray-500">{item.product.brand}</span>
                    </td>
                    <td className="p-3 text-center border-b border-gray-100">{item.quantity}</td>
                    <td className="p-3 text-right border-b border-gray-100">₦{item.unitPrice.toLocaleString()}</td>
                    <td className="p-3 text-right border-b border-gray-100 font-bold">₦{item.total.toLocaleString()}</td>
                </tr>
            ))}
        </tbody>
      </table>

      {/* TOTALS */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 space-y-2 text-right">
            <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₦{proforma.subTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Tax (7.5%):</span>
                <span>₦{proforma.taxAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-black text-purple-800 border-t border-purple-200 pt-2 mt-2">
                <span>Total Estimate:</span>
                <span>₦{proforma.totalAmount.toLocaleString()}</span>
            </div>
        </div>
      </div>

      {/* TERMS & DISCLAIMER */}
      <div className="border-t-2 border-gray-200 pt-4">
        <h4 className="font-bold text-sm mb-2">Terms & Notes:</h4>
        <p className="text-sm text-gray-600 whitespace-pre-wrap">{proforma.notes}</p>
        
        <div className="mt-8 text-center border border-dashed border-gray-400 p-2 text-xs text-gray-500 font-bold uppercase">
            This is not a tax invoice. This document is for valuation and advance payment purposes only.
        </div>
      </div>
    </div>
  );
});

ProformaTemplate.displayName = 'ProformaTemplate';