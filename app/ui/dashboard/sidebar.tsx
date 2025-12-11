'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  X,
  FileText,
  Truck,
  HardHat
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import LanguageSwitcher from '@/app/ui/language-switcher';

// Define all possible links with their Roles
const links = [
  // Dashboard: Everyone sees this
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
  
  // User Management: Admin & HR
  { name: 'User Management', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] },
  
  // Production: Admin & Production Manager
  { name: 'Production', href: '/dashboard/production', icon: Factory, roles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
  
  // Inventory: Admin, Store Keeper, Production Manager
  { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER', 'PRODUCTION_MANAGER'] },
  
  // Sales: Admin & Sales
  { name: 'Sales & Invoices', href: '/dashboard/sales', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
  
  // Accounting: Admin & Accountant
  { name: 'Accounting', href: '/dashboard/accounting', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  
  // Assets: Admin & Store Keeper
  { name: 'Assets', href: '/dashboard/assets', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER'] },
  
  // HR: Admin & HR
  { name: 'HR & Payroll', href: '/dashboard/hr', icon: HardHat, roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] },
  
  // Reports: Admin & Accountant
  { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  
  // Settings: EVERYONE (Profile/Password management)
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ALL'] },
];

export default function Sidebar({ userRole, mobileOpen, setMobileOpen }: { userRole: string, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
  const pathname = usePathname();

  // Filter links based on role (Show if 'ALL' or user has role)
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
          <div className="flex h-20 items-center gap-3 border-b border-gray-800 px-6">
            <div className="relative h-10 w-10 bg-white rounded-full p-1 flex-shrink-0">
               <Image 
                 src="/logo.png" 
                 alt="KVTS" 
                 fill 
                 className="object-contain p-1" 
                 priority
               />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none text-[#E30613]">KVTS</span>
              <span className="text-xs text-gray-400 font-medium">INDUSTRIES</span>
            </div>
            
            {/* Close Button for Mobile */}
            <button 
              onClick={() => setMobileOpen(false)}
              className="ml-auto md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-800">
            {filteredLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive = pathname === link.href;
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)} // Close menu on click (mobile)
                  className={clsx(
                    'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive 
                      ? 'bg-[#E30613] text-white shadow-md' 
                      : 'text-gray-400 hover:bg-gray-900 hover:text-white hover:pl-4'
                  )}
                >
                  <LinkIcon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* FOOTER AREA */}
          <div className="border-t border-gray-800 p-4 bg-gray-900/50 space-y-4">
            
            {/* 1. Language Switcher (Now Professional) */}
            <div>
              <p className="px-1 text-[10px] font-bold text-gray-500 uppercase mb-2">Language</p>
              <LanguageSwitcher />
            </div>

            <div className="border-t border-gray-800"></div>

            {/* 2. User Info */}
            <div className="flex items-center gap-3 px-1">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#E30613] to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                {userRole.substring(0, 2)}
              </div>
              <div className="text-xs overflow-hidden">
                <p className="font-medium text-white truncate">Current User</p>
                <p className="text-gray-400 capitalize truncate text-[10px]">{userRole.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            
            {/* 3. Logout */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-black border border-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#E30613] hover:text-white hover:border-[#E30613]"
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