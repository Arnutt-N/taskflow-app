'use client';

import { Task } from '@/types';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useMemo, useState, useCallback } from 'react';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

interface TaskGanttViewProps {
  tasks: Task[];
  projects: { id: string; name: string }[];
}

const statusProgress: Record<string, number> = {
  Done: 100,
  Completed: 100,
  Review: 85,
  'In Progress': 50,
  Planning: 15,
  Todo: 0,
};

const statusColor: Record<string, { bar: string; selected: string }> = {
  Done:        { bar: '#10b981', selected: '#059669' },
  Completed:   { bar: '#10b981', selected: '#059669' },
  Review:      { bar: '#8b5cf6', selected: '#7c3aed' },
  'In Progress': { bar: '#6366f1', selected: '#4f46e5' },
  Planning:    { bar: '#60a5fa', selected: '#3b82f6' },
  Todo:        { bar: '#94a3b8', selected: '#64748b' },
};

const VIEW_OPTIONS = [
  { mode: ViewMode.Day,   label: 'Day',   icon: Calendar,       colWidth: 40 },
  { mode: ViewMode.Week,  label: 'Week',  icon: CalendarDays,   colWidth: 120 },
  { mode: ViewMode.Month, label: 'Month', icon: CalendarRange,  colWidth: 200 },
];

export const TaskGanttView = ({ tasks, projects }: TaskGanttViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);

  const ganttTasks: GanttTask[] = useMemo(() => {
    if (!tasks?.length) return [];

    return tasks
      .filter(t => t.createdAt && t.dueDate)
      .map(task => {
        const start = new Date(task.createdAt!);
        const end = new Date(task.dueDate!);
        if (end <= start) end.setDate(start.getDate() + 1);

        const progress = statusProgress[task.status] ?? 0;
        const col = statusColor[task.status] ?? statusColor.Todo;

        const project = projects.find(p => p.id === task.projectId);

        return {
          start,
          end,
          name: task.title,
          id: task.id,
          type: 'task' as const,
          progress,
          isDisabled: false,
          project: project?.name,
          styles: {
            progressColor: col.bar,
            progressSelectedColor: col.selected,
            backgroundColor: col.bar + '33',
            backgroundSelectedColor: col.bar + '66',
          },
        } satisfies GanttTask;
      });
  }, [tasks, projects]);

  const currentView = VIEW_OPTIONS.find(v => v.mode === viewMode) ?? VIEW_OPTIONS[1];

  // Legend data
  const legend = [
    { label: 'Done',         color: '#10b981' },
    { label: 'Review',       color: '#8b5cf6' },
    { label: 'In Progress',  color: '#6366f1' },
    { label: 'Planning',     color: '#60a5fa' },
    { label: 'Todo',         color: '#94a3b8' },
  ];

  if (ganttTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 text-center">
        <CalendarRange className="w-12 h-12 text-slate-200 mb-4" />
        <p className="text-slate-500 font-semibold">No tasks with due dates</p>
        <p className="text-slate-400 text-sm mt-1">Set a due date on tasks to see the Gantt chart</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-230px)] min-h-[600px]">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-bold text-slate-700">Timeline</h3>
          <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
            {ganttTasks.length} tasks
          </span>
        </div>

        {/* Zoom buttons */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {VIEW_OPTIONS.map(opt => {
            const Icon = opt.icon;
            const active = viewMode === opt.mode;
            return (
              <button
                key={opt.mode}
                onClick={() => setViewMode(opt.mode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center gap-3">
          {legend.map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        className="flex-1 overflow-auto sidebar-scroll"
        style={{ fontFamily: 'var(--font-noto-sans-thai), sans-serif' }}
      >
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          listCellWidth="180px"
          columnWidth={currentView.colWidth}
          rowHeight={44}
          headerHeight={52}
          fontSize="12px"
          ganttHeight={0}
          todayColor="rgba(99,102,241,0.08)"
        />
      </div>
    </div>
  );
};
