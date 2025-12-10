'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import { ProductionForm } from '@/app/ui/production/production-form';
import clsx from 'clsx';

export default function ProductionClientWrapper({ reports, products }: { reports: any[], products: any[] }) {
  const [isModalOpen, setModalOpen] = useState(false);

  // Helper to export CSV
  const handleExport = () => {
    const headers = ['Date', 'Batch', 'Product', 'Shift', 'Total', 'Qualified', 'Rejected', 'Defect Types'];
    const rows = reports.map(r => [
      new Date(r.date).toLocaleDateString(),
      r.batchNumber,
      r.product.name,
      r.shift,
      r.totalQty,
      r.qualifiedQty,
      r.rejectedQty,
      r.defects.map((d:any) => `${d.defectType}:${d.quantity}`).join('; ')
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "production_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <div className="bg-white px-4 pb-4 border-x border-gray-200 flex justify-end gap-2">
         <button 
            onClick={handleExport}
            className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Export CSV
          </button>
         <button 
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-[#E30613] px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <Plus className="w-4 h-4" /> New Production Report
          </button>
      </div>

      <div className="overflow-hidden rounded-b-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date / Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Batch Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Product</th>
              <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Performance</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reports.map((report) => {
               const rate = report.totalQty > 0 
                  ? ((report.qualifiedQty / report.totalQty) * 100).toFixed(0) 
                  : 0;
               return (
              <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{new Date(report.date).toLocaleDateString()}</div>
                  <div className="text-xs text-gray-500 font-bold">{report.shift} SHIFT</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                    {report.batchNumber}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="text-sm text-gray-900">{report.product.name}</div>
                  <div className="text-xs text-gray-500">{report.product.brand} - {report.product.code}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center">
                   <div className="flex flex-col items-center gap-1">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                         <div className="h-full bg-green-500" style={{ width: `${rate}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{report.qualifiedQty} / {report.totalQty} ({rate}%)</span>
                   </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                   {report.rejectedQty > 0 ? (
                      <span className="text-red-600 font-bold text-xs">{report.rejectedQty} Rejected</span>
                   ) : (
                      <span className="text-green-600 font-bold text-xs">Perfect</span>
                   )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        
        {reports.length === 0 && (
            <div className="p-10 text-center text-gray-500">
                No production reports found.
            </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Record Production Output"
      >
        <ProductionForm products={products} onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
}