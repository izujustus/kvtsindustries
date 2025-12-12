import { PrismaClient } from '@prisma/client';
import CustomerProfileView from '@/app/ui/customers/customer-profile-view';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();
const serialize = (data: any) => JSON.parse(JSON.stringify(data));

// 1. Update the Props type to be a Promise
export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  
  // 2. Await the params to get the ID
  const { id } = await params;

  const rawCustomer = await prisma.customer.findUnique({
    where: { id: id }, // Use the awaited ID
    include: {
      invoices: {
        include: { items: { include: { product: true } } }, 
        orderBy: { date: 'desc' }
      },
      payments: {
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!rawCustomer) notFound();

  const customer = serialize(rawCustomer);

  return <CustomerProfileView customer={customer} />;
}