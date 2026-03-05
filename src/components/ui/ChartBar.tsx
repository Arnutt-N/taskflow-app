// components/ui/ChartBar.tsx
'use client';

import { ArrowUpRight } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface ChartBarProps {
  label: string;
  value1?: number;
  value2?: number;
  max: number;
  color1?: string;
  color2?: string;
  onClick?: () => void;
  active?: boolean;
}

export const ChartBar = ({ 
  label, 
  value1, 
  value2, 
  max, 
  color1 = 'bg-rose-400', 
  color2 = 'bg-emerald-400', 
  onClick, 
  active 
}: ChartBarProps) => {
  const p1 = Math.min(((value1 || 0) / max) * 100, 100);
  const p2 = Math.min(((value2 || 0) / max) * 100, 100);

  return (
    <button 
      type="button"
      onClick={onClick}
      className={`group cursor-pointer p-4 rounded-xl transition-all border w-full text-left ${
        active 
          ? 'bg-indigo-50 border-indigo-100' 
          : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
      }`}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors line-clamp-1">{label}</span>
        <ArrowUpRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
      </div>
      <div className="space-y-3 relative">
        <div className="flex items-center gap-3">
          <div className="h-2 rounded-full bg-slate-100 w-full flex-1 overflow-hidden">
             <div className={`h-full ${color1} rounded-full`} style={{ width: `${p1}%` }} />
          </div>
          <span className="text-xs font-mono w-24 text-right text-slate-500">{formatNumber(value1)}</span>
        </div>
        <div className="flex items-center gap-3">
           <div className="h-2 rounded-full bg-slate-100 w-full flex-1 overflow-hidden">
             <div className={`h-full ${color2} rounded-full`} style={{ width: `${p2}%` }} />
           </div>
           <span className="text-xs font-mono font-medium w-24 text-right text-slate-700">{formatNumber(value2)}</span>
        </div>
      </div>
    </button>
  );
};
