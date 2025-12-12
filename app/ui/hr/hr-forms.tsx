// 'use client';

// import { useActionState, useState } from 'react';
// import { createEmployee, createPayroll, updateEmployeeStatus } from '@/app/lib/hr-actions';
// import { AlertTriangle, CheckCircle, Ban, UserX } from 'lucide-react';
// import clsx from 'clsx';

// // 1. EMPLOYEE FORM (With Departments)
// export function EmployeeForm({ onClose, departments }: { onClose: () => void, departments?: any[] }) {
//   const [state, action, isPending] = useActionState(createEmployee, undefined);
  
//   const [selectedDeptId, setSelectedDeptId] = useState("");
//   const selectedDept = departments?.find(d => d.id === selectedDeptId);
//   const subDepartments = selectedDept?.subDepartments || [];

//   return (
//     <form action={action} className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-gray-700">First Name</label>
//           <input name="firstName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Last Name</label>
//           <input name="lastName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Email (Optional)</label>
//           <input name="email" type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Phone</label>
//           <input name="phone" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//       </div>

//       {/* DEPARTMENT SELECTOR */}
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Department</label>
//           <select 
//             name="department" 
//             required 
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm"
//             onChange={(e) => setSelectedDeptId(e.target.value)}
//           >
//             <option value="">-- Select --</option>
//             {departments?.map((dept) => (
//               <option key={dept.id} value={dept.id}>{dept.name}</option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-xs font-medium text-gray-700">Sub-Department</label>
//           <select 
//             name="subDepartment" 
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm disabled:bg-gray-100 disabled:text-gray-400"
//             disabled={!selectedDeptId || subDepartments.length === 0}
//           >
//             <option value="">{subDepartments.length === 0 ? "No Sub-sections" : "-- Select --"}</option>
//             {subDepartments.map((sub: any) => (
//               <option key={sub.id} value={sub.id}>{sub.name}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Job Position</label>
//           <input name="position" required placeholder="e.g. Senior Technician" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Basic Salary (₦)</label>
//           <input name="basicSalary" type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Hire Date</label>
//           <input name="hireDate" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
//           <input name="dateOfBirth" type="date" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//       </div>

//       {state?.message && (
//         <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>
//           {state.message}
//         </p>
//       )}

//       <div className="flex justify-end gap-3 pt-2">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
//         <button disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-[#E30613] rounded-md hover:bg-red-700">
//           {isPending ? 'Saving...' : 'Hire Employee'}
//         </button>
//       </div>
//     </form>
//   );
// }

// // 2. PAYROLL FORM
// export function PayrollForm({ employees, onClose }: { employees: any[], onClose: () => void }) {
//   const [state, action, isPending] = useActionState(createPayroll, undefined);
//   const [components, setComponents] = useState<{name: string, amount: number, type: 'EARNING' | 'DEDUCTION'}[]>([]);

//   const addComponent = (type: 'EARNING' | 'DEDUCTION') => {
//     const name = prompt(`Enter ${type.toLowerCase()} name:`);
//     const amountStr = prompt(`Enter amount:`);
//     if (name && amountStr) {
//       setComponents([...components, { name, amount: Number(amountStr), type }]);
//     }
//   };

//   return (
//     <form action={action} className="space-y-4">
//       <input type="hidden" name="components" value={JSON.stringify(components)} />
      
//       <div>
//         <label className="block text-xs font-medium text-gray-700">Select Employee</label>
//         <select name="employeeId" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm">
//           <option value="">-- Choose Employee --</option>
//           {employees.map(e => (
//             <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeNumber})</option>
//           ))}
//         </select>
//       </div>

//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Period Start</label>
//           <input name="payPeriodStart" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//         <div>
//           <label className="block text-xs font-medium text-gray-700">Period End</label>
//           <input name="payPeriodEnd" type="date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm" />
//         </div>
//       </div>

//       <div className="border border-gray-200 rounded-md p-3 bg-gray-50">
//         <div className="flex justify-between items-center mb-2">
//           <h4 className="text-xs font-bold text-gray-700">Salary Adjustments</h4>
//           <div className="flex gap-2">
//             <button type="button" onClick={() => addComponent('EARNING')} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200">+ Earning</button>
//             <button type="button" onClick={() => addComponent('DEDUCTION')} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200">- Deduction</button>
//           </div>
//         </div>
//         {components.length === 0 ? <p className="text-xs text-gray-400 italic">No adjustments added.</p> : (
//           <ul className="space-y-1">
//             {components.map((c, i) => (
//               <li key={i} className="flex justify-between text-xs">
//                 <span>{c.name}</span>
//                 <span className={c.type === 'EARNING' ? "text-green-600" : "text-red-600"}>
//                   {c.type === 'EARNING' ? '+' : '-'} ₦{c.amount.toLocaleString()}
//                 </span>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>

