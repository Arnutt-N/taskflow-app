// components/ui/Pagination.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}: PaginationProps) => (
  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
    <span className="text-xs text-slate-500">
      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
    </span>
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium flex items-center shadow-sm"
      >
        <ChevronLeft className="w-3 h-3 mr-1"/> Previous
      </button>
      <div className="flex gap-1">
        {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
          <button 
            key={i} 
            onClick={() => onPageChange(i + 1)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
              currentPage === i + 1 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium flex items-center shadow-sm"
      >
        Next <ChevronRight className="w-3 h-3 ml-1"/>
      </button>
    </div>
  </div>
);
