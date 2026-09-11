/**
 * Clinical Contrast Sensitivity Test Page
 * Pelli-Robson style with fixed size letters, decreasing contrast
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
  createContrastSensitivityTest, 
  calculateSloanStrokeWidth,
  type ContrastLetter, 
  type ContrastLetterResponse, 
  type ContrastTripletResponse,
  type SloanLetter,
} from '@spect-it/cv'

export default function ContrastTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createContrastSensitivityTest())
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [tripletResponses, setTripletResponses] = useState<ContrastTripletResponse[]>([])
  const [result, setResult] = useState<any>(null)
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
    ensureCalibration(() => {})
  }, [user, authLoading])

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
    setResult(testResult)

    // Mark test as complete in journey
    markTestComplete('contrast')

    if (user) {
      setSaving(true)
      try {
        await supabase.from('test_results').insert({
          user_id: user.id,
          test_type: 'Contrast Sensitivity (Clinical)',
          test_data: testResult,
          results: { finalLogCS: testResult.finalLogCS, category: testResult.category },
        })
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            </div>
            
            {/* Display brightness warning if needed */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Viewing Conditions</h4>
              <p className="text-sm text-yellow-800">
                Ensure your screen is at maximum brightness and the room has moderate ambient lighting 
                (not too bright, not too dark). Contrast sensitivity testing is affected by display 
                brightness and viewing environment.
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mb-6">
              <p className="text-sm text-gray-600 mb-2">Log Contrast Sensitivity</p>
              <p className="text-5xl font-bold text-purple-600 mb-4">{result.finalLogCS.toFixed(2)}</p>
              <p className="text-lg text-gray-700">{test.getInterpretation(result.category, result.finalLogCS)}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800"><strong>Screening Result:</strong> {result.methodology}</p>
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
      <CalibrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onComplete={() => setIsModalOpen(false)} calibrator={calibrator} />
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
              Level {currentLevelIndex + 1} - Letter {currentLetterIndex + 1}/3
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
