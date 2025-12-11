import { PrismaClient } from '@prisma/client';
import { DateFilter } from '@/app/ui/reports/date-filter';
// import ReportsClientWrapper from './client-wrapper'; // New Client Component
import ReportsClientWrapper from './client-wrapper';

const prisma = new PrismaClient();

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  
  // DATE LOGIC (Default to Current Month if missing)
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const from = params.from || defaultStart;
  const to = params.to || defaultEnd;

  // Convert to Date objects for Prisma
  // We add 'T23:59:59' to end date to include the whole day
  const dateFilter = {
    gte: new Date(from),
    lte: new Date(`${to}T23:59:59.999Z`),
  };

  // 1. SALES DATA
  const invoices = await prisma.salesInvoice.findMany({
    where: { 
      date: dateFilter,
      status: 'PAID' // Only count paid revenue for reports
    }
  });
  const revenue = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);

  // 2. EXPENSE DATA
  const expenses = await prisma.expense.findMany({
    where: { incurredDate: dateFilter }
  });
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  // 3. PRODUCTION DATA
  const production = await prisma.productionReport.findMany({
    where: { date: dateFilter }
  });
  const totalProduced = production.reduce((sum, p) => sum + p.totalQty, 0);
  const totalQualified = production.reduce((sum, p) => sum + p.qualifiedQty, 0);
  const totalRejected = production.reduce((sum, p) => sum + p.rejectedQty, 0);

  // 4. INVENTORY SNAPSHOT (Current, not filtered by date, as valuation is "As of Now")
  const products = await prisma.product.findMany();
  const inventoryValue = products.reduce((sum, p) => sum + (Number(p.costPrice) * p.stockOnHand), 0);
  const lowStock = products.filter(p => p.stockOnHand <= p.reorderLevel).length;

  // 5. HR DATA (Payroll within date range)
  const payrolls = await prisma.payroll.findMany({
    where: { paymentDate: dateFilter }
  });
  const totalPayroll = payrolls.reduce((sum, p) => sum + Number(p.netPay), 0);
  const employeeCount = await prisma.employee.count({ where: { status: 'ACTIVE' } });

  // 6. CHART DATA PREPARATION
  // Group Revenue by Date for Charts
  const salesMap: Record<string, number> = {};
  invoices.forEach(inv => {
    const d = new Date(inv.date).toLocaleDateString(undefined, {month:'short', day:'numeric'});
    salesMap[d] = (salesMap[d] || 0) + Number(inv.paidAmount);
  });
  const salesChartData = Object.entries(salesMap).map(([name, total]) => ({ name, total }));

  // Group Expenses by Category
  const expenseMap: Record<string, number> = {};
  expenses.forEach(exp => {
    expenseMap[exp.category] = (expenseMap[exp.category] || 0) + Number(exp.amount);
  });
  const expenseChartData = Object.entries(expenseMap).map(([name, value]) => ({ name, value }));

  // PRODUCTION CHART DATA
  const productionChartData = production.map(p => ({
    name: new Date(p.date).toLocaleDateString(undefined, {month:'short', day:'numeric'}),
    qualified: p.qualifiedQty,
    rejected: p.rejectedQty
  }));

  // PACK DATA FOR CLIENT
  const reportData = {
    dateRange: { from, to },
    financials: {
      revenue,
      expenses: totalExpenses,
      profit: revenue - totalExpenses
    },
    production: {
      total: totalProduced,
      qualified: totalQualified,
      rejected: totalRejected,
      defectRate: totalProduced > 0 ? ((totalRejected/totalProduced)*100).toFixed(1) : '0'
    },
    inventory: {
      valuation: inventoryValue,
      lowStock
    },
    hr: {
      headcount: employeeCount,
      payroll: totalPayroll
    },
    charts: {
      sales: salesChartData,
      expenses: expenseChartData,
      production: productionChartData
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Comprehensive Reports</h1>
      </div>

      <DateFilter />

      <ReportsClientWrapper data={reportData} />
    </div>
  );
}