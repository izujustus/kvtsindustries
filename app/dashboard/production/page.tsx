// import { PrismaClient } from '@prisma/client';
// import { Plus, Download, Factory, AlertCircle, CheckCircle } from 'lucide-react';
// import SearchBar from '@/app/ui/users/search'; 
// import ProductionClientWrapper from './client-wrapper';

// const prisma = new PrismaClient();

// export default async function ProductionPage({
//   searchParams,
// }: {
//   // FIX: Promise type
//   searchParams: Promise<{ query?: string; page?: string }>;
// }) {
//   // FIX: Await the params
//   const params = await searchParams;
//   const query = params?.query || '';
  
//   // 1. Fetch Products
//   const products = await prisma.product.findMany({
//     select: { id: true, name: true, code: true, brand: true },
//     where: { type: 'FINISHED_GOOD' } 
//   });

//   // 2. Fetch Reports
//   const reports = await prisma.productionReport.findMany({
//     where: {
//       OR: [
//         { batchNumber: { contains: query, mode: 'insensitive' } },
//         { product: { name: { contains: query, mode: 'insensitive' } } }
//       ]
//     },
//     include: {
//       product: true,
//       defects: true, 
//     },
//     orderBy: { date: 'desc' },
//     take: 50 
//   });

//   // 3. Stats
//   const totalProduced = reports.reduce((sum, r) => sum + r.totalQty, 0);
//   const totalRejected = reports.reduce((sum, r) => sum + r.rejectedQty, 0);
//   const defectRate = totalProduced > 0 ? ((totalRejected / totalProduced) * 100).toFixed(1) : '0';

//   return (
//     <div className="w-full space-y-6">
//       {/* HEADER */}
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold text-gray-900">Production Overview</h1>
//         <button className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
//           <Download className="w-4 h-4" /> Export Report
//         </button>
//       </div>

//       {/* STATS CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Factory className="w-6 h-6" /></div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Total Production</p>
//             <p className="text-2xl font-bold text-gray-900">{totalProduced.toLocaleString()}</p>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-green-50 rounded-full text-green-600"><CheckCircle className="w-6 h-6" /></div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Qualified Output</p>
//             <p className="text-2xl font-bold text-gray-900">{(totalProduced - totalRejected).toLocaleString()}</p>
//           </div>
//         </div>
//         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
//           <div className="p-3 bg-red-50 rounded-full text-red-600"><AlertCircle className="w-6 h-6" /></div>
//           <div>
//             <p className="text-sm text-gray-500 font-medium">Defect Rate</p>
//             <p className="text-2xl font-bold text-gray-900">{defectRate}%</p>
//             <span className="text-xs text-red-500">{totalRejected} units rejected</span>
//           </div>
//         </div>
//       </div>

//       {/* SEARCH */}
//       <div className="bg-white p-4 rounded-t-xl border border-b-0 border-gray-200 flex justify-between gap-4">
//         <div className="w-full max-w-md"><SearchBar /></div>
//       </div>

//       {/* CLIENT WRAPPER */}
//       <ProductionClientWrapper reports={reports} products={products} />
//     </div>
//   );
// }

import { PrismaClient } from '@prisma/client';
import { Download, Factory, AlertCircle, CheckCircle } from 'lucide-react';
import SearchBar from '@/app/ui/users/search'; 
import ProductionClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string; brand?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const categoryFilter = params?.category || 'ALL'; 
  const brandFilter = params?.brand || 'ALL';

  // 1. Fetch Dropdown Data
  const categories = await prisma.productCategory.findMany({ orderBy: { name: 'asc' } });
  
  // Fetch Brands (Distinct)
  const brandResults = await prisma.product.findMany({ 
    select: { brand: true }, 
    distinct: ['brand'],
    where: { brand: { not: null }, type: 'FINISHED_GOOD' }
  });
  const brands = brandResults.map(b => b.brand).filter(Boolean) as string[];

  // 2. Fetch Products (Including CategoryId for form filtering)
  const products = await prisma.product.findMany({
    select: { id: true, name: true, code: true, brand: true, type: true, categoryId: true },
    where: { type: 'FINISHED_GOOD' } 
  });

  // 3. Build Query for Reports
  let whereClause: any = {
    OR: [
      { batchNumber: { contains: query, mode: 'insensitive' } },
      { product: { name: { contains: query, mode: 'insensitive' } } }
    ]
  };

  // Filter by Category
  if (categoryFilter !== 'ALL') {
     const catId = categories.find(c => c.id === categoryFilter || c.name.toUpperCase() === categoryFilter.toUpperCase())?.id;
     if (catId) {
       whereClause.product = { ...whereClause.product, categoryId: catId };
     }
  }

  // Filter by Brand
  if (brandFilter !== 'ALL') {
    whereClause.product = { ...whereClause.product, brand: brandFilter };
  }

  // 4. Fetch Reports
  const reports = await prisma.productionReport.findMany({
    where: whereClause,
    include: {
      product: { include: { category: true } },
      defects: true, 
    },
    orderBy: { date: 'desc' },
    take: 50 
  });

  // 5. Stats
  const totalProduced = reports.reduce((sum, r) => sum + r.totalQty, 0);
  const totalRejected = reports.reduce((sum, r) => sum + r.rejectedQty, 0);
  const defectRate = totalProduced > 0 ? ((totalRejected / totalProduced) * 100).toFixed(1) : '0';

  return (
    <div className="w-full space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Production Overview</h1>
        <button className="flex items-center gap-2 rounded-lg bg-white border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm">
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
            <span className="text-xs text-red-500 font-medium">{totalRejected} units rejected</span>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-t-xl border border-b-0 border-gray-200 flex flex-col md:flex-row justify-between gap-4">
        <div className="w-full max-w-md"><SearchBar /></div>
      </div>

      {/* CLIENT WRAPPER */}
      <ProductionClientWrapper 
         reports={reports} 
         products={products} 
         categories={categories}
         brands={brands}
         currentCategory={categoryFilter}
         currentBrand={brandFilter}
      />
    </div>
  );
}