'use client';

import { LayoutDashboard, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Stats } from '@/types';

interface OperationalHealthProps {
  stats: Stats;
  onViewTasks: () => void;
}

export const OperationalHealth = ({ 
  stats,
  onViewTasks
}: OperationalHealthProps) => {
  const totalTasks = stats.tasks?.total || 0;
  const doneTasks = stats.tasks?.done || 0;
  const inProgressTasks = stats.tasks?.inProgress || 0;
  const todoTasks = stats.tasks?.todo || 0;
  const reviewTasks = stats.tasks?.review || 0;
  const planningTasks = stats.tasks?.planning || 0;
  const router = useRouter();

  const getPercent = (count: number) => totalTasks > 0 ? (count / totalTasks) * 100 : 0;
  
  const donePercent = getPercent(doneTasks);
  const reviewPercent = getPercent(reviewTasks);
  const inProgressPercent = getPercent(inProgressTasks);
  const planningPercent = getPercent(planningTasks);
  const todoPercent = getPercent(todoTasks);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-indigo-500" />
          Operational Health
        </h3>
        <p className="text-slate-400 text-sm mt-0.5">ภาพรวมสถานะงานสำหรับทีมปฏิบัติการ</p>
      </div>

      <div className="flex items-end gap-2 mb-3">
        <span className="text-4xl font-black text-slate-800 tracking-tight">{totalTasks}</span>
        <span className="text-sm font-medium text-slate-400 mb-1.5">Total Tasks ใน scope</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-6 flex overflow-hidden">
        <div className="bg-amber-400 h-full transition-all duration-1000" style={{ width: `${todoPercent}%` }} title={`Todo: ${todoTasks}`} />
        <div className="bg-violet-400 h-full transition-all duration-1000" style={{ width: `${planningPercent}%` }} title={`Planning: ${planningTasks}`} />
        <div className="bg-indigo-400 h-full transition-all duration-1000" style={{ width: `${inProgressPercent}%` }} title={`Doing: ${inProgressTasks}`} />
        <div className="bg-blue-400 h-full transition-all duration-1000" style={{ width: `${reviewPercent}%` }} title={`Review: ${reviewTasks}`} />
        <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${donePercent}%` }} title={`Done: ${doneTasks}`} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-2 mb-6 flex-1">
        <button onClick={() => router.push('/tasks')} className="bg-slate-50 hover:bg-amber-50 rounded-xl p-2 cursor-pointer transition-colors border border-slate-100 group text-center flex flex-col items-center justify-center">
          <div className="text-xl font-black text-amber-500 group-hover:scale-110 transition-transform">{todoTasks}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Todo</div>
        </button>
        <button onClick={() => router.push('/tasks')} className="bg-slate-50 hover:bg-violet-50 rounded-xl p-2 cursor-pointer transition-colors border border-slate-100 group text-center flex flex-col items-center justify-center">
          <div className="text-xl font-black text-violet-500 group-hover:scale-110 transition-transform">{planningTasks}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Planning</div>
        </button>
        <button onClick={() => router.push('/tasks')} className="bg-slate-50 hover:bg-indigo-50 rounded-xl p-2 cursor-pointer transition-colors border border-slate-100 group text-center flex flex-col items-center justify-center">
          <div className="text-xl font-black text-indigo-500 group-hover:scale-110 transition-transform">{inProgressTasks}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Doing</div>
        </button>
        <button onClick={() => router.push('/tasks')} className="bg-slate-50 hover:bg-blue-50 rounded-xl p-2 cursor-pointer transition-colors border border-slate-100 group text-center flex flex-col items-center justify-center">
          <div className="text-xl font-black text-blue-500 group-hover:scale-110 transition-transform">{reviewTasks}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Review</div>
        </button>
        <button onClick={() => router.push('/tasks')} className="bg-slate-50 hover:bg-emerald-50 rounded-xl p-2 cursor-pointer transition-colors border border-slate-100 group text-center flex flex-col items-center justify-center">
          <div className="text-xl font-black text-emerald-600 group-hover:scale-110 transition-transform">{doneTasks}</div>
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Done</div>
        </button>
      </div>

      {/* Quick Action */}
      <button 
        onClick={onViewTasks}
        className="mt-4 w-full py-2.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1"
      >
        View Tasks <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
};
