// components/dashboard/DashboardView.tsx
'use client';

import { Wallet, Trash2 } from 'lucide-react';
import { KPICards, ProjectPerformance, OperationalHealth } from '.';
import { Project, Stats } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface DashboardViewProps {
  projects: Project[];
  stats: Stats;
  selectedProjectId: string | null;
  onProjectClick: (projectId: string) => void;
  onClearFilter: () => void;
  onViewTasks: () => void;
}

export const DashboardView = ({
  projects,
  stats,
  selectedProjectId,
  onProjectClick,
  onClearFilter,
  onViewTasks,
}: DashboardViewProps) => {
  const maxRevenue = Math.max(...projects.map(p => p.revenue || 0), 1);
  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="space-y-8 animate-in max-w-screen-2xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Executive & Operations Overview
          </h2>
          <p className="text-slate-500 text-sm">ภาพรวมการเงินสำหรับผู้บริหาร พร้อมรายละเอียดงานสำหรับทีมปฏิบัติการ</p>
          
          {selectedProjectId && selectedProject && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <button
                type="button"
                onClick={onClearFilter}
                className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                เคลียร์ตัวกรอง
              </button>
              <span className="truncate max-w-[260px]">
                โฟกัสที่: <span className="text-slate-700 font-medium">{selectedProject.name}</span>
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-slate-400 uppercase">Net Profit</p>
            <p className="text-lg font-bold text-slate-800">{formatCurrency(stats.totalProfit)}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Wallet className="w-5 h-5"/>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards stats={stats} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <ProjectPerformance 
          projects={projects}
          selectedProjectId={selectedProjectId}
          maxRevenue={maxRevenue}
          onProjectClick={onProjectClick}
        />
        <OperationalHealth 
          stats={stats}
          onViewTasks={onViewTasks}
        />
      </div>
    </div>
  );
};
