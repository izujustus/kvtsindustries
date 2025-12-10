'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Plus, BookOpen, FileText, Check } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { AccountForm, JournalEntryForm, ExpenseForm } from '@/app/ui/accounting/accounting-forms';
import { approveExpense } from '@/app/lib/accounting-actions';

export default function AccountingClientWrapper({ accounts, journalEntries, expenses, userId }: any) {
  const [tab, setTab] = useState('COA'); // COA, JOURNAL, EXPENSES
  const [modal, setModal] = useState<'ACCOUNT' | 'ENTRY' | 'EXPENSE' | null>(null);

  const handleApprove = async (id: string) => {
    if (!confirm('Approve this expense? This will post a Journal Entry.')) return;
    await approveExpense(id, userId);
  };

  return (
    <>
      {/* TABS & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-4">
          <button onClick={() => setTab('COA')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'COA' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Chart of Accounts</button>
          <button onClick={() => setTab('JOURNAL')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'JOURNAL' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>General Ledger</button>
          <button onClick={() => setTab('EXPENSES')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'EXPENSES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Expenses</button>
        </div>
        <div className="flex gap-2">
           {tab === 'COA' && (
             <button onClick={() => setModal('ACCOUNT')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50"><Plus className="w-4 h-4" /> Add Account</button>
           )}
           {tab === 'JOURNAL' && (
             <button onClick={() => setModal('ENTRY')} className="flex items-center gap-2 px-3 py-2 bg-blue-700 text-white rounded-md text-sm hover:bg-blue-800"><BookOpen className="w-4 h-4" /> Post Entry</button>
           )}
           {tab === 'EXPENSES' && (
             <button onClick={() => setModal('EXPENSE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm hover:bg-red-700"><FileText className="w-4 h-4" /> Submit Expense</button>
           )}
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
        
        {/* TAB: CHART OF ACCOUNTS */}
        {tab === 'COA' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((acc: any) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{acc.code}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{acc.name}</td>
                  <td className="px-6 py-4"><span className="text-xs bg-gray-100 px-2 py-1 rounded">{acc.type}</span></td>
                  <td className="px-6 py-4 text-right text-sm font-bold">₦{acc.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB: JOURNAL ENTRIES */}
        {tab === 'JOURNAL' && (
          <div className="divide-y divide-gray-200">
            {journalEntries.map((entry: any) => (
              <div key={entry.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-sm text-blue-800">{entry.entryNumber}</span>
                    <span className="text-gray-500 text-xs ml-2">{new Date(entry.date).toLocaleDateString()}</span>
                    <p className="text-sm text-gray-800">{entry.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">Ref: {entry.reference || 'N/A'}</span>
                </div>
                {/* Lines */}
                <div className="bg-gray-50 rounded border p-2 text-xs">
                  {entry.lines.map((line: any, idx: number) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 py-1">
                      <div className="col-span-6 text-gray-600">{line.account.code} - {line.account.name}</div>
                      <div className="col-span-3 text-right">{Number(line.debit) > 0 ? Number(line.debit).toFixed(2) : '-'}</div>
                      <div className="col-span-3 text-right">{Number(line.credit) > 0 ? Number(line.credit).toFixed(2) : '-'}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: EXPENSES */}
        {tab === 'EXPENSES' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Details</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((exp: any) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(exp.incurredDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{exp.title}</div>
                    <div className="text-xs text-gray-500">{exp.category} • {exp.paymentMethod}</div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold">₦{Number(exp.amount).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    {exp.status === 'PENDING' ? (
                      <button onClick={() => handleApprove(exp.id)} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium hover:bg-yellow-200">
                        Pending <Check className="w-3 h-3" />
                      </button>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'ACCOUNT'} onClose={() => setModal(null)} title="Add Ledger Account">
        <AccountForm onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'ENTRY'} onClose={() => setModal(null)} title="Post Journal Entry">
        <JournalEntryForm accounts={accounts} userId={userId} onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'EXPENSE'} onClose={() => setModal(null)} title="Submit Expense Claim">
        <ExpenseForm onClose={() => setModal(null)} />
      </Modal>
    </>
  );
}