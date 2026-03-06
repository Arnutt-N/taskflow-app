'use client';

import { Project } from '@/types';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { useMemo, useState } from 'react';

interface ProjectGanttViewProps {
    projects: Project[];
    onProjectClick: (projectId: string) => void;
}

export const ProjectGanttView = ({ projects, onProjectClick }: ProjectGanttViewProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);

    const ganttTasks: GanttTask[] = useMemo(() => {
        if (!projects || projects.length === 0) return [];

        return projects
            .filter(p => p.deadline)
            .map(project => {
                const end = new Date(project.deadline);
                // Fallback start date if not present: 30 days prior to deadline
                const start = new Date(project.deadline);
                start.setDate(end.getDate() - 30);

                let styles = { progressColor: '#6366f1', progressSelectedColor: '#4f46e5' };
                if (project.status === 'Completed' || project.status === 'DONE' as any) {
                    styles = { progressColor: '#10b981', progressSelectedColor: '#059669' };
                }

                return {
                    start,
                    end,
                    name: project.name,
                    id: project.id,
                    type: 'project',
                    progress: project.progress,
                    isDisabled: true,
                    styles,
                    project: project.team || 'No Team',
                } as GanttTask;
            });
    }, [projects]);

    if (ganttTasks.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
                <p className="text-slate-500 font-medium">No projects with deadlines found for Gantt Chart</p>
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
