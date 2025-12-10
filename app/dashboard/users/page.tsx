import { PrismaClient } from '@prisma/client';
import SearchBar from '@/app/ui/users/search';
import { Plus, Download, Edit, Key } from 'lucide-react';
import { CreateUserForm, EditUserForm, ResetPasswordForm, Modal } from '@/app/ui/users/user-form';
import ClientPageWrapper from './client-wrapper';
// import ClientPageWrapper from './client-wrapper'; // Logic wrapper


const prisma = new PrismaClient();

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { query?: string; page?: string };
}) {
  const query = searchParams?.query || '';
  
  // FETCH DATA
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex gap-3">
          {/* Export Button logic can be client side via CSV */}
          <button className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 bg-white p-4 rounded-t-xl border border-b-0 border-gray-200">
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
        {/* Pass user creation trigger to Client Wrapper */}
      </div>

      <ClientPageWrapper users={users} />
    </div>
  );
}