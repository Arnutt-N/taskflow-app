'use client';

import React, { useState, useMemo } from 'react';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui';
import {
  Users, Clock, TrendingUp, Search, Filter, ArrowUpDown,
  MoreVertical, CheckSquare, Edit2, Archive, Trash2,
  CheckCircle2, ArrowUpRight, Calendar, ArrowRight
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatNumber = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return '0';
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
};

const getDeadlineInfo = (deadline: string) => {
  const now = new Date();
  const due = new Date(deadline);
  const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0)   return { label: `${Math.abs(diff)}d overdue`, color: 'bg-rose-50 text-rose-600 border-rose-200' };
  if (diff === 0) return { label: 'Due today', color: 'bg-rose-50 text-rose-600 border-rose-200' };
  if (diff <= 3)  return { label: `${diff}d left`, color: 'bg-amber-50 text-amber-600 border-amber-200' };
  if (diff <= 14) return { label: `${diff}d left`, color: 'bg-indigo-50 text-indigo-600 border-indigo-200' };
  return { label: `${diff}d left`, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' };
};

// Generate a deterministic gradient color from a name string
const getAvatarGradient = (name: string) => {
  const gradients = [
    'from-indigo-500 to-purple-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
    'from-violet-500 to-indigo-500',
  ];
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
};

// ─── Avatar Component ─────────────────────────────────────────────────────────

