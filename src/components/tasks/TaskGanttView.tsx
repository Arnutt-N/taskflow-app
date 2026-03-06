'use client';

import { Task } from '@/types';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useMemo, useState } from 'react';

interface TaskGanttViewProps {
    tasks: Task[];
    projects: { id: string, name: string }[];
}

export const TaskGanttView = ({ tasks, projects }: TaskGanttViewProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

    const ganttTasks: GanttTask[] = useMemo(() => {
        if (!tasks || tasks.length === 0) return [];

        let count = 0;
        return tasks
            .filter(t => t.createdAt && t.dueDate) // Need actual dates for Gantt
            .map(task => {
                const start = new Date(task.createdAt!);
                const end = new Date(task.dueDate!);

                // Ensure end > start to avoid errors
                if (end <= start) {
                    end.setDate(start.getDate() + 1);
                }

                let progress = 0;
                if (task.status === 'Done') progress = 100;
                else if (task.status === 'Review') progress = 90;
                else if (task.status === 'In Progress') progress = 50;
                else if (task.status === 'Planning') progress = 10;

                let styles = { progressColor: '#6366f1', progressSelectedColor: '#4f46e5' };
                if (task.status === 'Done') {
                    styles = { progressColor: '#10b981', progressSelectedColor: '#059669' };
                } else if (task.priority === 'Critical') {
                    styles = { progressColor: '#f43f5e', progressSelectedColor: '#e11d48' };
                }

                const project = projects.find(p => p.id === task.projectId);

                return {
                    start,
                    end,
                    name: task.title,
                    id: task.id,
                    type: 'task',
                    progress,
                    isDisabled: true,
                    styles,
                    project: project?.name || 'Unknown',
                } as GanttTask;
            });
    }, [tasks, projects]);

    if (ganttTasks.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                <p className="text-slate-500 font-medium">No tasks with due dates found for Gantt Chart</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-250px)] min-h-[600px]">
            <div className="flex items-center gap-2 mb-4 justify-end">
                <span className="text-sm font-medium text-slate-500">View format:</span>
                <select
                    className="text-sm border-slate-200 rounded-md py-1 px-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value as ViewMode)}
                >
                    <option value={ViewMode.Day}>Day</option>
                    <option value={ViewMode.Week}>Week</option>
                    <option value={ViewMode.Month}>Month</option>
                </select>
            </div>

            <div className="flex-1 overflow-auto border border-slate-100 rounded-lg pb-10">
                <Gantt
                    tasks={ganttTasks}
                    viewMode={viewMode}
                    listCellWidth={!window.matchMedia('(max-width: 768px)').matches ? '155px' : ''}
                    columnWidth={!window.matchMedia('(max-width: 768px)').matches ? 60 : 40}
                />
            </div>
        </div>
    );
};
