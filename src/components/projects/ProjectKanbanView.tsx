'use client';

import { Project } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { StatusBadge, Avatar } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Clock, TrendingUp, Users } from 'lucide-react';

interface ProjectKanbanViewProps {
    projects: Project[];
    onProjectStatusChange?: (projectId: string, newStatus: string) => void;
    onProjectClick: (projectId: string) => void;
}

const KANBAN_COLUMNS = [
    { id: 'Todo', title: 'To Do', color: 'bg-slate-100' },
    { id: 'Planning', title: 'Planning', color: 'bg-blue-50' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-indigo-50' },
    { id: 'Review', title: 'Review', color: 'bg-purple-50' },
    { id: 'Done', title: 'Done', color: 'bg-emerald-50' },
];

export const ProjectKanbanView = ({ projects, onProjectStatusChange, onProjectClick }: ProjectKanbanViewProps) => {
    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside a column
        if (!destination) return;

        // Dropped in the same column
        if (source.droppableId === destination.droppableId) return;

        // Status changed
        if (onProjectStatusChange) {
            onProjectStatusChange(draggableId, destination.droppableId);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 h-[calc(100vh-280px)] min-h-[500px]">
                {KANBAN_COLUMNS.map(col => {
                    const colProjects = projects.filter(p => p.status === col.id.toUpperCase().replace(' ', '_'));
                    // In DB enum it's 'IN_PROGRESS', 'TODO', 'DONE', etc. Or 'In Progress' if mapped.
                    // Wait, Project type says status: 'In Progress' | 'Planning' | 'Completed' | 'Todo'
                    // Let's filter by matching standard values
                    const normalizedFilter = col.id;

                    return (
                        <div key={col.id} className="flex-none w-80 flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden">
                            <div className={`px-4 py-3 font-semibold text-sm border-b border-slate-200/60 flex items-center justify-between ${col.color}`}>
                                <span className="text-slate-700">{col.title}</span>
                                <span className="bg-white/60 text-slate-500 text-xs py-0.5 px-2 rounded-full font-medium">
                                    {colProjects.length}
                                </span>
                            </div>

                            <Droppable droppableId={col.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 overflow-y-auto p-3 space-y-3 transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/30' : ''
                                            }`}
                                    >
                                        {colProjects.map((project, index) => {
                                            const profit = (project.revenue || 0) - (project.budget || 0);
                                            const margin = project.revenue ? Math.round((profit / project.revenue) * 100) : 0;

                                            return (
                                                <Draggable key={project.id} draggableId={project.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => onProjectClick(project.id)}
                                                            className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 transition-all cursor-pointer ${snapshot.isDragging ? 'shadow-md rotate-2 ring-2 ring-indigo-500/20' : 'hover:border-slate-300'
                                                                }`}
                                                        >
                                                            <h3 className="font-bold text-slate-800 mb-2 line-clamp-2 text-sm">{project.name}</h3>

                                                            <div className="space-y-2 mb-3">
                                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                    <Users className="w-3 h-3" />
                                                                    <span>{project.team}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                    <Clock className="w-3 h-3" />
                                                                    <span>{new Date(project.deadline).toLocaleDateString('th-TH')}</span>
                                                                </div>
                                                            </div>

                                                            <div className="mb-3">
                                                                <div className="flex justify-between text-[10px] mb-1">
                                                                    <span className="text-slate-500">Progress</span>
                                                                    <span className="font-semibold text-slate-700">{project.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-emerald-500' :
                                                                                project.progress > 50 ? 'bg-indigo-500' : 'bg-amber-400'
                                                                            }`}
                                                                        style={{ width: `${project.progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>

                                                        </div>
                                                    )}
                                                </Draggable>
                                            )
                                        })}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    );
                })}
            </div>
        </DragDropContext>
    );
};
