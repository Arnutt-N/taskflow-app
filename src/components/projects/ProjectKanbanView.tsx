'use client';

import { Project } from '@/types';
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
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useMemo } from 'react';
import { Clock, Users, Search, Filter, Plus, MoreHorizontal } from 'lucide-react';

interface ProjectKanbanViewProps {
  projects: Project[];
  onProjectStatusChange?: (projectId: string, newStatus: string) => void;
  onProjectClick: (projectId: string) => void;
}

const KANBAN_COLUMNS = [
  { id: 'Todo', title: 'To Do', color: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700' },
  { id: 'Planning', title: 'Planning', color: 'bg-blue-50/50', border: 'border-blue-200', text: 'text-blue-700' },
  { id: 'In Progress', title: 'In Progress', color: 'bg-indigo-50/50', border: 'border-indigo-200', text: 'text-indigo-700' },
  { id: 'Review', title: 'Review', color: 'bg-purple-50/50', border: 'border-purple-200', text: 'text-purple-700' },
  { id: 'Done', title: 'Done', color: 'bg-emerald-50/50', border: 'border-emerald-200', text: 'text-emerald-700' },
];

function ProjectCard({ project, onClick, isDragOverlay = false }: { project: Project; onClick?: () => void; isDragOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

  const style = isDragOverlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
      };

  const isLate = project.deadline && new Date(project.deadline) < new Date();
  const isDueSoon = project.deadline && new Date(project.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000 && !isLate;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white p-4 rounded-xl shadow-sm border transition-all duration-200 group cursor-grab active:cursor-grabbing select-none
        ${isDragOverlay ? 'shadow-xl rotate-3 scale-105 border-indigo-400 z-50 ring-4 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'}
        ${isDragging && !isDragOverlay ? 'opacity-30' : ''}
        ${isLate && project.status !== 'Completed' ? 'border-l-4 border-l-rose-500' : ''}
        ${isDueSoon && project.status !== 'Completed' ? 'border-l-4 border-l-amber-500' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
          #{project.id.split('-')[0]}
        </span>
        {project.priority === 'High' && (
          <span className="w-2 h-2 rounded-full bg-rose-500" title="High Priority" />
        )}
      </div>

      <h3 className="font-bold text-slate-800 mb-3 text-sm leading-snug group-hover:text-indigo-600 transition-colors">{project.name}</h3>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] mb-1.5">
          <span className="text-slate-500 font-medium">Progress</span>
          <span className="font-bold text-slate-700">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              project.progress === 100 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
              project.progress > 50 ? 'bg-gradient-to-r from-indigo-400 to-indigo-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'
            }`}
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          <Users className="w-3 h-3 text-indigo-400" />
          <span className="font-medium truncate max-w-[80px]" title={project.team}>{project.team}</span>
        </div>
        {project.deadline && (
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md border
            ${isLate && project.status !== 'Completed' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
              isDueSoon && project.status !== 'Completed' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
              'bg-slate-50 text-slate-500 border-slate-100'}
          `} title={`Due: ${new Date(project.deadline).toLocaleDateString()}`}>
            <Clock className="w-3 h-3" />
            {new Date(project.deadline).toLocaleDateString('th-TH', { month: 'short', day: 'numeric'})}
          </div>
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  projects,
  isOver,
  onProjectClick
}: {
  column: (typeof KANBAN_COLUMNS)[0];
  projects: Project[];
  isOver: boolean;
  onProjectClick: (id: string) => void;
}) {
  const wipLimit = column.id === 'In Progress' ? 3 : (column.id === 'Review' ? 4 : null);
  const isOverLimit = wipLimit !== null && projects.length > wipLimit;

  return (
    <div
      className={`flex-none w-[320px] max-w-[85vw] flex flex-col h-full max-h-full rounded-2xl border ${column.border} overflow-hidden shadow-sm bg-slate-50/50 transition-colors
        ${isOver ? 'ring-2 ring-indigo-300 bg-indigo-50/40' : ''}
      `}
    >
      <div className={`px-4 py-3 border-b ${column.border} flex items-center justify-between ${column.color} shrink-0`}>
        <div className="flex items-center gap-2">
          <h3 className={`font-bold text-sm ${column.text}`}>{column.title}</h3>
          <span className={`text-xs py-0.5 px-2 rounded-full font-bold ${isOverLimit ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-300' : 'bg-white/60 text-slate-600 shadow-sm'}`}>
            {projects.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-white/50 rounded text-slate-400 hover:text-slate-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1 hover:bg-white/50 rounded text-slate-400 hover:text-slate-700 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOverLimit && (
        <div className="bg-rose-50 text-rose-600 text-[10px] font-bold px-3 py-1 text-center border-b border-rose-100 uppercase tracking-wide">
          WIP Limit Exceeded (Max {wipLimit})
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[80px]">
        <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onClick={() => onProjectClick(project.id)} />
          ))}
        </SortableContext>

        {projects.length > 0 && (
          <button className="w-full py-2.5 mt-2 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-white transition-all flex items-center justify-center gap-2 group/add">
            <Plus className="w-4 h-4 text-slate-400 group-hover/add:text-indigo-500" />
            Add card
          </button>
        )}
        {projects.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-xl h-24 flex items-center justify-center text-slate-400 text-sm font-medium">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

export const ProjectKanbanView = ({ projects, onProjectStatusChange, onProjectClick }: ProjectKanbanViewProps) => {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  
  const [localProjects, setLocalProjects] = useState<Project[]>(projects);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useMemo(() => setLocalProjects(projects), [projects]);

  const teams = useMemo(() => {
    const uniqueTeams = new Set(projects.map(p => p.team));
    return ['All', ...Array.from(uniqueTeams)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    let result = localProjects;
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        p => p.name.toLowerCase().includes(lowerSearch) || p.team.toLowerCase().includes(lowerSearch)
      );
    }
    if (teamFilter !== 'All') {
      result = result.filter(p => p.team === teamFilter);
    }
    return result;
  }, [localProjects, search, teamFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const mapStatusToColumnId = (status: string) => {
    const s = status.toUpperCase().replace(' ', '_');
    if (s === 'COMPLETED') return 'Done';
    const match = KANBAN_COLUMNS.find(c => c.id.toUpperCase().replace(' ', '_') === s);
    return match ? match.id : 'Todo';
  };

  const projectsByColumn = useMemo(() => {
    const map: Record<string, Project[]> = {};
    KANBAN_COLUMNS.forEach(col => {
      map[col.id] = filteredProjects.filter(p => mapStatusToColumnId(p.status) === col.id);
    });
    return map;
  }, [filteredProjects]);

  function findColumnOfProject(projectId: string): string | undefined {
    const proj = localProjects.find(p => p.id === projectId);
    if (!proj) return undefined;
    return mapStatusToColumnId(proj.status);
  }

  function onDragStart({ active }: DragStartEvent) {
    setActiveProject(localProjects.find(p => p.id === active.id) || null);
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) { setOverId(null); return; }
    const overColId = KANBAN_COLUMNS.find(c => c.id === over.id)?.id
      ?? findColumnOfProject(over.id as string);
    setOverId(overColId || null);
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveProject(null);
    setOverId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overColId = KANBAN_COLUMNS.find(c => c.id === over.id)?.id
      ?? findColumnOfProject(over.id as string);

    if (!overColId) return;

    const currentStatus = mapStatusToColumnId(localProjects.find(p => p.id === activeId)?.status || '');
    if (currentStatus === overColId) return;

    const newDbStatus = overColId === 'Done' ? 'Completed' : overColId;

    setLocalProjects(prev =>
      prev.map(p => p.id === activeId ? { ...p, status: newDbStatus } : p)
    );

    if (onProjectStatusChange) {
      onProjectStatusChange(activeId, newDbStatus);
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 shrink-0">
        <div className="relative w-full sm:w-64 md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search in board..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium"
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            {teams.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>
            ))}
          </select>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-1 h-[calc(100vh-280px)] min-h-[500px] flex-nowrap items-start">
          {KANBAN_COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              projects={projectsByColumn[col.id] || []}
              isOver={overId === col.id}
              onProjectClick={onProjectClick}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeProject ? <ProjectCard project={activeProject} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
