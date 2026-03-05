// components/dashboard/OperationalHealth.tsx
'use client';

import { LayoutDashboard, ChevronRight, Plus } from 'lucide-react';
import { DonutChart } from '@/components/ui';
import { Stats } from '@/types';

interface OperationalHealthProps {
  stats: Stats;
  onViewTasks: () => void;
}

export const OperationalHealth = ({ stats, onViewTasks }: OperationalHealthProps) => {
  const chartData = [
    { label: 'Done', value: stats.tasks.done, color: '#10b981' }, 
    { label: 'In Progress', value: stats.tasks.inProgress, color: '#3b82f6' }, 
    { label: 'Todo', value: stats.tasks.todo, color: '#fbbf24' }, 
  ];

  return (
    <div className="xl:col-span-1 space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-clean border border-slate-100">
        <div>
          <h3 className="font-bold text-lg mb-1 text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-indigo-500" />
            Operational Health
          </h3>
          <p className="text-slate-400 text-sm mb-6">ภาพรวมสถานะงานสำหรับทีมปฏิบัติการ</p>
          
          <div className="flex items-end gap-2 mb-2">
            <span className="text-4xl font-bold text-slate-800">{stats.tasks.total}</span>
            <span className="text-sm text-slate-400 mb-1.5">Total Tasks</span>
          </div>
          
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6 flex overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ 
              width: `${stats.tasks.total > 0 ? (stats.tasks.done / stats.tasks.total) * 100 : 0}%` 
            }} />
            <div className="bg-amber-400 h-full" style={{ 
              width: `${stats.tasks.total > 0 ? (stats.tasks.todo / stats.tasks.total) * 100 : 0}%` 
            }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className="bg-slate-50 rounded-xl p-3 hover:bg-slate-100 border border-slate-100 text-left"
              onClick={onViewTasks}
            >
              <div className="text-2xl font-bold text-emerald-600">{stats.tasks.done}</div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Done</div>
            </button>
            <button
              type="button"
              className="bg-slate-50 rounded-xl p-3 hover:bg-slate-100 border border-slate-100 text-left"
              onClick={onViewTasks}
            >
              <div className="text-2xl font-bold text-amber-500">{stats.tasks.todo}</div>
              <div className="text-xs text-slate-400 uppercase font-semibold">Pending</div>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-clean border border-slate-100">
        <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Quick Actions</h4>
        <button
          type="button"
          onClick={onViewTasks}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors group mb-2 border border-slate-100"
        >
          <span className="text-sm font-medium">เปิดรายการงานทั้งหมด</span>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
        </button>
        
        <button
          type="button"
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors group border border-slate-100"
        >
          <span className="text-sm font-medium">สร้างรายงานสรุป (Coming soon)</span>
          <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
        </button>
      </div>
    </div>
  );
};
