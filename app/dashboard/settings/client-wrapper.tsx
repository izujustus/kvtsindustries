'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { User, Lock, Building, Megaphone, Briefcase } from 'lucide-react';
import { 
  ProfileForm, 
  SecurityForm, 
  SystemForm, 
  AnnouncementForm, 
  DepartmentForm 
} from '@/app/ui/settings/settings-forms';

export default function SettingsClientWrapper({ user, settings, announcements, departments }: any) {
  const [tab, setTab] = useState('PROFILE');
  // Check if user is allowed to see Admin Zone
  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* SIDEBAR TABS */}
      <div className="w-full lg:w-64 flex-shrink-0">
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => setTab('PROFILE')}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              tab === 'PROFILE' ? "bg-white text-[#E30613] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <User className="w-4 h-4" /> My Profile
          </button>
          
          <button 
            onClick={() => setTab('SECURITY')}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
              tab === 'SECURITY' ? "bg-white text-[#E30613] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Lock className="w-4 h-4" /> Security
          </button>

          {isAdmin && (
            <>
              <div className="my-2 border-t border-gray-200"></div>
              <p className="px-4 text-xs font-bold text-gray-400 uppercase mb-1">Admin Zone</p>
              
              <button 
                onClick={() => setTab('SYSTEM')}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  tab === 'SYSTEM' ? "bg-white text-[#E30613] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Building className="w-4 h-4" /> Company Settings
              </button>

              <button 
                onClick={() => setTab('ANNOUNCEMENTS')}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  tab === 'ANNOUNCEMENTS' ? "bg-white text-[#E30613] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Megaphone className="w-4 h-4" /> Announcements
              </button>

              {/* THIS WAS MISSING: */}
              <button 
                onClick={() => setTab('DEPARTMENTS')}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  tab === 'DEPARTMENTS' ? "bg-white text-[#E30613] shadow-sm border border-gray-200" : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Briefcase className="w-4 h-4" /> Departments
              </button>
            </>
          )}
        </nav>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 bg-white rounded-xl border shadow-sm p-6 sm:p-8 min-h-[500px]">
        
        {tab === 'PROFILE' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">My Profile</h2>
            <p className="text-sm text-gray-500 mb-6">Manage your personal information</p>
            <ProfileForm user={user} />
          </div>
        )}

        {tab === 'SECURITY' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Security</h2>
            <p className="text-sm text-gray-500 mb-6">Update your password to keep your account safe</p>
            <SecurityForm user={user} />
          </div>
        )}

        {tab === 'SYSTEM' && isAdmin && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Company Configuration</h2>
            <p className="text-sm text-gray-500 mb-6">These details appear on Invoices and Reports</p>
            <SystemForm settings={settings} />
          </div>
        )}

        {tab === 'ANNOUNCEMENTS' && isAdmin && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Manage Announcements</h2>
            <p className="text-sm text-gray-500 mb-6">Post updates to the main dashboard for all employees.</p>
            <AnnouncementForm announcements={announcements} />
          </div>
        )}

        {/* THIS WAS MISSING: */}
        {tab === 'DEPARTMENTS' && isAdmin && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Manage Departments</h2>
            <p className="text-sm text-gray-500 mb-6">Create organization structure and sub-sections.</p>
            <DepartmentForm departments={departments} />
          </div>
        )}

      </div>
    </div>
  );
}