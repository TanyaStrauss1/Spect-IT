/**
 * Next.js 15 App Router - Root Layout
 * World-Class Structure
 */

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CookieConsent } from '@/components/CookieConsent'
import { AuthProvider } from '@/lib/auth/auth-context'
import { ParticipantProvider } from '@/lib/participants/participant-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Spect-IT – Digital Vision Screening for Emerging Markets',
  description: 'Professional-grade eye testing powered by AI, depth sensing, and computer vision. Accessible, accurate, and available anywhere. Screening only, not a diagnosis.',
  keywords: 'vision screening, eye test, depth sensing, TrueDepth, ARKit, computer vision, AI, optometry, emerging markets',
  authors: [{ name: 'Spect-IT' }],
  openGraph: {
    title: 'Spect-IT – Digital Vision Screening',
    description: 'Professional-grade eye testing powered by AI and computer vision. Screening only, not a diagnosis.',
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
        <AuthProvider>
          <ParticipantProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <CookieConsent />
          </ParticipantProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

