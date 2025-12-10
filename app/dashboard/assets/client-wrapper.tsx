'use client';

import { useState } from 'react';
import { Plus, Settings, UserPlus, Wrench } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '@/app/ui/users/user-form';
import { AssetForm, MaintenanceForm, AssignmentForm } from '@/app/ui/assets/asset-forms';

export default function AssetsClientWrapper({ assets, employees }: any) {
  const [modal, setModal] = useState<'CREATE' | 'MAINTENANCE' | 'ASSIGN' | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);

  const handleAction = (type: 'MAINTENANCE' | 'ASSIGN', asset: any) => {
    setSelectedAsset(asset);
    setModal(type);
  };

  return (
    <>
      <div className="flex justify-between items-center bg-white p-4 rounded-t-xl border border-b-0 border-gray-200">
        <div className="text-sm text-gray-500">{assets.length} Assets Registered</div>
        <button onClick={() => setModal('CREATE')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm hover:bg-red-700">
          <Plus className="w-4 h-4" /> Register Asset
        </button>
      </div>

      <div className="bg-white border rounded-b-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tag / Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {assets.map((asset: any) => (
              <tr key={asset.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{asset.assetTag}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{asset.category}</td>
                <td className="px-6 py-4">
                  {asset.assignedTo ? (
                    <div className="flex items-center gap-2">
                       <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 font-bold">
                         {asset.assignedTo.firstName.charAt(0)}
                       </span>
                       <span className="text-sm text-gray-700">{asset.assignedTo.firstName} {asset.assignedTo.lastName}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("px-2 py-1 text-xs font-medium rounded-full", 
                    asset.status === 'ACTIVE' ? "bg-green-100 text-green-800" : 
                    asset.status === 'IN_REPAIR' ? "bg-orange-100 text-orange-800" : 
                    "bg-gray-100 text-gray-800")}>
                    {asset.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleAction('ASSIGN', asset)} title="Assign User" className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600">
                      <UserPlus className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleAction('MAINTENANCE', asset)} title="Log Maintenance" className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600">
                      <Wrench className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assets.length === 0 && <div className="p-8 text-center text-gray-500">No assets found.</div>}
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'CREATE'} onClose={() => setModal(null)} title="Register New Asset">
        <AssetForm onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'MAINTENANCE'} onClose={() => setModal(null)} title="Log Maintenance">
        <MaintenanceForm asset={selectedAsset} onClose={() => setModal(null)} />
      </Modal>
      <Modal isOpen={modal === 'ASSIGN'} onClose={() => setModal(null)} title="Assign Asset">
        <AssignmentForm asset={selectedAsset} employees={employees} onClose={() => setModal(null)} />
      </Modal>
    </>
  );
}