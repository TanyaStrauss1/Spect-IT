/**
 * Medical Disclaimer Component
 * WCAG-compliant, clear medical warnings
 */

'use client'

export function MedicalDisclaimer() {
  return (
    <section className="py-12 bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              ⚠️ Important Medical Disclaimer
            </h3>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>Spect-IT is a vision screening tool, not a medical diagnosis.</strong> The results 
                provided are for informational purposes only and should not be used as a substitute for 
                professional medical advice, diagnosis, or treatment.
              </p>
              <p>
                Always seek the advice of a qualified optometrist, ophthalmologist, or other qualified 
                health provider with any questions you may have regarding your vision or eye health.
              </p>
              <p>
                <strong>Never disregard professional medical advice</strong> or delay in seeking it because 
                of something you have read or results you have received from this screening tool.
              </p>
              <p>
                If you experience any vision problems, eye pain, or other eye-related symptoms, consult a 
                qualified eye care professional immediately.
              </p>
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

