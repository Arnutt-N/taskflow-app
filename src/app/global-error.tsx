'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-rose-100 text-center space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Something went wrong!</h2>
            <p className="text-slate-500 text-sm">A critical error occurred. Please try reloading the page.</p>
            <div className="p-4 bg-slate-50 rounded-lg text-left text-xs text-rose-600 font-mono overflow-auto max-h-32 mb-4 break-all">
               {error.message || 'Unknown error'}
            </div>
            <button
              onClick={() => reset()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
