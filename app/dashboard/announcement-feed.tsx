'use client';

import { useState } from 'react';
import { Megaphone, Bell, Calendar, User, X } from 'lucide-react';
import { Modal } from '@/app/ui/users/user-form'; // Reusing your existing Modal

export default function AnnouncementFeed({ announcements, userRole }: { announcements: any[], userRole: string }) {
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* HEADER */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#E30613]" /> Company Updates
        </h3>
        {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
           <span className="text-[10px] uppercase tracking-wider bg-gray-900 text-white px-2 py-1 rounded font-medium">Admin View</span>
        )}
      </div>

      {/* LIST */}
      <div className="divide-y divide-gray-100 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200">
        {announcements.length > 0 ? (
          announcements.map((msg) => (
            <div 
              key={msg.id} 
              className="p-6 hover:bg-gray-50 transition-colors group cursor-pointer"
              onClick={() => setSelected(msg)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-[#E30613] transition-colors line-clamp-1">
                  {msg.title}
                </h4>
                <span className="text-xs text-gray-400 whitespace-nowrap ml-2 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(msg.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-2 mb-3">
                {msg.message}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                    {msg.createdBy?.name?.charAt(0) || 'A'}
                  </div>
                  <span>{msg.createdBy?.name || 'Management'}</span>
                </div>
                
                <button 
                  className="text-xs font-bold text-[#E30613] hover:underline flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent double triggering
                    setSelected(msg);
                  }}
                >
                  Read full update &rarr;
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center h-full">
            <Bell className="w-10 h-10 mb-3 opacity-20" />
            <p>No new announcements at this time.</p>
          </div>
        )}
      </div>

      {/* READING MODAL */}
      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Announcement Details">
          <div className="flex flex-col h-full max-h-[70vh]">
            {/* Header Info */}
            <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selected.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
                <User className="w-3 h-3" />
                <span className="font-medium text-gray-700">{selected.createdBy?.name || 'Admin'}</span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <h2 className="text-xl font-black text-gray-900 mb-4 leading-tight">
                {selected.title}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>

            {/* Footer Action */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelected(null)}
                className="bg-gray-900 text-white px-6 py-2 rounded-md text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}