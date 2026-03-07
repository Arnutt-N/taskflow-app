'use client';

import { Task } from '@/types';
import { Calendar, dateFnsLocalizer, Event } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { th } from 'date-fns/locale';
import { th, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from 'react';

const locales = {
    'th': th,
    'en-US': enUS
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface TaskCalendarViewProps {
    tasks: Task[];
}

export const TaskCalendarView = ({ tasks }: TaskCalendarViewProps) => {
    const events = useMemo(() => {
        return tasks
            .filter(t => t.dueDate || t.createdAt) // Needs at least some date
            .map(task => {
                const startDate = task.createdAt || new Date().toISOString();
                const endDate = task.dueDate || startDate;

                return {
                    id: task.id,
                    title: task.title,
                    start: new Date(startDate),
                    end: new Date(endDate),
                    resource: task,
                    allDay: true,
                };
            });
    }, [tasks]);

    const eventStyleGetter = (event: Event) => {
        const task = event.resource as Task;
        let backgroundColor = '#6366f1'; // Default Indigo

        switch (task.status) {
            case 'Done': backgroundColor = '#10b981'; break; // Emerald
            case 'In Progress': backgroundColor = '#3b82f6'; break; // Blue
            case 'Review': backgroundColor = '#8b5cf6'; break; // Purple
            case 'Planning': backgroundColor = '#64748b'; break; // Slate
            case 'Todo': backgroundColor = '#f59e0b'; break; // Amber
        }

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
                tooltipAccessor={(e) => `${e.title}\nStatus: ${e.resource?.status}\nPriority: ${e.resource?.priority}`}
            />
        </div>
    );
};
