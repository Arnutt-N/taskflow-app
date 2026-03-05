'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface Project {
  id: string;
  name: string;
  team: string | null;
  status: string;
  deadline: string | null;
  progress: number;
  budget: number;
  revenue: number;
  margin: number;
  _count: { tasks: number };
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  REVIEW: 'bg-amber-100 text-amber-700',
  DONE: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
};

const statusLabels: Record<string, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
};

export default function ProjectsPage() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
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
            <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage and track all your projects
            </p>
          </div>
          <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {project.team || 'No team'}
                  </p>
                </div>
                <button className="p-1 text-slate-400 hover:text-slate-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    statusColors[project.status] || statusColors.TODO
                  }`}
                >
                  {statusLabels[project.status] || project.status}
                </span>
                <span className="text-xs text-slate-400">
                  {project._count.tasks} tasks
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Progress</span>
                  <span className="font-medium text-slate-800">
                    {project.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-500">Budget</p>
                  <p className="font-medium text-slate-800">
                    ${(project.budget / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Revenue</p>
                  <p className="font-medium text-emerald-600">
                    ${(project.revenue / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Margin</p>
                  <p
                    className={`font-medium ${
                      project.margin >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {project.margin}%
                  </p>
                </div>
              </div>

              {/* Deadline */}
              {project.deadline && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Due {new Date(project.deadline).toLocaleDateString('th-TH')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {projects?.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-1">
              No projects yet
            </h3>
            <p className="text-slate-500">
              Create your first project to get started
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
