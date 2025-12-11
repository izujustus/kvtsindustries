'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Plus, UserPlus, FileText, MoreHorizontal, Search, Filter, User, Calendar, DollarSign, Briefcase, Clock, History, ArrowRight } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { EmployeeForm, PayrollForm, EmployeeStatusForm } from '@/app/ui/hr/hr-forms';

// --- HELPER 1: DETAILED TENURE (For Profile View) ---
function calculateDetailedTenure(hireDate: string | Date) {
  const start = new Date(hireDate);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) { months--; const prev = new Date(now.getFullYear(), now.getMonth(), 0); days += prev.getDate(); }
  if (months < 0) { years--; months += 12; }

  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  if (years === 0 && months === 0) return `${days} ${days === 1 ? 'day' : 'days'}`;
  
  return parts.join(', ');
}

// --- HELPER 2: COMPACT TABLE TENURE (For the Column) ---
function getTableTenure(hireDate: string | Date) {
  const start = new Date(hireDate);
  const now = new Date();
  
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  // Adjust calc
  if (days < 0) { months--; days += 30; } // approx
  if (months < 0) { years--; months += 12; }

  const isLoyal = years >= 1; // Green condition
  let label = '';

  if (years > 0) {
    label = `${years} Yr${years > 1 ? 's' : ''}`;
    if (months > 0) label += ` ${months} Mo${months > 1 ? 's' : ''}`;
  } else if (months > 0) {
    label = `${months} Mo${months > 1 ? 's' : ''}`;
  } else {
    label = `${days} Day${days !== 1 ? 's' : ''}`;
  }

  return { label, isLoyal };
}

