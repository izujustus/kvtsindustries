'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Plus, Search, Filter, Printer, Eye, ArrowRightCircle, Trash2, Edit } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form'; // Reusing your existing Modal
// import { ProformaForm } from '@/app/ui/sales/proforma-form';
import { ProformaForm } from '@/app/ui/sales/proforma-form';
// import { ProformaTemplate } from '@/app/ui/sales/proforma-template';
import { ProformaTemplate } from '@/app/ui/sales/proforma-template';
// import { convertProformaToDraft, deleteProforma } from '@/app/lib/proforma-actions';
import { convertProformaToDraft, deleteProforma } from '@/app/lib/lib/proforma-actions';
import clsx from 'clsx';

export default function ProformaClientWrapper({ proformas, customers, products }: any) {
  const [modal, setModal] = useState<'CREATE' | 'EDIT' | 'VIEW' | null>(null);
  const [selectedProforma, setSelectedProforma] = useState<any>(null);
  
  // FILTERS
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, DRAFT, SENT, CONVERTED

  // PRINT
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: printRef, documentTitle: 'Proforma_Invoice' });

  // HANDLERS
  const handleEdit = (p: any) => {
    setSelectedProforma(p);
    setModal('EDIT');
  };

  const handleView = (p: any) => {
    setSelectedProforma(p);
    setModal('VIEW');
  };

  const handleConvert = async (id: string) => {
    if(!confirm("Convert to Draft Invoice? This will allow you to finalize the sale.")) return;
    await convertProformaToDraft(id);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure? This cannot be undone.")) return;
    await deleteProforma(id);
  };

  // FILTER LOGIC
  const filtered = proformas.filter((p: any) => {
    const matchesSearch = 
        p.proformaNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' 
        ? true 
        : statusFilter === 'CONVERTED' 
            ? p.status === 'CONVERTED_TO_INVOICE' 
            : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
        
        {/* LEFT: SEARCH & FILTER */}
        <div className="flex flex-col md:flex-row gap-3 flex-1">
            <div className="relative max-w-sm w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-gray-400" /></div>
                <input 
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500" 
                    placeholder="Search Number or Customer..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="relative w-full md:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter className="h-4 w-4 text-gray-400" /></div>
                <select 
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="ALL">All Statuses</option>
                    <option value="DRAFT">Drafts</option>
                    <option value="SENT">Sent</option>
                    <option value="CONVERTED">Converted</option>
                </select>
            </div>
        </div>

        {/* RIGHT: CREATE */}
        <button 
            onClick={() => { setSelectedProforma(null); setModal('CREATE'); }}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
        >
            <Plus className="w-4 h-4" /> Create Proforma
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-4">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                    <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {filtered.map((p: any) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.proformaNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{p.customer.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={clsx("px-2 py-1 text-xs font-bold rounded-full",
                                p.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                                p.status === 'SENT' ? 'bg-blue-100 text-blue-600' :
                                p.status === 'CONVERTED_TO_INVOICE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                            )}>
                                {p.status === 'CONVERTED_TO_INVOICE' ? 'CONVERTED' : p.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold">₦{p.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => handleView(p)} className="p-1 text-gray-500 hover:text-black" title="View"><Eye className="w-4 h-4"/></button>
                            
                            {p.status !== 'CONVERTED_TO_INVOICE' && (
                                <>
                                    <button onClick={() => handleEdit(p)} className="p-1 text-gray-500 hover:text-blue-600" title="Edit"><Edit className="w-4 h-4"/></button>
                                    <button onClick={() => handleDelete(p.id)} className="p-1 text-gray-500 hover:text-red-600" title="Delete"><Trash2 className="w-4 h-4"/></button>
                                    <button onClick={() => handleConvert(p.id)} className="p-1 text-purple-600 hover:text-purple-800" title="Convert to Invoice"><ArrowRightCircle className="w-4 h-4"/></button>
                                </>
                            )}
                        </td>
                    </tr>
                ))}
                {filtered.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-500">No Proformas Found</td></tr>
                )}
            </tbody>
        </table>
      </div>

      {/* MODALS */}
      <Modal isOpen={modal === 'CREATE' || modal === 'EDIT'} onClose={() => setModal(null)} title={modal === 'CREATE' ? "New Proforma" : "Edit Proforma"}>
        <ProformaForm customers={customers} products={products} initialData={modal === 'EDIT' ? selectedProforma : null} onClose={() => setModal(null)} />
      </Modal>

      <Modal isOpen={modal === 'VIEW'} onClose={() => setModal(null)} title="Proforma Preview">
         <div className="flex flex-col h-[80vh] w-full">
            <div className="flex justify-end gap-2 mb-4">
                <button onClick={handlePrint} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-purple-700 flex items-center gap-2">
                    <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={() => setModal(null)} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded border border-gray-300 shadow-inner flex justify-center">
                <ProformaTemplate ref={printRef} proforma={selectedProforma} />
            </div>
         </div>
      </Modal>
    </>
  );
}