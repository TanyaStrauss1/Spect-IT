/**
 * Hero Section - World-Class Landing
 * "Digital Vision Screening for Emerging Markets"
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../ui'
import { JourneyModal } from '../journey/JourneyModal'
import { useJourney } from '@/lib/journey/useJourney'

export function HeroSection() {
  const [showJourneyModal, setShowJourneyModal] = useState(false)
  const { calculateProgress } = useJourney()
  const progress = calculateProgress()

  return (
    <>
      <section className="relative bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.015]">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/30 via-transparent to-transparent" />

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-teal-50 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-cyan-200/50 text-cyan-900 shadow-sm">
              <span className="text-xs">●</span>
              Clinical-Grade Vision Screening
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-slate-900">
              Precision eye care,{' '}
              <span className="bg-gradient-to-r from-cyan-600 to-teal-500 bg-clip-text text-transparent">
                refined
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Clinical-grade vision screening from home. Ten tests — acuity, colour, astigmatism, 
              contrast and more — with results you can share with an optometrist. Screening only, not a diagnosis.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setShowJourneyModal(true)}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700 px-8 py-4 text-lg shadow-clinical"
              >
                Start Guided Journey
              </Button>
              <Link href="/tests">
                <Button size="lg" variant="outline" className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-4 text-lg">
                  Browse Tests
                </Button>
              </Link>
            </div>

            {/* Progress Indicator */}
            {progress.completed > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setShowJourneyModal(true)}
                  className="inline-flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-full text-sm hover:bg-cyan-100 transition-colors border border-cyan-200 text-cyan-900 shadow-sm"
                >
                  <span className="text-xs">●</span>
                  Journey Progress: {progress.completed}/{progress.total} Complete
                </button>
              </div>
            )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-600">
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="text-sm text-cyan-600">✓</span>
              <span>Clinically inspired</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="text-sm text-cyan-600">✓</span>
              <span>10 comprehensive tests</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="text-sm text-cyan-600">✓</span>
              <span>Share results with optometrist</span>
            </div>
          </div>
          </div>
        </div>

        {/* Bottom gradient separator */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </section>

      {/* Journey Modal */}
      <JourneyModal 
        isOpen={showJourneyModal} 
        onClose={() => setShowJourneyModal(false)} 
      />
    </>
  )
}

