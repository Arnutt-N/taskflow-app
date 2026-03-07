'use client';

import { Task } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useMemo } from 'react';
import { Calendar, Flag, GripVertical, User } from 'lucide-react';

interface TaskKanbanViewProps {
  tasks: Task[];
  onTaskStatusChange?: (taskId: string, newStatus: string) => void;
}

const KANBAN_COLUMNS = [
  { id: 'Todo',        title: 'To Do',       color: 'border-t-slate-400',   bg: 'bg-slate-50',   badge: 'bg-slate-100 text-slate-600' },
  { id: 'Planning',   title: 'Planning',     color: 'border-t-blue-400',    bg: 'bg-blue-50/40', badge: 'bg-blue-100 text-blue-700' },
  { id: 'In Progress',title: 'In Progress',  color: 'border-t-indigo-500',  bg: 'bg-white',      badge: 'bg-indigo-100 text-indigo-700' },
  { id: 'Review',     title: 'Review',       color: 'border-t-violet-400',  bg: 'bg-violet-50/40', badge: 'bg-violet-100 text-violet-700' },
  { id: 'Done',       title: 'Done',         color: 'border-t-emerald-500', bg: 'bg-emerald-50/30', badge: 'bg-emerald-100 text-emerald-700' },
];

const PRIORITY_MAP: Record<string, { label: string; cls: string }> = {
  Critical: { label: 'Critical', cls: 'text-rose-700 bg-rose-50 border border-rose-200' },
  High:     { label: 'High',     cls: 'text-orange-700 bg-orange-50 border border-orange-200' },
  Medium:   { label: 'Medium',   cls: 'text-blue-700 bg-blue-50 border border-blue-200' },
  Low:      { label: 'Low',      cls: 'text-slate-600 bg-slate-50 border border-slate-200' },
};

// ── Sortable Task Card ────────────────────────────────────────────────────────
function KanbanCard({ task, isDragOverlay = false }: { task: Task; isDragOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      };

  const p = PRIORITY_MAP[task.priority] || PRIORITY_MAP.Low;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !['Done', 'Completed'].includes(task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group bg-white rounded-xl border border-slate-200/80
        shadow-sm hover:shadow-md hover:border-indigo-200
        transition-all duration-150 select-none
        ${isDragOverlay ? 'shadow-xl border-indigo-400 rotate-2 scale-105' : ''}
        ${isDragging && !isDragOverlay ? 'opacity-30' : ''}
      `}
    >
      {/* Drag Handle + Title */}
      <div className="flex items-start gap-2 p-3 pb-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-0.5 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 rounded"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <p className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 flex-1 group-hover:text-indigo-700 transition-colors">
          {task.title}
        </p>
      </div>

      {/* Project */}
      {task.projectId && (
        <div className="px-3 pb-1">
          <span className="text-[10px] text-slate-400 font-medium">
            {task.projectId.slice(0, 8)}...
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 mt-1">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${p.cls}`}>
          <Flag className="w-2.5 h-2.5 inline mr-0.5 -mt-px" />
          {p.label}
        </span>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[10px] font-medium ${isOverdue ? 'text-rose-600' : 'text-slate-400'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </span>
          )}
          {task.assignee && (
            <div
              title={task.assignee}
              className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-violet-400 rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0"
            >
              {task.assignee[0]?.toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({
  column,
  tasks,
  isOver,
}: {
  column: (typeof KANBAN_COLUMNS)[0];
  tasks: Task[];
  isOver: boolean;
}) {
  const { setNodeRef, isOver: isOverDroppable } = useDroppable({
    id: column.id,
  });

  // Use the droppable's isOver state if available, otherwise fallback to prop
  const droppableIsOver = isOverDroppable || isOver;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-none w-72 flex flex-col rounded-2xl border border-slate-200/70
        border-t-4 ${column.color} ${column.bg}
        transition-colors duration-150
        ${droppableIsOver ? 'border-indigo-300 bg-indigo-50/30 shadow-inner' : ''}
      `}
    >
      {/* Column Header */}
      <div className="px-4 py-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">{column.title}</h3>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.badge}`}>
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3 pb-3 space-y-2.5 min-h-[80px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-20 flex items-center justify-center text-slate-300 text-xs font-medium">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Kanban Board ─────────────────────────────────────────────────────────
export const TaskKanbanView = ({ tasks, onTaskStatusChange }: TaskKanbanViewProps) => {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Sync when parent tasks prop changes (e.g., refetch)
  useMemo(() => setLocalTasks(tasks), [tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts — prevents accidental drags on click
      },
    })
  );

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      map[col.id] = localTasks.filter(t => t.status === col.id);
    });
    return map;
  }, [localTasks]);

  function findColumnOfTask(taskId: string): string | undefined {
    return KANBAN_COLUMNS.find(col =>
      localTasks.find(t => t.id === taskId)?.status === col.id
    )?.id;
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveTask(localTasks.find(t => t.id === active.id) || null);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) { setOverId(null); return; }
    
    // Check if we're directly over a column
    const overColumn = KANBAN_COLUMNS.find(c => c.id === over.id);
    if (overColumn) {
      setOverId(overColumn.id);
      return;
    }
    
    // Otherwise find column from the task being hovered over
    const overColId = findColumnOfTask(over.id as string);
    setOverId(overColId || null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null);
    setOverId(null);
    if (!over) return;

    const activeId = active.id as string;

    // Check if we're directly over a column
    const overColumn = KANBAN_COLUMNS.find(c => c.id === over.id);
    let overColId = overColumn?.id;
    
    // If not over a column, try to find from the task
    if (!overColId) {
      overColId = findColumnOfTask(over.id as string);
    }

    if (!overColId) return;

    const currentStatus = localTasks.find(t => t.id === activeId)?.status;
    if (currentStatus === overColId) return;

    // Optimistic update
    setLocalTasks(prev =>
      prev.map(t => t.id === activeId ? { ...t, status: overColId as Task['status'] } : t)
    );

    if (onTaskStatusChange) {
      onTaskStatusChange(activeId, overColId);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 h-[calc(100vh-240px)] min-h-[500px]">
        {KANBAN_COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id] || []}
            isOver={overId === col.id}
          />
        ))}
      </div>

      {/* DragOverlay — renders a floating clone OUTSIDE scroll containers, eliminating jank */}
      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeTask ? <KanbanCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
};
