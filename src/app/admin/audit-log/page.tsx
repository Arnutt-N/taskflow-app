'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search, RefreshCw, User, Loader2, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATE: 'bg-blue-50 text-blue-700 border-blue-200',
  DELETE: 'bg-rose-50 text-rose-700 border-rose-200',
  STATUS_CHANGE: 'bg-violet-50 text-violet-700 border-violet-200',
};

export default function AuditLogPage() {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const { data = [], isLoading, refetch, isFetching } = useQuery<AuditEntry[]>({
    queryKey: ['audit-log'],
    queryFn: () => fetch('/api/admin/audit-log').then(r => r.json()),
    refetchInterval: 30_000,
  });

  const filtered = data.filter(entry => {
    const matchSearch = !search || 
      entry.user.name.toLowerCase().includes(search.toLowerCase()) ||
      entry.entityType.toLowerCase().includes(search.toLowerCase()) ||
      entry.action.toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || entry.action === filterAction;
    return matchSearch && matchAction;
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-6 h-6 text-amber-500" /> Audit Log
            </h1>
            <p className="text-slate-500 text-sm mt-1">All system activity — who did what and when</p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Search by user, entity..."
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="text-sm text-slate-700 py-2.5 bg-transparent outline-none"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="STATUS_CHANGE">Status Change</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Time</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Entity</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-16 text-slate-400">No audit records found</td></tr>
                  ) : (
                    filtered.slice(0, 100).map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap font-mono">
                          {new Date(entry.createdAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-indigo-600" />
                            </div>
                            <span className="text-slate-700 font-medium text-xs">{entry.user?.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${ACTION_COLORS[entry.action] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                            {entry.action}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          <span className="font-semibold">{entry.entityType}</span>
                          <span className="text-slate-400 font-mono ml-1.5 text-[10px]">{entry.entityId.slice(0, 8)}…</span>
                        </td>
                        <td className="px-5 py-3.5 max-w-xs">
                          {entry.newValue && (
                            <p className="text-xs text-slate-500 truncate" title={entry.newValue}>{entry.newValue}</p>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 100 && (
            <div className="px-5 py-3 bg-slate-50 text-xs text-slate-400 border-t border-slate-100">
              Showing first 100 of {filtered.length} records
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
