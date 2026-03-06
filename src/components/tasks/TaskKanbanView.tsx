'use client';

import { Task } from '@/types';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { StatusBadge, Avatar } from '@/components/ui';

interface TaskKanbanViewProps {
    tasks: Task[];
    onTaskStatusChange?: (taskId: string, newStatus: string) => void;
}

const KANBAN_COLUMNS = [
    { id: 'Todo', title: 'To Do', color: 'bg-slate-100' },
    { id: 'Planning', title: 'Planning', color: 'bg-blue-50' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-indigo-50' },
    { id: 'Review', title: 'Review', color: 'bg-purple-50' },
    { id: 'Done', title: 'Done', color: 'bg-emerald-50' },
];

export const TaskKanbanView = ({ tasks, onTaskStatusChange }: TaskKanbanViewProps) => {
    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        // Dropped outside a column
        if (!destination) return;

        // Dropped in the same column
        if (source.droppableId === destination.droppableId) return;

        // Status changed
        if (onTaskStatusChange) {
            onTaskStatusChange(draggableId, destination.droppableId);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 pt-2 -mx-2 px-2 h-[calc(100vh-280px)] min-h-[500px]">
                {KANBAN_COLUMNS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id);

                    return (
                        <div key={col.id} className="flex-none w-80 flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200/60 overflow-hidden">
                            <div className={`px-4 py-3 font-semibold text-sm border-b border-slate-200/60 flex items-center justify-between ${col.color}`}>
                                <span className="text-slate-700">{col.title}</span>
                                <span className="bg-white/60 text-slate-500 text-xs py-0.5 px-2 rounded-full font-medium">
                                    {colTasks.length}
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
                                        {colTasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 transition-all ${snapshot.isDragging ? 'shadow-md rotate-2 ring-2 ring-indigo-500/20' : 'hover:border-slate-300'
                                                            }`}
                                                    >
                                                        <p className="font-medium text-slate-800 text-sm mb-2">{task.title}</p>

                                                        <div className="flex items-center justify-between mt-4">
                                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${task.priority === 'Critical' ? 'text-rose-600 bg-rose-50' :
                                                                task.priority === 'High' ? 'text-orange-600 bg-orange-50' :
                                                                    task.priority === 'Medium' ? 'text-blue-600 bg-blue-50' :
                                                                        'text-slate-600 bg-slate-50'
                                                                }`}>
                                                                {task.priority}
                                                            </span>

                                                            {task.assignee && (
                                                                <div className="flex -space-x-1">
                                                                    <Avatar name={task.assignee} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
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
