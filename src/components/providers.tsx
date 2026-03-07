'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'font-sans text-sm rounded-xl border border-slate-100 shadow-lg pr-8',
              closeButton: '!bg-transparent !border-0 !shadow-none !text-slate-400 hover:!text-slate-600 !rounded-full !p-1 !w-6 !h-6 !right-2 top-1/2 -translate-y-1/2',
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}

