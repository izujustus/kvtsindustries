
// 'use client';

// import Link from 'next/link';
// import Image from 'next/image';
// import { usePathname } from 'next/navigation';
// import clsx from 'clsx';
// import { 
//   LayoutDashboard, 
//   Users, 
//   Factory, 
//   ShoppingCart, 
//   Package, 
//   CreditCard, 
//   Settings, 
//   LogOut,
//   X,
//   FileText,
//   Truck,
//   HardHat,
//   Contact // Added Icon for CRM
// } from 'lucide-react';
// import { signOut } from 'next-auth/react';
// import LanguageSwitcher from '@/app/ui/language-switcher';

// // Define all possible links with their Roles
// const links = [
//   // Dashboard: Everyone sees this
//   { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ALL'] },
  
//   // User Management: Admin & HR
//   { name: 'User Management', href: '/dashboard/users', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] },
  
//   // Production: Admin & Production Manager
//   { name: 'Production', href: '/dashboard/production', icon: Factory, roles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
  
//   // Inventory: Admin, Store Keeper, Production Manager
//   { name: 'Inventory', href: '/dashboard/inventory', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER', 'PRODUCTION_MANAGER'] },
  
//   // Sales: Admin & Sales
//   { name: 'Sales & Invoices', href: '/dashboard/sales', icon: ShoppingCart, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },

//   // NEW: Customer CRM (Admin & Sales only)
//   { name: 'Customer CRM', href: '/dashboard/customers', icon: Contact, roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'] },
  
//   // Accounting: Admin & Accountant
//   { name: 'Accounting', href: '/dashboard/accounting', icon: CreditCard, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  
//   // Assets: Admin & Store Keeper
//   { name: 'Assets', href: '/dashboard/assets', icon: Truck, roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER'] },
  
//   // HR: Admin & HR
//   { name: 'HR & Payroll', href: '/dashboard/hr', icon: HardHat, roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] },
  
//   // Reports: Admin & Accountant
//   { name: 'Reports', href: '/dashboard/reports', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
  
//   // Settings: EVERYONE (Profile/Password management)
//   { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['ALL'] },
// ];

// export default function Sidebar({ userRole, mobileOpen, setMobileOpen }: { userRole: string, mobileOpen: boolean, setMobileOpen: (v: boolean) => void }) {
//   const pathname = usePathname();

//   // Filter links based on role (Show if 'ALL' or user has role)
//   const filteredLinks = links.filter(link => 
//     link.roles.includes('ALL') || link.roles.includes(userRole)
//   );

//   return (
//     <>
//       {/* MOBILE OVERLAY */}
//       <div 
//         className={clsx(
//           "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
//           mobileOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
//         )}
//         onClick={() => setMobileOpen(false)}
//       />

//       {/* SIDEBAR CONTAINER */}
//       <div className={clsx(
//         "fixed top-0 left-0 z-50 h-full w-64 bg-black text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block",
//         mobileOpen ? "translate-x-0" : "-translate-x-full"
//       )}>
//         <div className="flex h-full flex-col">
          
//           {/* LOGO AREA */}
//           <div className="flex h-20 items-center gap-3 border-b border-gray-800 px-6">
//             <div className="relative h-10 w-10 bg-white rounded-full p-1 flex-shrink-0">
//                <Image 
//                  src="/logo.png" 
//                  alt="KVTS" 
//                  fill 
//                  className="object-contain p-1" 
//                  priority
//                />
//             </div>
//             <div className="flex flex-col">
//               <span className="text-lg font-bold tracking-tight leading-none text-[#E30613]">KVTS</span>
//               <span className="text-xs text-gray-400 font-medium">INDUSTRIES</span>
//             </div>
            
//             {/* Close Button for Mobile */}
//             <button 
//               onClick={() => setMobileOpen(false)}
//               className="ml-auto md:hidden text-gray-400 hover:text-white"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           {/* NAVIGATION LINKS */}
//           <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-gray-800">
//             {filteredLinks.map((link) => {
//               const LinkIcon = link.icon;
//               // Updated isActive logic to keep parent link active when viewing sub-pages (e.g. /dashboard/customers/123)
//               const isActive = pathname.startsWith(link.href);
              
//               return (
//                 <Link
//                   key={link.name}
//                   href={link.href}
//                   onClick={() => setMobileOpen(false)} // Close menu on click (mobile)
//                   className={clsx(
//                     'group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200',
//                     isActive 
//                       ? 'bg-[#E30613] text-white shadow-md' 
//                       : 'text-gray-400 hover:bg-gray-900 hover:text-white hover:pl-4'
//                   )}
//                 >
//                   <LinkIcon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
//                   {link.name}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* FOOTER AREA */}
//           <div className="border-t border-gray-800 p-4 bg-gray-900/50 space-y-4">
            
