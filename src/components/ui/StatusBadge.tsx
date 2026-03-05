// components/ui/StatusBadge.tsx
'use client';

interface StatusBadgeProps {
  status: string;
}

const statusStyles: Record<string, string> = {
  'Done': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-100',
  'Todo': 'bg-slate-50 text-slate-600 border-slate-100',
  'Planning': 'bg-violet-50 text-violet-700 border-violet-100',
  'High': 'bg-orange-50 text-orange-700 border-orange-100',
  'Critical': 'bg-rose-50 text-rose-700 border-rose-100',
};

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${statusStyles[status] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
    {status}
  </span>
);
