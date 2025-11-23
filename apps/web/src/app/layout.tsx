/**
 * Next.js 15 App Router - Root Layout
 * Advanced Platform with All Providers
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { ToastProvider } from '@/components/ui/Toast'
import { Analytics, SpeedInsights } from '@/lib/analytics/analytics'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Spect-IT – LiDAR-Enhanced Digital Vision Screening for Emerging Markets',
  description: 'Professional-grade eye testing powered by AI, LiDAR depth sensing, and computer vision. Accessible, accurate, and available anywhere.',
  keywords: 'vision screening, eye test, LiDAR, computer vision, AI, optometry, emerging markets',
  authors: [{ name: 'Spect-IT' }],
  openGraph: {
    title: 'Spect-IT – LiDAR-Enhanced Digital Vision Screening',
    description: 'Professional-grade eye testing powered by AI and computer vision',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <QueryProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <ToastProvider />
          <Analytics />
          <SpeedInsights />
        </QueryProvider>
      </body>
    </html>
  )
}

