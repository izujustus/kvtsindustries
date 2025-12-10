'use client';

import { useState } from 'react';
import { Plus, Edit, Key, MoreHorizontal } from 'lucide-react';
import { CreateUserForm, EditUserForm, ResetPasswordForm, Modal } from '@/app/ui/users/user-form';
import clsx from 'clsx';

export default function ClientPageWrapper({ users }: { users: any[] }) {
  const [modalType, setModalType] = useState<'CREATE' | 'EDIT' | 'PASSWORD' | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalType('EDIT');
  };

  const handlePassword = (user: any) => {
    setSelectedUser(user);
    setModalType('PASSWORD');
  };

  return (
    <>
      {/* ACTION BAR */}
      <div className="bg-white px-4 pb-4 border-x border-gray-200 flex justify-end">
         <button 
            onClick={() => setModalType('CREATE')}
            className="flex items-center gap-2 rounded-md bg-[#E30613] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="w-4 h-4" /> Add New User
          </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-b-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">User</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Role</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center text-[#E30613] font-bold">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={clsx(
                    "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                    user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? "bg-purple-100 text-purple-800" :
                    user.role === 'PRODUCTION_MANAGER' ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  )}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className={clsx(
                    "inline-flex rounded-full px-2 text-xs font-semibold leading-5",
                    user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  )}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handlePassword(user)}
                      className="text-gray-400 hover:text-yellow-600 tooltip" 
                      title="Reset Password"
                    >
                      <Key className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(user)}
                      className="text-gray-400 hover:text-[#E30613]" 
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
            <div className="p-10 text-center text-gray-500">
                No users found matching your search.
            </div>
        )}
      </div>

      {/* MODALS */}
      <Modal 
        isOpen={modalType === 'CREATE'} 
        onClose={() => setModalType(null)} 
        title="Create New User"
      >
        <CreateUserForm onClose={() => setModalType(null)} />
      </Modal>

      <Modal 
        isOpen={modalType === 'EDIT'} 
        onClose={() => setModalType(null)} 
        title="Edit User Details"
      >
        <EditUserForm user={selectedUser} onClose={() => setModalType(null)} />
      </Modal>

      <Modal 
        isOpen={modalType === 'PASSWORD'} 
        onClose={() => setModalType(null)} 
        title={`Reset Password: ${selectedUser?.name}`}
      >
        <ResetPasswordForm userId={selectedUser?.id} onClose={() => setModalType(null)} />
      </Modal>
    </>
  );
}