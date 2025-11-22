/**
 * Test Grid Section
 * Showcase all vision tests
 */

'use client'

import { TestCard } from '../components/ui'
import Link from 'next/link'

const tests = [
  {
    id: 'acuity',
    title: 'Visual Acuity',
    description: 'Measure how clearly you can see at a distance using the standard Snellen chart',
    icon: '👁️',
    duration: '3-5 min',
    route: '/tests/acuity'
  },
  {
    id: 'color',
    title: 'Color Vision',
    description: 'Test for color blindness using Ishihara plates',
    icon: '🎨',
    duration: '2-3 min',
    route: '/tests/color'
  },
  {
    id: 'astigmatism',
    title: 'Astigmatism',
    description: 'Detect astigmatism using radial line patterns',
    icon: '🌀',
    duration: '2-3 min',
    route: '/tests/astigmatism'
  },
  {
    id: 'contrast',
    title: 'Contrast Sensitivity',
    description: 'Measure ability to distinguish objects from background',
    icon: '🌓',
    duration: '3-4 min',
    route: '/tests/contrast'
  },
  {
    id: 'visual-field',
    title: 'Visual Field',
    description: 'Test peripheral vision and detect blind spots',
    icon: '📍',
    duration: '5-7 min',
    route: '/tests/visual-field'
  },
  {
    id: 'prescription',
    title: 'Prescription Measurement',
    description: 'Estimate your eyeglass prescription using AI and computer vision',
    icon: '🔬',
    duration: '5-10 min',
    route: '/tests/prescription'
  }
]

export function TestGridSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Comprehensive Vision Tests
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Six professional-grade tests powered by AI and computer vision
          </p>
        </div>

        {/* Test Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              title={test.title}
              description={test.description}
              icon={test.icon}
              duration={test.duration}
              onStart={() => {
                window.location.href = test.route
              }}
            />
          ))}
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
            <p className="text-sm text-gray-600">6 different vision tests</p>
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

