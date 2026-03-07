'use client';

import { ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  trend?: number;
  active?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}

export const StatCard = ({ label, value, subtext, trend, active, onClick, icon: Icon }: StatCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative p-6 rounded-2xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : 'cursor-default'} overflow-hidden border text-left w-full
        ${active 
          ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-50' 
          : 'bg-white border-slate-100 shadow-sm'
        }
      `}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
            trend >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
          }`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
        <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${active ? 'text-indigo-900' : 'text-slate-800'} truncate`} title={value}>
          {value}
        </h3>
        {subtext && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{subtext}</p>}
      </div>
    </button>
  );
};