//             {/* 1. Language Switcher (Now Professional) */}
//             <div>
//               <p className="px-1 text-[10px] font-bold text-gray-500 uppercase mb-2">Language</p>
//               <LanguageSwitcher />
//             </div>

//             <div className="border-t border-gray-800"></div>

//             {/* 2. User Info */}
//             <div className="flex items-center gap-3 px-1">
//               <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#E30613] to-orange-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
//                 {userRole.substring(0, 2)}
//               </div>
//               <div className="text-xs overflow-hidden">
//                 <p className="font-medium text-white truncate">Current User</p>
//                 <p className="text-gray-400 capitalize truncate text-[10px]">{userRole.toLowerCase().replace('_', ' ')}</p>
//               </div>
//             </div>
            
//             {/* 3. Logout */}
//             <button
//               onClick={() => signOut({ callbackUrl: '/' })}
//               className="flex w-full items-center justify-center gap-2 rounded-md bg-black border border-gray-800 px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#E30613] hover:text-white hover:border-[#E30613]"
//             >
//               <LogOut className="w-4 h-4" />
//               Sign Out
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

'use client';

import React, { useState, useEffect } from 'react';
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
  HardHat,
  ChevronDown,
  ChevronRight,
  Circle,
  Briefcase
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import LanguageSwitcher from '@/app/ui/language-switcher';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type NavItem = {
  name: string;
  href: string;
  icon: any;
  roles: string[];
  subItems?: { name: string; href: string; roles: string[] }[];
};

// ============================================================================
// NAVIGATION STRUCTURE (Updated with New Features)
// ============================================================================

