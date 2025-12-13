import Link from 'next/link';
import { Truck, Lock, FileCheck, ArrowLeft } from 'lucide-react';

export default function WaybillsRedirectPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-gray-50 p-8 text-center border-b border-gray-100">
          <div className="mx-auto w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Waybill System Update</h1>
          <p className="text-sm text-gray-500 mt-2">Logistics & Gate Pass Module</p>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6">
          <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded-r-md">
            <p className="text-sm text-purple-800 font-medium">
              Waybills are now automatically generated upon Invoice Approval to prevent theft.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600 text-sm leading-relaxed">
              To ensure every item leaving the warehouse is accounted for, we have moved Waybills into the <strong>Sales Dashboard</strong>. A Waybill is only created when an admin approves a draft order.
            </p>

            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider">How to generate a Waybill:</h3>
            
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-gray-100 rounded-full">
                  <ArrowLeft className="w-3 h-3 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Go to <span className="font-bold text-gray-900">Sales & Finance</span>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-blue-100 rounded-full">
                  <FileCheck className="w-3 h-3 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Find a <strong>Draft Order</strong> and click <span className="font-bold text-blue-600">Approve & Post</span>.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-0.5 p-1 bg-green-100 rounded-full">
                  <Lock className="w-3 h-3 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">
                  Enter Driver Details. The system will then generate the <strong>Gate Pass</strong> instantly.
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