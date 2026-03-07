import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function InProgressPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin"></div>
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Work In Progress</h1>
        <p className="text-slate-500 max-w-md mb-10 leading-relaxed text-sm">
          The requested operation or project phase is currently actively being worked on. Our team is pushing updates constantly.
        </p>
        
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm w-full max-w-md text-left mb-8">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Current Status</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Phase 1 Initialization</p>
                <p className="text-xs text-slate-400">Completed yesterday</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center flex-shrink-0 relative">
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-700">Phase 2 Development</p>
                <p className="text-xs text-amber-500/80">Currently crunching</p>
              </div>
            </div>
          </div>
        </div>

        <Link href="/" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors group">
          Return to Dashboard
          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </DashboardLayout>
  );
}
