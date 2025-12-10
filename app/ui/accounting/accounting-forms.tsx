'use client';

import { useActionState, useEffect, useState } from 'react';
import { createAccount, createJournalEntry, createExpense } from '@/app/lib/accounting-actions';
import { Plus, Trash, AlertTriangle, CheckCircle } from 'lucide-react';

// 1. ACCOUNT FORM (Chart of Accounts)
export function AccountForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createAccount, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Code</label>
          <input name="code" required placeholder="e.g. 1050" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select name="type" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="ASSET">Asset</option>
            <option value="LIABILITY">Liability</option>
            <option value="EQUITY">Equity</option>
            <option value="REVENUE">Revenue</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Account Name</label>
        <input name="name" required placeholder="Petty Cash" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Creating...' : 'Create Account'}
        </button>
      </div>
    </form>
  );
}

// 2. JOURNAL ENTRY FORM (Double Entry Logic)
export function JournalEntryForm({ accounts, userId, onClose }: { accounts: any[], userId: string, onClose: () => void }) {
  const [state, action, isPending] = useActionState(createJournalEntry, undefined);
  
  // Dynamic Lines
  const [lines, setLines] = useState([
    { accountId: '', debit: 0, credit: 0 },
    { accountId: '', debit: 0, credit: 0 }
  ]);

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const addLine = () => setLines([...lines, { accountId: '', debit: 0, credit: 0 }]);
  const removeLine = (idx: number) => setLines(lines.filter((_, i) => i !== idx));

  const updateLine = (idx: number, field: string, value: any) => {
    const newLines = [...lines];
    newLines[idx] = { ...newLines[idx], [field]: value };
    // Auto-zero opposite field (Logic: A line is usually Debit OR Credit, rarely both)
    if (field === 'debit' && Number(value) > 0) newLines[idx].credit = 0;
    if (field === 'credit' && Number(value) > 0) newLines[idx].debit = 0;
    setLines(newLines);
  };

  const totalDebit = lines.reduce((acc, l) => acc + Number(l.debit), 0);
  const totalCredit = lines.reduce((acc, l) => acc + Number(l.credit), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="lines" value={JSON.stringify(lines)} />
      <input type="hidden" name="userId" value={userId} />

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Date</label>
           <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Reference</label>
           <input name="reference" placeholder="Inv-001 / Adj" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
         <label className="block text-sm font-medium text-gray-700">Description</label>
         <input name="description" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {/* Ledger Lines */}
      <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 mb-2 px-1">
          <div className="col-span-5">Account</div>
          <div className="col-span-3 text-right">Debit</div>
          <div className="col-span-3 text-right">Credit</div>
          <div className="col-span-1"></div>
        </div>
        
        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-5">
                <select 
                  required 
                  value={line.accountId}
                  onChange={(e) => updateLine(idx, 'accountId', e.target.value)}
                  className="w-full text-sm rounded-md border-gray-300"
                >
                  <option value="">Select Account...</option>
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>)}
                </select>
              </div>
              <div className="col-span-3">
                <input 
                  type="number" step="0.01" 
                  value={line.debit || ''} 
                  onChange={(e) => updateLine(idx, 'debit', Number(e.target.value))}
                  className="w-full text-right text-sm rounded-md border-gray-300"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-3">
                <input 
                  type="number" step="0.01" 
                  value={line.credit || ''} 
                  onChange={(e) => updateLine(idx, 'credit', Number(e.target.value))}
                  className="w-full text-right text-sm rounded-md border-gray-300"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-1 text-center">
                 <button type="button" onClick={() => removeLine(idx)} className="text-gray-400 hover:text-red-500"><Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLine} className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800">
           <Plus className="w-3 h-3" /> Add Line
        </button>
      </div>

      {/* Totals & Validation */}
      <div className="flex justify-between items-center pt-2 border-t">
        <div className="text-sm">
           {isBalanced ? (
             <span className="flex items-center gap-2 text-green-600 font-medium"><CheckCircle className="w-4 h-4"/> Balanced</span>
           ) : (
             <span className="flex items-center gap-2 text-red-600 font-medium"><AlertTriangle className="w-4 h-4"/> Imbalanced ({Math.abs(totalDebit - totalCredit).toFixed(2)})</span>
           )}
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <span>Dr: {totalDebit.toLocaleString()}</span>
          <span>Cr: {totalCredit.toLocaleString()}</span>
        </div>
      </div>

      {state?.message && !state.success && <p className="text-red-500 text-sm">{state.message}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending || !isBalanced} className="bg-blue-700 text-white px-4 py-2 rounded text-sm hover:bg-blue-800 disabled:bg-gray-400">
          {isPending ? 'Posting...' : 'Post Entry'}
        </button>
      </div>
    </form>
  );
}

// 3. EXPENSE FORM
export function ExpenseForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createExpense, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Expense Title</label>
        <input name="title" required placeholder="Office Supplies" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input name="amount" type="number" step="0.01" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date Incurred</label>
          <input name="date" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select name="category" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="Utilities">Utilities</option>
            <option value="Rent">Rent</option>
            <option value="Salaries">Salaries</option>
            <option value="Repairs">Repairs & Maintenance</option>
            <option value="Travel">Travel</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Payment Method</label>
          <select name="paymentMethod" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
             <option value="CASH">Cash</option>
             <option value="TRANSFER">Bank Transfer</option>
             <option value="POS">POS</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea name="description" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Submitting...' : 'Submit Claim'}
        </button>
      </div>
    </form>
  );
}