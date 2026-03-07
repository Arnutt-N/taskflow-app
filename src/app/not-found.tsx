import Link from 'next/link';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center animate-in zoom-in-95 duration-500">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-rose-50 rounded-full mb-6">
          <FileQuestion className="w-12 h-12 text-rose-500" />
        </div>
        <h1 className="text-9xl font-extrabold text-slate-900 tracking-tighter mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or perhaps it never existed.
        </p>
        <Link href="/" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
