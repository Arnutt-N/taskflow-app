import type { Metadata } from 'next'
import { Inter, Noto_Sans_Thai } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import './globals.css'

// Font optimization (Next.js 16)
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  variable: '--font-noto-thai',
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'TaskFlow - Task Management Dashboard',
  description: 'Task management and project tracking dashboard',
  keywords: ['task', 'project', 'management', 'dashboard'],
  authors: [{ name: 'ToppLab' }],
  creator: 'ToppLab',
  openGraph: {
    title: 'TaskFlow - Task Management Dashboard',
    description: 'Task management and project tracking dashboard',
    type: 'website',
    locale: 'th_TH',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" className={`${inter.variable} ${notoSansThai.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
