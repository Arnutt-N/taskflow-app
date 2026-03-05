'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Calendar, User, Flag } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  estimatedHours: number;
  actualHours: number;
  project: { id: string; name: string };
  assignee: { id: string; name: string } | null;
  _count: { comments: number };
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 border-slate-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  DONE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'text-slate-500',
  MEDIUM: 'text-amber-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-rose-500',
};

const statusLabels: Record<string, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export default function AllTasksPage() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ['all-tasks'],
    queryFn: async () => {
      const res = await fetch('/api/tasks');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
  });

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
            <h1 className="text-2xl font-bold text-slate-800">All Tasks</h1>
            <p className="text-slate-500 text-sm mt-1">
              View and manage all tasks across projects
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Status
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              <Flag className="w-4 h-4 mr-2" />
              Priority
            </button>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks?.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-800">{task.title}</p>
                        {task._count.comments > 0 && (
                          <p className="text-xs text-slate-500 mt-1">{task._count.comments} comments</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{task.project.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        statusColors[task.status] || statusColors.TODO
                      }`}>
                        {statusLabels[task.status] || task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs font-medium ${
                        priorityColors[task.priority] || priorityColors.LOW
                      }`}>
                        <Flag className="w-3 h-3 mr-1" />
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignee ? (
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-medium text-indigo-600 mr-2">
                            {task.assignee.name[0]}
                          </div>
                          <span className="text-sm text-slate-600">{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.dueDate ? (
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="w-4 h-4 mr-1.5 text-slate-400" />
                          {new Date(task.dueDate).toLocaleDateString('th-TH')}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <span className="text-slate-800">{task.actualHours}</span>
                        <span className="text-slate-400"> / {task.estimatedHours}h</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {tasks?.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-1">No tasks yet</h3>
              <p className="text-slate-500">Create your first task to get started</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
