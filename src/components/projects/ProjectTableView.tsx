'use client';

import React, { useState, useMemo } from 'react';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, ArrowUpDown, MoreVertical, CheckSquare, Edit2, Archive, Trash2, CheckCircle2, Users, Clock, TrendingUp } from 'lucide-react';

interface ProjectTableViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
}

type SortField = 'name' | 'team' | 'status' | 'deadline' | 'progress' | 'budget' | 'margin';
type SortOrder = 'asc' | 'desc';

export const ProjectTableView = ({ projects, onProjectClick, selectedProjectId }: ProjectTableViewProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statuses = ['All', 'In Progress', 'Planning', 'Completed', 'Todo'];

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (p: Project) => p.name.toLowerCase().includes(lowerSearch) || p.team.toLowerCase().includes(lowerSearch)
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter((p: Project) => p.status === statusFilter);
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name': comparison = a.name.localeCompare(b.name); break;
        case 'team': comparison = a.team.localeCompare(b.team); break;
        case 'status': comparison = a.status.localeCompare(b.status); break;
        case 'deadline': comparison = new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); break;
        case 'progress': comparison = a.progress - b.progress; break;
        case 'budget': comparison = (a.budget || 0) - (b.budget || 0); break;
        case 'margin':
          const profitA = (a.revenue || 0) - (a.budget || 0);
          const marginA = a.revenue ? profitA / a.revenue : 0;
          const profitB = (b.revenue || 0) - (b.budget || 0);
          const marginB = b.revenue ? profitB / b.revenue : 0;
          comparison = marginA - marginB;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [projects, search, statusFilter, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSelectAll = () => {
    if (selectedProjects.size === paginatedProjects.length) {
      // Deselect all on current page
      const currentIds = new Set(paginatedProjects.map((p: Project) => p.id));
      setSelectedProjects((prev: Set<string>) => {
        const next = new Set(prev);
        currentIds.forEach(id => next.delete(id));
        return next;
      });
    } else {
      // Select all on current page
      setSelectedProjects((prev: Set<string>) => {
        const next = new Set(prev);
        paginatedProjects.forEach((p: Project) => next.add(p.id));
        return next;
      });
    }
  };

  const toggleSelectProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProjects(newSelected);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const isAllCurrentPageSelected = paginatedProjects.length > 0 && paginatedProjects.every((p: Project) => selectedProjects.has(p.id));

  return (
    <div className="space-y-4 bg-white rounded-xl shadow-sm border border-slate-100 p-2 sm:p-4 animate-in fade-in duration-300">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center p-2 rounded-xl">
        <div className="flex-1 w-full max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name..."
            className="w-full pl-10 pr-4 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {selectedProjects.size > 0 && (
            <div className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg flex items-center gap-2 border border-indigo-100">
              {selectedProjects.size} selected
              <button className="p-1 hover:bg-white rounded-md text-indigo-600 ml-2" title="Mark Completed"><CheckCircle2 className="w-4 h-4" /></button>
              <button className="p-1 hover:bg-white rounded-md text-rose-600" title="Delete"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}

          <div className="relative flex items-center gap-2 border border-slate-200 rounded-lg px-3 h-10 bg-slate-50">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium h-full"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="p-4 w-12">
                  <div className="flex items-center justify-center">
                    <button 
                      onClick={toggleSelectAll}
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isAllCurrentPageSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                    >
                      {isAllCurrentPageSelected && <CheckSquare className="w-3 h-3" />}
                    </button>
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">
                    Project Name
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'name' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">
                    Status
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'status' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('team')}>
                  <div className="flex items-center gap-2">
                    Team
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'team' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('deadline')}>
                  <div className="flex items-center gap-2">
                    Deadline
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'deadline' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('progress')}>
                  <div className="flex items-center gap-2">
                    Progress
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'progress' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('budget')}>
                  <div className="flex items-center justify-end gap-2">
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'budget' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                    Budget
                  </div>
                </th>
                <th scope="col" className="px-6 py-4 text-right font-semibold tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group" onClick={() => handleSort('margin')}>
                  <div className="flex items-center justify-end gap-2">
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${sortField === 'margin' ? 'text-indigo-500' : 'text-slate-300 group-hover:text-slate-500'}`} />
                    Margin
                  </div>
                </th>
                <th scope="col" className="px-4 py-4 w-12">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((project) => {
                  const isSelected = selectedProjects.has(project.id);
                  const isActive = selectedProjectId === project.id;
                  const profit = (project.revenue || 0) - (project.budget || 0);
                  const margin = project.revenue ? Math.round((profit / project.revenue) * 100) : 0;
                  
                  return (
                    <tr 
                      key={project.id} 
                      onClick={() => onProjectClick(project.id)}
                      className={`hover:bg-indigo-50/40 transition-colors cursor-pointer group ${isSelected ? 'bg-indigo-50/60' : isActive ? 'bg-slate-50' : 'bg-white'}`}
                    >
                      <td className="p-4 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <button 
                            onClick={(e) => toggleSelectProject(project.id, e)}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}
                          >
                            {isSelected && <CheckSquare className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm ${
                              project.status === 'Completed' ? 'bg-emerald-500' :
                              project.status === 'In Progress' ? 'bg-indigo-500' : 'bg-slate-400'
                          }`}>
                            {project.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{project.name}</div>
                            <div className="text-[11px] text-slate-400">ID: {project.id.split('-')[0]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-sm">{project.team}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-sm">{new Date(project.deadline).toLocaleDateString('th-TH')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex-1 border border-slate-200/50">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                project.progress === 100 ? 'bg-emerald-500' : project.progress >= 50 ? 'bg-indigo-500' : 'bg-amber-400'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-8">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-700">{formatCurrency(project.budget)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-full text-xs ${margin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          <TrendingUp className="w-3 h-3" />
                          {margin >= 0 ? '+' : ''}{margin}%
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <TableRowDropdown projectId={project.id} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="w-8 h-8 text-slate-300 mb-2" />
                      <p className="font-medium">No projects found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
            <span className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-800 font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-800 font-bold">{Math.min(currentPage * itemsPerPage, filteredAndSortedProjects.length)}</span> of <span className="text-slate-800 font-bold">{filteredAndSortedProjects.length}</span> results
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent transition-colors shadow-sm"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                // Show pages around current
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, index, array) => (
                <div key={page} className="flex gap-1">
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 py-1.5 text-slate-400">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm ${currentPage === page ? 'bg-indigo-600 text-white border border-indigo-600' : 'bg-transparent border border-slate-200 text-slate-600 hover:bg-white'}`}
                  >
                    {page}
                  </button>
                </div>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-md border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent transition-colors shadow-sm"
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

// Extracted dropdown to manage its own open state without triggering re-renders on the whole table
const TableRowDropdown = ({ projectId }: { projectId: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-200">
            <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-indigo-400" /> Edit
            </button>
            <button className="w-full px-4 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-400" /> Archive
            </button>
            <div className="h-px bg-slate-100 my-1" />
            <button className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};