const navItems: NavItem[] = [
  // 1. Dashboard
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    roles: ['ALL'] 
  },
  
  // 2. User Management
  { 
    name: 'User Management', 
    href: '/dashboard/users', 
    icon: Users, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'HR'] 
  },
  
  // 3. Sales & Distribution (Grouped for professionalism)
  { 
    name: 'Sales & Distribution', 
    href: '/dashboard/sales', 
    icon: ShoppingCart, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'SALES_MANAGER'],
    subItems: [
      { name: 'All Invoices', href: '/dashboard/sales', roles: ['ALL'] },
      { name: 'Create Invoice', href: '/dashboard/sales/create', roles: ['ALL'] },
      { name: 'Proforma Invoices', href: '/dashboard/sales/proforma', roles: ['ALL'] }, // NEW
      { name: 'Waybills', href: '/dashboard/sales/waybills', roles: ['ALL'] }, // NEW
      { name: 'Customers', href: '/dashboard/customers', roles: ['ALL'] },
    ]
  },
  
  // 4. Production
  { 
    name: 'Production', 
    href: '/dashboard/production', 
    icon: Factory, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'],
    subItems: [
      { name: 'Daily Reports', href: '/dashboard/production', roles: ['ALL'] },
      { name: 'Work Orders', href: '/dashboard/production/orders', roles: ['ALL'] },
    ]
  },
  
  // 5. Inventory & Stock
  { 
    name: 'Inventory', 
    href: '/dashboard/inventory', 
    icon: Package, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER', 'PRODUCTION_MANAGER'],
    subItems: [
      { name: 'All Products', href: '/dashboard/inventory', roles: ['ALL'] },
      { name: 'Categories', href: '/dashboard/inventory/categories', roles: ['ALL'] }, // NEW
      { name: 'Suppliers', href: '/dashboard/suppliers', roles: ['ALL'] }, // NEW
    ]
  },
  
  // 6. Finance & Accounting
  { 
    name: 'Accounting', 
    href: '/dashboard/accounting', 
    icon: CreditCard, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'],
    subItems: [
      { name: 'Expenses', href: '/dashboard/accounting/expenses', roles: ['ALL'] },
      { name: 'Supplier Payments', href: '/dashboard/accounting/supplier-payments', roles: ['ALL'] }, // NEW
      { name: 'Ledger Entries', href: '/dashboard/accounting', roles: ['ALL'] },
    ]
  },
  
  // 7. Assets
  { 
    name: 'Assets', 
    href: '/dashboard/assets', 
    icon: Truck, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'STORE_KEEPER'] 
  },
  
  // 8. HR & Payroll
  { 
    name: 'HR & Payroll', 
    href: '/dashboard/hr', 
    icon: HardHat, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'HR'],
    subItems: [
      { name: 'Employees', href: '/dashboard/hr', roles: ['ALL'] },
      { name: 'Payroll', href: '/dashboard/hr/payroll', roles: ['ALL'] },
    ]
  },
  
  // 9. Reports
  { 
    name: 'Reports', 
    href: '/dashboard/reports', 
    icon: FileText, 
    roles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] 
  },
  
  // 10. Settings
  { 
    name: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings, 
    roles: ['ALL'] 
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Sidebar({ 
  userRole, 
  mobileOpen, 
  setMobileOpen 
}: { 
  userRole: string, 
  mobileOpen: boolean, 
  setMobileOpen: (v: boolean) => void 
}) {
  const pathname = usePathname();
  
  // State to track which menu group is expanded
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  // Effect: Auto-expand the group that contains the current active page
  useEffect(() => {
    const activeGroup = navItems.find(item => 
      item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href))
    );
    if (activeGroup) {
      setExpandedGroup(activeGroup.name);
    }
  }, [pathname]);

  // Handle expanding/collapsing
  const toggleGroup = (name: string) => {
    setExpandedGroup(prev => prev === name ? null : name);
  };

  // Filter links based on role
  const filteredLinks = navItems.filter(link => 
    link.roles.includes('ALL') || link.roles.includes(userRole)
  );

  return (
    <>
      {/* MOBILE OVERLAY */}
      <div 
        className={clsx(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "opacity-100 block" : "opacity-0 hidden pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* SIDEBAR CONTAINER */}
      <div className={clsx(
        "fixed top-0 left-0 z-50 h-full w-72 bg-[#0a0a0a] text-white transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:block border-r border-gray-900 shadow-2xl flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        
        {/* HEADER / LOGO */}
        <div className="flex h-20 items-center gap-3 border-b border-gray-900 px-6 bg-[#0f0f0f]">
          <div className="relative h-9 w-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-900/20">
             {/* Replace with your actual Logo if available */}
             <Image 
               src="/logo.png" 
               alt="KVTS" 
               width={32}
               height={32}
               className="object-contain" 
             />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white leading-none">KVTS</span>
            <span className="text-[10px] text-[#E30613] font-bold tracking-widest mt-1">INDUSTRIES</span>
          </div>
          
          {/* Close Button (Mobile) */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="ml-auto md:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* NAVIGATION SCROLL AREA */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          <ul className="space-y-1">
            {filteredLinks.map((link) => {
              const LinkIcon = link.icon;
              const hasSubItems = link.subItems && link.subItems.length > 0;
              const isExpanded = expandedGroup === link.name;
              
              // Check if parent or any child is active
              const isParentActive = pathname === link.href;
              const isChildActive = link.subItems?.some(sub => pathname.startsWith(sub.href));
              const isActive = isParentActive || isChildActive;

              return (
                <li key={link.name}>
                  {hasSubItems ? (
                    // 1. RENDER EXPANDABLE PARENT
                    <div className="space-y-1">
                      <button
                        onClick={() => toggleGroup(link.name)}
                        className={clsx(
                          'group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          isActive 
                            ? 'bg-gray-900 text-white' 
                            : 'text-gray-400 hover:bg-gray-900 hover:text-white'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <LinkIcon className={clsx("w-5 h-5", isActive ? "text-[#E30613]" : "text-gray-500 group-hover:text-white")} />
                          <span>{link.name}</span>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                        )}
                      </button>

                      {/* SUB-ITEMS RENDER */}
                      <div className={clsx("overflow-hidden transition-all duration-300 ease-in-out", isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0")}>
                        <ul className="mt-1 ml-4 space-y-1 border-l border-gray-800 pl-3">
                          {link.subItems?.map((sub) => {
                             const isSubActive = pathname === sub.href;
                             return (
                               <li key={sub.name}>
                                 <Link
                                   href={sub.href}
                                   onClick={() => setMobileOpen(false)}
                                   className={clsx(
                                     'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                                     isSubActive
                                       ? 'bg-[#E30613] text-white shadow-md'
                                       : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                   )}
                                 >
                                   <Circle className={clsx("w-1.5 h-1.5", isSubActive ? "fill-white text-white" : "text-gray-600")} />
                                   {sub.name}
                                 </Link>
                               </li>
                             );
                          })}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    // 2. RENDER SINGLE LINK
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={clsx(
                        'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        isActive 
                          ? 'bg-[#E30613] text-white shadow-md' 
                          : 'text-gray-400 hover:bg-gray-900 hover:text-white hover:pl-4'
                      )}
                    >
                      <LinkIcon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-gray-500 group-hover:text-white")} />
                      {link.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER AREA */}
        <div className="border-t border-gray-900 p-4 bg-[#0d0d0d] space-y-4">
            
            {/* Language Switcher */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Language</span>
              <div className="scale-90 origin-right">
                <LanguageSwitcher />
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 p-2 rounded-md bg-gray-900/50 border border-gray-800">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#E30613] to-red-800 flex items-center justify-center text-xs font-bold text-white ring-2 ring-[#0a0a0a]">
                {userRole.substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">Logged In User</p>
                <p className="text-[10px] text-gray-400 capitalize truncate">{userRole.toLowerCase().replace(/_/g, ' ')}</p>
              </div>
            </div>
            
            {/* Sign Out */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-black border border-gray-800 px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider transition-all hover:bg-[#E30613] hover:text-white hover:border-[#E30613] group"
            >
              <LogOut className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-300" />
              Sign Out
            </button>
        </div>

      </div>
    </>
  );
}