// components/projects/ProjectsView.tsx
'use client';

import { useState } from 'react';
import {
  LayoutGrid, TableProperties, CalendarDays, BarChartHorizontal, List
} from 'lucide-react';
import { ProjectKanbanView } from './ProjectKanbanView';
import { ProjectCalendarView } from './ProjectCalendarView';
import { ProjectGanttView } from './ProjectGanttView';
import { ProjectGridView } from './ProjectGridView';
import { ProjectTableView } from './ProjectTableView';
import { Project } from '@/types';

interface ProjectsViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
}

const formatNumber = (amount: number) =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);

export const ProjectsView = ({ projects, onProjectClick, selectedProjectId }: ProjectsViewProps) => {
  const [viewType, setViewType] = useState<'grid' | 'table' | 'kanban' | 'calendar' | 'gantt'>('grid');

  const views = [
    { key: 'grid',     label: 'Cards',    Icon: LayoutGrid },
    { key: 'table',    label: 'Table',    Icon: List },
    { key: 'kanban',   label: 'Kanban',   Icon: TableProperties },
    { key: 'gantt',    label: 'Gantt',    Icon: BarChartHorizontal },
    { key: 'calendar', label: 'Calendar', Icon: CalendarDays },
  ] as const;

  return (
    <div className="space-y-5 animate-in max-w-[1600px] mx-auto pb-10">
      {/* ── View Switcher ── */}
      <div className="flex justify-start">
        <div className="flex bg-slate-100 p-1.5 rounded-xl w-fit border border-slate-200 shadow-sm overflow-x-auto">
          {views.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setViewType(key)}
              className={`px-3 py-1.5 text-sm font-semibold rounded-lg flex items-center gap-2 transition-all duration-200 whitespace-nowrap
                ${viewType === key
                  ? 'bg-white text-indigo-700 shadow border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── View Content ── */}
      <div className="w-full">
        {viewType === 'grid'     && <ProjectGridView     projects={projects} onProjectClick={onProjectClick} selectedProjectId={selectedProjectId} />}
        {viewType === 'table'    && <ProjectTableView    projects={projects} onProjectClick={onProjectClick} selectedProjectId={selectedProjectId} />}
        {viewType === 'kanban'   && <ProjectKanbanView   projects={projects} onProjectClick={onProjectClick} />}
        {viewType === 'calendar' && <ProjectCalendarView projects={projects} onProjectClick={onProjectClick} />}
        {viewType === 'gantt'    && <ProjectGanttView    projects={projects} onProjectClick={onProjectClick} />}
      </div>
    </div>
  );
};
