/**
 * Clinical Visual Field Test Page (Amsler Grid)
 * Central 20° field screening, per-eye testing
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import InteractiveAmslerGrid from '@/components/InteractiveAmslerGrid'
import { createVisualFieldTest, TEST_TYPE_ID, type GridIssue, type IssueType, type EyeVisualFieldResult } from '@spect-it/cv'

type Eye = 'right' | 'left'

export default function VisualFieldTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createVisualFieldTest())
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [issues, setIssues] = useState<GridIssue[]>([])
  const [centralFixation, setCentralFixation] = useState(true)
  const [rightEyeResult, setRightEyeResult] = useState<EyeVisualFieldResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeVisualFieldResult | null>(null)
  const [saving, setSaving] = useState(false)

  const config = test.getGridConfig()

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/auth/signin')
  }, [user, authLoading, router])

  const handleSubmitEye = () => {
    const eyeResult = test.processEyeResult(currentEye, issues, centralFixation)

    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      setCurrentEye('left')
      setIssues([])
      setCentralFixation(true)
    } else {
      setLeftEyeResult(eyeResult)
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (right: EyeVisualFieldResult, left: EyeVisualFieldResult) => {
    const result = test.createResult(undefined, right, left)
    setStep('result')

    // Mark test as complete in journey
    markTestComplete(TEST_TYPE_ID.VISUAL_FIELD)

    if (user) {
      setSaving(true)
      try {
        await supabase.from('test_results').insert({
          user_id: user.id,
          test_type: TEST_TYPE_ID.VISUAL_FIELD,
          test_data: result,
          results: { rightEye: right, leftEye: left, methodology: result.methodology },
        })
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Visual Field Screening (Amsler Grid)</h1>
            <div className="space-y-4 mb-8">
              <p className="text-gray-700">This test screens your central {config.coverageDegrees}° visual field for scotomas and distortions.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  {test.getInstructions().map((inst, i) => (<li key={i}>{inst}</li>))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800"><strong>Important:</strong> {test.createResult(undefined, null, null).limitations}</p>
              </div>
            </div>
            <button onClick={() => setStep('test')} className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700">Start Test</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && rightEyeResult && leftEyeResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{(!rightEyeResult.hasAbnormalities && !leftEyeResult.hasAbnormalities) ? '✓' : '⚠️'}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
                <p className="text-sm text-gray-700">{test.getInterpretation(rightEyeResult)}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
                <p className="text-sm text-gray-700">{test.getInterpretation(leftEyeResult)}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800"><strong>Screening Result:</strong> Central visual field only. Does not detect peripheral field loss or glaucoma. Comprehensive perimetry required for full assessment.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700">Dashboard</button>
              <button onClick={() => router.push('/')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Home</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Simplified Amsler grid rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-teal-100 text-teal-600 px-4 py-2 rounded-full font-semibold mb-4">
              {currentEye === 'right' ? 'Right Eye (OD) - Cover LEFT eye' : 'Left Eye (OS) - Cover RIGHT eye'}
            </div>
            <h3 className="text-xl text-gray-600 mb-2">Look at the central dot</h3>
            <p className="text-sm text-gray-500">Click to mark any distorted, missing, blurry, or dark areas</p>
          </div>
          
          {/* Interactive Amsler Grid */}
          <InteractiveAmslerGrid
            gridSize={10}
            pixelSize={400}
            onIssuesChange={setIssues}
            showInstructions={false}
            className="mb-6"
          />
          
          {/* Central fixation status */}
          <div className="mb-6 max-w-md mx-auto">
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input 
                type="checkbox" 
                checked={!centralFixation} 
                onChange={(e) => setCentralFixation(!e.target.checked)} 
                className="w-5 h-5" 
              />
              <span className="text-sm text-gray-700 font-medium">
                The central fixation dot is missing, distorted, or I cannot see it clearly
              </span>
            </label>
          </div>
          
          {/* Clinical note */}
          <p className="text-xs text-gray-500 text-center mb-6">
            Interactive 10×10 Amsler grid • Central 20° field screening • 
            {issues.length} region(s) marked
          </p>
          
          <button 
            onClick={handleSubmitEye} 
            className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            {currentEye === 'right' ? 'Continue to Left Eye' : 'Complete Test'}
          </button>
        </div>
      </div>
    </div>
  )
}
