'use client';

import { useActionState, useState } from 'react';
import { 
  updateProfile, 
  changePassword, 
  updateSystemSettings, 
  createAnnouncement, 
  deleteAnnouncement,
  createDepartment, 
  deleteDepartment, 
  createSubDepartment, 
  deleteSubDepartment 
} from '@/app/lib/settings-actions';
import { 
  Save, Lock, User, Building, Plus, Trash, Megaphone, Briefcase, ChevronRight, ChevronDown, CornerDownRight 
} from 'lucide-react';

// 1. PROFILE FORM
export function ProfileForm({ user }: { user: any }) {
  const [state, action, isPending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="max-w-xl space-y-4">
      <input type="hidden" name="id" value={user.id} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Display Name</label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 text-gray-400" />
          </div>
          <input name="name" defaultValue={user.name} required className="pl-10 block w-full rounded-md border-gray-300 focus:ring-[#E30613] focus:border-[#E30613] sm:text-sm p-2 border" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email Address</label>
        {/* DISABLED EMAIL INPUT */}
        <input 
          disabled 
          name="email" 
          type="email" 
          defaultValue={user.email} 
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm p-2 border cursor-not-allowed" 
        />
        <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact Super Admin for assistance.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Role</label>
        <input disabled value={user.role} className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 sm:text-sm p-2 border cursor-not-allowed" />
        <p className="text-xs text-gray-500 mt-1">Role cannot be changed here.</p>
      </div>

      {state?.message && <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{state.message}</p>}

      <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800">
        {isPending ? 'Saving...' : 'Update Profile'}
      </button>
    </form>
  );
}

// 2. SECURITY FORM
export function SecurityForm({ user }: { user: any }) {
  const [state, action, isPending] = useActionState(changePassword, undefined);

  return (
    <form action={action} className="max-w-xl space-y-4">
      <input type="hidden" name="id" value={user.id} />

      <div>
        <label className="block text-sm font-medium text-gray-700">Current Password</label>
        <input name="currentPassword" type="password" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <input name="newPassword" type="password" required minLength={6} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border" />
      </div>

      {state?.message && <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{state.message}</p>}

      <button disabled={isPending} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
        <Lock className="w-4 h-4" /> {isPending ? 'Updating...' : 'Change Password'}
      </button>
    </form>
  );
}

// 3. COMPANY SETTINGS FORM (Admin Only)
export function SystemForm({ settings }: { settings: any }) {
  const [state, action, isPending] = useActionState(updateSystemSettings, undefined);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 text-xs text-yellow-800 mb-4">
        These details will appear on all PDF Invoices and Reports.
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name</label>
        <input name="companyName" defaultValue={settings?.companyName} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Office Address</label>
        <textarea name="companyAddress" defaultValue={settings?.companyAddress} rows={3} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input name="companyPhone" defaultValue={settings?.companyPhone} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="companyEmail" defaultValue={settings?.companyEmail} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-bold text-gray-900 mb-2">Financial Defaults</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Default VAT (%)</label>
            <input name="defaultTaxRate" type="number" step="0.1" defaultValue={Number(settings?.defaultTaxRate || 7.5)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
        </div>
      </div>

      {state?.message && <p className={state.success ? "text-green-600 text-sm" : "text-red-600 text-sm"}>{state.message}</p>}

      <button disabled={isPending} className="flex items-center gap-2 bg-[#E30613] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
        <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Configuration'}
      </button>
    </form>
  );
}

