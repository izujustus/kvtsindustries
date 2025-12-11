'use client';

import { useActionState, useState } from 'react';
import { createEmployee, createPayroll, updateEmployeeStatus } from '@/app/lib/hr-actions';
import { AlertTriangle, CheckCircle, Ban, UserX } from 'lucide-react';
import clsx from 'clsx';

// 1. EMPLOYEE FORM (With Departments)
export function EmployeeForm({ onClose, departments }: { onClose: () => void, departments?: any[] }) {
  const [state, action, isPending] = useActionState(createEmployee, undefined);
  
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const selectedDept = departments?.find(d => d.id === selectedDeptId);
  const subDepartments = selectedDept?.subDepartments || [];

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">First Name</label>
          <input name="firstName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Last Name</label>
          <input name="lastName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Email (Optional)</label>
          <input name="email" type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Phone</label>
          <input name="phone" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
      </div>

      {/* DEPARTMENT SELECTOR */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Department</label>
          <select 
            name="department" 
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm"
            onChange={(e) => setSelectedDeptId(e.target.value)}
          >
            <option value="">-- Select --</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700">Sub-Department</label>
          <select 
            name="subDepartment" 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
            disabled={!selectedDeptId || subDepartments.length === 0}
          >
            <option value="">{subDepartments.length === 0 ? "No Sub-sections" : "-- Select --"}</option>
            {subDepartments.map((sub: any) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Job Position</label>
          <input name="position" required placeholder="e.g. Senior Technician" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Basic Salary (₦)</label>
          <input name="basicSalary" type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Hire Date</label>
          <input name="hireDate" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
          <input name="dateOfBirth" type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
      </div>

      {state?.message && (
        <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-[#E30613] rounded-md hover:bg-red-700">
          {isPending ? 'Saving...' : 'Hire Employee'}
        </button>
      </div>
    </form>
  );
}

// 2. PAYROLL FORM
export function PayrollForm({ employees, onClose }: { employees: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(createPayroll, undefined);
  const [components, setComponents] = useState<{name: string, amount: number, type: 'EARNING' | 'DEDUCTION'}[]>([]);

  const addComponent = (type: 'EARNING' | 'DEDUCTION') => {
    const name = prompt(`Enter ${type.toLowerCase()} name:`);
    const amountStr = prompt(`Enter amount:`);
    if (name && amountStr) {
      setComponents([...components, { name, amount: Number(amountStr), type }]);
    }
  };

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="components" value={JSON.stringify(components)} />
      
      <div>
        <label className="block text-xs font-medium text-gray-700">Select Employee</label>
        <select name="employeeId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm">
          <option value="">-- Choose Employee --</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeNumber})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Period Start</label>
          <input name="payPeriodStart" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Period End</label>
          <input name="payPeriodEnd" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
        </div>
      </div>

      <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-xs font-bold text-gray-700">Salary Adjustments</h4>
          <div className="flex gap-2">
            <button type="button" onClick={() => addComponent('EARNING')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">+ Earning</button>
            <button type="button" onClick={() => addComponent('DEDUCTION')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">- Deduction</button>
          </div>
        </div>
        {components.length === 0 ? <p className="text-xs text-gray-400 italic">No adjustments added.</p> : (
          <ul className="space-y-1">
            {components.map((c, i) => (
              <li key={i} className="flex justify-between text-xs">
                <span>{c.name}</span>
                <span className={c.type === 'EARNING' ? "text-green-600" : "text-red-600"}>
                  {c.type === 'EARNING' ? '+' : '-'} ₦{c.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {state?.message && <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{state.message}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
          {isPending ? 'Processing...' : 'Run Payroll'}
        </button>
      </div>
    </form>
  );
}

// 3. EMPLOYEE STATUS FORM (New)
export function EmployeeStatusForm({ employee, onClose }: { employee: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(updateEmployeeStatus, undefined);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="employeeId" value={employee.id} />
      
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</h3>
        <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
        <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
          Current Status: 
          <span className={clsx(
            "px-2 py-1 rounded-full",
            employee.status === 'ACTIVE' ? "bg-green-100 text-green-700" :
            employee.status === 'SUSPENDED' ? "bg-orange-100 text-orange-700" :
            employee.status === 'TERMINATED' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
          )}>
            {employee.status}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Change Status To:</label>
        <div className="grid grid-cols-1 gap-3">
          
          <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors">
            <input type="radio" name="status" value="ACTIVE" defaultChecked={employee.status === 'ACTIVE'} className="text-green-600 focus:ring-green-500" />
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <span className="block text-sm font-bold text-gray-900">Active</span>
                <span className="block text-xs text-gray-500">Employee is working normally.</span>
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors">
            <input type="radio" name="status" value="SUSPENDED" defaultChecked={employee.status === 'SUSPENDED'} className="text-orange-600 focus:ring-orange-500" />
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <span className="block text-sm font-bold text-gray-900">Suspended</span>
                <span className="block text-xs text-gray-500">Temporarily remove access.</span>
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
            <input type="radio" name="status" value="ON_LEAVE" defaultChecked={employee.status === 'ON_LEAVE'} className="text-blue-600 focus:ring-blue-500" />
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-blue-600" />
              <div>
                <span className="block text-sm font-bold text-gray-900">On Leave</span>
                <span className="block text-xs text-gray-500">Maternity, Sick, or Annual Leave.</span>
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors">
            <input type="radio" name="status" value="TERMINATED" defaultChecked={employee.status === 'TERMINATED'} className="text-red-600 focus:ring-red-500" />
            <div className="flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-600" />
              <div>
                <span className="block text-sm font-bold text-gray-900">Terminated</span>
                <span className="block text-xs text-gray-500">Permanently remove employee.</span>
              </div>
            </div>
          </label>

        </div>
      </div>

      {state?.message && (
        <p className={state.success ? "text-green-600 text-sm text-center font-bold" : "text-red-600 text-sm text-center font-bold"}>
          {state.message}
        </p>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} className="px-6 py-2 text-sm font-bold text-white bg-black rounded-md hover:bg-gray-900">
          {isPending ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}