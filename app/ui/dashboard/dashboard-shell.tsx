'use client';

import { useState } from 'react';
import Sidebar from '@/app/ui/dashboard/sidebar';
import { Menu } from 'lucide-react';

export default function DashboardShell({ 
  children, 
  userRole 
}: { 
  children: React.ReactNode;
  userRole: string; 
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-gray-50">
      
      {/* Sidebar Component */}
      <Sidebar 
        userRole={userRole} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* Mobile Header (Only visible on small screens) */}
        <header className="flex h-16 items-center border-b border-gray-200 bg-white px-4 md:hidden">
          <button 
            onClick={() => setMobileOpen(true)}
            className="text-gray-500 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-gray-900">KVTS Dashboard</span>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}