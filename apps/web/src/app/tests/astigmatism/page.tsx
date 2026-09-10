/**
 * Astigmatism Test Page
 * Uses a radial fan chart to detect astigmatism
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

export default function AstigmatismTestPage() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [leftEyeResponse, setLeftEyeResponse] = useState<number | null>(null)
  const [rightEyeResponse, setRightEyeResponse] = useState<number | null>(null)
  const [currentEye, setCurrentEye] = useState<'left' | 'right'>('left')
  const [selectedLines, setSelectedLines] = useState<number[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, router])

  useEffect(() => {
    if (step === 'test' && canvasRef.current) {
      drawRadialChart()
    }
  }, [step])

  const drawRadialChart = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 40
    const numLines = 12 // 12 radial lines (like clock positions)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    // Draw 12 radial lines
    for (let i = 0; i < numLines; i++) {
      const angle = (i * Math.PI * 2) / numLines
      const x1 = centerX + Math.cos(angle) * 30
      const y1 = centerY + Math.sin(angle) * 30
      const x2 = centerX + Math.cos(angle) * radius
      const y2 = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }

  const handleLineSelection = (lineNumber: number) => {
    if (selectedLines.includes(lineNumber)) {
      setSelectedLines(selectedLines.filter(l => l !== lineNumber))
    } else {
      setSelectedLines([...selectedLines, lineNumber])
    }
  }

  const handleSubmitEye = () => {
    const response = selectedLines.length
    
    if (currentEye === 'left') {
      setLeftEyeResponse(response)
      setCurrentEye('right')
      setSelectedLines([])
    } else {
      setRightEyeResponse(response)
      finishTest(leftEyeResponse!, response)
    }
  }

  const finishTest = async (leftResponse: number, rightResponse: number) => {
    // Calculate result
    // If 0-1 lines appear darker: likely no astigmatism
    // If 2+ lines appear darker: possible astigmatism
    const leftStatus = leftResponse <= 1 ? 'Normal' : 'Possible Astigmatism'
    const rightStatus = rightResponse <= 1 ? 'Normal' : 'Possible Astigmatism'
    
    const testResult = {
      leftEye: {
        darkerLines: leftResponse,
        status: leftStatus
      },
      rightEye: {
        darkerLines: rightResponse,
        status: rightStatus
      },
      overallAssessment: leftResponse <= 1 && rightResponse <= 1 
        ? 'No signs of astigmatism detected' 
        : 'Possible astigmatism detected - consult an eye care professional'
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
            test_type: 'Astigmatism',
            test_name: 'Radial Fan Chart',
            test_data: testResult,
            score: leftResponse + rightResponse,
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
              <div className="text-6xl mb-4">🌀</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Astigmatism Test</h1>
              <p className="text-gray-600">Radial Fan Chart Screening</p>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">What is this test?</h3>
                <p>
                  This test uses a radial fan chart with lines radiating from the center. 
                  If you have astigmatism, some lines may appear darker or sharper than others.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>You'll test each eye separately</li>
                  <li>Cover one eye with your hand (don't press on it)</li>
                  <li>Look at the radial chart and identify which lines appear darker or sharper</li>
                  <li>Select all lines that appear darker than the others</li>
                  <li>Repeat for the other eye</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Sit about 2 feet (60cm) from your screen in good lighting.
                  If all lines appear equally dark, that's normal! Only select lines that appear 
                  noticeably darker or sharper.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Screening Notice:</strong> This is a screening tool, not a diagnostic test. 
                  Results do not constitute a medical diagnosis. Please consult an eye care professional 
                  for a comprehensive eye examination.
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
                Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Cover your {currentEye === 'left' ? 'right' : 'left'} eye
              </h2>
              <p className="text-gray-600">
                Select the numbers of any lines that appear darker or sharper
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="relative inline-block">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={400}
                  className="border-2 border-gray-300 rounded-lg"
                />
                {/* Number labels around the chart */}
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * Math.PI * 2) / 12 - Math.PI / 2
                    const distance = 220
                    const x = 200 + Math.cos(angle) * distance
                    const y = 200 + Math.sin(angle) * distance
                    return (
                      <div
                        key={i}
                        className="absolute text-sm font-semibold text-gray-600"
                        style={{
                          left: `${x}px`,
                          top: `${y}px`,
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        {i + 1}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Line selection buttons */}
            <div className="grid grid-cols-6 gap-2 max-w-md mx-auto mb-8">
              {[...Array(12)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleLineSelection(i + 1)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-colors ${
                    selectedLines.includes(i + 1)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <button
                onClick={handleSubmitEye}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                {currentEye === 'left' ? 'Continue to Right Eye' : 'Finish Test'}
              </button>
              <button
                onClick={() => setSelectedLines([])}
                className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Clear Selection
              </button>
              <p className="text-sm text-gray-500 text-center">
                If all lines look the same, leave nothing selected and continue
              </p>
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
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-4 text-center">Assessment</p>
              <p className="text-2xl font-bold text-indigo-600 text-center">{result.overallAssessment}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Left Eye</p>
                <p className="text-lg text-gray-900">{result.leftEye.status}</p>
                <p className="text-sm text-gray-500 mt-1">{result.leftEye.darkerLines} line(s) selected</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-2 font-semibold">Right Eye</p>
                <p className="text-lg text-gray-900">{result.rightEye.status}</p>
                <p className="text-sm text-gray-500 mt-1">{result.rightEye.darkerLines} line(s) selected</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a screening result, not a medical diagnosis. 
                If possible astigmatism is detected, please consult an eye care professional 
                for a comprehensive eye examination and precise measurement.
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
