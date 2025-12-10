'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Plus, CreditCard, UserPlus } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { CustomerForm, InvoiceForm, PaymentForm } from '@/app/ui/sales/sales-forms';

export default function SalesClientWrapper({ invoices, customers, products, unpaidInvoices }: any) {
  const [tab, setTab] = useState('INVOICES');
  const [modal, setModal] = useState<'INVOICE' | 'CUSTOMER' | 'PAYMENT' | null>(null);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-4">
          <button onClick={() => setTab('INVOICES')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'INVOICES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Invoices</button>
          <button onClick={() => setTab('CUSTOMERS')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'CUSTOMERS' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Debtors / Customers</button>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setModal('CUSTOMER')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"><UserPlus className="w-4 h-4" /> New Customer</button>
           <button onClick={() => setModal('PAYMENT')} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"><CreditCard className="w-4 h-4" /> Record Payment</button>
           <button onClick={() => setModal('INVOICE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm hover:bg-red-700"><Plus className="w-4 h-4" /> Create Invoice</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
        {tab === 'INVOICES' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-gray-50">
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
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
              {customers.map((c: any) => {
                const balance = Number(c.currentBalance);
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.email || c.phone || 'N/A'}</td>
                    <td className="px-6 py-4 text-right">
                       {balance > 0 ? (
                         <span className="text-red-600 font-bold">Owes ₦{balance.toLocaleString()}</span>
                       ) : balance < 0 ? (
                         <span className="text-green-600 font-bold">Credit ₦{Math.abs(balance).toLocaleString()}</span>
                       ) : (
                         <span className="text-gray-400">Settled</span>
                       )}
                    </td>
                  </tr>
                )
              })}
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
    </>
  );
}