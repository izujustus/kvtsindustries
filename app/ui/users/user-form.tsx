// 'use client';

import { useActionState, useEffect } from 'react'; // <--- Added useEffect
import { createUser, updateUser, resetUserPassword } from '@/app/lib/user-actions';
import { X, Save, Lock } from 'lucide-react';

// Reusable Modal Wrapper (Unchanged)
export function Modal({ title, isOpen, onClose, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-gray-500 hover:text-red-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// 1. CREATE USER FORM
export function CreateUserForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createUser, undefined);

  // FIX: Wrap the side-effect in useEffect
  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input name="name" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input name="email" type="email" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" placeholder="john@kvts.com" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select name="role" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]">
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="PRODUCTION_MANAGER">Production Manager</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="STORE_KEEPER">Store Keeper</option>
            <option value="HR">HR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Initial Password</label>
          <input name="password" type="text" defaultValue="Freedom@2024" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select name="isActive" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="true">Active</option>
          <option value="false">Inactive (Suspended)</option>
        </select>
      </div>

      {state?.errors && <p className="text-sm text-red-500">Please check inputs</p>}
      {state?.message && !state.success && <p className="text-sm text-red-500">{state.message}</p>}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-[#E30613] text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
          {isPending ? 'Creating...' : 'Create User'}
        </button>
      </div>
    </form>
  );
}

// 2. EDIT USER FORM
export function EditUserForm({ user, onClose }: { user: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(updateUser, undefined);

  // FIX: Wrap the side-effect in useEffect
  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={user.id} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Full Name</label>
        <input name="name" defaultValue={user.name} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input name="email" defaultValue={user.email} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select name="role" defaultValue={user.role} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]">
             <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="PRODUCTION_MANAGER">Production Manager</option>
            <option value="SALES_MANAGER">Sales Manager</option>
            <option value="ACCOUNTANT">Accountant</option>
            <option value="STORE_KEEPER">Store Keeper</option>
            <option value="HR">HR</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select name="isActive" defaultValue={String(user.isActive)} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]">
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-black text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors">
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

// 3. RESET PASSWORD FORM
export function ResetPasswordForm({ userId, onClose }: { userId: string, onClose: () => void }) {
  const [state, action, isPending] = useActionState(resetUserPassword, undefined);

  // FIX: Wrap the side-effect in useEffect
  useEffect(() => {
    if (state?.success) {
      onClose();
    }
  }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={userId} />
      <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
        <p className="text-xs text-yellow-800">Warning: This will overwrite the user&apos;s current password.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">New Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input name="password" type="text" defaultValue="Freedom@2024" className="pl-9 mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#E30613] focus:ring-[#E30613]" />
        </div>
      </div>
      
      {state?.message && !state.success && <p className="text-sm text-red-500">{state.message}</p>}
      
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
        <button disabled={isPending} type="submit" className="bg-red-600 text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
          {isPending ? 'Resetting...' : 'Reset Password'}
        </button>
      </div>
    </form>
  );
}