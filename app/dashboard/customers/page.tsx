import { PrismaClient } from '@prisma/client';
// import CustomerClientWrapper from '@/app/ui/customers/customer-client-wrapper';
import CustomerClientWrapper from './customer-client-wrapper';

const prisma = new PrismaClient();

// Helper to sanitize Decimal/Date for Client Components
const serialize = (data: any) => JSON.parse(JSON.stringify(data));

export default async function CustomersPage() {
  const rawCustomers = await prisma.customer.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      _count: {
        select: { invoices: true, payments: true }
      }
    }
  });

  const customers = serialize(rawCustomers);

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer CRM</h1>
        <p className="text-sm text-gray-500">Manage profiles, track history, and view statements.</p>
      </div>
      
      <CustomerClientWrapper customers={customers} />
    </div>
  );
}