const MemberAvatar = ({ name, index }: { name: string; index: number }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative"
      style={{ zIndex: hovered ? 20 : 10 - index }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Tooltip */}
      {hovered && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-medium py-1 px-2 rounded-md whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {name}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
      <div
        className={`w-7 h-7 rounded-full bg-gradient-to-tr ${getAvatarGradient(name)} text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white shadow-sm transition-all duration-200 ${hovered ? '-translate-y-1 scale-110' : ''}`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    </div>
  );
};

// ─── Grid View ────────────────────────────────────────────────────────────────

interface ProjectGridViewProps {
  projects: Project[];
  onProjectClick: (projectId: string) => void;
  selectedProjectId: string | null;
}

type SortField = 'name' | 'deadline' | 'progress' | 'profit';
type SortOrder = 'asc' | 'desc';

export const ProjectGridView = ({ projects, onProjectClick, selectedProjectId }: ProjectGridViewProps) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());

  const statuses = ['All', 'In Progress', 'Planning', 'Completed', 'Todo'];

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') {
      result = result.filter(p => p.status === statusFilter);
    }
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':     cmp = a.name.localeCompare(b.name); break;
        case 'deadline': cmp = new Date(a.deadline).getTime() - new Date(b.deadline).getTime(); break;
        case 'progress': cmp = a.progress - b.progress; break;
        case 'profit':
          cmp = ((a.revenue || 0) - (a.budget || 0)) - ((b.revenue || 0) - (b.budget || 0)); break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [projects, search, statusFilter, sortField, sortOrder]);

  const toggleSelectAll = () => {
    if (selectedProjects.size === filteredAndSortedProjects.length) setSelectedProjects(new Set());
    else setSelectedProjects(new Set(filteredAndSortedProjects.map(p => p.id)));
  };

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedProjects);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedProjects(next);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 w-full max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or teams..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-shadow"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-slate-50">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              className="text-sm bg-transparent outline-none cursor-pointer text-slate-700 font-medium"
              value={sortField}
              onChange={e => setSortField(e.target.value as SortField)}
            >
              <option value="deadline">Deadline</option>
              <option value="name">Name</option>
              <option value="progress">Progress</option>
              <option value="profit">Profit</option>
            </select>
            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="text-slate-400 hover:text-slate-700 px-1"
              title="Toggle order"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProjects.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-indigo-700">
            {selectedProjects.size} project{selectedProjects.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <button className="text-xs font-medium px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
            </button>
            <button className="text-xs font-medium px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 transition-colors flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredAndSortedProjects.map(project => (
          <EnhancedProjectCard
            key={project.id}
            project={project}
            onClick={() => onProjectClick(project.id)}
            active={selectedProjectId === project.id}
            isSelected={selectedProjects.has(project.id)}
            onToggleSelect={e => toggleSelect(project.id, e)}
            onViewTasks={() => onProjectClick(project.id)}
          />
        ))}

        {filteredAndSortedProjects.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-600">No projects found</h3>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filter options</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Enhanced Project Card ────────────────────────────────────────────────────

interface EnhancedProjectCardProps {
  project: Project;
  onClick: () => void;
  active: boolean;
  isSelected: boolean;
  onToggleSelect: (e: React.MouseEvent) => void;
  onViewTasks: () => void;
}

// Mock: generate pseudo-members from team name for display purposes
const getMockMembers = (team: string): string[] => {
  const initials: Record<string, string[]> = {
    'Design Squad':   ['Arisa', 'Ben', 'Chloe'],
    'Core Engine':    ['David', 'Emma', 'Frank', 'Grace'],
    'Growth':         ['Henry', 'Iris'],
    'SecOps':         ['Jack', 'Kani', 'Leo'],
    'Mobile':         ['Mia', 'Nat', 'Olivia', 'Pat', 'Quinn'],
    'Data Team':      ['Ryan', 'Sara'],
  };
  return initials[team] || [team.charAt(0) + 'ember1', team.charAt(0) + 'ember2'];
};

const EnhancedProjectCard = ({
  project, onClick, active, isSelected, onToggleSelect, onViewTasks,
}: EnhancedProjectCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const profit = (project.revenue || 0) - (project.budget || 0);
  const margin = project.revenue ? Math.round((profit / project.revenue) * 100) : 0;
  const deadline = getDeadlineInfo(project.deadline);
  const members = project.members ?? getMockMembers(project.team);
  const visibleMembers = members.slice(0, 3);
  const extraCount = members.length - visibleMembers.length;

  const progressColor =
    project.progress === 100 ? 'from-emerald-400 to-emerald-500' :
    project.progress > 50    ? 'from-indigo-400 to-indigo-500' :
                               'from-amber-400 to-amber-500';

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col overflow-hidden
        ${active    ? 'border-indigo-400 ring-4 ring-indigo-50 shadow-lg shadow-indigo-100/50 scale-[1.01] z-10' : 'border-slate-200 hover:border-indigo-300 hover:shadow-lg hover:shadow-slate-100'}
        ${isSelected ? 'bg-indigo-50/20' : ''}
      `}
    >
      {/* ── Body ── */}
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* Row 1: checkbox + team chip + status badge + hamburger */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Checkbox */}
            <div
              className="p-0.5 rounded hover:bg-slate-100 transition-colors z-20 cursor-pointer shrink-0"
              onClick={onToggleSelect}
            >
              <div className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded flex items-center justify-center border transition-colors
                ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-300 group-hover:border-indigo-400 bg-white'}`}
              >
                {isSelected && <CheckSquare className="w-3 h-3" />}
              </div>
            </div>

            {/* Team chip */}
            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate max-w-[100px]">
              {project.team}
            </span>

            {/* Status Badge */}
            <StatusBadge status={project.status} />
          </div>

          {/* Hamburger */}
          <div className="relative z-20 shrink-0">
            <button
              onClick={e => { e.stopPropagation(); setShowDropdown(v => !v); }}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setShowDropdown(false); }} />
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30">
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Edit2 className="w-3.5 h-3.5 text-indigo-400" /> Edit
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                    onClick={e => { e.stopPropagation(); onViewTasks(); setShowDropdown(false); }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" /> View Tasks
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Archive className="w-3.5 h-3.5 text-slate-400" /> Archive
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <button className="w-full px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Project Name */}
        <h3 className="font-bold text-slate-800 text-lg leading-tight line-clamp-2 pr-1 group-hover:text-indigo-800 transition-colors">
          {project.name}
        </h3>

        {/* Row 3: Deadline + proximity chip */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            Due: <span className="font-medium text-slate-700">
              {new Date(project.deadline).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </span>
          <span className={`ml-auto px-2 py-0.5 rounded-full border text-[10px] font-bold ${deadline.color}`}>
            {deadline.label}
          </span>
        </div>

        {/* Row 4: Financial — Net Profit + Margin */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 px-4 py-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mb-0.5">Net Profit</p>
            <p className={`text-sm font-black ${profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ฿{formatNumber(profit)}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 mb-0.5">
              <TrendingUp className={`w-3 h-3 ${margin >= 0 ? 'text-blue-500' : 'text-rose-500'}`} />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Margin</p>
            </div>
            <p className={`text-sm font-black ${margin >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              {margin >= 0 ? '+' : ''}{margin}%
            </p>
          </div>
        </div>

        {/* Row 5: Progress bar */}
        <div className="group/progress relative">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="font-medium text-slate-500">Progress</span>
            <span className="font-bold text-slate-700">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${progressColor} relative overflow-hidden`}
              style={{ width: `${project.progress}%` }}
            >
              {/* Shimmer stripe */}
              <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[progress_1s_linear_infinite]" />
            </div>
          </div>
          {/* Tooltip */}
          <div className="absolute opacity-0 group-hover/progress:opacity-100 pointer-events-none transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded-md -top-7 right-0 whitespace-nowrap z-30 shadow">
            {project.progress}% Completed
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between group-hover:bg-indigo-50/40 transition-colors rounded-b-2xl">
        {/* Stacked member avatars */}
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {visibleMembers.map((m, i) => (
              <MemberAvatar key={m} name={m} index={i} />
            ))}
            {extraCount > 0 && (
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white text-slate-600 text-[10px] font-bold flex items-center justify-center ring-2 ring-white z-0">
                +{extraCount}
              </div>
            )}
          </div>
        </div>

        {/* View drill-down */}
        <button
          onClick={e => { e.stopPropagation(); onViewTasks(); }}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors group/btn"
        >
          View
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
};
