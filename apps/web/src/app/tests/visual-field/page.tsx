/**
 * Visual Field Test Page
 * Simple central/peripheral screening (not full clinical perimetry)
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

// Grid positions for peripheral vision testing (9 zones: center + 8 surrounding)
const testPositions = [
  { id: 1, x: 50, y: 20, zone: 'top' },
  { id: 2, x: 80, y: 20, zone: 'top-right' },
  { id: 3, x: 80, y: 50, zone: 'right' },
  { id: 4, x: 80, y: 80, zone: 'bottom-right' },
  { id: 5, x: 50, y: 80, zone: 'bottom' },
  { id: 6, x: 20, y: 80, zone: 'bottom-left' },
  { id: 7, x: 20, y: 50, zone: 'left' },
  { id: 8, x: 20, y: 20, zone: 'top-left' },
]

export default function VisualFieldTestPage() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<'left' | 'right'>('left')
  const [currentTrial, setCurrentTrial] = useState(0)
  const [showStimulus, setShowStimulus] = useState(false)
  const [stimulusPosition, setStimulusPosition] = useState<any>(null)
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (step === 'test' && !waitingForResponse && currentTrial < testPositions.length) {
      // Random delay between 1-3 seconds before showing stimulus
      const delay = 1000 + Math.random() * 2000
      timeoutRef.current = setTimeout(() => {
        showNextStimulus()
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [step, currentTrial, waitingForResponse])

  const showNextStimulus = () => {
    const position = testPositions[currentTrial]
    setStimulusPosition(position)
    setShowStimulus(true)
    setWaitingForResponse(true)

    // Stimulus shows for 500ms
    setTimeout(() => {
      setShowStimulus(false)
    }, 500)
  }

  const handleResponse = (detected: boolean) => {
    if (!waitingForResponse) return

    const response = {
      trial: currentTrial + 1,
      position: stimulusPosition,
      detected,
      eye: currentEye,
      timestamp: Date.now()
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)
    setWaitingForResponse(false)

    if (currentTrial < testPositions.length - 1) {
      setCurrentTrial(currentTrial + 1)
    } else {
      // Move to next eye or finish
      if (currentEye === 'left') {
        setCurrentEye('right')
        setCurrentTrial(0)
      } else {
        finishTest(newResponses)
      }
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    // Calculate results for each eye
    const leftEyeResponses = finalResponses.filter(r => r.eye === 'left')
    const rightEyeResponses = finalResponses.filter(r => r.eye === 'right')

    const leftDetected = leftEyeResponses.filter(r => r.detected).length
    const rightDetected = rightEyeResponses.filter(r => r.detected).length

    const leftPercentage = (leftDetected / leftEyeResponses.length) * 100
    const rightPercentage = (rightDetected / rightEyeResponses.length) * 100

    // Identify any blind spots
    const missedZones = {
      left: leftEyeResponses.filter(r => !r.detected).map(r => r.position.zone),
      right: rightEyeResponses.filter(r => !r.detected).map(r => r.position.zone)
    }

    let assessment = ''
    if (leftPercentage >= 85 && rightPercentage >= 85) {
      assessment = 'Normal peripheral vision detected'
    } else if (leftPercentage >= 70 && rightPercentage >= 70) {
      assessment = 'Mild peripheral vision concerns - consider professional evaluation'
    } else {
      assessment = 'Peripheral vision concerns detected - consult an eye care professional'
    }

    const testResult = {
      leftEye: {
        detected: leftDetected,
        total: leftEyeResponses.length,
        percentage: Math.round(leftPercentage),
        missedZones: missedZones.left
      },
      rightEye: {
        detected: rightDetected,
        total: rightEyeResponses.length,
        percentage: Math.round(rightPercentage),
        missedZones: missedZones.right
      },
      assessment,
      responses: finalResponses
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
            test_type: 'Visual Field',
            test_name: 'Peripheral Vision Screening',
            test_data: testResult,
            score: Math.round((leftPercentage + rightPercentage) / 2),
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
              <div className="text-6xl mb-4">📍</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Visual Field Test</h1>
              <p className="text-gray-600">Peripheral Vision Screening</p>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">What is this test?</h3>
                <p>
                  This test screens your peripheral (side) vision by presenting brief flashes 
                  of light in different areas while you focus on a central point. It can help 
                  detect blind spots or reduced peripheral vision.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>You'll test each eye separately</li>
                  <li>Cover one eye with your hand (don't press on it)</li>
                  <li>Keep your gaze fixed on the central dot - DO NOT look around</li>
                  <li>Click "Saw It" if you see a flash in your peripheral vision</li>
                  <li>Click "Missed It" if you don't see anything after a few seconds</li>
                  <li>Repeat for the other eye</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Keep your eyes focused on the central dot at all times. 
                  Use your peripheral vision to detect the flashes. Sit about 2 feet (60cm) from your 
                  screen in good lighting.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Screening Notice:</strong> This is a basic screening, not full clinical perimetry. 
                  Results do not constitute a medical diagnosis. Please consult an eye care professional 
                  for comprehensive visual field testing if you have concerns.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('test')}
              className="w-full mt-8 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'test') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye - Trial {currentTrial + 1} of {testPositions.length}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cover your {currentEye === 'left' ? 'right' : 'left'} eye
              </h2>
              <p className="text-gray-600">
                Keep your gaze on the center dot. Click when you see a flash.
              </p>
            </div>

            {/* Test Area */}
            <div 
              className="relative bg-gray-100 rounded-lg mx-auto mb-8"
              style={{ width: '500px', height: '500px' }}
            >
              {/* Central fixation point */}
              <div 
                className="absolute bg-red-500 rounded-full"
                style={{
                  width: '12px',
                  height: '12px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)'
                }}
              />

              {/* Stimulus */}
              {showStimulus && stimulusPosition && (
                <div 
                  className="absolute bg-white rounded-full animate-pulse"
                  style={{
                    width: '30px',
                    height: '30px',
                    left: `${stimulusPosition.x}%`,
                    top: `${stimulusPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)'
                  }}
                />
              )}
            </div>

            {/* Response Buttons */}
            <div className="flex gap-4 max-w-lg mx-auto">
              <button
                onClick={() => handleResponse(true)}
                disabled={!waitingForResponse}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  waitingForResponse
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Saw It ✓
              </button>
              <button
                onClick={() => handleResponse(false)}
                disabled={!waitingForResponse}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition-colors ${
                  waitingForResponse
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Missed It ✗
              </button>
            </div>

            {!waitingForResponse && (
              <p className="text-center text-gray-500 text-sm mt-4">
                Next flash coming soon... Keep your eyes on the center dot!
              </p>
            )}

            {/* Progress */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{responses.filter(r => r.eye === currentEye).length} / {testPositions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(responses.filter(r => r.eye === currentEye).length / testPositions.length) * 100}%` 
                  }}
                />
              </div>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            <p className="text-gray-600">Your results have been {saving ? 'saving...' : 'saved'}</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Assessment</p>
              <p className="text-2xl font-bold text-indigo-600">{result.assessment}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Left Eye</p>
                <p className="text-4xl font-bold text-gray-900">{result.leftEye.percentage}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.leftEye.detected}/{result.leftEye.total} detected
                </p>
                {result.leftEye.missedZones.length > 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    Missed: {result.leftEye.missedZones.join(', ')}
                  </p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Right Eye</p>
                <p className="text-4xl font-bold text-gray-900">{result.rightEye.percentage}%</p>
                <p className="text-sm text-gray-500 mt-1">
                  {result.rightEye.detected}/{result.rightEye.total} detected
                </p>
                {result.rightEye.missedZones.length > 0 && (
                  <p className="text-xs text-red-600 mt-2">
                    Missed: {result.rightEye.missedZones.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a basic screening result, not a comprehensive visual field test. 
                Missing peripheral stimuli may indicate potential vision concerns. Please consult an eye care 
                professional for a full evaluation if concerns are detected.
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
