'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 mb-2">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
      <p className="text-slate-500 text-sm max-w-sm text-center">We encountered an unexpected error while loading this page.</p>
      
      <div className="p-3 bg-slate-50 text-rose-600 text-xs font-mono rounded-lg max-w-lg mt-4 mb-4 break-all border border-slate-100 shadow-sm">
        {error.message || 'Unknown error occurred'}
      </div>

      <button
        onClick={() => reset()}
        className="px-5 py-2 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
