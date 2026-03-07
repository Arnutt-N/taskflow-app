'use client';

import { Task } from '@/types';
import { StatusBadge } from '@/components/ui';
import { Calendar, UserCircle, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MyUrgentTasksProps {
  tasks: Task[];
  userName: string;
}

export const MyUrgentTasks = ({ tasks, userName }: MyUrgentTasksProps) => {
  const router = useRouter();
  
  // Filter for logged in user's tasks
  const myTasks = tasks.filter(t => t.assignee === userName || t.assignee.includes(userName.split(' ')[0]));
  
  // Filter for incomplete urgent tasks (High, Critical, or due soon)
  const urgentTasks = myTasks
    .filter(t => !['Done', 'Completed'].includes(t.status))
    .filter(t => {
      // Prioritize High/Critical
      if (['High', 'Critical'].includes(t.priority)) return true;
      
      // Prioritize upcoming deadlines (next 3 days)
      if (t.dueDate) {
        const diff = new Date(t.dueDate).getTime() - new Date().getTime();
        const days = diff / (1000 * 3600 * 24);
        if (days <= 3) return true;
      }
      return false;
    })
    .slice(0, 5); // Take top 5

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-indigo-500" />
            My Urgent Tasks
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">งานด่วนที่มอบหมายให้คุณ</p>
        </div>
        <span className="px-2 py-1 bg-rose-50 text-rose-600 font-bold text-xs rounded-full">
          {urgentTasks.length} Urgent
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {urgentTasks.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <p className="text-sm font-medium text-slate-500">เยี่ยมมาก! ไม่มีงานด่วนค้างอยู่</p>
            <p className="text-xs mt-1">Check "All Tasks" for other assignments.</p>
          </div>
        ) : (
          urgentTasks.map(task => (
            <div key={task.id} className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group bg-white">
              <div className="flex justify-between items-start mb-2 gap-4">
                <h4 className="font-bold text-sm text-slate-800 line-clamp-2 max-w-[70%] group-hover:text-indigo-600 transition-colors">
                  {task.title}
                </h4>
                <div className="shrink-0 flex flex-col gap-1 items-end">
                  <StatusBadge status={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs">
                {task.dueDate ? (
                  <div className={`flex items-center gap-1.5 font-medium ${
                    new Date(task.dueDate).getTime() < new Date().getTime() 
                      ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md' 
                      : 'text-slate-500'
                  }`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                ) : (
                  <span className="text-slate-400">No deadline</span>
                )}
                {/* Task Details Action Removed for cleaner look */}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Action */}
      <button 
        onClick={() => router.push('/tasks')}
        className="mt-4 w-full py-2.5 text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors flex items-center justify-center gap-1"
      >
        View Tasks <ArrowUpRight className="w-3 h-3" />
      </button>
    </div>
  );
};
