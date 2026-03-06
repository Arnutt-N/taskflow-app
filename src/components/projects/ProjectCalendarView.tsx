'use client';

import { Project } from '@/types';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { th } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from 'react';

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

export const ProjectCalendarView = ({ projects, onProjectClick }: ProjectCalendarViewProps) => {
    const events = useMemo(() => {
        return projects
            .filter(p => p.deadline)
            .map(project => {
                // Assume projects start 30 days before deadline if no start date is clear
                const endDate = new Date(project.deadline);
                const startDate = new Date(project.deadline);
                startDate.setDate(endDate.getDate() - 30);

                return {
                    id: project.id,
                    title: project.name,
                    start: startDate,
                    end: endDate,
                    resource: project,
                    allDay: true,
                };
            });
    }, [projects]);

    const eventStyleGetter = (event: Event) => {
        const project = event.resource as Project;
        let backgroundColor = '#6366f1'; // Default Indigo

        if (project.status === 'Completed' || project.status === 'DONE' as any) backgroundColor = '#10b981'; // Emerald
        else if (project.status === 'In Progress' || project.status === 'IN_PROGRESS' as any) backgroundColor = '#3b82f6'; // Blue
        else if (project.status === 'Planning') backgroundColor = '#64748b'; // Slate
        else if (project.status === 'Todo' || project.status === 'TODO' as any) backgroundColor = '#f59e0b'; // Amber

        return {
            style: {
                backgroundColor,
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                fontWeight: '500',
                padding: '2px 4px'
            }
        };
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm h-[calc(100vh-250px)] min-h-[600px]">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'agenda']}
                onSelectEvent={(event) => onProjectClick((event.resource as Project).id)}
                tooltipAccessor={(e) => `${e.title}\nStatus: ${e.resource?.status}\nProgress: ${e.resource?.progress}%`}
            />
        </div>
    );
};
