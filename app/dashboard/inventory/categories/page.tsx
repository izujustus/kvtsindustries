import { PrismaClient } from '@prisma/client';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form';
import CategoryClient from './client';
// import CategoryClient from './client'; // See step 3b below


const prisma = new PrismaClient();

export default async function CategoriesPage() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
          <p className="text-sm text-gray-500">Organize your inventory with categories</p>
        </div>
        <CategoryClient categories={categories} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold uppercase text-gray-500">Description</th>
              <th className="px-6 py-3 text-center text-xs font-bold uppercase text-gray-500">Products</th>
              <th className="px-6 py-3 text-right text-xs font-bold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{cat.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{cat.description || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-blue-50 text-blue-700 py-1 px-2 rounded-full text-xs font-bold">
                    {cat._count.products}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <CategoryClient category={cat} mode="ROW_ACTIONS" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}