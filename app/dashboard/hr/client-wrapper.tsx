// 'use client';

// import { useState } from 'react';
// import clsx from 'clsx';
// import { Plus, UserPlus, FileText } from 'lucide-react';
// import { Modal } from '@/app/ui/users/user-form';
// import { EmployeeForm, PayrollForm } from '@/app/ui/hr/hr-forms';

// export default function HRClientWrapper({ employees, payrolls }: any) {
//   const [tab, setTab] = useState('EMPLOYEES');
//   const [modal, setModal] = useState<'EMPLOYEE' | 'PAYROLL' | null>(null);

//   return (
//     <>
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
//         <div className="flex gap-4">
//           <button onClick={() => setTab('EMPLOYEES')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'EMPLOYEES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Employees</button>
//           <button onClick={() => setTab('PAYROLL')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'PAYROLL' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Payroll History</button>
//         </div>
//         <div className="flex gap-2">
//            <button onClick={() => setModal('PAYROLL')} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"><FileText className="w-4 h-4" /> Run Payroll</button>
//            <button onClick={() => setModal('EMPLOYEE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm hover:bg-red-700"><UserPlus className="w-4 h-4" /> Hire Employee</button>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
        
//         {/* TAB 1: EMPLOYEES */}
//         {tab === 'EMPLOYEES' && (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Salary</th>
//                 <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {employees.map((e: any) => (
//                 <tr key={e.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-xs font-mono text-gray-500">{e.employeeNumber}</td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm font-medium text-gray-900">{e.firstName} {e.lastName}</div>
//                     <div className="text-xs text-gray-500">{e.email || e.phone}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900">{e.position}</div>
//                     <div className="text-xs text-gray-500">{e.department}</div>
//                   </td>
//                   <td className="px-6 py-4 text-right text-sm font-bold">₦{e.basicSalary.toLocaleString()}</td>
//                   <td className="px-6 py-4 text-center">
//                     <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{e.status}</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}

//         {/* TAB 2: PAYROLL */}
//         {tab === 'PAYROLL' && (
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Employee</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Basic</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Add/Ded</th>
//                 <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Net Pay</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {payrolls.map((p: any) => (
//                 <tr key={p.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 text-sm font-medium">{p.employee.firstName} {p.employee.lastName}</td>
//                   <td className="px-6 py-4 text-right text-sm text-gray-500">₦{p.basicSalary.toLocaleString()}</td>
//                   <td className="px-6 py-4 text-right text-xs">
//                     <span className="text-green-600 block">+{p.totalAllowances.toLocaleString()}</span>
//                     <span className="text-red-600 block">-{p.totalDeductions.toLocaleString()}</span>
//                   </td>
//                   <td className="px-6 py-4 text-right text-sm font-black text-gray-900">₦{p.netPay.toLocaleString()}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* MODALS */}
//       <Modal isOpen={modal === 'EMPLOYEE'} onClose={() => setModal(null)} title="Hire New Employee">
//         <EmployeeForm onClose={() => setModal(null)} />
//       </Modal>
//       <Modal isOpen={modal === 'PAYROLL'} onClose={() => setModal(null)} title="Process Payroll">
//         <PayrollForm employees={employees} onClose={() => setModal(null)} />
//       </Modal>
//     </>
//   );
// }
'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Plus, UserPlus, FileText } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { EmployeeForm, PayrollForm } from '@/app/ui/hr/hr-forms';

// Add 'departments' to props
export default function HRClientWrapper({ employees, payrolls, departments }: any) {
  const [tab, setTab] = useState('EMPLOYEES');
  const [modal, setModal] = useState<'EMPLOYEE' | 'PAYROLL' | null>(null);

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-4">
          <button onClick={() => setTab('EMPLOYEES')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'EMPLOYEES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Employees</button>
          <button onClick={() => setTab('PAYROLL')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2", tab === 'PAYROLL' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500")}>Payroll History</button>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setModal('PAYROLL')} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"><FileText className="w-4 h-4" /> Run Payroll</button>
           <button onClick={() => setModal('EMPLOYEE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm hover:bg-red-700"><UserPlus className="w-4 h-4" /> Hire Employee</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
        
        {/* TAB 1: EMPLOYEES */}
        {tab === 'EMPLOYEES' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Salary</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((e: any) => (
                <tr key={e.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-xs font-mono text-gray-500">{e.employeeNumber}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{e.firstName} {e.lastName}</div>
                    <div className="text-xs text-gray-500">{e.email || e.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{e.position}</div>
                    <div className="text-xs text-gray-500">
                      {e.department} 
                      {e.subDepartment ? ` > ${e.subDepartment}` : ''}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold">₦{e.basicSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TAB 2: PAYROLL */}
        {tab === 'PAYROLL' && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Employee</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Basic</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Add/Ded</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Net Pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payrolls.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium">{p.employee.firstName} {p.employee.lastName}</td>
                  <td className="px-6 py-4 text-right text-sm text-gray-500">₦{p.basicSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-xs">
                    <span className="text-green-600 block">+{p.totalAllowances.toLocaleString()}</span>
                    <span className="text-red-600 block">-{p.totalDeductions.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-black text-gray-900">₦{p.netPay.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'EMPLOYEE'} onClose={() => setModal(null)} title="Hire New Employee">
        {/* Pass departments to the Form */}
        <EmployeeForm onClose={() => setModal(null)} departments={departments} />
      </Modal>
      
      <Modal isOpen={modal === 'PAYROLL'} onClose={() => setModal(null)} title="Process Payroll">
        <PayrollForm employees={employees} onClose={() => setModal(null)} />
      </Modal>
    </>
  );
}