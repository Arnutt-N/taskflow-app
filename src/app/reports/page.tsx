'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart3, CheckCircle2, AlertTriangle, TrendingUp, Clock, Loader2, Target, Coins, FolderKanban, Activity } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

interface ReportData {
  taskMetrics: { totalTasks: number; doneTasks: number; overdueTasks: number; completionRate: number };
  byPriority: Record<string, number>;
  byStatus: Record<string, number>;
  financials: { totalBudget: number; totalRevenue: number; profit: number; profitableProjects: number };
  projectHealth: { total: number; healthy: number; atRisk: number };
  weeklyTrend: { week: string; created: number; done: number }[];
  recentActivity: { id: string; action: string; entityType: string; createdAt: string; user: { name: string } }[];
}

const PRIORITY_COLORS: Record<string, string> = {
  Critical: 'bg-rose-500',
  High: 'bg-orange-400',
  Medium: 'bg-blue-400',
  Low: 'bg-slate-300',
};

const STATUS_COLORS: Record<string, string> = {
  Todo: 'bg-slate-300',
  Planning: 'bg-blue-400',
  'In Progress': 'bg-indigo-500',
  Review: 'bg-violet-500',
  Done: 'bg-emerald-500',
};

function formatTHB(n: number) {
  return `฿${new Intl.NumberFormat('th-TH').format(Math.round(n))}`;
}

function MetricCard({ label, value, subtext, icon: Icon, color = 'text-indigo-500', bg = 'bg-indigo-50' }: {
  label: string; value: string | number; subtext?: string; icon: React.ElementType; color?: string; bg?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 mb-0.5">{label}</p>
        <p className="text-2xl font-black text-slate-800 tracking-tight leading-none">{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { data, isLoading } = useQuery<ReportData>({
    queryKey: ['reports'],
    queryFn: () => fetch('/api/reports').then(r => r.json()),
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) return null;

  const maxTrend = Math.max(...data.weeklyTrend.map(w => w.created), 1);

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" /> Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time project & task performance metrics</p>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="Completion Rate"
            value={`${data.taskMetrics.completionRate}%`}
            subtext={`${data.taskMetrics.doneTasks} of ${data.taskMetrics.totalTasks} tasks done`}
            icon={Target}
            color="text-emerald-600" bg="bg-emerald-50"
          />
          <MetricCard
            label="Overdue Tasks"
            value={data.taskMetrics.overdueTasks}
            subtext="Tasks past due date"
            icon={AlertTriangle}
            color="text-rose-500" bg="bg-rose-50"
          />
          <MetricCard
            label="Net Profit"
            value={formatTHB(data.financials.profit)}
            subtext={`${data.financials.profitableProjects} profitable projects`}
            icon={Coins}
            color="text-amber-600" bg="bg-amber-50"
          />
          <MetricCard
            label="At-Risk Projects"
            value={data.projectHealth.atRisk}
            subtext={`of ${data.projectHealth.total} active projects`}
            icon={FolderKanban}
            color="text-orange-500" bg="bg-orange-50"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weekly Trend */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" /> Weekly Task Trend
            </h2>
            <p className="text-xs text-slate-400 mb-5">Tasks created vs completed over last 8 weeks</p>
            <div className="flex items-end gap-3 h-36">
              {data.weeklyTrend.map(w => (
                <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col gap-0.5 items-center justify-end" style={{ height: '100px' }}>
                    <div
                      className="w-full bg-indigo-200 rounded-t-md transition-all duration-500"
                      style={{ height: `${(w.created / maxTrend) * 90}px` }}
                      title={`Created: ${w.created}`}
                    />
                    <div
                      className="w-full bg-emerald-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${(w.done / maxTrend) * 90}px`, marginTop: '-4px' }}
                      title={`Done: ${w.done}`}
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">{w.week}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-200 rounded-sm" /> Created</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm" /> Completed</span>
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1">Priority Breakdown</h2>
            <p className="text-xs text-slate-400 mb-5">Tasks by urgency level</p>
            <div className="space-y-3">
              {Object.entries(data.byPriority).map(([priority, count]) => {
                const pct = data.taskMetrics.totalTasks > 0 ? Math.round((count / data.taskMetrics.totalTasks) * 100) : 0;
                return (
                  <div key={priority}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{priority}</span>
                      <span className="text-slate-400 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${PRIORITY_COLORS[priority] || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Task Status Distribution
            </h2>
            <p className="text-xs text-slate-400 mb-4">Current state of all tasks</p>
            <div className="space-y-3">
              {Object.entries(data.byStatus).map(([status, count]) => {
                const pct = data.taskMetrics.totalTasks > 0 ? Math.round((count / data.taskMetrics.totalTasks) * 100) : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-600 font-medium truncate">{status}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[status] || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-8 text-right font-mono">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
            <h2 className="font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-500" /> Recent Activity
            </h2>
            <p className="text-xs text-slate-400 mb-4">Latest system events</p>
            <div className="flex-1 space-y-3 overflow-y-auto sidebar-scroll max-h-56">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No recent activity</p>
              ) : (
                data.recentActivity.map(entry => (
                  <div key={entry.id} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold flex-shrink-0 mt-0.5">
                      {entry.user?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-700">{entry.user?.name}</span>
                      <span className="text-slate-500"> {entry.action.toLowerCase()}d a </span>
                      <span className="text-slate-600 font-medium">{entry.entityType.toLowerCase()}</span>
                    </div>
                    <span className="text-slate-300 text-[10px] whitespace-nowrap">
                      {new Date(entry.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
