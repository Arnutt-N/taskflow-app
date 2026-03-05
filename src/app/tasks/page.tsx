'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Search, User, CheckCircle2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useSession } from 'next-auth/react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  estimatedHours: number;
  actualHours: number;
  project: { id: string; name: string };
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-amber-100 text-amber-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-rose-100 text-rose-700',
};

export default function MyTasksPage() {
  const { data: session } = useSession();
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks?myTasks=true');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

  const pendingTasks = tasks?.filter((t) => t.status !== 'DONE') || [];
  const completedTasks = tasks?.filter((t) => t.status === 'DONE') || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-96 bg-slate-100 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Tasks</h1>
            <p className="text-slate-500 text-sm mt-1">
              {pendingTasks.length} pending, {completedTasks.length} completed
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search my tasks..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-800">{tasks?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{pendingTasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Done</p>
            <p className="text-2xl font-bold text-emerald-600">{completedTasks.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-sm text-slate-500">Efficiency</p>
            <p className="text-2xl font-bold text-indigo-600">
              {tasks?.length
                ? Math.round((completedTasks.length / tasks.length) * 100)
                : 0}
              %
            </p>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <button className="mt-1 w-5 h-5 rounded border-2 border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-colors flex-shrink-0"></button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-800">{task.title}</h3>
                  <p className="text-sm text-slate-500">{task.project.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${
                        statusColors[task.status]
                      }`}
                    >
                      {task.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-slate-400">
                        Due {new Date(task.dueDate).toLocaleDateString('th-TH')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {completedTasks.length > 0 && (
            <>
              <div className="flex items-center gap-2 py-4">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-sm text-slate-400">Completed</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-50 rounded-xl border border-slate-200 p-4 opacity-75"
                >
                  <div className="flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-500 line-through">
                        {task.title}
                      </h3>
                      <p className="text-sm text-slate-400">{task.project.name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {tasks?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">
              No tasks assigned
            </h3>
            <p className="text-slate-500">
              You don't have any tasks yet. Create one to get started!
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
