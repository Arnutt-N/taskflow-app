'use client';

import { ArrowUpRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ProjectPerformanceChartProps {
  projects: { id: string; name: string; budget: number; revenue: number }[];
  maxRevenue: number;
}

export const ProjectPerformanceChart = ({ projects, maxRevenue }: ProjectPerformanceChartProps) => {
  const router = useRouter();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Project Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Budget vs Revenue comparison</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Cost / Budget
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Revenue
          </div>
        </div>
      </div>
      
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {projects.length === 0 && (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
            No active project financial data
          </div>
        )}
        
        {projects.map(p => {
          const p1 = Math.min(((p.budget || 0) / maxRevenue) * 100, 100);
          const p2 = Math.min(((p.revenue || 0) / maxRevenue) * 100, 100);
          
          return (
            <button
              key={p.id}
              onClick={() => router.push('/projects')}
              className="group cursor-pointer p-4 rounded-xl transition-all border border-slate-100 w-full text-left hover:bg-slate-50 hover:border-slate-200"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {p.name}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="space-y-3 relative">
                <div className="flex items-center gap-3">
                  <div className="h-2 rounded-full bg-slate-100 w-full flex-1 overflow-hidden">
                    <div className="h-full bg-rose-400 rounded-full" style={{ width: `${p1}%` }} />
                  </div>
                   <span className="text-xs font-bold w-24 text-right text-slate-500" style={{ fontFamily: 'var(--font-noto-sans-thai), sans-serif' }}>
                    ฿{formatNumber(p.budget)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 rounded-full bg-slate-100 w-full flex-1 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-700" style={{ width: `${p2}%` }} />
                  </div>
                  <span className="text-xs font-bold w-24 text-right text-emerald-700" style={{ fontFamily: 'var(--font-noto-sans-thai), sans-serif' }}>
                    ฿{formatNumber(p.revenue)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