//       {state?.message && <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{state.message}</p>}

//       <div className="flex justify-end gap-3 pt-2">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
//         <button disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
//           {isPending ? 'Processing...' : 'Run Payroll'}
//         </button>
//       </div>
//     </form>
//   );
// }

// // 3. EMPLOYEE STATUS FORM (New)
// export function EmployeeStatusForm({ employee, onClose }: { employee: any, onClose: () => void }) {
//   const [state, action, isPending] = useActionState(updateEmployeeStatus, undefined);

//   return (
//     <form action={action} className="space-y-6">
//       <input type="hidden" name="employeeId" value={employee.id} />
      
//       <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//         <h3 className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</h3>
//         <p className="text-sm text-gray-500">{employee.position} • {employee.department}</p>
//         <div className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
//           Current Status: 
//           <span className={clsx(
//             "px-2 py-1 rounded-full",
//             employee.status === 'ACTIVE' ? "bg-green-100 text-green-700" :
//             employee.status === 'SUSPENDED' ? "bg-orange-100 text-orange-700" :
//             employee.status === 'TERMINATED' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
//           )}>
//             {employee.status}
//           </span>
//         </div>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-2">Change Status To:</label>
//         <div className="grid grid-cols-1 gap-3">
          
//           <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors">
//             <input type="radio" name="status" value="ACTIVE" defaultChecked={employee.status === 'ACTIVE'} className="text-green-600 focus:ring-green-500" />
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-4 h-4 text-green-600" />
//               <div>
//                 <span className="block text-sm font-bold text-gray-900">Active</span>
//                 <span className="block text-xs text-gray-500">Employee is working normally.</span>
//               </div>
//             </div>
//           </label>

//           <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors">
//             <input type="radio" name="status" value="SUSPENDED" defaultChecked={employee.status === 'SUSPENDED'} className="text-orange-600 focus:ring-orange-500" />
//             <div className="flex items-center gap-2">
//               <AlertTriangle className="w-4 h-4 text-orange-600" />
//               <div>
//                 <span className="block text-sm font-bold text-gray-900">Suspended</span>
//                 <span className="block text-xs text-gray-500">Temporarily remove access.</span>
//               </div>
//             </div>
//           </label>

//           <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors">
//             <input type="radio" name="status" value="ON_LEAVE" defaultChecked={employee.status === 'ON_LEAVE'} className="text-blue-600 focus:ring-blue-500" />
//             <div className="flex items-center gap-2">
//               <Ban className="w-4 h-4 text-blue-600" />
//               <div>
//                 <span className="block text-sm font-bold text-gray-900">On Leave</span>
//                 <span className="block text-xs text-gray-500">Maternity, Sick, or Annual Leave.</span>
//               </div>
//             </div>
//           </label>

//           <label className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors">
//             <input type="radio" name="status" value="TERMINATED" defaultChecked={employee.status === 'TERMINATED'} className="text-red-600 focus:ring-red-500" />
//             <div className="flex items-center gap-2">
//               <UserX className="w-4 h-4 text-red-600" />
//               <div>
//                 <span className="block text-sm font-bold text-gray-900">Terminated</span>
//                 <span className="block text-xs text-gray-500">Permanently remove employee.</span>
//               </div>
//             </div>
//           </label>

//         </div>
//       </div>

//       {state?.message && (
//         <p className={state.success ? "text-green-600 text-sm text-center font-bold" : "text-red-600 text-sm text-center font-bold"}>
//           {state.message}
//         </p>
//       )}

//       <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
//         <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
//         <button disabled={isPending} className="px-6 py-2 text-sm font-bold text-white bg-black rounded-md hover:bg-gray-900">
//           {isPending ? 'Updating...' : 'Update Status'}
//         </button>
//       </div>
//     </form>
//   );
// }


'use client';

import { useActionState, useState, useEffect } from 'react';
import { createEmployee, updateEmployee, createPayroll, updateEmployeeStatus } from '@/app/lib/hr-actions';
import { CreditCard, Heart, Save, User, Building } from 'lucide-react';
import { UploadButton } from "@/utils/uploadthing"; 
import clsx from 'clsx';

// Shared Styles for Consistency
const inputClass = "mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-[#E30613] focus:ring-[#E30613] placeholder-gray-400";
const labelClass = "block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide";

