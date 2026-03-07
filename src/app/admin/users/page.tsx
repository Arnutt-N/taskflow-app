'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Search, Shield, UserCircle2 } from 'lucide-react';
import { Avatar } from '@/components/ui';
import { format } from 'date-fns';

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json())
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6 animate-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
            <p className="text-slate-500 text-sm mt-1">Manage team members, roles, and access controls</p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase">Total Users:</span>
              <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{users?.length || 0}</span>
            </div>
          </div>

          <div className="overflow-x-auto table-responsive">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 bg-slate-100 rounded-lg w-48"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-100 rounded-full w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-8 bg-slate-100 rounded max-w-[80px] ml-auto"></div></td>
                    </tr>
                  ))
                ) : users?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 px-6 py-4">No users found.</td>
                  </tr>
                ) : (
                  users?.map((user: any) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={user.name} />
                          <div>
                            <p className="font-semibold text-slate-800">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {user.role === 'ADMIN' ? <Shield className="w-3.5 h-3.5 text-rose-500" /> : <UserCircle2 className="w-3.5 h-3.5 text-slate-400" />}
                          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-600">{user.department?.name || 'Unassigned'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
