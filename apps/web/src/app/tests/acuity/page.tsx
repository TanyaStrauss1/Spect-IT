/**
 * Visual Acuity Test Page
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

export default function AcuityTestPage() {
  const [distance, setDistance] = useState<number>(2.0)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [currentLine, setCurrentLine] = useState(1)
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
    initializeTest()
  }, [user, router])

  const initializeTest = async () => {
    try {
      // Initialize camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      // Simulate calibration after 2 seconds
      setTimeout(() => {
        setIsCalibrated(true)
      }, 2000)
    } catch (error) {
      console.error('Failed to initialize camera:', error)
      // Continue without camera for now
      setIsCalibrated(true)
    }
  }

  // Snellen letters for each line (simplified)
  const snellenLines = [
    ['E'],                    // Line 1: 20/200
    ['F', 'P'],              // Line 2: 20/100
    ['T', 'O', 'Z'],         // Line 3: 20/70
    ['L', 'P', 'E', 'D'],    // Line 4: 20/50
    ['P', 'E', 'C', 'F', 'D'], // Line 5: 20/40
    ['E', 'D', 'F', 'C', 'Z', 'P'], // Line 6: 20/30
    ['F', 'E', 'L', 'O', 'P', 'Z', 'D'], // Line 7: 20/25
    ['D', 'E', 'F', 'P', 'O', 'T', 'E', 'C'], // Line 8: 20/20
  ]

  const snellenScores = ['20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/25', '20/20']

  const handleSubmit = () => {
    const correctLetters = snellenLines[currentLine - 1]
    const userLetters = userInput.trim().toUpperCase().split(/\s+/)
    const isCorrect = userLetters.length === correctLetters.length && 
                      userLetters.every((letter, i) => letter === correctLetters[i])

    const newResponses = [...responses, {
      line: currentLine,
      letters: correctLetters,
      userInput: userLetters,
      correct: isCorrect
    }]
    setResponses(newResponses)

    if (isCorrect && currentLine < snellenLines.length) {
      setCurrentLine(currentLine + 1)
      setUserInput('')
    } else {
      finishTest(newResponses)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    // Calculate result - last line passed
    const lastCorrect = finalResponses.filter(r => r.correct).length
    const snellenScore = snellenScores[Math.min(lastCorrect, snellenScores.length - 1)]
    
    const testResult = {
      snellen: snellenScore,
      decimal: parseFloat((20 / parseInt(snellenScore.split('/')[1])).toFixed(2)),
      logMAR: parseFloat((Math.log10(parseInt(snellenScore.split('/')[1]) / 20)).toFixed(2)),
      linesRead: lastCorrect,
      responses: finalResponses
    }

    setResult(testResult)

    // Save to Supabase
    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            user_email: user.email,
            test_type: 'Visual Acuity',
            test_name: 'Snellen Chart',
            test_data: testResult,
            score: lastCorrect,
            decimal_acuity: testResult.decimal,
            test_date: new Date().toISOString(),
            test_distance: distance,
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

  if (result) {
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
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Snellen Acuity</p>
                <p className="text-5xl font-bold text-indigo-600">{result.snellen}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Decimal</p>
                  <p className="text-2xl font-semibold text-gray-900">{result.decimal}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">LogMAR</p>
                  <p className="text-2xl font-semibold text-gray-900">{result.logMAR}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a screening result, not a medical diagnosis. 
                  Please consult an eye care professional for a comprehensive eye examination.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Distance Calibration */}
        {!isCalibrated && (
          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Setting Up Camera</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Please allow camera access and position yourself 2 meters from the screen</p>
              </div>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md mx-auto rounded-lg"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          </div>
        )}

        {/* Test Display */}
        {isCalibrated && currentLine <= snellenLines.length && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                Line {currentLine} of {snellenLines.length}
              </div>
              <h3 className="text-xl text-gray-600 mb-2">Read the letters below</h3>
            </div>

            <div 
              className="text-center font-bold mb-8 tracking-wider" 
              style={{ 
                fontSize: `${Math.max(24, 120 - (currentLine * 12))}px`,
                letterSpacing: '0.1em'
              }}
            >
              {snellenLines[currentLine - 1].join(' ')}
            </div>
            
            <div className="space-y-4 max-w-lg mx-auto">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                placeholder="Type the letters you see (space between letters)"
                className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                autoFocus
              />
              <button
                onClick={handleSubmit}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
              >
                Submit Answer
              </button>
              <p className="text-sm text-gray-500 text-center">
                Press Enter to submit
              </p>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        {isCalibrated && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{responses.length} / {snellenLines.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(responses.length / snellenLines.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

