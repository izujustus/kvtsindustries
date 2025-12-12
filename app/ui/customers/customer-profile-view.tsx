'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReactToPrint } from 'react-to-print';
import { ArrowLeft, Printer, FileText, ShoppingBag, CreditCard, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { InvoiceTemplate } from '@/app/ui/sales/invoice-template';

// 1. STATEMENT TEMPLATE COMPONENT (For Printing)
const StatementTemplate = ({ customer, transactions }: { customer: any, transactions: any[] }) => {
  return (
    <div className="p-10 font-sans text-sm text-black bg-white">
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase">Statement of Account</h1>
        <p className="text-gray-500">KVTS INDUSTRIES CO., LTD.</p>
      </div>

      <div className="flex justify-between mb-8">
        <div>
           <p className="text-gray-500 text-xs uppercase">Customer:</p>
           <p className="font-bold text-lg">{customer.name}</p>
           <p>{customer.address}</p>
           <p>{customer.phone}</p>
        </div>
        <div className="text-right">
           <p className="text-gray-500 text-xs uppercase">Statement Date:</p>
           <p className="font-bold">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      <table className="w-full border-collapse border border-gray-300 text-xs">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Description / Ref</th>
            <th className="border p-2 text-right">Debit (Inv)</th>
            <th className="border p-2 text-right">Credit (Pay)</th>
            <th className="border p-2 text-right">Balance</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t: any, idx: number) => (
            <tr key={idx}>
              <td className="border p-2">{new Date(t.date).toLocaleDateString()}</td>
              <td className="border p-2">{t.description}</td>
              <td className="border p-2 text-right">{t.debit > 0 ? t.debit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
              <td className="border p-2 text-right">{t.credit > 0 ? t.credit.toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
              <td className="border p-2 text-right font-bold">{t.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-8 text-right">
         <p className="text-lg font-bold">Closing Balance: ₦{Number(customer.currentBalance).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
         <p className="text-xs text-gray-500">Positive = Owing | Negative = Credit</p>
      </div>
    </div>
  );
};


// 2. MAIN COMPONENT
export default function CustomerProfileView({ customer }: { customer: any }) {
  const router = useRouter();
  const [tab, setTab] = useState('OVERVIEW');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null); // For re-printing

  // -- MERGE TRANSACTIONS FOR STATEMENT --
  const transactions = [
    ...customer.invoices.map((i: any) => ({
      date: i.date,
      type: 'INVOICE',
      description: `Inv #${i.invoiceNumber}`,
      debit: Number(i.totalAmount),
      credit: 0,
      refId: i.id
    })),
    ...customer.payments.map((p: any) => ({
      date: p.date,
      type: 'PAYMENT',
      description: `Pay #${p.paymentNumber} (${p.method})`,
      debit: 0,
      credit: Number(p.amount),
      refId: p.id
    }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate Running Balance
  let runningBalance = 0;
  const statementData = transactions.map(t => {
    runningBalance += (t.debit - t.credit);
    return { ...t, balance: runningBalance };
  });

  // Print Handlers
  const statementRef = useRef<HTMLDivElement>(null); // Hidden ref for statement
  const invoiceRef = useRef<HTMLDivElement>(null); // Hidden ref for invoice

  const handlePrintStatement = useReactToPrint({
    contentRef: statementRef,
    documentTitle: `Statement_${customer.name}`,
  });

  const handlePrintInvoice = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: selectedInvoice ? `Invoice_${selectedInvoice.invoiceNumber}` : 'Invoice',
  });

  // Auto-trigger print when invoice selected
  const selectAndPrintInvoice = (inv: any) => {
    // FIX APPLIED HERE: Attach customer object to invoice
    const fullInvoice = { 
      ...inv, 
      customer: customer 
    };
    setSelectedInvoice(fullInvoice);
    setTimeout(() => handlePrintInvoice(), 100);
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{customer.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-2">
             <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{customer.code || 'NO ID'}</span>
             <span>{customer.email}</span>
          </p>
        </div>
        <div className="ml-auto flex gap-2">
           <button onClick={() => handlePrintStatement()} className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50">
             <Printer className="w-4 h-4" /> Print Statement
           </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
           <p className="text-sm text-gray-500 mb-1">Current Balance</p>
           <p className={clsx("text-2xl font-bold", Number(customer.currentBalance) > 0 ? "text-red-600" : "text-green-600")}>
             ₦{Number(customer.currentBalance).toLocaleString()}
           </p>
           <p className="text-xs text-gray-400 mt-1">{Number(customer.currentBalance) > 0 ? "Customer Owes You" : "Credit Available"}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
           <p className="text-sm text-gray-500 mb-1">Total Sales (Lifetime)</p>
           <p className="text-2xl font-bold">
             ₦{customer.invoices.reduce((sum: number, i: any) => sum + Number(i.totalAmount), 0).toLocaleString()}
           </p>
           <p className="text-xs text-gray-400 mt-1">{customer.invoices.length} total orders</p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
           <p className="text-sm text-gray-500 mb-1">Last Transaction</p>
           <p className="text-lg font-bold">
             {transactions.length > 0 ? new Date(transactions[transactions.length-1].date).toLocaleDateString() : 'N/A'}
           </p>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {['OVERVIEW', 'INVOICES', 'PAYMENTS', 'STATEMENT'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={clsx(
                "pb-3 text-sm font-medium border-b-2 transition-colors",
                tab === t ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t === 'OVERVIEW' ? 'Overview' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white rounded-xl border shadow-sm min-h-[400px]">
        
        {/* TAB: INVOICES */}
        {tab === 'INVOICES' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Invoice #</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
               {customer.invoices.map((inv: any) => (
                 <tr key={inv.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 text-sm text-gray-900">{new Date(inv.date).toLocaleDateString()}</td>
                   <td className="px-6 py-4 text-sm font-medium">{inv.invoiceNumber}</td>
                   <td className="px-6 py-4 text-sm text-right font-bold">₦{Number(inv.totalAmount).toLocaleString()}</td>
                   <td className="px-6 py-4 text-center">
                      <span className={clsx("px-2 py-1 text-xs rounded-full", inv.status === 'PAID' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                        {inv.status}
                      </span>
                   </td>
                   <td className="px-6 py-4 text-right">
                      <button onClick={() => selectAndPrintInvoice(inv)} className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center justify-end gap-1">
                        <Printer className="w-3 h-3" /> Print
                      </button>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        )}

        {/* TAB: PAYMENTS */}
        {tab === 'PAYMENTS' && (
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Ref #</th>
                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Method</th>
                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {customer.payments.map((p: any) => (
                 <tr key={p.id}>
                   <td className="px-6 py-4 text-sm text-gray-900">{new Date(p.date).toLocaleDateString()}</td>
                   <td className="px-6 py-4 text-sm font-medium">{p.paymentNumber}</td>
                   <td className="px-6 py-4 text-sm text-gray-500">{p.method}</td>
                   <td className="px-6 py-4 text-sm text-right font-bold text-green-600">₦{Number(p.amount).toLocaleString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
        
        {/* TAB: STATEMENT (Preview in UI) */}
        {tab === 'STATEMENT' && (
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded mb-4 text-xs text-gray-500 border border-gray-200">
               This is a preview. Click "Print Statement" at the top right to generate the official PDF.
            </div>
             <table className="min-w-full divide-y divide-gray-200 border text-xs">
                <thead className="bg-gray-100 font-bold">
                   <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Description</th>
                      <th className="px-4 py-2 text-right">Debit</th>
                      <th className="px-4 py-2 text-right">Credit</th>
                      <th className="px-4 py-2 text-right">Balance</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                   {statementData.map((t, i) => (
                      <tr key={i}>
                         <td className="px-4 py-2">{new Date(t.date).toLocaleDateString()}</td>
                         <td className="px-4 py-2">{t.description}</td>
                         <td className="px-4 py-2 text-right">{t.debit > 0 ? t.debit.toLocaleString() : '-'}</td>
                         <td className="px-4 py-2 text-right">{t.credit > 0 ? t.credit.toLocaleString() : '-'}</td>
                         <td className="px-4 py-2 text-right font-bold">{t.balance.toLocaleString()}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* TAB: OVERVIEW (Default) */}
        {tab === 'OVERVIEW' && (
           <div className="p-8 grid grid-cols-2 gap-8">
              <div>
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Financial Overview</h3>
                 <div className="space-y-3 text-sm">
                    <div className="flex justify-between border-b pb-2">
                       <span className="text-gray-500">Total Invoiced:</span>
                       <span className="font-medium">₦{customer.invoices.reduce((sum:number, i:any)=> sum + Number(i.totalAmount), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                       <span className="text-gray-500">Total Paid:</span>
                       <span className="font-medium">₦{customer.payments.reduce((sum:number, p:any)=> sum + Number(p.amount), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                       <span className="font-bold">Net Balance:</span>
                       <span className={clsx("font-bold", Number(customer.currentBalance) > 0 ? "text-red-600" : "text-green-600")}>
                         ₦{Number(customer.currentBalance).toLocaleString()}
                       </span>
                    </div>
                 </div>
              </div>
              
              <div>
                 <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Contact Details</h3>
                 <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3">
                       <span className="text-gray-500">Address:</span>
                       <span className="col-span-2">{customer.address || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                       <span className="text-gray-500">Phone:</span>
                       <span className="col-span-2">{customer.phone || 'N/A'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                       <span className="text-gray-500">Email:</span>
                       <span className="col-span-2">{customer.email || 'N/A'}</span>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      {/* --- HIDDEN PRINT TEMPLATES --- */}
      <div className="hidden">
         {/* Statement */}
         <div ref={statementRef}>
            <StatementTemplate customer={customer} transactions={statementData} />
         </div>
         {/* Invoice */}
         <div ref={invoiceRef}>
            <InvoiceTemplate invoice={selectedInvoice} />
         </div>
      </div>

    </div>
  );
}