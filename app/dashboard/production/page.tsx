import { PrismaClient } from '@prisma/client';
import { Factory, AlertCircle, CheckCircle, Download } from 'lucide-react'; // Added missing imports
import SearchBar from '@/app/ui/users/search';
import ProductionClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function ProductionPage({
  searchParams,
}: {
  // FIX 1: Type definition must be a Promise
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  // FIX 2: Await the params before using them
  const params = await searchParams;
  const query = params?.query || '';
  
  // 1. Fetch Products (For Dropdown)
  const products = await prisma.product.findMany({
    select: { id: true, name: true, code: true, brand: true },
    where: { type: 'FINISHED_GOOD' }
  });

  // 2. Fetch Reports (With Filtering)
  const reports = await prisma.productionReport.findMany({
    where: {
      OR: [
        { batchNumber: { contains: query, mode: 'insensitive' } },
        { product: { name: { contains: query, mode: 'insensitive' } } }
      ]
    },
    include: {
      product: true,
      defects: true,
    },
    orderBy: { date: 'desc' },
    take: 50
  });

  // 3. Calculate Stats
  const totalProduced = reports.reduce((sum, r) => sum + r.totalQty, 0);
  const totalRejected = reports.reduce((sum, r) => sum + r.rejectedQty, 0);
  const defectRate = totalProduced > 0 ? ((totalRejected / totalProduced) * 100).toFixed(1) : '0';

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Production Overview</h1>
        <button className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Factory className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Production</p>
            <p className="text-2xl font-bold text-gray-900">{totalProduced.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-full text-green-600"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Qualified Output</p>
            <p className="text-2xl font-bold text-gray-900">{(totalProduced - totalRejected).toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-full text-red-600"><AlertCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Defect Rate</p>
            <p className="text-2xl font-bold text-gray-900">{defectRate}%</p>
            <span className="text-xs text-red-500">{totalRejected} units rejected</span>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="bg-white p-4 rounded-t-xl border border-b-0 border-gray-200 flex justify-between gap-4">
        <div className="w-full max-w-md"><SearchBar /></div>
      </div>

      {/* CLIENT WRAPPER */}
      <ProductionClientWrapper reports={reports} products={products} />
    </div>
  );
}