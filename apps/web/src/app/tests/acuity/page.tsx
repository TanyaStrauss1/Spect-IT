/**
 * Clinical Visual Acuity Test Page
 * 
 * ETDRS/LogMAR standard with Sloan letters, per-eye testing, calibration-based angular sizing
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import CalibrationModal, { useCalibration } from '@/components/CalibrationModal'
import SloanOptotype from '@/components/SloanOptotype'
import { useJourney } from '@/lib/journey/useJourney'
import {
  createVisualAcuityTest,
  ETDRS_CHART,
  calculateSloanStrokeWidth,
  TEST_TYPE_ID,
  type VisualAcuityTest,
  type ETDRSLine,
  type LetterResponse,
  type LineResponse,
  type EyeResult,
  type SloanLetter,
} from '@spect-it/cv'

type Eye = 'right' | 'left'

export default function AcuityTestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  
  const [test] = useState(() => createVisualAcuityTest({ startLogMAR: 0.5 }))
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [lineResponses, setLineResponses] = useState<LineResponse[]>([])
  const [rightEyeResult, setRightEyeResult] = useState<EyeResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeResult | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [saving, setSaving] = useState(false)

  const chartLines = test.getChartLines()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, router])

  const startTest = () => {
    const handleReady = () => {
      // Test is ready to begin after calibration
    }
    ensureCalibration(handleReady)
  }

  useEffect(() => {
    if (user && !isModalOpen) {
      startTest()
    }
  }, [user])

  const currentLine = chartLines[currentLineIndex]
  const calibration = calibrator.getCalibration() || calibrator.getDefaultCalibration()
  
  // Calculate stroke width for Sloan optotype rendering
  const strokeWidthPx = currentLine 
    ? calculateSloanStrokeWidth(
        currentLine.logMAR,
        calibration.pxPerMm,
        calibration.distanceCm * 10
      )
    : 12

  const handleLetterSubmit = () => {
    if (!currentLine) return

    const letter = currentLine.letters[currentLetterIndex]
    const correct = test.checkResponse(letter, userInput)
    
    const response: LetterResponse = {
      letter,
      userResponse: userInput.trim().toUpperCase(),
      correct,
    }

    // Add to current line's responses
    const currentLineLetters = lineResponses[currentLineIndex]?.letters || []
    const updatedLineLetters = [...currentLineLetters, response]

    // Check if line is complete
    if (updatedLineLetters.length === currentLine.letters.length) {
      const lineResponse = test.scoreLine(currentLine, updatedLineLetters)
      const updatedLineResponses = [...lineResponses]
      updatedLineResponses[currentLineIndex] = lineResponse
      setLineResponses(updatedLineResponses)

      // Check if we should stop or continue
      if (test.shouldStop(lineResponse) || currentLineIndex >= chartLines.length - 1) {
        // Finish current eye
        finishEye(updatedLineResponses)
      } else {
        // Move to next line
        setCurrentLineIndex(currentLineIndex + 1)
        setCurrentLetterIndex(0)
      }
    } else {
      // Move to next letter in current line
      const updatedResponses = [...lineResponses]
      if (!updatedResponses[currentLineIndex]) {
        updatedResponses[currentLineIndex] = {
          line: currentLine,
          letters: updatedLineLetters,
          correctCount: updatedLineLetters.filter(r => r.correct).length,
          score: updatedLineLetters.filter(r => r.correct).length,
        }
      } else {
        updatedResponses[currentLineIndex].letters = updatedLineLetters
        updatedResponses[currentLineIndex].correctCount = updatedLineLetters.filter(r => r.correct).length
      }
      setLineResponses(updatedResponses)
      setCurrentLetterIndex(currentLetterIndex + 1)
    }

    setUserInput('')
  }

  const finishEye = (responses: LineResponse[]) => {
    const eyeResult = test.processEyeResult(currentEye, responses)

    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      // Start left eye
      setCurrentEye('left')
      setCurrentLineIndex(0)
      setCurrentLetterIndex(0)
      setLineResponses([])
    } else {
      setLeftEyeResult(eyeResult)
      // Test complete
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (rightEye: EyeResult, leftEye: EyeResult) => {
    const result = test.createResult(calibration, rightEye, leftEye)
    setIsComplete(true)

    // Mark test as complete in journey
    markTestComplete(TEST_TYPE_ID.VISUAL_ACUITY)

    // Save to Supabase
    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: TEST_TYPE_ID.VISUAL_ACUITY,
            test_data: result,
            results: {
              rightEye: rightEye,
              leftEye: leftEye,
              methodology: result.methodology,
            },
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

  if (isComplete && rightEyeResult && leftEyeResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
              <p className="text-gray-600">Your results have been {saving ? 'saving...' : 'saved'}</p>
            </div>

            {/* Results Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Right Eye */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Snellen</p>
                    <p className="text-2xl font-bold text-indigo-600">{rightEyeResult.finalSnellen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">LogMAR</p>
                    <p className="text-xl font-semibold text-gray-900">{rightEyeResult.finalLogMAR.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className={`text-sm font-semibold ${
                      rightEyeResult.category === 'PASS' ? 'text-green-600' :
                      rightEyeResult.category === 'BORDERLINE' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {rightEyeResult.category}
                    </p>
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Snellen</p>
                    <p className="text-2xl font-bold text-purple-600">{leftEyeResult.finalSnellen}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">LogMAR</p>
                    <p className="text-xl font-semibold text-gray-900">{leftEyeResult.finalLogMAR.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <p className={`text-sm font-semibold ${
                      leftEyeResult.category === 'PASS' ? 'text-green-600' :
                      leftEyeResult.category === 'BORDERLINE' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {leftEyeResult.category}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Screening Result:</strong> This is a screening test, not a medical diagnosis. 
                ETDRS methodology with letter-by-letter scoring. Please consult an eye care professional 
                for a comprehensive eye examination and prescription.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
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
      <CalibrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={() => setIsModalOpen(false)}
        calibrator={calibrator}
      />

      <div className="container mx-auto max-w-4xl">
        {/* Test Interface */}
        {currentLine && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'} - Line {currentLineIndex + 1} of {chartLines.length}
              </div>
              <h3 className="text-xl text-gray-600 mb-2">
                {currentEye === 'right' ? 'Cover or close your LEFT eye' : 'Cover or close your RIGHT eye'}
              </h3>
              <p className="text-sm text-gray-500">
                Letter {currentLetterIndex + 1} of {currentLine.letters.length} - Read the letter
              </p>
            </div>

            {/* Letter Display - Proper Sloan Optotype */}
            <div className="flex justify-center items-center mb-8" style={{ minHeight: '200px' }}>
              <SloanOptotype
                letter={currentLine.letters[currentLetterIndex] as SloanLetter}
                strokeWidthPx={strokeWidthPx}
                color="#000000"
              />
            </div>
            
            {/* Clinical note */}
            <p className="text-xs text-gray-500 text-center mb-4">
              Proper Sloan optotype with 5×5 grid geometry • 
              Stroke width: {strokeWidthPx}px • 
              LogMAR {currentLine.logMAR.toFixed(1)} ({currentLine.snellen})
            </p>

            {/* Input */}
            <div className="space-y-4 max-w-lg mx-auto">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                placeholder="Type the letter you see"
                className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none uppercase"
                onKeyPress={(e) => e.key === 'Enter' && userInput && handleLetterSubmit()}
                autoFocus
                maxLength={1}
              />
              <button
                onClick={handleLetterSubmit}
                disabled={!userInput}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                Submit ({currentLetterIndex + 1}/{currentLine.letters.length})
              </button>
              <p className="text-sm text-gray-500 text-center">
                Press Enter to submit • Sloan letters: C D H K N O R S V Z
              </p>
            </div>

            {/* Progress */}
            <div className="mt-8 bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Line Progress</span>
                <span>{currentLineIndex + 1} / {chartLines.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentLineIndex + 1) / chartLines.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
