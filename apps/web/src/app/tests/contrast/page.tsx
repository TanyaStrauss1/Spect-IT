/**
 * Clinical Contrast Sensitivity Test Page
 * Pelli-Robson style with fixed size letters, decreasing contrast
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import CalibrationModal, { useCalibration } from '@/components/CalibrationModal'
import SloanOptotype from '@/components/SloanOptotype'
import { 
  createContrastSensitivityTest, 
  calculateSloanStrokeWidth,
  TEST_TYPE_ID,
  type ContrastLetter, 
  type ContrastLetterResponse, 
  type ContrastTripletResponse,
  type SloanLetter,
} from '@spect-it/cv'

type Eye = 'right' | 'left'
type TestPhase = 'intro' | 'test' | 'result'

export default function ContrastTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createContrastSensitivityTest())
  const [step, setStep] = useState<TestPhase>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [tripletResponses, setTripletResponses] = useState<ContrastTripletResponse[]>([])
  const [rightEyeResult, setRightEyeResult] = useState<any>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const levels = test.getContrastLevels()
  const currentLevel = levels[currentLevelIndex]
  const calibration = calibrator.getCalibration() || calibrator.getDefaultCalibration()
  
  // Calculate stroke width for ~3° visual angle letter (180 arcmin)
  // This gives us a letter of fixed angular size, not varying with logMAR
  const letterSizeArcMin = 180 // ~3° = 180 arcmin
  const strokeWidthPx = currentLevel ? calculateSloanStrokeWidth(
    Math.log10(letterSizeArcMin / 5), // Convert to logMAR-like scale (5 arcmin at 0.0)
    calibration.pxPerMm,
    calibration.distanceCm * 10
  ) : 12
  
  // Use proper Weber contrast: letter luminance relative to background
  // For dark letters on light background: contrast = (Lmax - L) / Lmax
  const contrastValue = currentLevel?.contrast || 1.0
  const letterColor = `rgba(0, 0, 0, ${contrastValue})`

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    if (participants.length > 0 && !activeParticipant) {
      alert('Please select a participant before starting the test')
      router.push('/dashboard/participants')
      return
    }
    ensureCalibration(() => {})
  }, [user, authLoading, participants, activeParticipant, ensureCalibration])

  const handleLetterSubmit = () => {
    if (!currentLevel || !userInput.trim()) return

    const letter = currentLevel.letters[currentLetterIndex]
    const correct = test.checkResponse(letter, userInput.trim())
    const response: ContrastLetterResponse = { letter, userResponse: userInput.trim().toUpperCase(), correct }

    const currentTripletLetters = tripletResponses[currentLevelIndex]?.letters || []
    const updatedLetters = [...currentTripletLetters, response]
    setUserInput('')

    if (updatedLetters.length === 3) {
      const triplet = test.scoreTriplet(currentLevel, updatedLetters)
      const updatedTriplets = [...tripletResponses, triplet]
      setTripletResponses(updatedTriplets)

      if (test.shouldStop(triplet) || currentLevelIndex >= levels.length - 1) {
        finishTest(updatedTriplets)
      } else {
        setCurrentLevelIndex(currentLevelIndex + 1)
        setCurrentLetterIndex(0)
      }
    } else {
      setCurrentLetterIndex(currentLetterIndex + 1)
    }
  }

  const finishTest = async (triplets: ContrastTripletResponse[]) => {
    const testResult = test.createResult(calibration, triplets)

    if (currentEye === 'right') {
      setRightEyeResult(testResult)
      setCurrentEye('left')
      setCurrentLevelIndex(0)
      setCurrentLetterIndex(0)
      setTripletResponses([])
      setUserInput('')
      setStep('intro')
    } else {
      setLeftEyeResult(testResult)
      setStep('result')

      // Mark test as complete in journey
      markTestComplete(TEST_TYPE_ID.CONTRAST_SENSITIVITY)

      if (user) {
        setSaving(true)
        try {
          const testResultData: any = {
            user_id: user.id,
            test_type: TEST_TYPE_ID.CONTRAST_SENSITIVITY,
            test_data: { rightEye: rightEyeResult, leftEye: testResult },
            results: { 
              rightEye: { finalLogCS: rightEyeResult.finalLogCS, category: rightEyeResult.category },
              leftEye: { finalLogCS: testResult.finalLogCS, category: testResult.category }
            },
          }
          
          if (activeParticipant) {
            testResultData.participant_id = activeParticipant.id
          }

          await supabase.from('test_results').insert(testResultData)
        } catch (error) {
          console.error('Error saving:', error)
        } finally {
          setSaving(false)
        }
      }
    }
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <CalibrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onComplete={() => setIsModalOpen(false)} calibrator={calibrator} />
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Contrast Sensitivity Screening</h1>
            
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Screen Brightness Critical</h3>
              <p className="text-sm text-yellow-800">
                <strong>Before starting:</strong> Set your screen to <strong>maximum brightness</strong>. This test uses varying contrast levels that require optimal display settings. Test results are invalid with dimmed screens.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-gray-700">This test measures your ability to see letters at different contrast levels (from dark to faint gray) using Sloan optotypes.</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Test Setup</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li><strong>Screen brightness:</strong> Maximum (100%)</li>
                  <li><strong>Room lighting:</strong> Moderate (not too bright or dark)</li>
                  <li><strong>Distance:</strong> 35–40 cm from screen</li>
                  <li><strong>Remove glare:</strong> No reflections on screen</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Testing Method</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Test each eye separately (cover the other eye)</li>
                  <li>Fixed-size letters (~3° visual angle) with decreasing contrast</li>
                  <li>Letters get fainter, not smaller</li>
                  <li>Type the letter you see, or your best guess</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Now Testing: {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</h3>
                <p className="text-sm text-purple-800">
                  Cover your <strong>{currentEye === 'right' ? 'LEFT' : 'RIGHT'}</strong> eye with your hand or an eye patch. Keep both eyes open behind the cover.
                </p>
              </div>
            </div>
            <button onClick={() => setStep('test')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700">
              Start {currentEye === 'right' ? 'Right Eye' : 'Left Eye'} Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && rightEyeResult && leftEyeResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Viewing Conditions</h4>
              <p className="text-sm text-yellow-800">
                Contrast sensitivity testing is highly dependent on screen brightness and viewing environment. 
                Results should be interpreted cautiously and compared to clinical testing if concerns exist.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Eye (OD)</h3>
                <p className="text-4xl font-bold text-purple-600 mb-2">{rightEyeResult.finalLogCS.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-2">Log Contrast Sensitivity</p>
                <p className="text-sm text-gray-700">{test.getInterpretation(rightEyeResult.category, rightEyeResult.finalLogCS)}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Left Eye (OS)</h3>
                <p className="text-4xl font-bold text-pink-600 mb-2">{leftEyeResult.finalLogCS.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mb-2">Log Contrast Sensitivity</p>
                <p className="text-sm text-gray-700">{test.getInterpretation(leftEyeResult.category, leftEyeResult.finalLogCS)}</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800"><strong>Screening Result:</strong> {rightEyeResult.methodology} This is NOT a Pelli-Robson test. Comprehensive clinical testing required for diagnosis.</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-1 text-sm">⚠️ Next Steps</h4>
              <p className="text-sm text-yellow-800">
                If results show reduced contrast sensitivity or differ significantly between eyes, schedule a comprehensive eye exam. Reduced contrast sensitivity can indicate cataracts, glaucoma, diabetic retinopathy, or neurological conditions.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700">Dashboard</button>
              <button onClick={() => router.push('/')} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">Home</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Brightness warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-yellow-800">
              <strong>Ensure:</strong> Screen at maximum brightness • Moderate ambient lighting • 
              No glare on screen
            </p>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-semibold mb-4">
              {currentEye === 'right' ? 'Right Eye (OD) - Cover LEFT eye' : 'Left Eye (OS) - Cover RIGHT eye'} • 
              Level {currentLevelIndex + 1} • Letter {currentLetterIndex + 1}/3
            </div>
            <h3 className="text-xl text-gray-600">Read the letter</h3>
            <p className="text-sm text-gray-500">Weber contrast: {(currentLevel.contrast * 100).toFixed(1)}%</p>
          </div>
          
          {/* Calibrated Sloan Optotype at ~3° visual angle */}
          <div className="flex justify-center items-center mb-6" style={{ minHeight: '200px', backgroundColor: '#FFFFFF' }}>
            <div style={{ opacity: currentLevel.contrast }}>
              <SloanOptotype
                letter={currentLevel.letters[currentLetterIndex] as SloanLetter}
                strokeWidthPx={strokeWidthPx}
                color="#000000"
              />
            </div>
          </div>
          
          {/* Clinical note */}
          <p className="text-xs text-gray-500 text-center mb-6">
            Fixed-size Sloan letter (~3° visual angle) • 
            Stroke width: {strokeWidthPx}px • 
            Log CS: {currentLevel.logCS.toFixed(2)}
          </p>
          
          <div className="space-y-4 max-w-lg mx-auto">
            <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value.toUpperCase())} placeholder="Type the letter" className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none uppercase" onKeyPress={(e) => e.key === 'Enter' && userInput && handleLetterSubmit()} autoFocus maxLength={1} />
            <button onClick={handleLetterSubmit} disabled={!userInput} className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50">Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
