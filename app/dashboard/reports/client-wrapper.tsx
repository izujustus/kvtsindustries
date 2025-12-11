'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer } from 'lucide-react';
import clsx from 'clsx';
import { RevenueChart, ExpensePieChart, ProductionChart } from '@/app/ui/reports/charts';
import { PrintReportTemplate } from '@/app/ui/reports/print-report';
import { Modal } from '@/app/ui/users/user-form';

export default function ReportsClientWrapper({ data }: { data: any }) {
  const [tab, setTab] = useState('OVERVIEW');
  const [isPrintModalOpen, setPrintModalOpen] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `KVTS_Report_${data.dateRange.from}_${data.dateRange.to}`,
  });

  return (
    <>
      {/* ACTIONS ROW - Fixed Overlap */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4 mb-6">
        <button 
          onClick={() => setPrintModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#E30613] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-bold shadow hover:bg-red-700 w-full sm:w-auto transition-colors"
        >
          <Printer className="w-4 h-4" /> Export / Print Report
        </button>
      </div>

      {/* KPI CARDS - Responsive Grid (2 cols on mobile, 4 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase truncate">Net Profit</p>
          <p className={clsx("text-lg sm:text-2xl font-black truncate", data.financials.profit >= 0 ? "text-blue-800" : "text-red-600")}>
            ₦{data.financials.profit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase truncate">Revenue</p>
          <p className="text-lg sm:text-2xl font-black text-green-700 truncate">₦{data.financials.revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase truncate">Total Output</p>
          <p className="text-lg sm:text-2xl font-black text-gray-900 truncate">{data.production.total.toLocaleString()} <span className="text-[10px] font-normal text-gray-400">units</span></p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-xl border shadow-sm">
          <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase truncate">Asset Value</p>
          <p className="text-lg sm:text-2xl font-black text-purple-800 truncate">₦{data.inventory.valuation.toLocaleString()}</p>
        </div>
      </div>

      {/* TABS - Scrollable on mobile */}
      <div className="flex gap-4 sm:gap-6 border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
        {['OVERVIEW', 'FINANCIALS', 'PRODUCTION'].map((t) => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              "pb-3 text-xs sm:text-sm font-bold transition-colors border-b-2 whitespace-nowrap",
              tab === t ? "border-[#E30613] text-[#E30613]" : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="space-y-6">
        
        {/* OVERVIEW TAB */}
        {tab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={data.charts.sales} />
            <ProductionChart data={data.charts.production} />
          </div>
        )}

        {/* FINANCIALS TAB */}
        {tab === 'FINANCIALS' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
               <RevenueChart data={data.charts.sales} />
            </div>
            <div>
               <ExpensePieChart data={data.charts.expenses} />
               <div className="bg-white mt-4 p-4 rounded-xl border shadow-sm">
                 <h4 className="font-bold text-xs sm:text-sm mb-2 text-gray-700">Financial Summary</h4>
                 <div className="space-y-2 text-xs sm:text-sm">
                   <div className="flex justify-between"><span>Sales:</span> <span>₦{data.financials.revenue.toLocaleString()}</span></div>
                   <div className="flex justify-between text-red-600"><span>Expenses:</span> <span>(₦{data.financials.expenses.toLocaleString()})</span></div>
                   <div className="flex justify-between border-t pt-1 font-bold"><span>Profit:</span> <span>₦{data.financials.profit.toLocaleString()}</span></div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* PRODUCTION TAB */}
        {tab === 'PRODUCTION' && (
          <div className="space-y-6">
            <ProductionChart data={data.charts.production} />
            <div className="bg-white p-4 sm:p-6 rounded-xl border shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">Production Details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 sm:p-4 bg-gray-50 rounded">
                  <div className="text-xl sm:text-2xl font-bold">{data.production.total}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500">Total Output</div>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded text-green-700">
                  <div className="text-xl sm:text-2xl font-bold">{data.production.qualified}</div>
                  <div className="text-[10px] sm:text-xs opacity-70">Qualified</div>
                </div>
                <div className="p-3 sm:p-4 bg-red-50 rounded text-red-700">
                  <div className="text-xl sm:text-2xl font-bold">{data.production.rejected}</div>
                  <div className="text-[10px] sm:text-xs opacity-70">Rejected</div>
                </div>
                <div className="p-3 sm:p-4 bg-orange-50 rounded text-orange-700">
                  <div className="text-xl sm:text-2xl font-bold">{data.production.defectRate}%</div>
                  <div className="text-[10px] sm:text-xs opacity-70">Defect Rate</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EXPORT MODAL */}
      <Modal isOpen={isPrintModalOpen} onClose={() => setPrintModalOpen(false)} title="Export Report">
        <div className="flex flex-col h-[80vh] w-full">
          <div className="flex justify-end gap-2 mb-4">
             <button 
               onClick={() => handlePrint()} 
               className="bg-[#E30613] text-white px-4 py-2 rounded-md text-xs sm:text-sm font-bold hover:bg-red-700 flex items-center gap-2"
             >
               <Printer className="w-4 h-4" /> Print PDF
             </button>
             <button onClick={() => setPrintModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-xs sm:text-sm">Close</button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-100 p-2 sm:p-8 rounded border border-gray-300 shadow-inner flex justify-center">
             {/* Print Template Wrapper to center it */}
             <div className="w-full max-w-[210mm] bg-white shadow-lg">
                <PrintReportTemplate 
                  ref={printRef}
                  dateRange={data.dateRange}
                  financials={data.financials}
                  production={data.production}
                  inventory={data.inventory}
                  hr={data.hr}
                  salesData={data.charts.sales}
                  productionData={data.charts.production}
                />
             </div>
          </div>
        </div>
      </Modal>
    </>
  );
}