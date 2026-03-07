import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ServerCog, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ProcessingPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center animate-in slide-in-from-bottom-4 duration-500">
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-indigo-50 rounded-2xl rotate-12 flex items-center justify-center">
             <ServerCog className="w-12 h-12 text-indigo-600 animate-pulse" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-white">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">System is Processing</h1>
        <p className="text-slate-500 max-w-sm mx-auto mb-8 leading-relaxed text-sm">
          A heavy background task is currently running. This may take a few moments to complete. Please feel free to navigate away; we will notify you upon completion.
        </p>
        
        <div className="w-full max-w-sm bg-slate-100 rounded-full h-2 mb-8 overflow-hidden">
          <div className="bg-indigo-600 h-2 rounded-full w-2/3 relative">
            <div className="absolute inset-0 bg-white/20 animate-[slide_1s_ease-in-out_infinite]"></div>
          </div>
        </div>

        <Link href="/projects" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
      </div>
    </DashboardLayout>
  );
}
