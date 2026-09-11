/**
 * Clinical Results Summary Page
 * Unified results page with per-eye breakdown, PDF export, and recommendations
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth/auth-context'
import { generateClinicalSummary, type TestResult, type ClinicalSummary } from '@/lib/results/clinical-summary'
import { Button } from '@/components/ui'
import Link from 'next/link'

export default function ClinicalSummaryPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<ClinicalSummary | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/signin')
      return
    }
    loadResults()
  }, [user, authLoading, router])

  const loadResults = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setResults(data || [])
      setSummary(generateClinicalSummary(data || []))
    } catch (error) {
      console.error('Error loading results:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintPDF = () => {
    window.print()
  }

  const handleShare = async () => {
    const text = `Spect-IT Vision Screening Report\n\nCompleted: ${new Date().toLocaleDateString()}\n\nView full results at spect-it.com\n\nNote: Screening only — not a diagnosis or prescription.`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Spect-IT Vision Screening',
          text: text,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handlePrintPDF()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your clinical summary...</p>
        </div>
      </div>
    )
  }

  if (!results.length || !summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Results Yet</h2>
            <p className="text-gray-600 mb-6">Complete some vision tests to see your clinical summary</p>
            <Link href="/tests">
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                Browse Tests
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 print:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Screening Summary</h1>
              <p className="text-gray-600">Generated {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
            </div>
            <div className="flex gap-2 print:hidden">
              <Button
                onClick={handlePrintPDF}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                📄 Download PDF
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
              >
                📤 Share
              </Button>
            </div>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> This is a screening, not a diagnosis or dispensable prescription. 
              Consult a licensed optometrist or ophthalmologist for clinical decisions.
            </p>
          </div>
        </div>

        {/* Visual Acuity Summary */}
        {(summary.leftEye || summary.rightEye || summary.bothEyes) && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8 print:shadow-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              📏 Distance Vision (Visual Acuity)
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {summary.leftEye && (
                <div className="p-6 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
                  <div className="text-sm font-bold text-purple-700 mb-2">Left Eye (OS)</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{summary.leftEye.snellen}</div>
                  {summary.leftEye.interpretation && (
                    <>
                      <div 
                        className="text-lg font-semibold mb-1"
                        style={{ color: summary.leftEye.interpretation.color }}
                      >
                        {summary.leftEye.interpretation.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        logMAR: {summary.leftEye.logMAR?.toFixed(2)}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Tested {new Date(summary.leftEye.date!).toLocaleDateString()}
                  </div>
                </div>
              )}

              {summary.rightEye && (
                <div className="p-6 rounded-lg border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
                  <div className="text-sm font-bold text-orange-700 mb-2">Right Eye (OD)</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{summary.rightEye.snellen}</div>
                  {summary.rightEye.interpretation && (
                    <>
                      <div 
                        className="text-lg font-semibold mb-1"
                        style={{ color: summary.rightEye.interpretation.color }}
                      >
                        {summary.rightEye.interpretation.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        logMAR: {summary.rightEye.logMAR?.toFixed(2)}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Tested {new Date(summary.rightEye.date!).toLocaleDateString()}
                  </div>
                </div>
              )}

              {summary.bothEyes && (
                <div className="p-6 rounded-lg border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
                  <div className="text-sm font-bold text-green-700 mb-2">Both Eyes</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{summary.bothEyes.snellen}</div>
                  {summary.bothEyes.interpretation && (
                    <>
                      <div 
                        className="text-lg font-semibold mb-1"
                        style={{ color: summary.bothEyes.interpretation.color }}
                      >
                        {summary.bothEyes.interpretation.category}
                      </div>
                      <div className="text-sm text-gray-600">
                        logMAR: {summary.bothEyes.logMAR?.toFixed(2)}
                      </div>
                    </>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    Tested {new Date(summary.bothEyes.date!).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendation */}
            {(summary.leftEye?.interpretation || summary.rightEye?.interpretation || summary.bothEyes?.interpretation) && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-900">
                  <strong>Recommendation:</strong>{' '}
                  {summary.leftEye?.interpretation?.recommendation || 
                   summary.rightEye?.interpretation?.recommendation || 
                   summary.bothEyes?.interpretation?.recommendation}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Other Tests Summary */}
        {(summary.colorVision || summary.contrast || summary.astigmatism || summary.prescription || summary.visualField) && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-8 print:shadow-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">🎨 Other Screening Tests</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {summary.colorVision && (
                <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🎨</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Color Vision</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {summary.colorVision.test_data?.screeningResult || 'See details'}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tested {new Date(summary.colorVision.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {summary.contrast && (
                <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🌓</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Contrast Sensitivity</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {summary.contrast.test_data?.assessment || 
                         `${((summary.contrast.score || 0) * 100).toFixed(0)}% correct`}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tested {new Date(summary.contrast.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {summary.astigmatism && (
                <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">⚫</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Astigmatism</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {summary.astigmatism.test_data?.overallAssessment || 'See details'}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tested {new Date(summary.astigmatism.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {summary.prescription && (
                <div className="p-4 rounded-lg border-2 border-amber-200 bg-amber-50 hover:border-amber-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🔍</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Refractive Screening</div>
                      <div className="text-sm text-amber-700 mt-1 font-semibold">
                        Screening estimate only — NOT dispensable
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tested {new Date(summary.prescription.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {summary.visualField && (
                <div className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">👁️</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">Visual Field</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {summary.visualField.test_data?.assessment || 'See details'}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Tested {new Date(summary.visualField.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* When to See an Optometrist */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            👁️ When to See an Optometrist
          </h2>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <div className="font-semibold text-gray-900">Annual eye exams</div>
                <div className="text-sm text-gray-600">Recommended for everyone, even with good screening results.</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600 text-xl">!</span>
              <div>
                <div className="font-semibold text-gray-900">Vision changes</div>
                <div className="text-sm text-gray-600">If you notice blurriness, difficulty reading, or eye strain.</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
              <span className="text-yellow-600 text-xl">!</span>
              <div>
                <div className="font-semibold text-gray-900">Reduced acuity</div>
                <div className="text-sm text-gray-600">If your screening shows reduced vision (logMAR &gt; 0.3).</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <span className="text-red-600 text-xl">🚨</span>
              <div>
                <div className="font-semibold text-gray-900">Urgent signs</div>
                <div className="text-sm text-gray-600">Flashes of light, sudden vision loss, distortion, or eye pain — see an eye care professional immediately.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 print:hidden">
          <Link href="/dashboard">
            <Button variant="outline">← Back to Dashboard</Button>
          </Link>
          <Link href="/tests">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              Take More Tests
            </Button>
          </Link>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
