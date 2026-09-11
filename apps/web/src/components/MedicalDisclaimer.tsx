/**
 * Medical Disclaimer Component
 * SA-compliant: screening only, not diagnosis or dispensable prescription
 */

'use client'

export function MedicalDisclaimer() {
  return (
    <section className="py-12 bg-amber-50 border-t-4 border-amber-500">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-8 shadow-xl border-2 border-amber-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ⚠️ Important Medical Information
              </h3>
              <p className="text-gray-600">Screening only — not a diagnosis or dispensable prescription</p>
            </div>
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>This is a vision screening tool, not a medical diagnosis or dispensable prescription.</strong> Spect-IT provides 
                screening estimates for informational purposes only. All results, including refractive screening estimates, are 
                <strong> not dispensable prescriptions</strong> and cannot be used to order eyewear or contact lenses.
              </p>
              <p>
                Vision screening is not a substitute for comprehensive professional eye care. Always consult with a licensed 
                optometrist or ophthalmologist for clinical eye examinations, medical diagnoses, dispensable prescriptions, 
                and treatment decisions.
              </p>
              <p>
                <strong>When to see an eye care professional:</strong> Annual eye exams are recommended for everyone. 
                Schedule an appointment if you notice vision changes, reduced acuity, eye strain, or if screening results 
                indicate potential concerns.
              </p>
              
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
                <p className="text-sm text-red-900 font-semibold mb-2">
                  🚨 Urgent signs requiring immediate medical attention:
                </p>
                <ul className="text-sm text-red-900 list-disc list-inside space-y-1">
                  <li>Sudden vision loss or significant vision changes</li>
                  <li>Flashes of light or new floaters</li>
                  <li>Eye pain, redness, or discharge</li>
                  <li>Distortion or dark areas in central vision</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mt-4">
                <p className="text-sm text-blue-900">
                  <strong>Refractive screening disclaimer:</strong> Any refractive estimates (sphere, cylinder, axis) provided 
                  by Spect-IT are screening approximations only and <strong>NOT dispensable prescriptions</strong>. A licensed 
                  eye care professional must perform a comprehensive refraction and medical assessment before issuing a 
                  dispensable prescription for eyewear or contact lenses.
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                <a href="/privacy" className="hover:text-indigo-600 underline">
                  Privacy Policy
                </a>
                <a href="/terms" className="hover:text-indigo-600 underline">
                  Terms of Service
                </a>
                <a href="/medical-disclaimer" className="hover:text-indigo-600 underline">
                  Full Medical Disclaimer
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

