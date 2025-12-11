'use client';

import { useState, useRef } from 'react';
import clsx from 'clsx';
import { useReactToPrint } from 'react-to-print';
import { Plus, CreditCard, UserPlus, Printer, Eye, Search } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { CustomerForm, InvoiceForm, PaymentForm } from '@/app/ui/sales/sales-forms';
import { InvoiceTemplate } from '@/app/ui/sales/invoice-template';

export default function SalesClientWrapper({ invoices, customers, products, unpaidInvoices }: any) {
  const [tab, setTab] = useState('INVOICES');
  const [modal, setModal] = useState<'INVOICE' | 'CUSTOMER' | 'PAYMENT' | 'VIEW_INVOICE' | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // SEARCH STATE
  const [searchTerm, setSearchTerm] = useState('');

  // PRINT LOGIC
  const invoiceRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: selectedInvoice ? `Invoice_${selectedInvoice.invoiceNumber}` : 'Invoice',
  });

  const handleViewInvoice = (inv: any) => {
    setSelectedInvoice(inv);
    setModal('VIEW_INVOICE');
  };

  // FILTER LOGIC
  const filteredInvoices = invoices.filter((inv: any) => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCustomers = customers.filter((c: any) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <>
      {/* HEADER ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-4">
          <button onClick={() => { setTab('INVOICES'); setSearchTerm(''); }} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", tab === 'INVOICES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700")}>Invoices</button>
          <button onClick={() => { setTab('CUSTOMERS'); setSearchTerm(''); }} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", tab === 'CUSTOMERS' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700")}>Debtors / Customers</button>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setModal('CUSTOMER')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><UserPlus className="w-4 h-4" /> New Customer</button>
           <button onClick={() => setModal('PAYMENT')} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"><CreditCard className="w-4 h-4" /> Record Payment</button>
           <button onClick={() => setModal('INVOICE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm font-medium hover:bg-red-700"><Plus className="w-4 h-4" /> Create Invoice</button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="mt-4 relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-[#E30613] focus:border-[#E30613] sm:text-sm"
          placeholder={tab === 'INVOICES' ? "Search Invoice # or Customer..." : "Search Name, Phone or Email..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
        
        {/* TAB 1: INVOICES TABLE */}
        {tab === 'INVOICES' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{inv.customer.name}</td>
                    <td className="px-6 py-4">
                      <span className={clsx("px-2 py-1 text-xs font-medium rounded-full", 
                        inv.status === 'PAID' ? "bg-green-100 text-green-800" : 
                        inv.status === 'PARTIALLY_PAID' ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800")}>
                        {inv.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold">₦{Number(inv.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-sm text-red-600">₦{Number(inv.balanceDue).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleViewInvoice(inv)}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-blue-600 text-xs font-medium"
                      >
                        <Eye className="w-4 h-4" /> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No invoices found matching &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {/* TAB 2: CUSTOMERS TABLE */}
        {tab === 'CUSTOMERS' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Contact</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Net Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c: any) => {
                  const balance = Number(c.currentBalance);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{c.email || c.phone || 'N/A'}</td>
                      <td className="px-6 py-4 text-right">
                        {balance > 0 ? (
                          <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">Owes ₦{balance.toLocaleString()}</span>
                        ) : balance < 0 ? (
                          <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded">Credit ₦{Math.abs(balance).toLocaleString()}</span>
                        ) : (
                          <span className="text-gray-400">Settled</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">
                    No customers found matching &quot;{searchTerm}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'CUSTOMER'} onClose={() => setModal(null)} title="Add New Customer">
        <CustomerForm onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'INVOICE'} onClose={() => setModal(null)} title="Create Sales Invoice">
        <InvoiceForm customers={customers} products={products} onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'PAYMENT'} onClose={() => setModal(null)} title="Receive Payment">
        <PaymentForm invoices={unpaidInvoices} onClose={() => setModal(null)} />
      </Modal>

      {/* VIEW INVOICE MODAL */}
      <Modal isOpen={modal === 'VIEW_INVOICE'} onClose={() => setModal(null)} title="Invoice Preview">
        <div className="flex flex-col h-[80vh] w-full">
          <div className="flex justify-end gap-2 mb-4">
             <button 
               onClick={() => handlePrint()} 
               className="bg-[#E30613] text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 flex items-center gap-2 shadow-sm"
             >
               <Printer className="w-4 h-4" /> Print / PDF
             </button>
             <button onClick={() => setModal(null)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-50">Close</button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded border border-gray-300 shadow-inner">
             <div className="flex justify-center">
               <InvoiceTemplate ref={invoiceRef} invoice={selectedInvoice} />
             </div>
          </div>
        </div>
      </Modal>
    </>
  );
}