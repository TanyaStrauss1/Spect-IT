/**
 * Test Grid Section
 * Showcase all vision tests
 */

'use client'

import { TestCard } from '../ui'
import Link from 'next/link'

const eyeTests = [
  {
    id: 'acuity',
    title: 'Visual Acuity',
    description: 'Measure how clearly you can see at a distance using the standard Snellen chart',
    icon: '👁️',
    duration: '3-5 min',
    route: '/tests/acuity',
    available: true
  },
  {
    id: 'color',
    title: 'Color Vision',
    description: 'Screen for color vision deficiency using pseudoisochromatic plates',
    icon: '🎨',
    duration: '2-3 min',
    route: '/tests/color-vision',
    available: true
  },
  {
    id: 'astigmatism',
    title: 'Astigmatism',
    description: 'Detect astigmatism using radial line patterns',
    icon: '🌀',
    duration: '2-3 min',
    route: '/tests/astigmatism',
    available: true
  },
  {
    id: 'contrast',
    title: 'Contrast Sensitivity',
    description: 'Measure ability to distinguish objects from background',
    icon: '🌓',
    duration: '3-4 min',
    route: '/tests/contrast',
    available: true
  },
  {
    id: 'visual-field',
    title: 'Visual Field',
    description: 'Test peripheral vision and detect blind spots',
    icon: '📍',
    duration: '5-7 min',
    route: '/tests/visual-field',
    available: true
  },
  {
    id: 'prescription',
    title: 'Prescription Screening',
    description: 'Detect whether refractive correction may help — NOT a dispensable prescription',
    icon: '🔬',
    duration: '5-10 min',
    route: '/tests/prescription',
    available: true
  },
  {
    id: 'vision-scan',
    title: 'Vision Scan',
    description: 'Camera-based screening for alignment, motility, and convergence — Mobile App only',
    icon: '📱',
    duration: '8-12 min',
    route: null,
    available: true,
    mobileOnly: true
  }
]

const hearingTests = [
  {
    id: 'hearing',
    title: 'Hearing Screening',
    description: 'Basic pure-tone hearing screening at key frequencies with stereo testing',
    icon: '🎧',
    duration: '3-5 min',
    route: '/tests/hearing',
    available: true
  }
]

export function TestGridSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Screening Tests
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vision and hearing screening tests for families and teachers
          </p>
        </div>

        {/* Eye Screening Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              👁️ Eye Screening
            </h3>
            <p className="text-gray-600">
              Comprehensive vision screening tests — results are screening only, not a diagnosis
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eyeTests.map((test) => (
              <div key={test.id} className="relative">
                {!test.available && (
                  <div className="absolute top-4 right-4 z-10 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                {test.mobileOnly && (
                  <div className="absolute top-4 right-4 z-10 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Mobile Only
                  </div>
                )}
                <TestCard
                  title={test.title}
                  description={test.description}
                  icon={test.icon}
                  duration={test.duration}
                  disabled={!test.available || test.mobileOnly}
                  onStart={() => {
                    if (test.available && !test.mobileOnly && test.route) {
                      window.location.href = test.route
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Hearing Screening Section */}
        <div className="max-w-6xl mx-auto mb-12">
          <div className="mb-6">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              🎧 Hearing Screening
            </h3>
            <p className="text-gray-600">
              Pure-tone hearing screening — results are screening only, not a diagnosis
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hearingTests.map((test) => (
              <div key={test.id} className="relative">
                {!test.available && (
                  <div className="absolute top-4 right-4 z-10 bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
                <TestCard
                  title={test.title}
                  description={test.description}
                  icon={test.icon}
                  duration={test.duration}
                  disabled={!test.available}
                  onStart={() => {
                    if (test.available && test.route) {
                      window.location.href = test.route
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="text-4xl mb-3">🔬</div>
            <h4 className="font-semibold mb-2">Accurate Results</h4>
            <p className="text-sm text-gray-600">Medical-grade testing algorithms</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-semibold mb-2">Comprehensive</h4>
            <p className="text-sm text-gray-600">Vision and hearing screening tests</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">📱</div>
            <h4 className="font-semibold mb-2">Device Compatible</h4>
            <p className="text-sm text-gray-600">Works on all devices</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🔒</div>
            <h4 className="font-semibold mb-2">Secure & Private</h4>
            <p className="text-sm text-gray-600">Your data is protected</p>
          </div>
        </div>
      </div>
    </section>
  )
}

