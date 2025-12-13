import Link from 'next/link';
import { ArrowLeft, FileText, ShieldCheck, LayoutDashboard } from 'lucide-react';

export default function CreateInvoicePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
          <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Update</h1>
          <p className="text-sm text-gray-500 mt-2">Sales & Distribution Module</p>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-md">
            <p className="text-sm text-blue-800 font-medium">
              We have optimized the invoice creation process to ensure inventory safety.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              To support the new <strong>4-Stage Workflow</strong> (Draft → Confirmation → Gate Pass → Payment), creating new orders is now handled directly inside the <strong>Sales Dashboard</strong>.
            </p>

            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">How to create an invoice:</h3>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <ArrowLeft className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Go to <span className="font-bold text-gray-900">Sales & Finance</span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-red-100 rounded-full">
                  <FileText className="w-3 h-3 text-red-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Click the <span className="font-bold text-red-600">New Order</span> button at the top right.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-green-100 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  This ensures all orders start as <strong>Drafts</strong> before inventory is deducted.
                </span>
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <Link 
            href="/dashboard/sales" 
            className="block w-full bg-black text-white text-center py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
          >
            Go to Sales Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}