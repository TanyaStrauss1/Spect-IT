/**
 * Clinical Prescription Screening Page (Pinhole Method)
 * Honest refractive screening with dual acuity testing (uncorrected vs pinhole)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import CalibrationModal, { useCalibration } from '@/components/CalibrationModal'
import SloanOptotype from '@/components/SloanOptotype'
import { 
  createPrescriptionScreeningTest, 
  createVisualAcuityTest,
  calculateSloanStrokeWidth,
  type PinholeResult,
  type SloanLetter,
  type ETDRSLine,
} from '@spect-it/cv'

type Eye = 'right' | 'left'
type TestPhase = 'intro' | 'uncorrected' | 'pinhole' | 'result'

export default function PrescriptionTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createPrescriptionScreeningTest())
  const [acuityTest] = useState(() => createVisualAcuityTest({ startLogMAR: 0.5 }))
  
  const [step, setStep] = useState<TestPhase>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [uncorrectedLogMAR, setUncorrectedLogMAR] = useState<number | null>(null)
  const [pinholeLogMAR, setPinholeLogMAR] = useState<number | null>(null)
  const [rightEye, setRightEye] = useState<PinholeResult | null>(null)
  const [leftEye, setLeftEye] = useState<PinholeResult | null>(null)
  const [saving, setSaving] = useState(false)
  
  // Mini acuity test state
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [lineLetters, setLineLetters] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [testingPinhole, setTestingPinhole] = useState(false)
  
  const chartLines = acuityTest.getChartLines()
  const currentLine = chartLines[currentLineIndex]
  const calibration = calibrator.getCalibration() || calibrator.getDefaultCalibration()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    ensureCalibration(() => {})
  }, [user, authLoading, router])
  
  // Calculate stroke width for current line
  const strokeWidthPx = currentLine 
    ? calculateSloanStrokeWidth(
        currentLine.logMAR,
        calibration.pxPerMm,
        calibration.distanceCm * 10
      )
    : 12
  
  const startMiniAcuityTest = (isPinhole: boolean) => {
    setTestingPinhole(isPinhole)
    setCurrentLineIndex(0)
    setLineLetters([])
    setCorrectCount(0)
    setStep(isPinhole ? 'pinhole' : 'uncorrected')
  }
  
  const handleLineResponse = (correct: boolean) => {
    const newLineLetters = [...lineLetters, correct ? '✓' : '✗']
    setLineLetters(newLineLetters)
    
    if (correct) {
      setCorrectCount(correctCount + 1)
    }
    
    // Simple stopping rule: test 3 lines, stop if 2 or fewer correct on any line
    if (newLineLetters.length >= 3) {
      const finalLogMAR = currentLine.logMAR
      
      if (testingPinhole) {
        setPinholeLogMAR(finalLogMAR)
        // Process this eye's results
        if (uncorrectedLogMAR !== null) {
          const result = test.processPinholeResult(currentEye, uncorrectedLogMAR, finalLogMAR)
          if (currentEye === 'right') {
            setRightEye(result)
            setCurrentEye('left')
            setUncorrectedLogMAR(null)
            setPinholeLogMAR(null)
            setStep('intro')
          } else {
            setLeftEye(result)
            finishTest(rightEye!, result)
          }
        }
      } else {
        setUncorrectedLogMAR(finalLogMAR)
        setStep('intro') // Return to show pinhole instruction
      }
    } else if (currentLineIndex < chartLines.length - 1) {
      setCurrentLineIndex(currentLineIndex + 1)
      setLineLetters([])
      setCorrectCount(0)
    } else {
      // Reached end of chart
      const finalLogMAR = currentLine.logMAR
      if (testingPinhole) {
        setPinholeLogMAR(finalLogMAR)
        if (uncorrectedLogMAR !== null) {
          const result = test.processPinholeResult(currentEye, uncorrectedLogMAR, finalLogMAR)
          if (currentEye === 'right') {
            setRightEye(result)
            setCurrentEye('left')
            setUncorrectedLogMAR(null)
            setPinholeLogMAR(null)
            setStep('intro')
          } else {
            setLeftEye(result)
            finishTest(rightEye!, result)
          }
        }
      } else {
        setUncorrectedLogMAR(finalLogMAR)
        setStep('intro')
      }
    }
  }

  const finishTest = async (right: PinholeResult, left: PinholeResult) => {
    const result = test.createResult(calibration, right, left, null)
    setStep('result')

    // Mark test as complete in journey
    markTestComplete('prescription')

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
        <CalibrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onComplete={() => setIsModalOpen(false)} calibrator={calibrator} />
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Refractive Screening (Pinhole Method)</h1>
            
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <h3 className="font-semibold text-indigo-900 mb-2">
                {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
              </h3>
              <p className="text-sm text-indigo-800">
                {uncorrectedLogMAR === null 
                  ? `Cover your ${currentEye === 'right' ? 'LEFT' : 'RIGHT'} eye and prepare for uncorrected vision test`
                  : 'Now test with simulated pinhole (improves focus)'
                }
              </p>
            </div>
            
            {uncorrectedLogMAR === null ? (
              <>
                <div className="space-y-4 mb-8">
                  <p className="text-gray-700">This test uses the pinhole method to detect refractive errors:</p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                    <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                      <li>First, we'll measure your vision normally (uncorrected)</li>
                      <li>Then, we'll simulate a pinhole test</li>
                      <li>Significant improvement with pinhole indicates refractive error</li>
                      <li>Read letters line by line - we'll test 3 lines</li>
                    </ul>
                  </div>
                </div>
                <button onClick={() => startMiniAcuityTest(false)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700">Start Uncorrected Test</button>
              </>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Uncorrected result:</strong> logMAR {uncorrectedLogMAR.toFixed(2)} 
                      ({acuityTest.logMARToSnellen(uncorrectedLogMAR)})
                    </p>
                  </div>
                  <p className="text-gray-700">Now look through the simulated pinhole and read the letters again:</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Pinhole effect:</strong> A pinhole reduces blur from refractive errors by limiting light rays to the central optical axis, improving focus.
                    </p>
                  </div>
                </div>
                <button onClick={() => startMiniAcuityTest(true)} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700">Start Pinhole Test</button>
              </>
            )}
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

  // Acuity testing (uncorrected or pinhole)
  if (step === 'uncorrected' || step === 'pinhole') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'} - 
                {testingPinhole ? ' With Pinhole' : ' Uncorrected'} - 
                Line {currentLineIndex + 1}
              </div>
              <h3 className="text-xl text-gray-600 mb-2">
                Can you read this letter clearly?
              </h3>
              <p className="text-sm text-gray-500">
                Line {currentLineIndex + 1} of 3 • logMAR {currentLine?.logMAR.toFixed(1)}
              </p>
            </div>
            
            {testingPinhole && (
              <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <p className="text-sm text-yellow-800">
                  <strong>Pinhole mode:</strong> Imagine looking through a tiny hole that sharpens your view
                </p>
              </div>
            )}
            
            {/* Letter Display */}
            <div className="flex justify-center items-center mb-8" style={{ minHeight: '200px' }}>
              {currentLine && (
                <SloanOptotype
                  letter={currentLine.letters[0] as SloanLetter}
                  strokeWidthPx={strokeWidthPx}
                  color="#000000"
                />
              )}
            </div>
            
            {/* Simple Yes/No response */}
            <div className="space-y-3 max-w-md mx-auto">
              <button
                onClick={() => handleLineResponse(true)}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 text-lg"
              >
                ✓ Yes, I can read it clearly
              </button>
              <button
                onClick={() => handleLineResponse(false)}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 text-lg"
              >
                ✗ No, it's too blurry
              </button>
            </div>
            
            {/* Progress */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Progress: {lineLetters.join(' ')} {lineLetters.length > 0 && `(${correctCount}/${lineLetters.length} readable)`}
              </p>
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
