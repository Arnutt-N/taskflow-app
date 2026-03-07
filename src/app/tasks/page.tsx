'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, ListTodo, Users, CheckCircle2, LayoutDashboard } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';
import { TaskTableView } from '@/components/tasks/TaskTableView';
import { ImportExportToolbar } from '@/components/ui';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  estimatedHours: number;
  actualHours: number;
  project: { id: string; name: string };
  assignee: { id: string; name: string; avatar?: string | null } | null;
  _count: { comments: number };
}

export default function TasksPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<'my' | 'all'>('my');

  // Always fetch all tasks, we will filter for "My Tasks" on the client side 
  // to make the toggle instant without re-fetching.
  const { data: allTasks, isLoading } = useQuery<Task[]>({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      return res.json();
    },
  });

  const displayTasks = viewMode === 'my' 
    ? (allTasks?.filter(t => t.assignee?.id === session?.user?.id) || [])
    : (allTasks || []);

  const pendingCount = displayTasks.filter(t => t.status !== 'DONE').length;
  const completedCount = displayTasks.filter(t => t.status === 'DONE').length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 animate-in fade-in duration-500">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between">
              <div className="h-8 bg-slate-200 rounded w-1/4"></div>
              <div className="h-8 bg-slate-200 rounded w-32"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>)}
            </div>
            <div className="h-96 bg-slate-100 rounded-xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-screen-2xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Task Manager</h1>
            <p className="text-slate-500 text-sm mt-1">
              {viewMode === 'my' ? 'Manage your assigned tasks and priorities.' : 'Overview of all tasks across the workspace.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ImportExportToolbar type="tasks" />
            <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
              <Plus className="w-4 h-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex justify-start">
          <div className="flex items-center p-1.5 bg-slate-100 rounded-xl inline-flex border border-slate-200 shadow-sm">
            <button
              onClick={() => setViewMode('my')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'my' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              My Tasks
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'all' 
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4" />
              All Tasks
            </button>
          </div>
        </div>

        {/* ── 2. Top Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Tasks</p>
              <LayoutDashboard className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-3xl font-black text-slate-800">{displayTasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Pending</p>
              <div className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <p className="text-3xl font-black text-amber-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black text-emerald-600">{completedCount}</p>
          </div>
          <div className="bg-indigo-600 rounded-xl border border-indigo-500 p-5 shadow-sm shadow-indigo-200 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-indigo-200 uppercase tracking-wider">Completion Rate</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-black">{displayTasks.length ? Math.round((completedCount / displayTasks.length) * 100) : 0}%</p>
            </div>
          </div>
        </div>

        {/* ── 3. Task Table View ── */}
        <TaskTableView tasks={displayTasks} />

      </div>
    </DashboardLayout>
  );
}
