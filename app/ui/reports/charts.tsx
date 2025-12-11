'use client';

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#E30613', '#8884d8'];

// 1. REVENUE CHART
export function RevenueChart({ data }: { data: any[] }) {
  return (
    <div className="h-[250px] sm:h-[300px] w-full bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-xs sm:text-sm font-bold text-gray-500 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{fontSize: 10}} />
          <YAxis tick={{fontSize: 10}} tickFormatter={(value) => `₦${value/1000}k`} />
          <Tooltip contentStyle={{ fontSize: '12px' }} formatter={(value) => `₦${Number(value).toLocaleString()}`} />
          <Bar dataKey="total" fill="#E30613" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// 2. EXPENSE PIE CHART
export function ExpensePieChart({ data }: { data: any[] }) {
  return (
    <div className="h-[250px] sm:h-[300px] w-full bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-xs sm:text-sm font-bold text-gray-500 mb-4">Expense Distribution</h3>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: '12px' }} formatter={(value) => `₦${Number(value).toLocaleString()}`} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// 3. PRODUCTION QUALITY CHART
export function ProductionChart({ data }: { data: any[] }) {
  return (
    <div className="h-[250px] sm:h-[300px] w-full bg-white p-4 rounded-xl border shadow-sm">
      <h3 className="text-xs sm:text-sm font-bold text-gray-500 mb-4">Output vs Defects</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorGood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorBad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{fontSize: 10}} />
          <YAxis tick={{fontSize: 10}} />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip contentStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="qualified" stroke="#10B981" fillOpacity={1} fill="url(#colorGood)" name="Good" />
          <Area type="monotone" dataKey="rejected" stroke="#EF4444" fillOpacity={1} fill="url(#colorBad)" name="Defects" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}