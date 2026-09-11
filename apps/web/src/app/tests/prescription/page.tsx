/**
 * Clinical Prescription Screening Page (Pinhole Method)
 * Honest refractive screening without fake prescriptions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { createPrescriptionScreeningTest, type PinholeResult } from '@spect-it/cv'

type Eye = 'right' | 'left'

export default function PrescriptionTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [test] = useState(() => createPrescriptionScreeningTest())
  const [step, setStep] = useState<'intro' | 'uncorrected' | 'pinhole' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [uncorrectedLogMAR, setUncorrectedLogMAR] = useState(0.5)
  const [pinholeLogMAR, setPinholeLogMAR] = useState(0.3)
  const [rightEye, setRightEye] = useState<PinholeResult | null>(null)
  const [leftEye, setLeftEye] = useState<PinholeResult | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) router.push('/auth/signin')
  }, [user, authLoading, router])

  const handleSubmitEye = () => {
    const result = test.processPinholeResult(currentEye, uncorrectedLogMAR, pinholeLogMAR)

    if (currentEye === 'right') {
      setRightEye(result)
      setCurrentEye('left')
      setUncorrectedLogMAR(0.5)
      setPinholeLogMAR(0.3)
      setStep('uncorrected')
    } else {
      setLeftEye(result)
      finishTest(rightEye!, result)
    }
  }

  const finishTest = async (right: PinholeResult, left: PinholeResult) => {
    const result = test.createResult(undefined, right, left, null)
    setStep('result')

    if (user) {
      setSaving(true)
      try {
        await supabase.from('test_results').insert({
          user_id: user.id,
          test_type: 'Refractive Screening (Clinical)',
          test_data: result,
          results: { rightEye: right, leftEye: left, recommendation: result.recommendation },
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Refractive Screening (Pinhole Method)</h1>
            <div className="space-y-4 mb-8">
              <p className="text-gray-700">This test uses the pinhole method to detect refractive errors.</p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  {test.getPinholeInstructions().map((inst, i) => (<li key={i}>{inst}</li>))}
                </ul>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800"><strong>Disclaimer:</strong> This screening does NOT provide a prescription. Precise sphere, cylinder, and axis values require comprehensive refraction by an optometrist or ophthalmologist.</p>
              </div>
            </div>
            <button onClick={() => setStep('uncorrected')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700">Start Test</button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && rightEye && leftEye) {
    const result = test.createResult(undefined, rightEye, leftEye, null)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{result.category === 'NO_ERROR' ? '✓' : '⚠️'}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Screening Complete!</h2>
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Classification</p>
              <p className="text-2xl font-bold text-gray-900 mb-4">{result.category.replace('_', ' ')}</p>
              <p className="text-sm text-gray-700">{result.recommendation}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Right Eye</h3>
                <p className="text-sm text-gray-700">Improvement: {rightEye.improvement.toFixed(2)} logMAR {rightEye.significantImprovement ? '✓' : ''}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Left Eye</h3>
                <p className="text-sm text-gray-700">Improvement: {leftEye.improvement.toFixed(2)} logMAR {leftEye.significantImprovement ? '✓' : ''}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800"><strong>THIS IS A SCREENING ONLY.</strong> {result.disclaimer}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Dashboard</button>
              <button onClick={() => router.push('/')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Home</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
              {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'} - {step === 'uncorrected' ? 'Uncorrected Vision' : 'With Pinhole'}
            </div>
            <h3 className="text-xl text-gray-600">Measure visual acuity</h3>
            <p className="text-sm text-gray-500">(In full implementation, this would show actual acuity test)</p>
          </div>
          <div className="space-y-4 max-w-md mx-auto mb-6">
            {step === 'uncorrected' ? (
              <>
                <label className="block">
                  <span className="text-sm text-gray-700">Uncorrected LogMAR (simulated)</span>
                  <input type="number" step="0.1" value={uncorrectedLogMAR} onChange={(e) => setUncorrectedLogMAR(parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
                <button onClick={() => setStep('pinhole')} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Continue to Pinhole</button>
              </>
            ) : (
              <>
                <label className="block">
                  <span className="text-sm text-gray-700">Pinhole LogMAR (simulated)</span>
                  <input type="number" step="0.1" value={pinholeLogMAR} onChange={(e) => setPinholeLogMAR(parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </label>
                <button onClick={handleSubmitEye} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">Submit</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
