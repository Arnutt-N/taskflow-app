'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsersRound, Plus, User, Building2, Loader2, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  description?: string;
  department?: { id: string; name: string; color: string };
  _count: { members: number };
}

interface Department {
  id: string;
  name: string;
  color: string;
}

export default function TeamsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', departmentId: '' });

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => fetch('/api/admin/teams').then(r => r.json()),
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: () => fetch('/api/admin/departments').then(r => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      fetch('/api/admin/teams', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      setShowForm(false);
      setForm({ name: '', description: '', departmentId: '' });
      toast.success('Team created!');
    },
    onError: () => toast.error('Failed to create team'),
  });

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto space-y-6 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <UsersRound className="w-6 h-6 text-violet-500" /> Teams
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage teams within departments</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-md shadow-violet-200"
          >
            <Plus className="w-4 h-4" /> New Team
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-800">New Team</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Team Name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm"
                    placeholder="e.g. Frontend Team"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Department</label>
                  <select
                    value={form.departmentId}
                    onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-violet-400 outline-none text-sm bg-white"
                  >
                    <option value="">No Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-violet-400 outline-none text-sm resize-none"
                    rows={3}
                    placeholder="Team description..."
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50">Cancel</button>
                  <button
                    onClick={() => createMutation.mutate(form)}
                    disabled={!form.name.trim() || createMutation.isPending}
                    className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Teams Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Team</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {teams.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-12 text-slate-400">No teams yet. Create your first team!</td></tr>
                ) : (
                  teams.map(team => (
                    <tr key={team.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center">
                            <UsersRound className="w-4 h-4 text-violet-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{team.name}</p>
                            {team.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{team.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {team.department ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ backgroundColor: team.department.color + '20', color: team.department.color }}>
                            <Building2 className="w-3 h-3" /> {team.department.name}
                          </span>
                        ) : <span className="text-slate-400 text-xs">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-sm text-slate-600"><User className="w-3.5 h-3.5" /> {team._count.members}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
