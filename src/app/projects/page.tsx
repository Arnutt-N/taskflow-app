'use client';

import { useQuery } from '@tanstack/react-query';
import { Plus, Download, Upload } from 'lucide-react';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectsView } from '@/components/projects';
import { Project } from '@/types';

export default function ProjectsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const { data: rawProjects, isLoading, error } = useQuery<any[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      return res.json();
    },
  });

  // Map API response to Project type used by our views
  const projects: Project[] = (rawProjects || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    team: p.team || 'No Team',
    status: mapStatus(p.status),
    deadline: p.deadline,
    progress: p.progress,
    budget: parseFloat(p.budget) || 0,
    revenue: parseFloat(p.revenue) || 0,
    priority: 'Medium',
    description: p.description || '',
  }));

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

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          <div className="bg-rose-50 text-rose-700 border border-rose-200 rounded-xl p-6 inline-block">
            <p className="font-semibold">Failed to load projects</p>
            <p className="text-sm mt-1 text-rose-600">{(error as Error).message}</p>
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
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm text-sm font-medium">
              <Upload className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Import</span>
            </button>
            <button className="inline-flex items-center px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm text-sm font-medium">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm font-medium">
              <Plus className="w-4 h-4 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>

        {/* Projects View */}
        {projects.length > 0 ? (
          <ProjectsView
            projects={projects}
            onProjectClick={(id) => setSelectedProjectId(id)}
            selectedProjectId={selectedProjectId}
          />
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">No projects yet</h3>
            <p className="text-slate-500 text-sm">Create your first project to get started</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Map DB enum values to our Project type status
function mapStatus(dbStatus: string): Project['status'] {
  const map: Record<string, Project['status']> = {
    'TODO': 'Todo',
    'IN_PROGRESS': 'In Progress',
    'REVIEW': 'In Progress',  // Maps review to In Progress for display
    'DONE': 'Completed',
    'CANCELLED': 'Completed',
    'PLANNING': 'Planning',
  };
  return map[dbStatus] || 'Todo';
}
