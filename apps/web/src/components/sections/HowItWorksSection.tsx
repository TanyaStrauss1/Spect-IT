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
    description: 'Eight validated eye screening tests: Visual acuity (Sloan ETDRS), contrast sensitivity (logCS), color vision (confusion-line plates), astigmatism (radial patterns), visual field (Amsler grid), stereoacuity (random-dot stereograms), pupillary distance (PD), and refractive screening (pinhole test). Plus hearing screening with pure-tone audiometry.',
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
    description: 'Compares uncorrected acuity to pinhole acuity to detect refractive blur — tells you if correction may help, NOT a prescription. Does NOT generate sphere, cylinder, or axis values. Results are NOT dispensable. Consult an optometrist for prescriptions and eyewear.',
    color: 'border-cyan-500'
  },
  {
    icon: '🕶️',
    title: 'Stereoacuity',
    description: 'Random-dot stereogram test screens binocular depth perception using red-cyan anaglyph display. Measures stereo threshold in arcseconds. Requires anaglyph glasses.',
    color: 'border-teal-500'
  },
  {
    icon: '📏',
    title: 'Pupillary Distance',
    description: 'Manual marker-based PD measurement with calibrated screen. Provides screening estimate of distance between pupil centers. NOT for ordering glasses — professional measurement required.',
    color: 'border-blue-500'
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-cyan-200/50 text-cyan-900">
            <span className="text-xs">●</span>
            How it works
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Clinical-grade screening in four steps
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From calibration to results — here's how Spect-IT delivers accurate, repeatable vision screening.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {steps.map((step, index) => (
            <Card key={index} className="h-full hover:shadow-clinical-lg hover:border-cyan-200 transition-all hover:-translate-y-1 group">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-50 to-teal-50 flex items-center justify-center text-cyan-700 font-bold mb-4 border border-cyan-200 group-hover:scale-105 transition-transform">
                  {step.number}
                </div>
                <div className="text-3xl mb-3 opacity-80">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clinical Methodology Section */}
        <div className="max-w-7xl mx-auto mt-16">
          <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 rounded-clinical-lg p-8 border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900 text-center mb-8 tracking-tight">
              Clinical Methodology
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {methodology.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-clinical p-5 border-l-4 border-cyan-500 hover:shadow-clinical-lg transition-all hover:-translate-y-0.5"
                >
                  <div className="text-2xl mb-2 opacity-80">{item.icon}</div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Clinical Note */}
            <div className="mt-8 bg-amber-50 border-l-4 border-amber-500 rounded-clinical p-5">
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
          <p className="text-slate-600 mb-4 font-medium">
            Ready to test your vision?
          </p>
          <a
            href="/tests"
            className="inline-block bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-8 py-3 rounded-clinical font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all shadow-clinical hover:shadow-clinical-lg hover:-translate-y-0.5"
          >
            Start Your Screening →
          </a>
        </div>
      </div>
    </section>
  )
}

