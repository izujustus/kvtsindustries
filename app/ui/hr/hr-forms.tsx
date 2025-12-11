'use client';

import { useActionState, useEffect, useState } from 'react';
import { createEmployee, createPayroll } from '@/app/lib/hr-actions';
import { Plus, Trash, Calculator } from 'lucide-react';

// 1. EMPLOYEE FORM
export function EmployeeForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createEmployee, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input name="firstName" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input name="lastName" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Department</label>
          <select name="department" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
            <option value="Production">Production</option>
            <option value="Sales">Sales</option>
            <option value="Accounting">Accounting</option>
            <option value="HR">HR</option>
            <option value="Logistics">Logistics</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Position</label>
          <input name="position" placeholder="e.g. Operator" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Hire Date</label>
          <input name="hireDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
          <input name="basicSalary" type="number" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Saving...' : 'Hire Employee'}
        </button>
      </div>
    </form>
  );
}

// 2. PAYROLL FORM
export function PayrollForm({ employees, onClose }: { employees: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createPayroll, undefined);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  
  // Dynamic Components (Bonuses/Deductions)
  const [components, setComponents] = useState<{name: string, type: 'EARNING'|'DEDUCTION', amount: number}[]>([]);
  const [compName, setCompName] = useState('');
  const [compAmount, setCompAmount] = useState(0);
  const [compType, setCompType] = useState<'EARNING'|'DEDUCTION'>('EARNING');

  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  const addComponent = () => {
    if(!compName || compAmount <= 0) return;
    setComponents([...components, { name: compName, type: compType, amount: compAmount }]);
    setCompName(''); setCompAmount(0);
  };

  const removeComponent = (idx: number) => {
    setComponents(components.filter((_, i) => i !== idx));
  };

  // Calculations
  const basic = selectedEmp ? selectedEmp.basicSalary : 0;
  const totalEarnings = components.filter(c => c.type === 'EARNING').reduce((sum, c) => sum + c.amount, 0);
  const totalDeductions = components.filter(c => c.type === 'DEDUCTION').reduce((sum, c) => sum + c.amount, 0);
  const netPay = basic + totalEarnings - totalDeductions;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="components" value={JSON.stringify(components)} />

      {/* Select Employee */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Employee</label>
        <select 
          name="employeeId" 
          onChange={(e) => setSelectedEmp(employees.find(em => em.id === e.target.value))}
          required 
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">-- Select --</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Period Start</label>
          <input name="payPeriodStart" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Period End</label>
          <input name="payPeriodEnd" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      {/* Component Builder */}
      <div className="bg-gray-50 p-3 rounded border border-gray-200">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Add Allowances & Deductions</label>
        <div className="flex gap-2 mb-2">
          <input placeholder="Name (e.g. Bonus)" value={compName} onChange={e => setCompName(e.target.value)} className="flex-1 text-sm border-gray-300 rounded" />
          <select value={compType} onChange={e => setCompType(e.target.value as any)} className="text-sm border-gray-300 rounded">
            <option value="EARNING">Earning (+)</option>
            <option value="DEDUCTION">Deduction (-)</option>
          </select>
          <input type="number" placeholder="Amt" value={compAmount} onChange={e => setCompAmount(Number(e.target.value))} className="w-20 text-sm border-gray-300 rounded" />
          <button type="button" onClick={addComponent} className="bg-gray-800 text-white p-2 rounded hover:bg-black"><Plus className="w-4 h-4"/></button>
        </div>

        <div className="space-y-1">
          {components.map((c, i) => (
            <div key={i} className="flex justify-between text-sm bg-white p-2 border rounded">
              <span>{c.name}</span>
              <div className="flex items-center gap-2">
                <span className={c.type === 'EARNING' ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {c.type === 'EARNING' ? '+' : '-'} {c.amount.toLocaleString()}
                </span>
                <button type="button" onClick={() => removeComponent(i)}><Trash className="w-3 h-3 text-gray-400 hover:text-red-500"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm space-y-1">
        <div className="flex justify-between">
          <span>Basic Salary:</span>
          <span className="font-bold">₦{basic.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-green-700">
          <span>Total Allowances:</span>
          <span>+ ₦{totalEarnings.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-red-700">
          <span>Total Deductions:</span>
          <span>- ₦{totalDeductions.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-blue-200 text-lg font-black text-blue-900">
          <span>NET PAY:</span>
          <span>₦{netPay.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending || !selectedEmp} className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700">
          {isPending ? 'Processing...' : 'Run Payroll'}
        </button>
      </div>
    </form>
  );
}