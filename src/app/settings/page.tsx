import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Settings, User, Bell, Shield, Key } from 'lucide-react';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-xl mx-auto space-y-8 animate-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your account preferences and application settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-1">
            <SettingsNavItem icon={<User className="w-4 h-4" />} label="Profile" active />
            <SettingsNavItem icon={<Bell className="w-4 h-4" />} label="Notifications" />
            <SettingsNavItem icon={<Key className="w-4 h-4" />} label="Security" />
            <SettingsNavItem icon={<Shield className="w-4 h-4" />} label="Privacy" />
          </div>

          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner">
                  U
                </div>
                <button className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
                  Change Avatar
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">First Name</label>
                  <input type="text" defaultValue="Taskflow" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Last Name</label>
                  <input type="text" defaultValue="User" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
                  <input type="email" defaultValue="user@example.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
              </div>
              
              <div className="pt-6 flex justify-end">
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function SettingsNavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
      {icon}
      {label}
    </button>
  );
}
