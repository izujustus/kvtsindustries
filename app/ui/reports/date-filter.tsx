'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import clsx from 'clsx';

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Default to current month if no params
  const defaultStart = searchParams.get('from') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = searchParams.get('to') || new Date().toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [activeRange, setActiveRange] = useState('MONTH');

  const applyFilter = (start: string, end: string, rangeName: string) => {
    setStartDate(start);
    setEndDate(end);
    setActiveRange(rangeName);
    router.push(`?from=${start}&to=${end}`);
  };

  const handlePreset = (type: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    if (type === 'TODAY') {
      // Start/End are same
    } else if (type === 'WEEK') {
      start.setDate(today.getDate() - 7);
    } else if (type === 'MONTH') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (type === 'YEAR') {
      start = new Date(today.getFullYear(), 0, 1);
      end = new Date(today.getFullYear(), 11, 31);
    }

    applyFilter(start.toISOString().split('T')[0], end.toISOString().split('T')[0], type);
  };

  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-gray-100 rounded-lg"><Filter className="w-5 h-5 text-gray-600"/></div>
        <span className="font-bold text-gray-700">Filter Reports:</span>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {['TODAY', 'WEEK', 'MONTH', 'YEAR'].map((range) => (
          <button
            key={range}
            onClick={() => handlePreset(range)}
            className={clsx(
              "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
              activeRange === range ? "bg-white text-[#E30613] shadow-sm" : "text-gray-500 hover:text-gray-900"
            )}
          >
            This {range.charAt(0) + range.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">From</label>
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
            className="text-sm border-gray-300 rounded-md focus:ring-[#E30613] focus:border-[#E30613]"
          />
        </div>
        <span className="text-gray-400">-</span>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">To</label>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
            className="text-sm border-gray-300 rounded-md focus:ring-[#E30613] focus:border-[#E30613]"
          />
        </div>
        <button 
          onClick={() => applyFilter(startDate, endDate, 'CUSTOM')}
          className="ml-2 bg-black text-white px-3 py-2 rounded-md text-xs font-bold hover:bg-gray-800"
        >
          Apply
        </button>
      </div>
    </div>
  );
}