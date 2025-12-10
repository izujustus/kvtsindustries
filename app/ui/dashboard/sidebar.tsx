'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { 
  LayoutDashboard, 
  Users, 
  Factory, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  FileText,
  Truck,
  HardHat
} from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react'; // Client-side signout

// Define all possible links
const links = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
  { name: 'User Management', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] },
  { name: 'Production', href: '/dashboard/production', icon: Factory, roles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER', 'PRODUCTION_MANAGER'] },
  { name: 'Sales & Invoices', href: '/dashboard/sales', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
  { name: 'Accounting', href: '/dashboard/accounting', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  { name: 'Assets', href: '/dashboard/assets', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER'] },
  { name: 'HR & Payroll', href: '/dashboard/hr', icon: HardHat, roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
];

export default function Sidebar({ userRole, mobileOpen, setMobileOpen }: { userRole: string, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const pathname = usePathname();

  // Filter links based on role
  const filteredLinks = links.filter(link => 
    link.roles.includes('ALL') || link.roles.includes(userRole)
  );

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div 
        className={clsx(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          mobileOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* SIDEBAR CONTAINER */}
      <div className={clsx(
        "fixed top-0 left-0 z-50 h-full w-64 bg-black text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          
          {/* LOGO AREA */}
          <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
            <div className="h-8 w-8 rounded-full bg-white p-1">
              {/* Replace with <Image /> if you want */}
              <div className="h-full w-full rounded-full bg-[#E30613]" /> 
            </div>
            <span className="text-lg font-bold tracking-tight">
              KVTS <span className="text-[#E30613]">ERP</span>
            </span>
            {/* Close Button for Mobile */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="ml-auto md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {filteredLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)} // Close menu on click (mobile)
                  className={clsx(
                    'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive 
                      ? 'bg-[#E30613] text-white' 
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                  )}
                >
                  <LinkIcon className="w-5 h-5" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* USER & LOGOUT AREA */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">
                {userRole.substring(0, 2)}
              </div>
              <div className="text-xs">
                <p className="font-medium text-white">Logged in as</p>
                <p className="text-gray-500 capitalize">{userRole.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-2 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-950/30"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}