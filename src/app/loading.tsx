import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center gap-4 animate-in fade-in duration-300">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
          <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600 animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
