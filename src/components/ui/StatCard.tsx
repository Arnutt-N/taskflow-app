// components/ui/StatCard.tsx
'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: number;
  active?: boolean;
  onClick?: () => void;
  icon: React.ElementType;
}

export const StatCard = ({ label, value, subtext, trend, active, onClick, icon: Icon }: StatCardProps) => (
  <button 
    type="button"
    onClick={onClick}
    className={`
      relative p-6 rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden border text-left w-full
      ${active 
        ? 'bg-white border-indigo-200 shadow-clean ring-1 ring-indigo-50' 
        : 'bg-white border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200'
      }
    `}
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
         {Icon && <Icon className="w-6 h-6" />}
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
           trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>

    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
      <h3 className={`text-3xl font-bold tracking-tight ${active ? 'text-indigo-900' : 'text-slate-800'}`}>{value}</h3>
      {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
    </div>
  </button>
);
