'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Plus, UserPlus, FileText, MoreHorizontal, Search, Filter, User, Calendar, DollarSign, Briefcase, Clock } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { EmployeeForm, PayrollForm, EmployeeStatusForm } from '@/app/ui/hr/hr-forms';

// --- HELPER: CALCULATE DURATION ---
function calculateTenure(hireDate: string | Date) {
  const start = new Date(hireDate);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  // Adjust for negative days/months
  if (days < 0) {
    months--;
    // Get days in previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Format the output
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  
  // If less than a month, show days
  if (years === 0 && months === 0) {
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  return parts.join(', ');
}

export default function HRClientWrapper({ employees, payrolls, departments }: any) {
  const [tab, setTab] = useState('EMPLOYEES');
  const [modal, setModal] = useState<'EMPLOYEE' | 'PAYROLL' | 'STATUS' | 'VIEW' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // FILTER STATE
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FILTER LOGIC
  const filteredEmployees = employees.filter((e: any) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch = 
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // 2. HELPER TO OPEN MODALS
  const openStatusModal = (employee: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setSelectedEmployee(employee);
    setModal('STATUS');
  };

  const openViewModal = (employee: any) => {
    setSelectedEmployee(employee);
    setModal('VIEW');
  };

  // 3. GET PAYROLL HISTORY
  const employeePayrolls = selectedEmployee 
    ? payrolls.filter((p: any) => p.employeeId === selectedEmployee.id)
    : [];

  return (
    <>
      {/* TOP CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        
        {/* TABS */}
        <div className="flex gap-4">
          <button onClick={() => setTab('EMPLOYEES')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", tab === 'EMPLOYEES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-800")}>Employees</button>
          <button onClick={() => setTab('PAYROLL')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", tab === 'PAYROLL' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-800")}>Payroll History</button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
           <button onClick={() => setModal('PAYROLL')} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 shadow-sm transition-all"><FileText className="w-4 h-4" /> Run Payroll</button>
           <button onClick={() => setModal('EMPLOYEE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm hover:bg-red-700 shadow-sm transition-all"><UserPlus className="w-4 h-4" /> Hire Employee</button>
        </div>
      </div>

      {/* FILTERS TOOLBAR */}
      {tab === 'EMPLOYEES' && (
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              placeholder="Search by name or ID..." 
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30613]/20 focus:border-[#E30613]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg py-2 pl-2 pr-8 focus:outline-none focus:border-[#E30613] bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="TERMINATED">Terminated</option>
              <option value="ON_LEAVE">On Leave</option>
            </select>
          </div>
        </div>
      )}

      {/* MAIN CONTENT CARD */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4 min-h-[400px]">
        
        {/* TAB 1: EMPLOYEES TABLE */}
        {tab === 'EMPLOYEES' && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Salary</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                      No employees found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((e: any) => (
                    <tr 
                      key={e.id} 
                      onClick={() => openViewModal(e)} 
                      className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 text-xs font-mono text-gray-500">{e.employeeNumber}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-gray-900 group-hover:text-[#E30613] transition-colors">{e.firstName} {e.lastName}</div>
                        <div className="text-xs text-gray-500">{e.email || e.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{e.position}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {e.department} {e.subDepartment ? `› ${e.subDepartment}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono font-medium">₦{e.basicSalary.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx(
                          "text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold",
                          e.status === 'ACTIVE' ? "bg-green-100 text-green-700" :
                          e.status === 'SUSPENDED' ? "bg-orange-100 text-orange-700" :
                          e.status === 'TERMINATED' ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-700"
                        )}>
                          {e.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(evt) => openStatusModal(e, evt)}
                          className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-all"
                          title="Manage Status"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PAYROLL TABLE */}
        {tab === 'PAYROLL' && (
          <div className="overflow-x-auto">
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
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      <Modal isOpen={modal === 'EMPLOYEE'} onClose={() => setModal(null)} title="Hire New Employee">
        <EmployeeForm onClose={() => setModal(null)} departments={departments} />
      </Modal>
      
      <Modal isOpen={modal === 'PAYROLL'} onClose={() => setModal(null)} title="Process Payroll">
        <PayrollForm employees={employees} onClose={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'STATUS'} onClose={() => setModal(null)} title="Manage Employee Status">
        {selectedEmployee && (
          <EmployeeStatusForm employee={selectedEmployee} onClose={() => setModal(null)} />
        )}
      </Modal>

      {/* 4. FULL PROFILE VIEW (UPDATED WITH TENURE) */}
      <Modal isOpen={modal === 'VIEW'} onClose={() => setModal(null)} title="Employee Profile">
        {selectedEmployee && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-start justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">
                  {selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="text-sm text-gray-500 font-mono">{selectedEmployee.employeeNumber}</p>
                  
                  {/* TENURE BADGE */}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={clsx(
                      "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                      selectedEmployee.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                    )}>
                      {selectedEmployee.status}
                    </span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {calculateTenure(selectedEmployee.hireDate)}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setModal('STATUS')} className="text-xs font-bold text-[#E30613] hover:underline">
                Change Status
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact</label>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2"><User className="w-3 h-3 text-gray-400"/> {selectedEmployee.email || 'No Email'}</span>
                  <span className="flex items-center gap-2"><User className="w-3 h-3 text-gray-400"/> {selectedEmployee.phone || 'No Phone'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Employment</label>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2"><Briefcase className="w-3 h-3 text-gray-400"/> {selectedEmployee.position}</span>
                  <span className="flex items-center gap-2"><Briefcase className="w-3 h-3 text-gray-400"/> {selectedEmployee.department}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Financial</label>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-bold text-gray-800"><DollarSign className="w-3 h-3 text-gray-400"/> ₦{selectedEmployee.basicSalary.toLocaleString()}/mo</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Timeline</label>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-2"><Calendar className="w-3 h-3 text-gray-400"/> Hired: {new Date(selectedEmployee.hireDate).toLocaleDateString()}</span>
                  {selectedEmployee.dateOfBirth && (
                    <span className="flex items-center gap-2"><Calendar className="w-3 h-3 text-gray-400"/> DOB: {new Date(selectedEmployee.dateOfBirth).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Mini Payroll History */}
            <div className="border-t border-gray-100 pt-4">
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" /> Recent Payments
              </h4>
              {employeePayrolls.length > 0 ? (
                <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Date</th>
                        <th className="px-3 py-2 text-right">Net Pay</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeePayrolls.slice(0, 5).map((p: any) => (
                        <tr key={p.id} className="border-t border-gray-200">
                          <td className="px-3 py-2 text-gray-600">{new Date(p.paymentDate).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">₦{p.netPay.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No payment history found.</p>
              )}
            </div>

            <div className="flex justify-end pt-2">
               <button onClick={() => setModal(null)} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium">Close Profile</button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}