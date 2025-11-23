/**
 * Next.js 15 App Router - Root Layout
 * World-Class Structure
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

