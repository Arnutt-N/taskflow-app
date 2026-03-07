'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Task } from '@/types';
import { StatCard } from './StatCard';
import { ProjectPerformanceChart } from './ProjectPerformanceChart';
import { OperationalHealth } from './OperationalHealth';
import { MyUrgentTasks } from './MyUrgentTasks';
import { AtRiskProjects } from './AtRiskProjects';
import { Wallet, TrendingUp, PieChart, Target } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';

interface DashboardClientProps {
  projects: Project[];
  tasks: Task[];
  userName: string;
}

export const DashboardClient = ({ projects, tasks, userName }: DashboardClientProps) => {

  const router = useRouter();

  const stats = useMemo(() => {
    const totalCost = projects.reduce((acc, curr) => acc + (curr.budget || 0), 0);
    const totalRevenue = projects.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalProfit = totalRevenue - totalCost;
    const margin = totalRevenue ? Math.round((totalProfit / totalRevenue) * 100) : 0;
    
    // Overall Progress (average of all active projects)
    const activeProjects = projects.filter(p => p.status === 'In Progress');
    const overallProgress = activeProjects.length > 0 
      ? Math.round(activeProjects.reduce((acc, p) => acc + p.progress, 0) / activeProjects.length)
      : 0;

    return {
      totalCost,
      totalRevenue,
      totalProfit,
      margin,
      overallProgress,
      tasks: {
        total: tasks.length,
        done: tasks.filter(t => ['Done', 'Completed'].includes(t.status)).length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        review: tasks.filter(t => t.status === 'Review').length,
        todo: tasks.filter(t => t.status === 'Todo').length,
        planning: tasks.filter(t => t.status === 'Planning').length,
      }
    };
  }, [projects, tasks]);

  const maxRevenue = useMemo(() => {
    if (projects.length === 0) return 1;
    return Math.max(...projects.map(p => p.revenue || 0), 1);
  }, [projects]);

  return (
    <div className="space-y-8 animate-in max-w-screen-2xl mx-auto pb-10 px-2 sm:px-6">
      
      {/* ── 1. Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Welcome back, {userName.split(' ')[0]} 👋
          </h2>
          <p className="text-slate-500 text-sm">
            Executive & Operations Overview — Here is what's happening today.
          </p>
          <div className="flex items-center gap-3 mt-4">
            <Link href="/projects" className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors">
              Manage Projects
            </Link>
            <Link href="/tasks" className="text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors">
              View Tasks
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Aggregate Net Profit</p>
            <p className="text-2xl font-black text-slate-800 leading-none tracking-tight">฿{formatNumber(stats.totalProfit)}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── 2. KPI Cards (Executive View) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          label="Total Cost" 
          value={`฿${formatNumber(stats.totalCost)}`} 
          subtext="ต้นทุนและค่าใช้จ่ายรวม"
          icon={PieChart} 
          onClick={() => router.push('/projects')}
        />
        <StatCard 
          label="Total Revenue" 
          value={`฿${formatNumber(stats.totalRevenue)}`}
          subtext="รายได้จากโปรเจกต์ทั้งหมด" 
          icon={TrendingUp} 
          onClick={() => router.push('/projects')}
        />
        <StatCard 
          label="Net Profit" 
          value={`฿${formatNumber(stats.totalProfit)}`}
          subtext="กำไรสุทธิโดยรวม" 
          trend={stats.margin} 
          icon={Wallet} 
          onClick={() => router.push('/projects')}
          active 
        />
        <StatCard 
          label="Active Progress" 
          value={`${stats.overallProgress}%`}
          subtext="ความคืบหน้าเฉลี่ยโปรเจกต์ที่ดำเนินอยู่" 
          icon={Target} 
          onClick={() => router.push('/projects')}
        />
      </div>

      {/* ── 3. Main Content Area ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
        
        {/* Left Column: Project Performance (60%) */}
        <div className="xl:col-span-3">
          <ProjectPerformanceChart projects={projects} maxRevenue={maxRevenue} />
        </div>
        
        {/* Right Column: Health & Actionable Insights (40%) */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <OperationalHealth 
            stats={{
              totalCost: stats.totalCost,
              totalRevenue: stats.totalRevenue,
              totalProfit: stats.totalProfit,
              tasks: stats.tasks
            }}
            onViewTasks={() => router.push('/tasks')}
          />
          <MyUrgentTasks tasks={tasks} userName={userName} />
          <AtRiskProjects projects={projects} tasks={tasks} />
        </div>
      </div>
    </div>
  );
};
