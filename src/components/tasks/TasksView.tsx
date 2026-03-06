// components/tasks/TasksView.tsx
'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, ListTodo, Trash2, LayoutGrid, TableProperties, CalendarDays, BarChartHorizontal } from 'lucide-react';
import { StatusBadge, Avatar, Pagination } from '@/components/ui';
import { TaskKanbanView } from './TaskKanbanView';
import { TaskCalendarView } from './TaskCalendarView';
import { TaskGanttView } from './TaskGanttView';
import { Task, Project } from '@/types';
import { ITEMS_PER_PAGE } from '@/lib/constants';

interface TasksViewProps {
  tasks: Task[];
  projects: Project[];
  selectedProjectId: string | null;
  onlyMyTasks: boolean;
  searchQuery: string;
  currentPage: number;
  onSearchChange: (query: string) => void;
  onPageChange: (page: number) => void;
  onClearFilter: () => void;
}

export const TasksView = ({
  tasks,
  projects,
  selectedProjectId,
  onlyMyTasks,
  searchQuery,
  currentPage,
  onSearchChange,
  onPageChange,
  onClearFilter,
}: TasksViewProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewType, setViewType] = useState<'table' | 'kanban' | 'calendar' | 'gantt'>('table');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Unknown';
  };

  const priorityColors: Record<string, string> = {
    Critical: 'text-rose-600 bg-rose-50',
    High: 'text-orange-600 bg-orange-50',
    Medium: 'text-blue-600 bg-blue-50',
    Low: 'text-slate-600 bg-slate-50',
  };

  return (
    <div className="space-y-6 animate-in max-w-screen-2xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-indigo-600" />
            Tasks Management
          </h2>
          <p className="text-slate-500 text-sm">
            จัดการงานรายวัน {onlyMyTasks && <span className="text-indigo-600 font-medium">• My Tasks</span>}
            {selectedProjectId && <span className="text-indigo-600 font-medium"> • Filtered</span>}
          </p>
        </div>

        {(selectedProjectId || onlyMyTasks) && (
          <button
            type="button"
            onClick={onClearFilter}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-medium flex items-center gap-2 self-start"
          >
            <Trash2 className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">All Status</option>
            <option value="Done">Done</option>
            <option value="In Progress">In Progress</option>
            <option value="Todo">Todo</option>
            <option value="Planning">Planning</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">All Priority</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* View Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setViewType('table')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewType === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <TableProperties className="w-4 h-4" /> Table
        </button>
        <button
          onClick={() => setViewType('kanban')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewType === 'kanban' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <LayoutGrid className="w-4 h-4" /> Kanban
        </button>
        <button
          onClick={() => setViewType('gantt')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewType === 'gantt' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <BarChartHorizontal className="w-4 h-4" /> Gantt
        </button>
        <button
          onClick={() => setViewType('calendar')}
          className={`px-4 py-2 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${viewType === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CalendarDays className="w-4 h-4" /> Calendar
        </button>
      </div>

      {/* Main Content Area based on ViewType */}
      {viewType === 'table' && (
        <div className="bg-white rounded-xl shadow-clean border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Task</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Project</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Assignee</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTasks.map(task => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-400 md:hidden mt-1">{getProjectName(task.projectId)}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-slate-600 truncate max-w-[200px]">{getProjectName(task.projectId)}</p>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <div className="flex items-center gap-2">
                        <Avatar name={task.assignee} />
                        <span className="text-sm text-slate-700">{task.assignee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${priorityColors[task.priority] || 'bg-gray-50 text-gray-600'}`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredTasks.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}

      {viewType === 'kanban' && (
        <TaskKanbanView tasks={filteredTasks} />
      )}

      {viewType === 'calendar' && (
        <TaskCalendarView tasks={filteredTasks} />
      )}

      {viewType === 'gantt' && (
        <TaskGanttView tasks={filteredTasks} projects={projects} />
      )}

      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
          <ListTodo className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No tasks found</p>
          <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};
