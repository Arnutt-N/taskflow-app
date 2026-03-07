import type { Metadata } from 'next';
import { Noto_Sans_Thai } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const notoTh = Noto_Sans_Thai({ 
  subsets: ['thai', 'latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-noto-sans-thai' 
});

export const metadata: Metadata = {
  title: 'Engineering Taskflow',
  description: 'Task management and project tracking dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={notoTh.variable}>
      <body className="font-sans antialiased bg-slate-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
