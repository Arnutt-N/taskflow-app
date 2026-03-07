import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-indigo-100 p-8 text-center animate-in slide-in-from-bottom-4 duration-500 border border-slate-100">
        <div className="inline-flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-sm font-bold tracking-widest uppercase mb-6">
          Coming Soon
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">New Features<br/>On The Way</h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          We're working hard to bring this feature to life. It will be available in the next major update. Stay tuned!
        </p>
        <Link href="/" className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-slate-800 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
