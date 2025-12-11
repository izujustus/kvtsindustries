'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface ReportProps {
  dateRange: { from: string, to: string };
  financials: { revenue: number, expenses: number, profit: number };
  production: { total: number, qualified: number, rejected: number, defectRate: string };
  inventory: { valuation: number, lowStock: number };
  hr: { headcount: number, payroll: number };
  salesData: any[]; // For chart
  productionData: any[]; // For chart
}

export const PrintReportTemplate = forwardRef<HTMLDivElement, ReportProps>((props, ref) => {
  const { dateRange, financials, production, inventory, hr, salesData } = props;

  return (
    <div ref={ref} className="bg-white p-8 max-w-[210mm] mx-auto text-black font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center border-b-2 border-[#E30613] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
          <div>
            <h1 className="text-2xl font-black text-[#E30613] tracking-widest">KVTS INDUSTRIES</h1>
            <p className="text-xs font-bold text-gray-600">Comprehensive Management Report</p>
          </div>
        </div>
        <div className="text-right text-sm">
          <p className="font-bold text-gray-900">Period Covered:</p>
          <p className="font-mono bg-gray-100 px-2 py-1 rounded">
            {new Date(dateRange.from).toLocaleDateString()} — {new Date(dateRange.to).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* 1. FINANCIAL SUMMARY */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#E30613] mb-3 uppercase border-b w-fit">1. Financial Overview</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Revenue</p>
            <p className="text-xl font-bold text-green-700">₦{financials.revenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-xs text-gray-500 uppercase font-bold">Total Expenses</p>
            <p className="text-xl font-bold text-red-600">₦{financials.expenses.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 border rounded-lg">
            <p className="text-xs text-gray-500 uppercase font-bold">Net Profit</p>
            <p className="text-xl font-bold text-blue-800">₦{financials.profit.toLocaleString()}</p>
          </div>
        </div>
        
        {/* Simple Chart for Print (Using a simple HTML bar representation since Recharts can be tricky in print preview sometimes, but we try Recharts first) */}
        <div className="h-48 w-full border rounded p-2">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={salesData}>
               <XAxis dataKey="name" fontSize={10} />
               <Bar dataKey="total" fill="#E30613" />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* 2. PRODUCTION SUMMARY */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#E30613] mb-3 uppercase border-b w-fit">2. Production Performance</h2>
        <table className="w-full text-sm border-collapse border border-gray-300">
          <thead className="bg-black text-white">
            <tr>
              <th className="p-2 border border-gray-300">Metric</th>
              <th className="p-2 border border-gray-300 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border border-gray-300">Total Output</td><td className="p-2 border border-gray-300 text-right font-bold">{production.total} Units</td></tr>
            <tr><td className="p-2 border border-gray-300">Qualified (Good)</td><td className="p-2 border border-gray-300 text-right text-green-600">{production.qualified}</td></tr>
            <tr><td className="p-2 border border-gray-300">Rejected (Waste)</td><td className="p-2 border border-gray-300 text-right text-red-600">{production.rejected}</td></tr>
            <tr className="bg-gray-100"><td className="p-2 border border-gray-300 font-bold">Defect Rate</td><td className="p-2 border border-gray-300 text-right font-bold">{production.defectRate}%</td></tr>
          </tbody>
        </table>
      </div>

      {/* 3. ASSETS & INVENTORY */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold text-[#E30613] mb-3 uppercase border-b w-fit">3. Inventory</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between border-b pb-1"><span>Current Valuation:</span> <span className="font-bold">₦{inventory.valuation.toLocaleString()}</span></div>
            <div className="flex justify-between border-b pb-1"><span>Low Stock Alerts:</span> <span className="font-bold text-red-600">{inventory.lowStock} Items</span></div>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#E30613] mb-3 uppercase border-b w-fit">4. HR Status</h2>
          <div className="text-sm space-y-2">
            <div className="flex justify-between border-b pb-1"><span>Active Employees:</span> <span className="font-bold">{hr.headcount}</span></div>
            <div className="flex justify-between border-b pb-1"><span>Total Payroll (Period):</span> <span className="font-bold">₦{hr.payroll.toLocaleString()}</span></div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center text-xs text-gray-400 border-t pt-2">
        <p>Generated by KVTS ERP System on {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
});

PrintReportTemplate.displayName = 'PrintReportTemplate';