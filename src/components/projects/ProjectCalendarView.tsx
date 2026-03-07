'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Project } from '@/types';
import { Calendar, dateFnsLocalizer, Event, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { th } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Search, Filter, Calendar as CalendarIcon, Users, Clock, AlignLeft } from 'lucide-react';
import { StatusBadge } from '@/components/ui';

const locales = {
    'th': th,
    'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface ProjectCalendarViewProps {
    projects: Project[];
    onProjectClick: (projectId: string) => void;
}

interface ProjectEvent extends Event {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: Project;
    allDay: boolean;
}

export const ProjectCalendarView = ({ projects, onProjectClick }: ProjectCalendarViewProps) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [teamFilter, setTeamFilter] = useState('All');
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    const statuses = ['All', 'In Progress', 'Planning', 'Completed', 'Todo'];
    
    const teams = useMemo(() => {
        const uniqueTeams = new Set(projects.map(p => p.team));
        return ['All', ...Array.from(uniqueTeams)];
    }, [projects]);

    const events: ProjectEvent[] = useMemo(() => {
        let filtered = projects.filter(p => p.deadline);
        
        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(
                p => p.name.toLowerCase().includes(lowerSearch) || p.team.toLowerCase().includes(lowerSearch)
            );
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (teamFilter !== 'All') {
            filtered = filtered.filter(p => p.team === teamFilter);
        }

        return filtered.map(project => {
            const endDate = new Date(project.deadline);
            const startDate = new Date(project.deadline);
            startDate.setDate(endDate.getDate() - 5); // Just 5 days for calendar to not clutter too much

            return {
                id: project.id,
                title: project.name,
                start: startDate,
                end: endDate,
                resource: project,
                allDay: true,
            };
        });
    }, [projects, search, statusFilter, teamFilter]);

    const eventStyleGetter = (event: Event) => {
        const project = event.resource as Project;
        let backgroundColor = '#6366f1'; // Default Indigo
        let borderColor = '#4f46e5';

        if (project.status === 'Completed' || project.status === 'DONE' as any) {
            backgroundColor = '#10b981'; // Emerald
            borderColor = '#059669';
        }
        else if (project.status === 'In Progress' || project.status === 'IN_PROGRESS' as any) {
            backgroundColor = '#3b82f6'; // Blue
            borderColor = '#2563eb';
        }
        else if (project.status === 'Planning') {
            backgroundColor = '#64748b'; // Slate
            borderColor = '#475569';
        }
        else if (project.status === 'Todo' || project.status === 'TODO' as any) {
            backgroundColor = '#f59e0b'; // Amber
            borderColor = '#d97706';
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.95,
                color: 'white',
                border: `1px solid ${borderColor}`,
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                padding: '2px 6px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s',
            }
        };
    };

    // Custom UI Components for Calendar
    const EventComponent = ({ event }: { event: ProjectEvent }) => {
        return (
            <div className="flex flex-col gap-0.5 truncate hover:scale-[1.02] transition-transform cursor-pointer" title={event.title}>
                <div className="flex items-center gap-1.5">
                    <span className="truncate">{event.title}</span>
                </div>
                {view !== Views.MONTH && (
                    <div className="text-[10px] opacity-90 flex items-center gap-1 font-normal">
                        <Users className="w-2.5 h-2.5" />
                        {event.resource.team}
                    </div>
                )}
            </div>
        );
    };

    const handleNavigate = useCallback((newDate: Date) => setDate(newDate), []);
    const handleViewChange = useCallback((newView: any) => setView(newView), []);

    // Custom toolbar to replace the default one
    const CustomToolbar = (toolbarProvider: any) => {
        const { label, onNavigate } = toolbarProvider;

        return (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button 
                        onClick={() => onNavigate('PREV')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all font-medium text-sm px-3"
                    >
                        Back
                    </button>
                    <button 
                        onClick={() => onNavigate('TODAY')}
                        className="p-1.5 text-indigo-600 hover:text-indigo-700 bg-white shadow-sm rounded-md transition-all font-semibold text-sm px-3 border border-indigo-100"
                    >
                        Today
                    </button>
                    <button 
                        onClick={() => onNavigate('NEXT')}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all font-medium text-sm px-3"
                    >
                        Next
                    </button>
                </div>

                <h2 className="text-xl font-bold text-slate-800 min-w-[200px] text-center">{label}</h2>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 w-full sm:w-auto">
                    {['month', 'week', 'day', 'agenda'].map(v => (
                        <button
                            key={v}
                            onClick={() => handleViewChange(v as any)}
                            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all capitalize ${
                                view === v ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                            }`}
                        >
                            {v}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] min-h-[700px] animate-in fade-in duration-300">
            {/* Sidebar Filters */}
            <div className="w-full lg:w-64 shrink-0 flex flex-col gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Search className="w-4 h-4 text-indigo-500" /> Search
                        </h3>
                        <input
                            type="text"
                            placeholder="Find projects..."
                            className="w-full px-3 h-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Filter className="w-4 h-4 text-indigo-500" /> Filters
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Status</label>
                                <select
                                    className="w-full px-3 h-10 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Team</label>
                                <select
                                    className="w-full px-3 h-10 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={teamFilter}
                                    onChange={(e) => setTeamFilter(e.target.value)}
                                >
                                    {teams.map(t => <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mini Stats Configured from visible events */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-2xl border border-indigo-100 shadow-sm flex-1">
                    <h3 className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4 text-indigo-500" /> Visible Projects
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Total</span>
                            <span className="font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">{events.length}</span>
                        </div>
                        {statusFilter === 'All' && (
                            <div className="mt-4 pt-4 border-t border-indigo-100 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-emerald-700 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Completed</span>
                                    <span className="font-bold text-slate-700">{events.filter(e => e.resource.status === 'Completed').length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-blue-700 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> In Progress</span>
                                    <span className="font-bold text-slate-700">{events.filter(e => e.resource.status === 'In Progress').length}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-amber-700 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> Todo</span>
                                    <span className="font-bold text-slate-700">{events.filter(e => e.resource.status === 'Todo').length}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Calendar Space */}
            <div className="flex-1 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col min-w-0">
                <style dangerouslySetInnerHTML={{__html: `
                    .rbc-calendar { font-family: inherit; }
                    .rbc-header { padding: 8px; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #475569; border-bottom: 1px solid #e2e8f0; }
                    .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
                    .rbc-day-bg + .rbc-day-bg { border-left: 1px solid #f1f5f9; }
                    .rbc-month-row + .rbc-month-row { border-top: 1px solid #f1f5f9; }
                    .rbc-today { background-color: #f8fafc; }
                    .rbc-off-range-bg { background-color: #fcfcfc; }
                    .rbc-date-cell { padding: 4px 8px; font-size: 12px; font-weight: 500; color: #334155; }
                    .rbc-event { padding: 2px !important; }
                    .rbc-event:focus { outline: 2px solid #818cf8; outline-offset: 1px; }
                    .rbc-show-more { color: #6366f1; font-weight: 600; font-size: 11px; background: #e0e7ff; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 2px; }
                    .rbc-agenda-view table.rbc-agenda-table { border: 1px solid #e2e8f0; border-radius: 8px; }
                    .rbc-agenda-view table.rbc-agenda-table thead > tr > th { padding: 12px; font-weight: 600; text-transform: uppercase; font-size: 11px; color: #475569; border-bottom: 1px solid #e2e8f0; text-align: left; }
                `}} />
                
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ flex: 1, minHeight: 0 }}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: EventComponent,
                        toolbar: CustomToolbar
                    }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    view={view}
                    date={date}
                    onNavigate={handleNavigate}
                    onView={handleViewChange}
                    onSelectEvent={(event) => onProjectClick((event.resource as Project).id)}
                    popup
                    selectable
                />
            </div>
        </div>
    );
};
