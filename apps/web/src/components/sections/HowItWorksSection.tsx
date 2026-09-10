/**
 * How It Works Section
 * 3-step visual guide
 */

'use client'

import { Card, CardContent } from '../ui'

const steps = [
  {
    number: '01',
    title: 'Calibrate Distance',
    description: 'Our LiDAR depth sensor (or camera fallback) measures your exact distance from the screen for accurate testing.',
    icon: '📏',
    details: [
      'Automatic distance detection',
      'LiDAR on supported devices',
      'Camera-based fallback for all devices',
      'Real-time calibration feedback'
    ]
  },
  {
    number: '02',
    title: 'Complete Vision Tests',
    description: 'Six comprehensive tests measure visual acuity, color vision, astigmatism, contrast sensitivity, visual field, and prescription.',
    icon: '👁️',
    details: [
      'Snellen chart visual acuity',
      'Ishihara color vision test',
      'Radial line astigmatism test',
      'Pelli-Robson contrast sensitivity',
      'Visual field perimetry',
      'AI-powered prescription estimation'
    ]
  },
  {
    number: '03',
    title: 'Get Results & Recommendations',
    description: 'AI analyzes your results and provides professional-grade screening summary with actionable recommendations.',
    icon: '📊',
    details: [
      'Instant results dashboard',
      'AI-powered interpretation',
      'Risk assessment',
      'Optometrist referral if needed',
      'Printable screening report'
    ]
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional-grade vision screening in three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 z-0" style={{ width: 'calc(100% - 4rem)' }} />
              )}

              <Card className="relative z-10 h-full hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  {/* Step Number */}
                  <div className="text-6xl font-bold text-indigo-100 mb-4">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4">
                    {step.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Details List */}
                  <ul className="space-y-2">
                    {step.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-indigo-600 mt-1">✓</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ready to test your vision?
          </p>
          <a
            href="/tests"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start Your Screening →
          </a>
        </div>
      </div>
    </section>
  )
}