// ============================================================================
// 1. EMPLOYEE FORM (TABBED)
// ============================================================================
export function EmployeeForm({ onClose, departments = [], employee }: { onClose: () => void, departments?: any[], employee?: any }) {
  const actionFn = employee ? updateEmployee : createEmployee;
  const [state, action, isPending] = useActionState(actionFn, undefined);
  
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BANK' | 'JOB'>('PERSONAL');
  
  // Initialize state with employee data or defaults
  const [selectedDeptId, setSelectedDeptId] = useState(employee?.departmentId || "");
  const [imageUrl, setImageUrl] = useState(employee?.imageUrl || ""); 
  
  // Calculate Sub-departments based on selection
  // Note: We use 'departments' passed from props.
  const selectedDept = departments.find(d => d.id === selectedDeptId);
  const subDepartments = selectedDept?.subDepartments || [];

  return (
    <form action={action} className="h-[650px] flex flex-col bg-white">
      {employee && <input type="hidden" name="id" value={employee.id} />}
      <input type="hidden" name="imageUrl" value={imageUrl} />

      {/* TABS */}
      <div className="flex border-b border-gray-200 mb-4 bg-gray-50 rounded-t-lg shrink-0">
        <button type="button" onClick={() => setActiveTab('PERSONAL')} className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors", activeTab === 'PERSONAL' ? "border-[#E30613] text-[#E30613] bg-white" : "border-transparent text-gray-500 hover:text-gray-800")}>Personal Info</button>
        <button type="button" onClick={() => setActiveTab('BANK')} className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors", activeTab === 'BANK' ? "border-[#E30613] text-[#E30613] bg-white" : "border-transparent text-gray-500 hover:text-gray-800")}>Bank & Emergency</button>
        <button type="button" onClick={() => setActiveTab('JOB')} className={clsx("flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors", activeTab === 'JOB' ? "border-[#E30613] text-[#E30613] bg-white" : "border-transparent text-gray-500 hover:text-gray-800")}>Job & Pay</button>
      </div>

      {/* SCROLLABLE FORM CONTENT */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        
        {/* --- TAB 1: PERSONAL --- */}
        <div className={clsx("space-y-4", activeTab !== 'PERSONAL' && 'hidden')}>
            {/* UploadThing Button */}
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
               <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center border-2 border-gray-300 overflow-hidden shrink-0">
                 {imageUrl ? (
                   <img src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
                 ) : (
                   <span className="text-gray-400 font-bold text-2xl uppercase">{employee?.firstName?.[0] || <User className="w-8 h-8"/>}</span>
                 )}
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-gray-900 mb-1">Profile Picture</p>
                 <div className="flex justify-start">
                    <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                        if (res && res[0]) setImageUrl(res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                        alert(`ERROR! ${error.message}`);
                        }}
                        appearance={{
                        button: { background: '#E30613', color: 'white', fontSize: '12px', padding: '6px 12px' },
                        container: { display: 'flex', justifyContent: 'flex-start' }
                        }}
                    />
                 </div>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>First Name</label><input name="firstName" defaultValue={employee?.firstName} className={inputClass} placeholder="e.g. John" /></div>
              <div><label className={labelClass}>Last Name</label><input name="lastName" defaultValue={employee?.lastName} className={inputClass} placeholder="e.g. Doe" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Email</label><input name="email" type="email" defaultValue={employee?.email} className={inputClass} placeholder="john@example.com" /></div>
              <div><label className={labelClass}>Phone</label><input name="phone" defaultValue={employee?.phone} className={inputClass} placeholder="080..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Date of Birth</label><input name="dateOfBirth" type="date" defaultValue={employee?.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : ''} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Gender</label>
                <select name="gender" defaultValue={employee?.gender || ''} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>
            <div><label className={labelClass}>Home Address</label><textarea name="address" defaultValue={employee?.address} rows={2} className={inputClass} placeholder="Full residential address" /></div>
            <div><label className={labelClass}>Nationality</label><input name="nationality" defaultValue={employee?.nationality} className={inputClass} placeholder="e.g. Nigerian" /></div>
        </div>

        {/* --- TAB 2: BANK & EMERGENCY --- */}
        <div className={clsx("space-y-6", activeTab !== 'BANK' && 'hidden')}>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Salary Payment Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={labelClass + " text-blue-900"}>Bank Name</label><input name="bankName" defaultValue={employee?.bankName} className={inputClass + " border-blue-200 focus:ring-blue-500"} placeholder="e.g. GTBank" /></div>
                <div><label className={labelClass + " text-blue-900"}>Account Number</label><input name="bankAccountNumber" defaultValue={employee?.bankAccountNumber} className={inputClass + " border-blue-200 focus:ring-blue-500"} placeholder="0123456789" /></div>
                <div className="col-span-2"><label className={labelClass + " text-blue-900"}>Account Name</label><input name="bankAccountName" defaultValue={employee?.bankAccountName} className={inputClass + " border-blue-200 focus:ring-blue-500"} placeholder="Matches employee name" /></div>
                <div className="col-span-2"><label className={labelClass + " text-blue-900"}>Branch / Sort Code</label><input name="bankBranch" defaultValue={employee?.bankBranch} className={inputClass + " border-blue-200 focus:ring-blue-500"} placeholder="Optional" /></div>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
              <h4 className="text-sm font-bold text-red-900 mb-3 flex items-center gap-2"><Heart className="w-4 h-4"/> Emergency Contact</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className={labelClass + " text-red-900"}>Contact Name</label><input name="emergencyContactName" defaultValue={employee?.emergencyContactName} className={inputClass + " border-red-200 focus:ring-red-500"} /></div>
                <div><label className={labelClass + " text-red-900"}>Relationship</label><input name="emergencyContactRelation" defaultValue={employee?.emergencyContactRelation} className={inputClass + " border-red-200 focus:ring-red-500"} placeholder="e.g. Spouse" /></div>
                <div><label className={labelClass + " text-red-900"}>Phone</label><input name="emergencyContactPhone" defaultValue={employee?.emergencyContactPhone} className={inputClass + " border-red-200 focus:ring-red-500"} /></div>
              </div>
            </div>
        </div>

        {/* --- TAB 3: JOB --- */}
        <div className={clsx("space-y-4", activeTab !== 'JOB' && 'hidden')}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Department</label>
                <select 
                  name="departmentId" 
                  value={selectedDeptId} 
                  onChange={(e) => setSelectedDeptId(e.target.value)} 
                  className={inputClass}
                >
                  <option value="">Select Dept...</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Sub-Department</label>
                <select 
                  name="subDepartmentId" 
                  defaultValue={employee?.subDepartmentId || ''} 
                  disabled={subDepartments.length === 0} 
                  className={clsx(inputClass, subDepartments.length === 0 && "bg-gray-100 text-gray-400")}
                >
                  <option value="">{subDepartments.length === 0 ? "No Sub-sections" : "Select Sub-section..."}</option>
                  {subDepartments.map((s:any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Job Title</label><input name="position" defaultValue={employee?.position} className={inputClass} /></div>
              <div>
                <label className={labelClass}>Employment Type</label>
                <select name="employmentType" defaultValue={employee?.employmentType || 'FULL_TIME'} className={inputClass}>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERN">Intern</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className={labelClass}>Hire Date</label><input name="hireDate" type="date" defaultValue={employee?.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : ''} className={inputClass} /></div>
              <div><label className={labelClass}>Basic Salary (₦)</label><input name="basicSalary" type="number" defaultValue={employee?.basicSalary} className={inputClass} /></div>
            </div>

            <div><label className={labelClass}>Work Schedule</label><input name="workSchedule" defaultValue={employee?.workSchedule} placeholder="e.g. Mon-Fri, 9am - 5pm" className={inputClass} /></div>
        </div>
      </div>

      {state?.message && <p className={clsx("text-sm text-center mb-2 font-bold p-2 rounded", state.success ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50")}>{state.message}</p>}

      <div className="flex justify-end gap-3 pt-4 mt-auto border-t border-gray-200">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-[#E30613] rounded-md hover:bg-red-700 transition-colors shadow-sm">
          <Save className="w-4 h-4"/> {isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// 2. PAYROLL FORM
// ============================================================================
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
        <label className={labelClass}>Select Employee</label>
        <select name="employeeId" required className={inputClass}>
          <option value="">-- Choose Employee --</option>
          {employees.map(e => (
            <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeNumber})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Period Start</label>
          <input name="payPeriodStart" type="date" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Period End</label>
          <input name="payPeriodEnd" type="date" required className={inputClass} />
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
              <li key={i} className="flex justify-between text-xs text-gray-900">
                <span>{c.name}</span>
                <span className={c.type === 'EARNING' ? "text-green-600" : "text-red-600"}>
                  {c.type === 'EARNING' ? '+' : '-'} ₦{c.amount.toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {state?.message && <p className={state.success ? "text-green-600 text-sm font-bold" : "text-red-600 text-sm font-bold"}>{state.message}</p>}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 shadow-sm">
          {isPending ? 'Processing...' : 'Run Payroll'}
        </button>
      </div>
    </form>
  );
}

// ============================================================================
// 3. EMPLOYEE STATUS FORM
// ============================================================================
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
          {['ACTIVE', 'SUSPENDED', 'ON_LEAVE', 'TERMINATED'].map((status) => (
             <label key={status} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                <input type="radio" name="status" value={status} defaultChecked={employee.status === status} className="text-green-600 focus:ring-green-500" />
                <span className="block text-sm font-bold text-gray-900 capitalize">{status.replace('_', ' ').toLowerCase()}</span>
             </label>
          ))}
        </div>
      </div>

      {state?.message && <p className={state.success ? "text-green-600 text-sm font-bold" : "text-red-600 text-sm font-bold"}>{state.message}</p>}

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
        <button disabled={isPending} className="px-6 py-2 text-sm font-bold text-white bg-black rounded-md hover:bg-gray-900 shadow-sm">
          {isPending ? 'Updating...' : 'Update Status'}
        </button>
      </div>
    </form>
  );
}