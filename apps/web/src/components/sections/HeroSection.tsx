/**
 * Hero Section - World-Class Landing
 * "LiDAR-Enhanced Digital Vision Screening for Emerging Markets"
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
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-white/30">
              🏥 Clinical-Grade Vision Screening
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Precision eye care,{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                refined
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Clinical-grade vision screening from home. Ten tests — acuity, colour, astigmatism, 
              contrast and more — with results you can share with an optometrist. Screening only, not a diagnosis.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                onClick={() => setShowJourneyModal(true)}
                className="bg-white text-indigo-700 hover:bg-gray-100 px-8 py-4 text-lg"
              >
                Start Guided Journey
              </Button>
              <Link href="/tests">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg">
                  Browse Tests
                </Button>
              </Link>
            </div>

            {/* Progress Indicator */}
            {progress.completed > 0 && (
              <div className="mb-8">
                <button
                  onClick={() => setShowJourneyModal(true)}
                  className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm hover:bg-white/20 transition-colors border border-white/30"
                >
                  🎯 Journey Progress: {progress.completed}/{progress.total} Complete
                </button>
              </div>
            )}

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">◆</span>
              <span>Clinically inspired</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">◆</span>
              <span>10 comprehensive tests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">◆</span>
              <span>Share results with optometrist</span>
            </div>
          </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Journey Modal */}
      <JourneyModal 
        isOpen={showJourneyModal} 
        onClose={() => setShowJourneyModal(false)} 
      />
    </>
  )
}

