'use client';

import React, { useMemo, useState } from 'react';
import { Project } from '@/types';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Search, Filter, Calendar as CalendarIcon, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';

interface ProjectGanttViewProps {
    projects: Project[];
    onProjectClick: (projectId: string) => void;
}

export const ProjectGanttView = ({ projects, onProjectClick }: ProjectGanttViewProps) => {
    const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Month);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const statuses = ['All', 'In Progress', 'Planning', 'Completed', 'Todo'];

    const filteredProjects = useMemo(() => {
        let result = projects.filter(p => p.deadline); // Only projects with deadlines
        
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(
                p => p.name.toLowerCase().includes(lowerSearch) || p.team.toLowerCase().includes(lowerSearch)
            );
        }

        if (statusFilter !== 'All') {
            result = result.filter(p => p.status === statusFilter);
        }

        return result;
    }, [projects, search, statusFilter]);

    const ganttTasks: GanttTask[] = useMemo(() => {
        if (!filteredProjects || filteredProjects.length === 0) return [];

        return filteredProjects.map((project: Project) => {
            const end = new Date(project.deadline);
            // Fallback start date if not present: 30 days prior to deadline
            const start = new Date(project.deadline);
            start.setDate(end.getDate() - 30);

            // Styling based on status
            let progressColor = '#6366f1'; // Indigo 500
            let progressSelectedColor = '#4f46e5'; // Indigo 600
            let backgroundColor = '#e0e7ff'; // Indigo 100
            let backgroundSelectedColor = '#c7d2fe'; // Indigo 200

            if (project.status === 'Completed' || project.status === 'DONE' as any) {
                progressColor = '#10b981'; // Emerald 500
                progressSelectedColor = '#059669'; // Emerald 600
                backgroundColor = '#d1fae5'; // Emerald 100
                backgroundSelectedColor = '#a7f3d0'; // Emerald 200
            } else if (project.status === 'Todo' || project.status === 'TODO' as any) {
                progressColor = '#f59e0b'; // Amber 500
                progressSelectedColor = '#d97706'; // Amber 600
                backgroundColor = '#fef3c7'; // Amber 100
                backgroundSelectedColor = '#fde68a'; // Amber 200
            } else if (project.status === 'Planning') {
                progressColor = '#64748b'; // Slate 500
                progressSelectedColor = '#475569'; // Slate 600
                backgroundColor = '#f1f5f9'; // Slate 100
                backgroundSelectedColor = '#e2e8f0'; // Slate 200
            }

            return {
                start,
                end,
                name: project.name,
                id: project.id,
                type: 'project',
                progress: project.progress,
                isDisabled: false, // Made non-disabled for interactions
                styles: { 
                    progressColor, 
                    progressSelectedColor,
                    backgroundColor,
                    backgroundSelectedColor
                },
                project: project.team || 'No Team',
            } as GanttTask;
        });
    }, [filteredProjects]);

    const handleTaskChange = (task: GanttTask) => {
        // In a real app, this would dispatch an update to the backend
        console.log("Task changed:", task);
    };

    const handleProgressChange = (task: GanttTask) => {
        // In a real app, this would dispatch an update to the backend
        console.log("Progress changed:", task);
    };

    const handleDblClick = (task: GanttTask) => {
        onProjectClick(task.id);
    };

    // Custom Tooltip for Gantt
    const CustomTooltip = ({ task, fontSize, fontFamily }: { task: GanttTask, fontSize: string, fontFamily: string }) => {
        const project = filteredProjects.find((p: Project) => p.id === task.id);
        if (!project) return null;
        
        return (
            <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-sm w-64 border border-slate-700 z-50">
                <div className="font-bold mb-1 line-clamp-2">{task.name}</div>
                <div className="flex justify-between items-center text-xs text-slate-300 mb-2 pb-2 border-b border-slate-700">
                    <span>{project.team}</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-300 font-medium">{project.status}</span>
                </div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Start:</span>
                        <span>{task.start.toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-400">End:</span>
                        <span>{task.end.toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                        <span className="text-slate-400">Progress:</span>
                        <span className="font-bold text-white">{task.progress}%</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-250px)] min-h-[600px] space-y-4 animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Find projects..."
                            className="w-full pl-9 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative flex items-center gap-2 border border-slate-200 rounded-lg px-3 h-10 bg-slate-50 shrink-0">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <select
                            className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium h-full"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-full sm:w-auto justify-end overflow-x-auto">
                    <button
                        onClick={() => setViewMode(ViewMode.Day)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${viewMode === ViewMode.Day ? 'bg-white text-indigo-700 shadow border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                        <ZoomIn className="w-3.5 h-3.5" /> Day
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Week)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${viewMode === ViewMode.Week ? 'bg-white text-indigo-700 shadow border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                        <CalendarIcon className="w-3.5 h-3.5" /> Week
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Month)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${viewMode === ViewMode.Month ? 'bg-white text-indigo-700 shadow border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                        <ZoomOut className="w-3.5 h-3.5" /> Month
                    </button>
                    <button
                        onClick={() => setViewMode(ViewMode.Year)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all ${viewMode === ViewMode.Year ? 'bg-white text-indigo-700 shadow border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}`}
                    >
                        <Maximize2 className="w-3.5 h-3.5" /> Year
                    </button>
                </div>
            </div>

            {/* Gantt Area */}
            {ganttTasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 border-dashed">
                    <CalendarIcon className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 font-medium text-lg">No projects match criteria</p>
                    <p className="text-slate-400 text-sm mt-1">Try adjusting your filters or search terms</p>
                </div>
            ) : (
                <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-auto flex-1 custom-scrollbar">
                        <Gantt
                            tasks={ganttTasks}
                            viewMode={viewMode}
                            onDateChange={handleTaskChange}
                            onProgressChange={handleProgressChange}
                            onDoubleClick={handleDblClick}
                            listCellWidth={typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches ? '155px' : ''}
                            columnWidth={typeof window !== 'undefined' && !window.matchMedia('(max-width: 768px)').matches ? 65 : 45}
                            TooltipContent={CustomTooltip}
                            rowHeight={50}
                            barFill={70}
                            barCornerRadius={6}
                        />
                    </div>
                </div>
            )}
            
            {/* Custom CSS overrides for gantt-task-react to make it look premium */}
            <style dangerouslySetInnerHTML={{__html: `
                .gantt-container {
                    font-family: inherit !important;
                }
                .gantt .gridHeader {
                    fill: #f8fafc !important;
                }
                .gantt .gridRow:nth-child(even) {
                    fill: #f8fafc !important;
                }
                .gantt .gridRow:nth-child(odd) {
                    fill: #ffffff !important;
                }
                .gantt .gridRowLine {
                    stroke: #f1f5f9 !important;
                }
                .gantt .gridTick {
                    stroke: #e2e8f0 !important;
                }
                .gantt .calendarHeader {
                    font-weight: 600 !important;
                    fill: #475569 !important;
                }
                .gantt .calendarBottomText {
                    fill: #64748b !important;
                    font-size: 11px !important;
                }
                .gantt .calendarTopText {
                    fill: #334155 !important;
                    font-weight: 600 !important;
                }
                .gantt-task-info {
                    border-right: 1px solid #e2e8f0 !important;
                    background: #ffffff !important;
                }
                .gantt-task-info-content {
                    font-weight: 600 !important;
                    color: #334155 !important;
                    font-size: 13px !important;
                }
            `}} />
        </div>
    );
};
