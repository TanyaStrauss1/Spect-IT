/**
 * How It Works Section
 * 4-step clinical screening flow with methodology details
 */

'use client'

import { Card, CardContent } from '../ui'

const steps = [
  {
    number: '01',
    title: 'Calibrate your screen',
    description: 'Use a credit card to calibrate screen size (pixels/mm) and set your viewing distance. This ensures optotypes appear at the correct physical size for clinical accuracy.',
    icon: '📏'
  },
  {
    number: '02',
    title: 'Follow the guided journey',
    description: 'Our guided journey recommends test order and walks you through pre-test setup: distance, lighting, glasses on/off, occlusion. Progress is saved — resume anytime.',
    icon: '🎯'
  },
  {
    number: '03',
    title: 'Complete clinical tests',
    description: 'Six validated screening tests: Sloan optotypes for acuity (ETDRS protocol), confusion-line pseudoisochromatic plates (NOT Ishihara) for color, Amsler grid for macular health, contrast sensitivity (logCS), astigmatism screening, and refractive estimates.',
    icon: '👁️'
  },
  {
    number: '04',
    title: 'Get your summary & PDF',
    description: 'Receive a clinical results summary with logMAR scores, per-eye breakdown, and recommendations. Export as PDF to bring to your optometrist appointment.',
    icon: '📊'
  }
]

const methodology = [
  {
    icon: '📏',
    title: 'Visual Acuity',
    description: 'Standard Sloan optotypes (C, D, H, K, N, O, R, S, V, Z) at WHO-compliant visual angles. 6/6 (20/20) = 5 arc minutes per stroke. ETDRS methodology with 5 letters per line. LogMAR scoring for clinical reporting.',
    color: 'border-indigo-500'
  },
  {
    icon: '🎨',
    title: 'Color Vision',
    description: 'Confusion-line pseudoisochromatic plates (NOT Ishihara) for protan and deutan deficiencies. Control plates mark unreliable tests as inconclusive. Procedurally generated dot fields (~2000 dots) ensure copyright-free testing.',
    color: 'border-green-500'
  },
  {
    icon: '🌓',
    title: 'Contrast Sensitivity',
    description: 'Pelli-Robson-inspired low-contrast optotypes assess vision in reduced lighting. Screens for cataracts, glaucoma, macular degeneration. LogCS scoring.',
    color: 'border-amber-500'
  },
  {
    icon: '⚫',
    title: 'Astigmatism',
    description: 'Radial fan, cross-grid, and clock dial tests identify corneal irregularity and orientation. Results inform cylinder/axis estimates.',
    color: 'border-red-500'
  },
  {
    icon: '⊞',
    title: 'Visual Field (Amsler Grid)',
    description: 'Central 10° macular screening for metamorphopsia, scotomas, and distortion. Per-eye testing with fixation monitoring. Critical early indicator for macular conditions.',
    color: 'border-purple-500'
  },
  {
    icon: '🔍',
    title: 'Refractive Screening',
    description: 'Combines acuity, duochrome, and astigmatism results to estimate sphere, cylinder, and axis. Screening estimate only — NOT a diagnosis, clinical assessment, or dispensable prescription. Consult an optometrist for eyewear.',
    color: 'border-cyan-500'
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Clinical-grade screening in four steps
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From calibration to results — here's how Spect-IT delivers accurate, repeatable vision screening.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="h-full hover:shadow-xl transition-shadow border-2 border-gray-200 hover:border-indigo-300">
              <CardContent className="p-6">
                <div className="text-5xl font-bold text-indigo-100 mb-3">
                  {step.number}
                </div>
                <div className="text-4xl mb-3">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clinical Methodology Section */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 border-2 border-gray-300">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Clinical Methodology
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methodology.map((item, index) => (
                <div 
                  key={index}
                  className={`bg-white rounded-xl p-5 border-l-4 ${item.color} hover:shadow-lg transition-shadow`}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Clinical Note */}
            <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5">
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong>Clinical Note:</strong> Spect-IT uses screen-based testing with calibrated physical sizing and validated protocols. 
                All results are <strong>screening estimates for informational use</strong> — not medical diagnoses, clinical assessments, 
                or dispensable prescriptions. For professional eye care and eyewear prescriptions, consult a licensed optometrist or ophthalmologist.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Ready to test your vision?
          </p>
          <a
            href="/tests"
            className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-md"
          >
            Start Your Screening →
          </a>
        </div>
      </div>
    </section>
  )
}

