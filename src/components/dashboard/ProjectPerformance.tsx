// components/dashboard/ProjectPerformance.tsx
'use client';

import { BarChart3 } from 'lucide-react';
import { ChartBar } from '@/components/ui';
import { Project } from '@/types';

interface ProjectPerformanceProps {
  projects: Project[];
  selectedProjectId: string | null;
  maxRevenue: number;
  onProjectClick: (projectId: string) => void;
}

export const ProjectPerformance = ({ 
  projects, 
  selectedProjectId, 
  maxRevenue, 
  onProjectClick 
}: ProjectPerformanceProps) => (
  <div className="xl:col-span-2 bg-white rounded-2xl p-6 shadow-clean border border-slate-100 flex flex-col">
    <div className="flex justify-between items-center mb-8">
      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-indigo-600"/> Project Performance
      </h3>
      <div className="flex items-center gap-4 text-xs font-medium">
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Cost</div>
         <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Revenue</div>
      </div>
    </div>
    <div className="flex-1 space-y-2">
      {projects.map(p => (
        <ChartBar 
          key={p.id}
          label={p.name}
          value1={p.budget}
          value2={p.revenue}
          max={maxRevenue}
          onClick={() => onProjectClick(p.id)}
          active={selectedProjectId === p.id}
        />
      ))}
    </div>
  </div>
);
