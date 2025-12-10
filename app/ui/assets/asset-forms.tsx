'use client';

import { useActionState, useEffect } from 'react';
import { createAsset, logMaintenance, assignAsset } from '@/app/lib/asset-actions';

// 1. CREATE ASSET FORM
export function AssetForm({ onClose }: { onClose: () => void }) {
  const [state, action, isPending] = useActionState(createAsset, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Asset Tag ID</label>
          <input name="assetTag" required placeholder="TAG-001" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Serial Number</label>
          <input name="serialNumber" placeholder="SN123456" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Asset Name</label>
        <input name="name" required placeholder="Dell XPS 15 / Forklift A" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
           <label className="block text-sm font-medium text-gray-700">Category</label>
           <select name="category" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
             <option value="IT Equipment">IT Equipment</option>
             <option value="Machinery">Machinery</option>
             <option value="Furniture">Furniture</option>
             <option value="Vehicle">Vehicle</option>
           </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700">Condition</label>
           <select name="condition" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
             <option value="New">New</option>
             <option value="Good">Good</option>
             <option value="Fair">Fair</option>
             <option value="Poor">Poor</option>
           </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
          <input name="purchaseDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost</label>
          <input name="purchaseCost" type="number" step="0.01" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Initial Location</label>
        <input name="location" placeholder="Warehouse A / Office 101" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      {state?.message && !state.success && <p className="text-red-500 text-sm">{state.message}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800">
          {isPending ? 'Registering...' : 'Register Asset'}
        </button>
      </div>
    </form>
  );
}

// 2. MAINTENANCE FORM
export function MaintenanceForm({ asset, onClose }: { asset: any, onClose: () => void }) {
  const [state, action, isPending] = useActionState(logMaintenance, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assetId" value={asset.id} />
      <div className="text-sm font-medium text-gray-500 mb-2">Log maintenance for: {asset.name} ({asset.assetTag})</div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input name="date" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Cost</label>
          <input name="cost" type="number" step="0.01" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description of Work</label>
        <textarea name="description" required placeholder="Replaced battery, updated OS..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Performed By (Technician/Vendor)</label>
        <input name="performedBy" placeholder="External Vendor Ltd" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-[#E30613] text-white px-4 py-2 rounded text-sm hover:bg-red-700">
          {isPending ? 'Logging...' : 'Log Maintenance'}
        </button>
      </div>
    </form>
  );
}

// 3. ASSIGNMENT FORM
export function AssignmentForm({ asset, employees, onClose }: { asset: any, employees: any[], onClose: () => void }) {
  const [state, action, isPending] = useActionState(assignAsset, undefined);
  useEffect(() => { if (state?.success) onClose(); }, [state, onClose]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="assetId" value={asset.id} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Assign To Employee</label>
        <select name="employeeId" defaultValue={asset.assignedToEmployeeId || ""} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
          <option value="">-- No Assignment (Return to Store) --</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department})</option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">Select "No Assignment" to unassign the asset.</p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button disabled={isPending} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
          {isPending ? 'Updating...' : 'Update Assignment'}
        </button>
      </div>
    </form>
  );
}