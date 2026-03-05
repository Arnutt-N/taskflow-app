// components/layout/Header.tsx
'use client';

import { Bell, LogOut } from 'lucide-react';
import { getTodayLabel } from '@/lib/utils';
import { TabType } from '@/types';
import { signOut } from 'next-auth/react';

interface HeaderProps {
  activeTab: TabType;
}

const TAB_LABELS: Record<TabType, string> = {
  dashboard: 'Overview',
  projects: 'Projects',
  tasks: 'Tasks',
};

export const Header = ({ activeTab }: HeaderProps) => (
  <header className="h-20 bg-[#f8fafc]/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-40 sticky top-0 border-b border-slate-100/50">
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
        {TAB_LABELS[activeTab]}
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </h1>
      {activeTab === 'dashboard' && (
        <p className="text-xs text-slate-400">สำหรับผู้บริหารดูภาพรวม และทีมงานใช้ติดตามงานรายวัน</p>
      )}
    </div>
    
    <div className="flex items-center gap-4">
      <button 
        type="button"
        className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm relative"
        title="Notifications"
      >
         <Bell className="w-5 h-5"/>
         <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white" />
      </button>
      
      {/* Logout button for mobile/tablet */}
      <button 
        type="button"
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm lg:hidden"
        title="Logout"
      >
         <LogOut className="w-5 h-5"/>
      </button>
      
      <div className="h-8 w-px bg-slate-200 hidden lg:block" />
      <p className="text-sm font-medium text-slate-500 hidden sm:block">{getTodayLabel()}</p>
    </div>
  </header>
);