// --- HELPER 3: HISTORY LOG MESSAGES ---
function getHistoryMessage(log: any) {
  const date = new Date(log.changedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  if (log.newStatus === 'TERMINATED') return { icon: '🔴', text: `Employment was terminated on ${date}.`, color: 'text-red-600' };
  if (log.newStatus === 'SUSPENDED') return { icon: '🟠', text: `Placed on suspension effective ${date}.`, color: 'text-orange-600' };
  if (log.newStatus === 'ON_LEAVE') return { icon: '🔵', text: `Started leave period on ${date}.`, color: 'text-blue-600' };
  if (log.newStatus === 'ACTIVE') {
    if (log.oldStatus === 'ON_LEAVE') return { icon: '🟢', text: `Resumed duties from leave on ${date}.`, color: 'text-green-700' };
    if (log.oldStatus === 'SUSPENDED') return { icon: '🟢', text: `Reinstated from suspension on ${date}.`, color: 'text-green-700' };
    return { icon: '🟢', text: `Account activated on ${date}.`, color: 'text-green-700' };
  }
  return { icon: '⚪', text: `Status updated to ${log.newStatus} on ${date}.`, color: 'text-gray-600' };
}

export default function HRClientWrapper({ employees, payrolls, departments }: any) {
  const [tab, setTab] = useState('EMPLOYEES');
  const [modal, setModal] = useState<'EMPLOYEE' | 'PAYROLL' | 'STATUS' | 'VIEW' | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // FILTER LOGIC
  const filteredEmployees = employees.filter((e: any) => {
    const matchesStatus = statusFilter === 'ALL' || e.status === statusFilter;
    const matchesSearch = 
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openStatusModal = (employee: any, e: React.MouseEvent) => {
    e.stopPropagation(); setSelectedEmployee(employee); setModal('STATUS');
  };
  const openViewModal = (employee: any) => {
    setSelectedEmployee(employee); setModal('VIEW');
  };

  const employeePayrolls = selectedEmployee ? payrolls.filter((p: any) => p.employeeId === selectedEmployee.id) : [];

  return (
    <>
      {/* TOP CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        <div className="flex gap-4">
          <button onClick={() => setTab('EMPLOYEES')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", tab === 'EMPLOYEES' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-800")}>Employees</button>
          <button onClick={() => setTab('PAYROLL')} className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", tab === 'PAYROLL' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-800")}>Payroll History</button>
        </div>
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
            <input placeholder="Search by name or ID..." className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E30613]/20 focus:border-[#E30613]" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="text-sm border border-gray-200 rounded-lg py-2 pl-2 pr-8 focus:outline-none focus:border-[#E30613] bg-white">
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
      <div className="bg-white rounded-xl border shadow-sm mt-4 flex flex-col h-[600px]">
        
        {/* TAB 1: EMPLOYEES TABLE (SCROLLABLE WITH STICKY HEADER) */}
        {tab === 'EMPLOYEES' && (
          <div className="overflow-auto flex-1 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 relative">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">Duration</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">Salary</th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 whitespace-nowrap bg-gray-50">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredEmployees.length === 0 ? (<tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">No employees found.</td></tr>) : (
                  filteredEmployees.map((e: any) => {
                    const tenure = getTableTenure(e.hireDate);
                    return (
                      <tr key={e.id} onClick={() => openViewModal(e)} className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                        <td className="px-6 py-4 text-xs font-mono text-gray-500 whitespace-nowrap">{e.employeeNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900 group-hover:text-[#E30613] transition-colors">{e.firstName} {e.lastName}</div>
                          <div className="text-xs text-gray-500">{e.email || e.phone}</div>
                        </td>
                        
                        {/* ROLE COLUMN: Bold Green if > 1 Year */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={clsx("text-sm transition-colors", tenure.isLoyal ? "text-green-700 font-bold" : "text-gray-900")}>{e.position}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">{e.department} {e.subDepartment ? `› ${e.subDepartment}` : ''}</div>
                        </td>

                        {/* DURATION COLUMN */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={clsx("inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border shadow-sm", 
                            tenure.isLoyal 
                              ? "bg-green-50 text-green-700 border-green-200" 
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          )}>
                            <Clock className="w-3 h-3" /> {tenure.label}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right text-sm font-mono font-medium whitespace-nowrap">₦{e.basicSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <span className={clsx("text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-bold", e.status === 'ACTIVE' ? "bg-green-100 text-green-700" : e.status === 'SUSPENDED' ? "bg-orange-100 text-orange-700" : e.status === 'TERMINATED' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700")}>{e.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button onClick={(evt) => openStatusModal(e, evt)} className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-full transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PAYROLL TABLE */}
        {tab === 'PAYROLL' && (
          <div className="overflow-auto flex-1 rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 relative">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr><th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 bg-gray-50">Date</th><th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500 bg-gray-50">Employee</th><th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500 bg-gray-50">Net Pay</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {payrolls.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">{p.employee.firstName} {p.employee.lastName}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-gray-900 whitespace-nowrap">₦{p.netPay.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALS (Unchanged) --- */}
      <Modal isOpen={modal === 'EMPLOYEE'} onClose={() => setModal(null)} title="Hire New Employee"><EmployeeForm onClose={() => setModal(null)} departments={departments} /></Modal>
      <Modal isOpen={modal === 'PAYROLL'} onClose={() => setModal(null)} title="Process Payroll"><PayrollForm employees={employees} onClose={() => setModal(null)} /></Modal>
      <Modal isOpen={modal === 'STATUS'} onClose={() => setModal(null)} title="Manage Employee Status">{selectedEmployee && <EmployeeStatusForm employee={selectedEmployee} onClose={() => setModal(null)} />}</Modal>

      {/* PROFILE MODAL */}
      <Modal isOpen={modal === 'VIEW'} onClose={() => setModal(null)} title="Employee Profile">
        {selectedEmployee && (
          <div className="space-y-6">
            <div className="flex items-start justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-500">{selectedEmployee.firstName.charAt(0)}{selectedEmployee.lastName.charAt(0)}</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                  <p className="text-sm text-gray-500 font-mono">{selectedEmployee.employeeNumber}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={clsx("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", selectedEmployee.status === 'ACTIVE' ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700")}>{selectedEmployee.status}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Clock className="w-3 h-3" /> {calculateDetailedTenure(selectedEmployee.hireDate)}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setModal('STATUS')} className="text-xs font-bold text-[#E30613] hover:underline">Change Status</button>
            </div>
            {/* ... Grids & History ... */}
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
               <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Position</label><p>{selectedEmployee.position}</p></div>
               <div><label className="block text-xs font-bold text-gray-400 uppercase mb-1">Department</label><p>{selectedEmployee.department}</p></div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2"><History className="w-4 h-4 text-gray-400" /> Career History</h4>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 max-h-40 overflow-y-auto custom-scrollbar">
                {(!selectedEmployee.statusLogs || selectedEmployee.statusLogs.length === 0) ? <p className="text-xs text-gray-400 italic">No status changes recorded yet.</p> : (
                  <div className="space-y-4">
                    {selectedEmployee.statusLogs.map((log: any) => {
                      const info = getHistoryMessage(log);
                      return (
                        <div key={log.id} className="flex gap-3 relative">
                           <div className="absolute top-4 bottom-[-16px] left-[7px] w-[1px] bg-gray-200 last:hidden"></div>
                           <div className="text-base">{info.icon}</div>
                           <div><p className={clsx("text-sm font-medium", info.color)}>{info.text}</p></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end pt-2"><button onClick={() => setModal(null)} className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium">Close Profile</button></div>
          </div>
        )}
      </Modal>
    </>
  );
}