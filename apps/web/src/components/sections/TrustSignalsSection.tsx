/**
 * Trust Signals Section
 * Medical-grade, privacy, validation status
 */

'use client'

import { Card, CardContent } from '../ui'

const trustSignals = [
  {
    title: 'Medical-Grade Technology',
    description: 'Powered by LiDAR depth sensing, computer vision, and validated ML models',
    icon: '🏥',
    items: [
      'Clinical validation study in progress',
      'Advisory board of optometrists',
      'Medical-grade accuracy algorithms',
      'Regulatory-compliant architecture'
    ]
  },
  {
    title: 'Privacy & Security',
    description: 'Your vision data stays private and secure',
    icon: '🔒',
    items: [
      'On-device AI processing',
      'No images stored on servers',
      'Encrypted data transmission',
      'GDPR & HIPAA compliant'
    ]
  },
  {
    title: 'Accessible Globally',
    description: 'Designed for emerging markets and underserved communities',
    icon: '🌍',
    items: [
      'Works offline after initial load',
      'Low bandwidth requirements',
      'Multi-language support',
      'Free and open access'
    ]
  }
]

export function TrustSignalsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white to-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cyan-50 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-cyan-200/50 text-cyan-900">
            <span className="text-xs">●</span>
            Trust & Impact
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Built for Trust & Impact
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Medical-grade technology designed for global accessibility
          </p>
        </div>

        {/* Trust Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
          {trustSignals.map((signal, index) => (
            <Card key={index} className="h-full hover:shadow-clinical-lg hover:border-cyan-200 transition-all hover:-translate-y-1 group">
              <CardContent className="p-8">
                <div className="text-4xl mb-4 opacity-80 group-hover:opacity-100 transition-opacity">{signal.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {signal.title}
                </h3>
                <p className="text-slate-600 mb-6">
                  {signal.description}
                </p>
                <ul className="space-y-2">
                  {signal.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-cyan-600 mt-0.5 font-bold">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Validation Banner */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-amber-300 bg-amber-50/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl opacity-80">⚠️</div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">
                    Currently in Clinical Validation Study
                  </h4>
                  <p className="text-slate-700 mb-3 leading-relaxed">
                    Spect-IT is undergoing clinical validation with optometrists. This is a screening tool, 
                    not a diagnosis. Always consult a qualified eye care professional for definitive eye health assessment.
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and does not 
                    replace professional medical advice, diagnosis, or treatment.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

