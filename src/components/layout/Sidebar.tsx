// components/layout/Sidebar.tsx
'use client';

import { 
  LayoutDashboard, 
  FolderKanban, 
  CheckCircle2, 
  ListTodo,
  Zap,
  Upload,
  LogOut,
  User
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { TabType } from '@/types';
import { useSession, signOut } from 'next-auth/react';

interface SidebarProps {
  activeTab: TabType;
  onlyMyTasks: boolean;
  onTabChange: (tab: TabType, myTasks?: boolean) => void;
}

export const Sidebar = ({ activeTab, onlyMyTasks, onTabChange }: SidebarProps) => {
  const { data: session } = useSession();
  const user = session?.user;
  const isAdmin = user?.role === 'admin';

  return (
    <aside className="w-full md:w-20 lg:w-72 bg-white flex flex-col shrink-0 z-50 transition-all duration-300 shadow-xl border-r border-slate-100">
      <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100">
         <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
           <Zap className="w-6 h-6 fill-current" />
         </div>
         <span className="ml-3 font-bold text-xl hidden lg:block tracking-tight text-slate-900">
           Engineering<span className="text-indigo-600">Taskflow</span>
         </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        
        {/* Executive Section */}
        <div>
          <p className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Executive View</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={LayoutDashboard}
              label="Overview"
              active={activeTab === 'dashboard'}
              onClick={() => onTabChange('dashboard')}
            />
            <SidebarItem 
              icon={FolderKanban}
              label="Portfolio"
              active={activeTab === 'projects'}
              onClick={() => onTabChange('projects')}
            />
          </div>
        </div>

        {/* Team Workspace Section */}
        <div>
          <p className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Team Workspace</p>
          <div className="space-y-1">
            <SidebarItem 
              icon={CheckCircle2}
              label="Tasks"
              active={activeTab === 'tasks'}
              onClick={() => onTabChange('tasks', true)}
            />
          </div>
        </div>

        {/* Admin Section - Only for admin */}
        {isAdmin && (
          <div>
            <p className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">Admin</p>
            <div className="space-y-1">
              <a 
                href="/admin/upload"
                className="w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600"
              >
                <Upload className="w-5 h-5 mr-3 text-slate-400" />
                <span className="hidden lg:block">Import Excel</span>
              </a>
            </div>
          </div>
        )}

      </nav>

      {/* User Profile & Logout */}
      <div className="p-6 hidden lg:block border-t border-slate-100">
         <div className="flex items-center gap-3 px-2 mb-4">
            <Avatar name={user?.name || user?.email || 'User'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name || user?.email}</p>
              <p className="text-[10px] text-emerald-500 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                ● {user?.role === 'admin' ? 'Admin' : 'User'}
              </p>
            </div>
         </div>
         
         <button
           onClick={() => signOut({ callbackUrl: '/login' })}
           className="w-full flex items-center px-4 py-2 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
         >
           <LogOut className="w-4 h-4 mr-3" />
           <span className="text-sm">Logout</span>
         </button>
      </div>
    </aside>
  );
};

// Sidebar Item Component
interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative ${
      active 
        ? 'bg-indigo-50 text-indigo-700 font-semibold' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
    }`}
  >
    <Icon className={`w-5 h-5 mr-3 ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
    <span className="hidden lg:block">{label}</span>
  </button>
);
