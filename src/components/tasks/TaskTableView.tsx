'use client';

import React, { useState, useMemo } from 'react';
import { StatusBadge } from '@/components/ui';
import { Search, Filter, ArrowUpDown, Calendar, Flag, CheckSquare, MessageSquare } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  estimatedHours: number;
  actualHours: number;
  project: { id: string; name: string };
  assignee: { id: string; name: string; avatar?: string | null } | null;
  _count?: { comments: number };
}

interface TaskTableViewProps {
  tasks: Task[];
}

type SortField = 'title' | 'project' | 'status' | 'priority' | 'assignee' | 'dueDate' | 'hours';
type SortOrder = 'asc' | 'desc';

const priorityLabels: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

// Map Prisma string ENUM to our StatusBadge expected formats
const statusMap: Record<string, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
  BLOCKED: 'Blocked',
};

const mapStatus = (dbStatus: string) => statusMap[dbStatus] || dbStatus;

const priorityWeight: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export const TaskTableView = ({ tasks }: TaskTableViewProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const statuses = ['All', 'TODO', 'IN_PROGRESS', 'REVIEW', 'DONE', 'BLOCKED'];
  const priorities = ['All', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by search
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) || 
        t.project.name.toLowerCase().includes(lowerSearch) ||
        (t.assignee?.name || '').toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Filter by priority
    if (priorityFilter !== 'All') {
      result = result.filter(t => t.priority === priorityFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'title': comparison = a.title.localeCompare(b.title); break;
        case 'project': comparison = a.project.name.localeCompare(b.project.name); break;
        case 'status': comparison = (statusMap[a.status] || a.status).localeCompare(statusMap[b.status] || b.status); break;
        case 'priority': comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0); break;
        case 'assignee': comparison = (a.assignee?.name || '').localeCompare(b.assignee?.name || ''); break;
        case 'dueDate': 
          const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = dateA - dateB;
          break;
        case 'hours': comparison = (a.actualHours || 0) - (b.actualHours || 0); break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [tasks, search, statusFilter, priorityFilter, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedTasks.length / itemsPerPage);
  const MathMax = Math.max;
  
  // Prevent empty pages if items are deleted/filtered while on a high page number
  const validCurrentPage = MathMax(1, Math.min(currentPage, totalPages || 1));
  const paginatedTasks = filteredAndSortedTasks.slice(
    (validCurrentPage - 1) * itemsPerPage,
    validCurrentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedTasks.size === paginatedTasks.length && paginatedTasks.length > 0) {
      const currentIds = new Set(paginatedTasks.map(t => t.id));
      setSelectedTasks(prev => {
        const next = new Set(prev);
        currentIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      setSelectedTasks(prev => {
        const next = new Set(prev);
        paginatedTasks.forEach(t => next.add(t.id));
        return next;
      });
    }
  };

  const toggleSelectTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTasks(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const isAllCurrentPageSelected = paginatedTasks.length > 0 && paginatedTasks.every(t => selectedTasks.has(t.id));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* ── Toolbar ── */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 w-full xl:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks, projects, or assignees..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow shrink-0"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {selectedTasks.size > 0 && (
            <div className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg flex items-center border border-indigo-100 mr-2 shrink-0">
              {selectedTasks.size} selected
            </div>
          )}

          <div className="relative flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 shrink-0">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : mapStatus(s)}</option>)}
            </select>
          </div>

          <div className="relative flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 shrink-0">
            <Flag className="w-4 h-4 text-slate-500" />
            <select
              className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium"
              value={priorityFilter}
              onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            >
              {priorities.map(p => <option key={p} value={p}>{p === 'All' ? 'All Priorities' : priorityLabels[p]}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors mx-auto ${isAllCurrentPageSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white hover:border-indigo-400'}`}>
                    {isAllCurrentPageSelected && <CheckSquare className="w-3 h-3" />}
                  </button>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('title')}>
                  <div className="flex items-center gap-2">Task <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'title' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /></div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('project')}>
                  <div className="flex items-center gap-2">Project <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'project' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /></div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'status' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /></div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('priority')}>
                  <div className="flex items-center gap-2">Priority <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'priority' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /></div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('assignee')}>
                  <div className="flex items-center gap-2">Assignee <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'assignee' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /></div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('dueDate')}>
                  <div className="flex items-center gap-2">Due Date <ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'dueDate' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /></div>
                </th>
                <th scope="col" className="px-6 py-4 text-right font-semibold tracking-wider cursor-pointer hover:bg-slate-100 group" onClick={() => handleSort('hours')}>
                  <div className="flex items-center justify-end gap-2"><ArrowUpDown className={`w-3.5 h-3.5 ${sortField === 'hours' ? 'text-indigo-500' : 'text-slate-300 opacity-0 group-hover:opacity-100'}`} /> Hours</div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 text-slate-700">
              {paginatedTasks.length > 0 ? (
                paginatedTasks.map(task => {
                  const isSelected = selectedTasks.has(task.id);
                  const isOverdue = task.dueDate && new Date(task.dueDate).getTime() < new Date().getTime() && task.status !== 'DONE';
                  
                  return (
                    <tr key={task.id} className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-indigo-50/40' : task.status === 'DONE' ? 'opacity-60 bg-slate-50/50' : 'bg-white'}`}>
                      <td className="p-4 text-center">
                        <button onClick={(e) => toggleSelectTask(task.id, e)} className={`w-4 h-4 rounded border flex items-center justify-center transition-colors mx-auto ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white hover:border-indigo-400'}`}>
                          {isSelected && <CheckSquare className="w-3 h-3" />}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 line-clamp-1">{task.title}</div>
                        {task._count && task._count.comments > 0 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                            <MessageSquare className="w-3 h-3" /> {task._count.comments}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">
                        {task.project.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={mapStatus(task.status)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={priorityLabels[task.priority] || task.priority} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.assignee ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-700">
                              {task.assignee.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium">{task.assignee.name.split(' ')[0]}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {task.dueDate ? (
                          <div className={`flex items-center text-sm font-medium ${isOverdue ? 'text-rose-600 bg-rose-50 px-2 py-1 rounded-md inline-flex' : 'text-slate-600'}`}>
                            <Calendar className={`w-4 h-4 mr-1.5 ${isOverdue ? 'text-rose-500' : 'text-slate-400'}`} />
                            {new Date(task.dueDate).toLocaleDateString('th-TH')}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap text-sm">
                        <span className="font-medium text-slate-800">{task.actualHours}</span>
                        <span className="text-slate-400"> / {task.estimatedHours}h</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300 mb-3" />
                      <p className="font-semibold text-slate-700 text-lg mb-1">No tasks found</p>
                      <p className="text-sm text-slate-500">There are no tasks matching your filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/30">
            <span className="text-sm text-slate-500">
              Showing <span className="font-bold text-slate-700">{(validCurrentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(validCurrentPage * itemsPerPage, filteredAndSortedTasks.length)}</span> of <span className="font-bold text-slate-700">{filteredAndSortedTasks.length}</span> tasks
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm bg-white"
              >
                Prev
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                .map((page, index, array) => (
                <div key={page} className="flex gap-1 items-center">
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 text-slate-400 text-xs">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm ${validCurrentPage === page ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    {page}
                  </button>
                </div>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
