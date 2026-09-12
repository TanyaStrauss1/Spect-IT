/**
 * Clinical Astigmatism Test Page (Clock Dial)
 * 12 radial lines, per-eye testing, axis indication only (no cylinder power)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import EnhancedClockDial from '@/components/EnhancedClockDial'
import { createAstigmatismTest, TEST_TYPE_ID, type ClockPosition, type EyeAstigmatismResult } from '@spect-it/cv'

type Eye = 'right' | 'left'

export default function AstigmatismTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createAstigmatismTest())
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [selectedPositions, setSelectedPositions] = useState<ClockPosition[]>([])
  const [rightEyeResult, setRightEyeResult] = useState<EyeAstigmatismResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeAstigmatismResult | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, authLoading, router])

  const togglePosition = (position: ClockPosition) => {
    if (selectedPositions.includes(position)) {
      setSelectedPositions(selectedPositions.filter(p => p !== position))
    } else {
      setSelectedPositions([...selectedPositions, position])
    }
  }

  const handleSubmitEye = () => {
    const eyeResult = test.processEyeResult(currentEye, selectedPositions)

    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      setCurrentEye('left')
      setSelectedPositions([])
    } else {
      setLeftEyeResult(eyeResult)
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (right: EyeAstigmatismResult, left: EyeAstigmatismResult) => {
    const result = test.createResult(undefined, right, left)
    setStep('result')

    // Mark test as complete in journey
    markTestComplete(TEST_TYPE_ID.ASTIGMATISM)

    if (user) {
      setSaving(true)
      try {
        await supabase.from('test_results').insert({
          user_id: user.id,
          test_type: TEST_TYPE_ID.ASTIGMATISM,
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
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Astigmatism Screening (Clock Dial)</h1>
            <div className="space-y-4 mb-8">
              <p className="text-gray-700">This test uses a clock dial to screen for astigmatism.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  {test.getInstructions().map((inst, i) => (<li key={i}>{inst}</li>))}
                </ul>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800"><strong>Note:</strong> This test provides axis indication only, not cylinder power. Comprehensive refraction required for prescription.</p>
              </div>
            </div>
            <button onClick={() => setStep('test')} className="w-full bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-orange-700 hover:to-amber-700">Start Test</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && rightEyeResult && leftEyeResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
                <p className="text-sm text-gray-700">{test.getInterpretation(rightEyeResult)}</p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
                <p className="text-sm text-gray-700">{test.getInterpretation(leftEyeResult)}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800"><strong>Screening Result:</strong> This test provides axis indication only. Comprehensive eye examination required for cylinder power and precise prescription.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="flex-1 bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700">Dashboard</button>
              <button onClick={() => router.push('/')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Home</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full font-semibold mb-4">
              {currentEye === 'right' ? 'Right Eye (OD) - Cover LEFT eye' : 'Left Eye (OS) - Cover RIGHT eye'}
            </div>
            <h3 className="text-xl text-gray-600 mb-2">Select lines that appear darker or sharper</h3>
            <p className="text-sm text-gray-500">If all lines look the same, don't select any</p>
          </div>
          
          {/* Enhanced Clock Dial */}
          <EnhancedClockDial
            selectedPositions={selectedPositions}
            onTogglePosition={togglePosition}
            diameterPx={400}
            lineWeight={3}
            showInstructions={false}
            className="mb-6"
          />
          
          <button 
            onClick={handleSubmitEye} 
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            {currentEye === 'right' ? 'Continue to Left Eye' : 'Complete Test'}
          </button>
        </div>
      </div>
    </div>
  )
}
