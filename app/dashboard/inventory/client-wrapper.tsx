'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Plus, ArrowRightLeft, Link as LinkIcon, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from '@/app/ui/users/user-form';
import { ProductForm, AdjustmentForm, BOMForm } from '@/app/ui/inventory/inventory-forms';
import SearchBar from '@/app/ui/users/search';

export default function InventoryClientWrapper({ products, movements, currentTab }: any) {
  const [modalType, setModalType] = useState<'PRODUCT' | 'ADJUST' | 'BOM' | null>(null);
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Tab Handler (Updates URL)
  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', tab);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* TABS & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
        
        {/* Tab Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={() => setTab('STOCK')}
            className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", currentTab === 'STOCK' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Current Stock
          </button>
          <button 
            onClick={() => setTab('MOVEMENTS')}
            className={clsx("text-sm font-medium pb-4 -mb-4 border-b-2 transition-colors", currentTab === 'MOVEMENTS' ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-700")}
          >
            Movement History
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button onClick={() => setModalType('ADJUST')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            <ArrowRightLeft className="w-4 h-4" /> Adjust Stock
          </button>
          <button onClick={() => setModalType('BOM')} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">
            <LinkIcon className="w-4 h-4" /> Link BOM
          </button>
          <button onClick={() => setModalType('PRODUCT')} className="flex items-center gap-2 px-3 py-2 bg-[#E30613] text-white rounded-md text-sm font-medium hover:bg-red-700">
            <Plus className="w-4 h-4" /> New Item
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="py-4 max-w-md">
        <SearchBar />
      </div>

      {/* CONTENT: STOCK TABLE */}
      {currentTab === 'STOCK' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Category</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Cost / Price</th>
                <th className="px-6 py-3 text-center text-xs font-medium uppercase text-gray-500">Stock Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.code} • {p.brand}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
                      p.type === 'FINISHED_GOOD' ? "bg-green-50 text-green-700 ring-green-600/20" : 
                      p.type === 'RAW_MATERIAL' ? "bg-blue-50 text-blue-700 ring-blue-600/20" : 
                      "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
                    )}>
                      {p.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm text-gray-900">Cost: {p.costPrice}</div>
                    <div className="text-xs text-gray-500">Sell: {p.sellingPrice}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                       <span className={clsx(
                         "font-bold text-lg",
                         p.stockOnHand <= p.reorderLevel ? "text-red-600" : "text-gray-900"
                       )}>
                         {p.stockOnHand}
                       </span>
                      {p.stockOnHand <= p.reorderLevel && (
                            <div title="Low Stock!">
                                <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" />
                            </div>
                            )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <div className="p-8 text-center text-gray-500">No products found.</div>}
        </div>
      )}

      {/* CONTENT: MOVEMENTS TABLE */}
      {currentTab === 'MOVEMENTS' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Product</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {movements.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(m.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {m.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {m.product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-bold">
                    <span className={m.quantity > 0 ? "text-green-600" : "text-red-600"}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && <div className="p-8 text-center text-gray-500">No history found.</div>}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={modalType === 'PRODUCT'} onClose={() => setModalType(null)} title="Create New Product">
        <ProductForm onClose={() => setModalType(null)} />
      </Modal>
      
      <Modal isOpen={modalType === 'ADJUST'} onClose={() => setModalType(null)} title="Adjust Stock Level">
        <AdjustmentForm products={products} onClose={() => setModalType(null)} />
      </Modal>

      <Modal isOpen={modalType === 'BOM'} onClose={() => setModalType(null)} title="Bill of Materials (BOM)">
        <BOMForm products={products} onClose={() => setModalType(null)} />
      </Modal>
    </>
  );
}