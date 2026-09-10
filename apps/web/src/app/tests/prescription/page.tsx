/**
 * Prescription Measurement Test Page
 * Screening-level refractive estimate
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

// Test optotypes at different sizes for sphere estimation
const testSizes = [
  { level: 1, size: 48, approximatePower: '+2.00 to +1.00' },
  { level: 2, size: 36, approximatePower: '+1.00 to 0.00' },
  { level: 3, size: 24, approximatePower: '0.00 (Plano)' },
  { level: 4, size: 18, approximatePower: '-0.50 to -1.00' },
  { level: 5, size: 14, approximatePower: '-1.50 to -2.00' },
  { level: 6, size: 12, approximatePower: '-2.50 to -3.00' },
]

const testLetters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D']

export default function PrescriptionTestPage() {
  const [step, setStep] = useState<'intro' | 'distance' | 'near' | 'astigmatism' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<'left' | 'right'>('left')
  const [distanceResults, setDistanceResults] = useState<any>({ left: null, right: null })
  const [nearResults, setNearResults] = useState<any>({ left: null, right: null })
  const [astigmatismResults, setAstigmatismResults] = useState<any>({ left: false, right: false })
  const [currentSize, setCurrentSize] = useState(3) // Start at plano
  const [currentLetter, setCurrentLetter] = useState('')
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (step === 'distance' || step === 'near') {
      generateRandomLetter()
    }
  }, [step, currentSize])

  const generateRandomLetter = () => {
    const randomLetter = testLetters[Math.floor(Math.random() * testLetters.length)]
    setCurrentLetter(randomLetter)
  }

  const handleLetterResponse = (canRead: boolean) => {
    if (canRead && currentSize < testSizes.length) {
      // Can read current size, try smaller
      setCurrentSize(currentSize + 1)
    } else {
      // Can't read or reached end, record result
      const eyeResult = {
        smallestReadable: currentSize - (canRead ? 0 : 1),
        estimatedPower: testSizes[Math.max(0, currentSize - (canRead ? 1 : 2))].approximatePower
      }

      if (step === 'distance') {
        const newDistanceResults = { ...distanceResults }
        newDistanceResults[currentEye] = eyeResult
        setDistanceResults(newDistanceResults)

        if (currentEye === 'left') {
          setCurrentEye('right')
          setCurrentSize(3)
        } else {
          setStep('near')
          setCurrentEye('left')
          setCurrentSize(3)
        }
      } else if (step === 'near') {
        const newNearResults = { ...nearResults }
        newNearResults[currentEye] = eyeResult
        setNearResults(newNearResults)

        if (currentEye === 'left') {
          setCurrentEye('right')
          setCurrentSize(3)
        } else {
          setStep('astigmatism')
          setCurrentEye('left')
        }
      }
    }
  }

  const handleAstigmatismResponse = (hasAstigmatism: boolean) => {
    const newAstigmatismResults = { ...astigmatismResults }
    newAstigmatismResults[currentEye] = hasAstigmatism

    if (currentEye === 'left') {
      setCurrentEye('right')
      setAstigmatismResults(newAstigmatismResults)
    } else {
      setAstigmatismResults(newAstigmatismResults)
      finishTest(newAstigmatismResults)
    }
  }

  const finishTest = async (finalAstigmatismResults: any) => {
    // Generate prescription estimate
    const leftPrescription = {
      distance: distanceResults.left?.estimatedPower || 'Unable to determine',
      near: nearResults.left?.estimatedPower || 'Unable to determine',
      astigmatism: finalAstigmatismResults.left ? 'Possible (requires professional measurement)' : 'Unlikely'
    }

    const rightPrescription = {
      distance: distanceResults.right?.estimatedPower || 'Unable to determine',
      near: nearResults.right?.estimatedPower || 'Unable to determine',
      astigmatism: finalAstigmatismResults.right ? 'Possible (requires professional measurement)' : 'Unlikely'
    }

    const testResult = {
      leftEye: leftPrescription,
      rightEye: rightPrescription,
      disclaimer: 'This is a screening-level estimate only. Accurate prescription requires professional refraction by an optometrist or ophthalmologist.',
      rawData: {
        distance: distanceResults,
        near: nearResults,
        astigmatism: finalAstigmatismResults
      }
    }

    setResult(testResult)
    setStep('result')

    // Save to Supabase
    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            user_email: user.email,
            test_type: 'Prescription Measurement',
            test_name: 'Refractive Screening Estimate',
            test_data: testResult,
            score: 0, // Not applicable for prescription
            test_date: new Date().toISOString(),
          })

        if (error) {
          console.error('Error saving test result:', error)
        }
      } catch (error) {
        console.error('Error saving test result:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔬</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Prescription Measurement</h1>
              <p className="text-gray-600">Screening-Level Refractive Estimate</p>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">What is this test?</h3>
                <p>
                  This screening provides a <strong>rough estimate</strong> of your refractive error 
                  (nearsightedness, farsightedness) by testing your ability to read letters at different 
                  sizes and distances.
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-800 font-semibold">
                  <strong>⚠️ IMPORTANT LIMITATIONS:</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                  <li>This is NOT a replacement for a professional eye exam</li>
                  <li>Results are approximate estimates only</li>
                  <li>Cannot measure cylinder power (astigmatism correction) precisely</li>
                  <li>Cannot determine axis, prism, or other prescription details</li>
                  <li>Screen quality and viewing distance affect accuracy</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Remove any glasses or contact lenses</li>
                  <li>You'll test distance vision (far), near vision (reading), and astigmatism</li>
                  <li>Test each eye separately by covering the other</li>
                  <li>Indicate whether you can clearly read the displayed letter</li>
                  <li>Be honest - this helps generate a more accurate estimate</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Setup:</strong> Sit about 2 feet (60cm) from your screen for distance testing. 
                  For near testing, you'll move closer to about 14 inches (35cm). Use good, even lighting.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Screening Notice:</strong> This is a screening tool only. 
                  For an accurate prescription, schedule a comprehensive eye exam with an optometrist or ophthalmologist.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('distance')}
              className="w-full mt-8 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
            >
              Start Screening
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'distance' || step === 'near') {
    const testSize = testSizes[currentSize - 1] || testSizes[testSizes.length - 1]
    const isDistance = step === 'distance'

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                {isDistance ? 'Distance' : 'Near'} Vision - Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cover your {currentEye === 'left' ? 'right' : 'left'} eye
              </h2>
              <p className="text-gray-600">
                {isDistance ? 'Sit 2 feet (60cm) from screen' : 'Lean in to about 14 inches (35cm)'}
              </p>
            </div>

            <div className="bg-white border-4 border-gray-200 rounded-lg p-12 mb-8 min-h-[300px] flex items-center justify-center">
              <div 
                className="font-bold select-none"
                style={{ 
                  fontSize: `${testSize.size}px`,
                  letterSpacing: '0.1em'
                }}
              >
                {currentLetter}
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Can you read this letter clearly?
              </p>
              <p className="text-sm text-gray-500">
                Size level {currentSize} of {testSizes.length}
              </p>
            </div>

            <div className="flex gap-4 max-w-lg mx-auto">
              <button
                onClick={() => handleLetterResponse(true)}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
              >
                Yes, I can read it ✓
              </button>
              <button
                onClick={() => handleLetterResponse(false)}
                className="flex-1 bg-red-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors text-lg"
              >
                No, it's blurry ✗
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'astigmatism') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                Astigmatism Check - Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cover your {currentEye === 'left' ? 'right' : 'left'} eye
              </h2>
              <p className="text-gray-600">
                Look at the lines below. Do some appear darker or sharper than others?
              </p>
            </div>

            <div className="bg-white border-4 border-gray-200 rounded-lg p-8 mb-8 flex justify-center">
              <svg width="300" height="300" viewBox="0 0 300 300">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * Math.PI * 2) / 12
                  const x1 = 150 + Math.cos(angle) * 20
                  const y1 = 150 + Math.sin(angle) * 20
                  const x2 = 150 + Math.cos(angle) * 130
                  const y2 = 150 + Math.sin(angle) * 130
                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="black"
                      strokeWidth="2"
                    />
                  )
                })}
              </svg>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                Do some lines appear noticeably darker or sharper than others?
              </p>
            </div>

            <div className="flex gap-4 max-w-lg mx-auto">
              <button
                onClick={() => handleAstigmatismResponse(true)}
                className="flex-1 bg-orange-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-lg"
              >
                Yes, some are darker
              </button>
              <button
                onClick={() => handleAstigmatismResponse(false)}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
              >
                No, all look the same
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Screening Complete!</h2>
            <p className="text-gray-600">Your estimates have been {saving ? 'saving...' : 'saved'}</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <p className="text-sm text-red-800 font-semibold mb-2">
                ⚠️ SCREENING ESTIMATE ONLY - NOT AN ACTUAL PRESCRIPTION
              </p>
              <p className="text-sm text-red-700">
                {result.disclaimer}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-center">Left Eye Estimate</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Distance (Sphere)</p>
                    <p className="text-lg font-semibold text-gray-900">{result.leftEye.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Near (Add)</p>
                    <p className="text-lg font-semibold text-gray-900">{result.leftEye.near}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Astigmatism</p>
                    <p className="text-lg font-semibold text-gray-900">{result.leftEye.astigmatism}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 text-center">Right Eye Estimate</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Distance (Sphere)</p>
                    <p className="text-lg font-semibold text-gray-900">{result.rightEye.distance}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Near (Add)</p>
                    <p className="text-lg font-semibold text-gray-900">{result.rightEye.near}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase">Astigmatism</p>
                    <p className="text-lg font-semibold text-gray-900">{result.rightEye.astigmatism}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Schedule a comprehensive eye exam with an optometrist or 
                ophthalmologist for an accurate prescription. Bring these screening results to help guide 
                the discussion. Professional refraction can measure precise sphere, cylinder, axis, and 
                other parameters this screening cannot detect.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
