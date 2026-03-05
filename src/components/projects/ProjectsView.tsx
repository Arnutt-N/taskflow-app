// components/projects/ProjectsView.tsx
'use client';

import { FolderKanban, Users, Clock, TrendingUp } from 'lucide-react';
import { StatusBadge } from '@/components/ui';
import { Project } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface ProjectsViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
}

export const ProjectsView = ({ projects, onProjectClick, selectedProjectId }: ProjectsViewProps) => (
  <div className="space-y-6 animate-in max-w-screen-2xl mx-auto pb-10">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Projects Portfolio</h2>
        <p className="text-slate-500 text-sm">ภาพรวมโปรเจกต์ทั้งหมด พร้อมสถานะและความคืบหน้า</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard 
          key={project.id}
          project={project}
          onClick={() => onProjectClick(project.id)}
          active={selectedProjectId === project.id}
        />
      ))}
    </div>
  </div>
);

// Project Card Component
interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  active: boolean;
}

const ProjectCard = ({ project, onClick, active }: ProjectCardProps) => {
  const profit = (project.revenue || 0) - (project.budget || 0);
  const margin = project.revenue ? Math.round((profit / project.revenue) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-clean border text-left transition-all hover:shadow-lg ${
        active ? 'border-indigo-200 ring-1 ring-indigo-50' : 'border-slate-100 hover:border-slate-200'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Users className="w-4 h-4" />
          <span>{project.team}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          <span>Deadline: {new Date(project.deadline).toLocaleDateString('th-TH')}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              project.progress === 100 ? 'bg-emerald-500' : 
              project.progress > 50 ? 'bg-indigo-500' : 'bg-amber-400'
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">Budget</p>
          <p className="text-sm font-bold text-slate-700">{formatCurrency(project.budget)}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Margin</p>
          </div>
          <p className={`text-sm font-bold ${margin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {margin >= 0 ? '+' : ''}{margin}%
          </p>
        </div>
      </div>
    </button>
  );
};
