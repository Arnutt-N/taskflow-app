'use client';

import { Project, Task } from '@/types';
import { AlertCircle, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface AtRiskProjectsProps {
  projects: Project[];
  tasks: Task[];
}

export const AtRiskProjects = ({ projects, tasks }: AtRiskProjectsProps) => {
  const router = useRouter();

  // Find projects that are active and have low progress vs time remaining
  const riskyProjects = useMemo(() => {
    const active = projects.filter(p => p.status === 'In Progress');
    
    return active.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id);
      const totalTasks = pTasks.length;
      const doneTasks = pTasks.filter(t => ['Done', 'Completed'].includes(t.status)).length;
      
      // Calculate real progress based on tasks if available, fallback to project.progress
      const calcProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : p.progress;

      // Calculate days until deadline
      const diff = new Date(p.deadline).getTime() - new Date().getTime();
      const daysLeft = Math.ceil(diff / (1000 * 3600 * 24));
      
      // Risk Score heuristic:
      // High risk if days < 7 and progress < 80%
      // Critical risk if days < 3 and progress < 90%
      // Very high if overdue and not 100%
      
      let riskLevel = 'none';
      if (daysLeft < 0 && calcProgress < 100) riskLevel = 'critical';
      else if (daysLeft <= 3 && calcProgress < 90) riskLevel = 'high';
      else if (daysLeft <= 7 && calcProgress < 75) riskLevel = 'medium';
      else if (daysLeft <= 14 && calcProgress < 50) riskLevel = 'low';

      return {
        ...p,
        calcProgress,
        daysLeft,
        riskLevel
      };
    })
    .filter(p => p.riskLevel !== 'none')
    .sort((a, b) => a.daysLeft - b.daysLeft) // Most urgent first
    .slice(0, 4); // Show top 4
  }, [projects, tasks]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-rose-50 border-rose-200 text-rose-700';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'medium': return 'bg-amber-50 border-amber-200 text-amber-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'Overdue / Critical';
      case 'high': return 'High Risk';
      case 'medium': return 'Warning';
      default: return 'Needs Attention';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            At-Risk Projects
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">โปรเจกต์ที่อาจล่าช้ากว่ากำหนด</p>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {riskyProjects.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 bg-emerald-50/30 rounded-xl border border-dashed border-emerald-200">
            <p className="text-sm font-medium text-emerald-600">ยอดเยี่ยม!</p>
            <p className="text-xs mt-1 text-emerald-500">ทุกโปรเจกต์ทำงานได้ตามเป้าหมาย</p>
          </div>
        ) : (
          riskyProjects.map(project => (
            <div 
              key={project.id} 
              onClick={() => router.push('/projects')}
              className={`p-4 rounded-xl border transition-all flex flex-col gap-3 group bg-white cursor-pointer hover:shadow-md ${getRiskColor(project.riskLevel)}`}
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {getRiskLabel(project.riskLevel)}
                    </span>
                    <span className="text-xs font-bold font-mono">
                      {project.daysLeft < 0 ? `${Math.abs(project.daysLeft)}d Overdue` : `${project.daysLeft}d left`}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm tracking-tight line-clamp-1">{project.name}</h4>
                </div>
              </div>

              <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                <div className="flex justify-between text-[10px] font-bold opacity-80">
                  <span>Progress</span>
                  <span>{project.calcProgress}%</span>
                </div>
                <div className="w-full bg-white/50 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-current rounded-full transition-all duration-700" 
                    style={{ width: `${project.calcProgress}%` }} 
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <button 
        onClick={() => router.push('/projects')}
        className="mt-4 w-full py-2.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1"
      >
        View Projects <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
};