// 4. ANNOUNCEMENT MANAGER FORM
export function AnnouncementForm({ announcements }: { announcements: any[] }) {
  const [state, action, isPending] = useActionState(createAnnouncement, undefined);

  // Helper function to handle delete with confirmation
  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      await deleteAnnouncement(id);
    }
  };
  
  return (
    <div className="space-y-8">
      {/* CREATE NEW */}
      <form action={action} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
          <Megaphone className="w-5 h-5 text-[#E30613]" /> Post New Announcement
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Title / Subject</label>
          <input name="title" required placeholder="e.g. Scheduled System Maintenance" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm focus:ring-[#E30613] focus:border-[#E30613]" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Message Body</label>
          <textarea name="message" required rows={3} placeholder="Enter the details of the announcement here..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm focus:ring-[#E30613] focus:border-[#E30613]" />
        </div>

        <div className="flex justify-between items-center pt-2">
          <div>
             {state?.message && <p className={state.success ? "text-green-600 text-sm font-medium" : "text-red-600 text-sm font-medium"}>{state.message}</p>}
          </div>
          
          <button disabled={isPending} className="bg-black text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-gray-800 flex items-center gap-2">
            {isPending ? 'Posting...' : (
              <>
                <Plus className="w-4 h-4" /> Post Now
              </>
            )}
          </button>
        </div>
      </form>

      {/* LIST EXISTING */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Active Announcements</h3>
        <div className="space-y-3">
          {announcements.length === 0 && <p className="text-gray-500 text-sm italic bg-white p-4 rounded border border-dashed text-center">No active announcements.</p>}
          
          {announcements.map((ann) => (
            <div key={ann.id} className="flex justify-between items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  {ann.title}
                  <span className="text-[10px] font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </h4>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.message}</p>
              </div>
              
              <button 
                type="button"
                onClick={() => handleDeleteClick(ann.id)}
                className="ml-4 text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                title="Delete Announcement"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. DEPARTMENT & SUB-DEPARTMENT MANAGER (NEW)
export function DepartmentForm({ departments }: { departments: any[] }) {
  const [createDeptState, createDeptAction, isDeptPending] = useActionState(createDepartment, undefined);
  const [createSubState, createSubAction, isSubPending] = useActionState(createSubDepartment, undefined);
  
  // State to toggle open/close of departments
  const [openDeptId, setOpenDeptId] = useState<string | null>(null);

  const toggleDept = (id: string) => {
    setOpenDeptId(openDeptId === id ? null : id);
  };

  const handleDeleteDept = async (id: string) => {
    if (confirm('Delete this Department? Warning: All sub-departments under it will be deleted too.')) {
      await deleteDepartment(id);
    }
  };

  const handleDeleteSub = async (id: string) => {
    if (confirm('Delete this Sub-Department?')) {
      await deleteSubDepartment(id);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. CREATE PARENT DEPARTMENT */}
      <form action={createDeptAction} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
          <Briefcase className="w-5 h-5 text-[#E30613]" /> Add Main Department
        </h3>
        
        <div className="flex gap-2">
          <div className="flex-1">
            <input 
              name="name" 
              required 
              placeholder="e.g. Production" 
              className="block w-full rounded-md border-gray-300 shadow-sm p-2 border sm:text-sm focus:ring-[#E30613] focus:border-[#E30613]" 
            />
          </div>
          <button disabled={isDeptPending} className="bg-black text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-gray-800">
            {isDeptPending ? 'Adding...' : 'Add'}
          </button>
        </div>
        {/* Error message for Main Department */}
        {createDeptState?.message && (
          <p className={createDeptState.success ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
            {createDeptState.message}
          </p>
        )}
      </form>

      {/* 2. LIST DEPARTMENTS (Accordion Style) */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Organization Structure</h3>
        {departments.length === 0 ? (
           <p className="text-gray-500 text-sm italic">No departments created yet.</p>
        ) : (
          <div className="space-y-3">
            {departments.map((dept) => {
              const isOpen = openDeptId === dept.id;

              return (
                <div key={dept.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm transition-all">
                  
                  {/* Parent Header */}
                  <div className="flex justify-between items-center p-3 bg-white hover:bg-gray-50 cursor-pointer" onClick={() => toggleDept(dept.id)}>
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                      <span className="font-bold text-gray-800">{dept.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {dept.subDepartments?.length || 0} Sections
                      </span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteDept(dept.id); }} 
                      className="text-gray-300 hover:text-red-600 p-2"
                      title="Delete Department"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Nested Sub-Departments (Visible only if open) */}
                  {isOpen && (
                    <div className="bg-gray-50 p-4 border-t border-gray-100 animate-fade-in">
                      
                      {/* Sub List */}
                      <div className="space-y-2 mb-4 pl-4 border-l-2 border-gray-200 ml-1">
                        {(!dept.subDepartments || dept.subDepartments.length === 0) && (
                          <p className="text-xs text-gray-400 italic">No sub-departments defined.</p>
                        )}
                        
                        {dept.subDepartments?.map((sub: any) => (
                          <div key={sub.id} className="flex justify-between items-center group">
                             <div className="flex items-center gap-2 text-sm text-gray-600">
                               <CornerDownRight className="w-3 h-3 text-gray-300" />
                               {sub.name}
                             </div>
                             <button onClick={() => handleDeleteSub(sub.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600">
                               <Trash className="w-3 h-3" />
                             </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Sub Form */}
                      <form action={createSubAction} className="flex gap-2 mt-2 items-center">
                        <input type="hidden" name="departmentId" value={dept.id} />
                        <input 
                          name="name" 
                          required 
                          placeholder={`Add section to ${dept.name}...`} 
                          className="flex-1 rounded-md border-gray-300 shadow-sm p-1.5 border text-xs focus:ring-[#E30613] focus:border-[#E30613]" 
                        />
                        <button disabled={isSubPending} className="bg-white border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-xs font-bold hover:bg-gray-100 flex items-center gap-1">
                           <Plus className="w-3 h-3" /> Add
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}