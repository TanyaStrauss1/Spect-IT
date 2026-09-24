/**
 * Clinical Stereoacuity (Binocular Depth) Test Page
 * Random-dot stereogram with anaglyph display
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import CalibrationModal, { useCalibration } from '@/components/CalibrationModal'
import RandomDotStereogram from '@/components/RandomDotStereogram'
import { 
  createStereoacuityTest, 
  TEST_TYPE_ID,
  type StereoShape,
  type StereoResponse,
  type DisparityLevel,
  type StereoDisplayMode,
} from '@spect-it/cv'

type TestPhase = 'intro' | 'mode-select' | 'glasses-check' | 'test' | 'result'

export default function StereoacuityTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createStereoacuityTest())
  const [step, setStep] = useState<TestPhase>('intro')
  const [displayMode, setDisplayMode] = useState<StereoDisplayMode>('anaglyph')
  const [hasGlasses, setHasGlasses] = useState(false)
  const [levels, setLevels] = useState<DisparityLevel[]>([])
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [responses, setResponses] = useState<StereoResponse[]>([])
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [responseStartTime, setResponseStartTime] = useState<number>(Date.now())

  const calibration = calibrator.getCalibration() || calibrator.getDefaultCalibration()
  const currentLevel = levels[currentLevelIndex]

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

  useEffect(() => {
    if (calibration) {
      test.initialize(calibration.pxPerMm, calibration.distanceCm)
      setLevels(test.getDisparityLevels())
    }
  }, [calibration, test])

  const handleModeSelect = (mode: StereoDisplayMode) => {
    setDisplayMode(mode)
    if (mode === 'anaglyph') {
      setStep('glasses-check')
    } else {
      // Free-fusion mode - skip glasses check
      setHasGlasses(false)
      setStep('test')
      setResponseStartTime(Date.now())
    }
  }

  const handleGlassesConfirm = () => {
    setHasGlasses(true)
    setStep('test')
    setResponseStartTime(Date.now())
  }

  const handleShapeSelect = (selectedShape: StereoShape | null) => {
    if (!currentLevel) return

    const responseTime = Date.now() - responseStartTime
    const correct = test.checkResponse(currentLevel.shape, selectedShape)
    
    const response: StereoResponse = {
      level: currentLevel,
      userShape: selectedShape,
      correct,
      responseTimeMs: responseTime,
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)

    const newConsecutiveFailures = correct ? 0 : consecutiveFailures + 1
    setConsecutiveFailures(newConsecutiveFailures)

    if (test.shouldStop(newResponses, newConsecutiveFailures) || currentLevelIndex >= levels.length - 1) {
      finishTest(newResponses)
    } else {
      setCurrentLevelIndex(currentLevelIndex + 1)
      setResponseStartTime(Date.now())
    }
  }

  const finishTest = async (finalResponses: StereoResponse[]) => {
    const testResult = test.createResult(
      calibration,
      finalResponses,
      displayMode,
      hasGlasses
    )
    
    setResult(testResult)
    setStep('result')

    markTestComplete(TEST_TYPE_ID.STEREOACUITY)

    if (user) {
      setSaving(true)
      try {
        const testResultData: any = {
          user_id: user.id,
          test_type: TEST_TYPE_ID.STEREOACUITY,
          test_data: testResult,
          results: { 
            thresholdArcsec: testResult.thresholdArcsec,
            category: testResult.category,
            displayMode: testResult.displayMode,
            hasAnaglyphGlasses: testResult.hasAnaglyphGlasses,
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

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <CalibrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onComplete={() => setIsModalOpen(false)} calibrator={calibrator} />
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Stereoacuity (Binocular Depth) Screening</h1>
            
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Screening Only - Not Diagnostic</h3>
              <p className="text-sm text-yellow-800">
                This is a <strong>screening test</strong>, not a diagnostic assessment. Results provide an estimate of binocular depth perception but do not replace comprehensive clinical stereoacuity testing (Randot, Titmus, TNO).
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-gray-700">This test screens your ability to perceive depth using both eyes together (stereopsis). It uses random-dot stereograms to test binocular depth perception.</p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Clinical Note</h3>
                <p className="text-sm text-purple-800">
                  Stereoacuity (stereo threshold) measures the finest binocular disparity you can detect, reported in arcseconds. Normal stereopsis is typically ≤60 arcseconds. This test uses horizontal disparity in random-dot patterns to isolate binocular depth perception from monocular cues.
                </p>
              </div>
            </div>
            
            <button onClick={() => setStep('mode-select')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700">
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'mode-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Display Method</h2>
            
            <p className="text-gray-700 mb-6">
              Select how you'd like to view the stereogram. Anaglyph (with glasses) is preferred when available, but free-fusion (no glasses) is also offered for users who can fuse images naturally.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Anaglyph Option */}
              <button
                onClick={() => handleModeSelect('anaglyph')}
                className="bg-gradient-to-br from-red-50 to-cyan-50 border-2 border-indigo-300 rounded-lg p-6 text-left hover:border-indigo-500 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">🕶️</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Anaglyph (Recommended)</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Uses red-cyan 3D glasses to separate left and right eye images. This is the <strong>preferred method</strong> and provides more reliable results.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Requirements:</p>
                  <ul className="text-xs text-blue-800 list-disc list-inside space-y-1">
                    <li>Red-cyan anaglyph 3D glasses</li>
                    <li>Red filter over LEFT eye</li>
                    <li>Cyan filter over RIGHT eye</li>
                  </ul>
                </div>
                <div className="text-sm font-semibold text-indigo-600">✓ Most Reliable</div>
              </button>

              {/* Free-Fusion Option */}
              <button
                onClick={() => handleModeSelect('free-fusion')}
                className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-gray-300 rounded-lg p-6 text-left hover:border-purple-500 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-3">👀</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Free-Fusion (No Glasses)</h3>
                <p className="text-sm text-gray-700 mb-3">
                  View side-by-side images and fuse them naturally without glasses. Requires practice and ability to "relax" eye focus.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <p className="text-xs font-semibold text-yellow-900 mb-1">Note:</p>
                  <ul className="text-xs text-yellow-800 list-disc list-inside space-y-1">
                    <li>No glasses required</li>
                    <li>Requires free-fusion ability</li>
                    <li>May take practice to learn</li>
                    <li>Results vary by user skill</li>
                  </ul>
                </div>
                <div className="text-sm font-semibold text-purple-600">Alternative Method</div>
              </button>
            </div>

            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600">
                <strong>Screening Honesty:</strong> Free-fusion ability varies widely among individuals. If you cannot fuse the images or if you're unsure, we recommend using the anaglyph method with glasses for more reliable screening results.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'glasses-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Anaglyph Glasses Check</h2>
            
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">❗ Confirm You Have Anaglyph Glasses</h3>
              <p className="text-sm text-red-800">
                Do you have red-cyan anaglyph 3D glasses available right now?
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Anaglyph Glasses Requirements</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li><strong>Red filter over LEFT eye</strong></li>
                  <li><strong>Cyan (blue-green) filter over RIGHT eye</strong></li>
                  <li>Filters must be true red and cyan (not red-blue)</li>
                  <li>Adequate filter density to block opposite eye's image</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600">
                If you do not have anaglyph glasses, this test cannot be performed. Inexpensive anaglyph glasses are available online for $1-5. Clinical stereoacuity testing at an optometrist's office does not require special glasses.
              </p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleGlassesConfirm} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700"
              >
                ✓ Yes, I Have Anaglyph Glasses - Start Test
              </button>
              <button 
                onClick={() => router.push('/tests')} 
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                No Glasses Available - Return to Tests
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{result.category === 'NORMAL' ? '✓' : '⚠️'}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stereoacuity Result</h3>
              {result.thresholdArcsec !== null ? (
                <>
                  <p className="text-4xl font-bold text-indigo-600 mb-2">{result.thresholdArcsec} arcsec</p>
                  <p className="text-sm text-gray-600 mb-2">Stereo Threshold</p>
                  <p className="text-sm text-gray-700">{test.getInterpretation(result.category, result.thresholdArcsec)}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-red-600 mb-2">No Stereopsis Detected</p>
                  <p className="text-sm text-gray-700">{test.getInterpretation(result.category, result.thresholdArcsec)}</p>
                </>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Screening Result:</strong> {result.methodology}
              </p>
              <p className="text-xs text-blue-700 mt-2">
                <strong>Display method:</strong> {result.displayMode === 'anaglyph' ? 'Anaglyph (red-cyan glasses)' : 'Free-fusion (no glasses)'}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Clinical Interpretation</h4>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Normal stereoacuity:</strong> ≤60 arcseconds (functional for daily tasks like driving, sports, depth judgment)
              </p>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Reduced stereoacuity:</strong> 60-400 arcseconds (impaired but present; may affect fine motor tasks)
              </p>
              <p className="text-sm text-yellow-800">
                <strong>Absent/poor stereoacuity:</strong> &gt;400 arcseconds or none detected (may indicate strabismus, amblyopia, or monocular vision)
              </p>
            </div>

            {(result.category === 'REDUCED' || result.category === 'ABSENT') && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-900 mb-1 text-sm">🚨 REFERRAL RECOMMENDED</h4>
                <p className="text-sm text-red-800">
                  This screening detected reduced or absent stereoacuity. Recommend comprehensive eye examination with binocular vision assessment, including evaluation for strabismus (eye misalignment), amblyopia (lazy eye), and refractive error. Clinical stereoacuity testing (Randot, Titmus, TNO) should be performed.
                </p>
              </div>
            )}

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-purple-900 mb-1 text-sm">📋 Screening Disclaimer</h4>
              <p className="text-sm text-purple-800">
                {test.getDisclaimer(result.displayMode)}
              </p>
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
          <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Method:</strong> {displayMode === 'anaglyph' ? 'Anaglyph (red-cyan glasses)' : 'Free-fusion (no glasses)'} • 
              {displayMode === 'anaglyph' && 'Wearing red-cyan glasses (red over LEFT eye, cyan over RIGHT eye) • '}
              Distance glasses on if needed • 35-40 cm from screen • Moderate ambient lighting
            </p>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
              Level {currentLevelIndex + 1} of {levels.length} • 
              Target: {currentLevel?.arcseconds} arcsec • 
              Disparity: {currentLevel?.disparityPx}px
            </div>
            <h3 className="text-xl text-gray-600 mb-2">What shape do you see floating in depth?</h3>
            <p className="text-sm text-gray-500">
              {displayMode === 'anaglyph' 
                ? 'Look at the random dots with your anaglyph glasses'
                : 'Relax your eyes and fuse the two images into one'}
            </p>
          </div>
          
          <div className="flex justify-center items-center mb-8">
            {currentLevel && (
              <RandomDotStereogram
                shape={currentLevel.shape}
                disparityPx={currentLevel.disparityPx}
                displayMode={displayMode}
                sizePx={400}
                dotDensity={0.3}
                className="rounded-lg"
              />
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mb-6">
            Random-dot stereogram • {displayMode === 'anaglyph' ? 'Anaglyph display' : 'Free-fusion display'} • 
            Binocular disparity: {currentLevel?.disparityPx}px at {calibration.distanceCm}cm
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <button 
              onClick={() => handleShapeSelect('circle')} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 py-4 rounded-lg font-semibold transition-colors border-2 border-indigo-300"
            >
              ⭕ Circle
            </button>
            <button 
              onClick={() => handleShapeSelect('square')} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 py-4 rounded-lg font-semibold transition-colors border-2 border-indigo-300"
            >
              ⬜ Square
            </button>
            <button 
              onClick={() => handleShapeSelect('triangle')} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 py-4 rounded-lg font-semibold transition-colors border-2 border-indigo-300"
            >
              🔺 Triangle
            </button>
            <button 
              onClick={() => handleShapeSelect('diamond')} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-900 py-4 rounded-lg font-semibold transition-colors border-2 border-indigo-300"
            >
              🔶 Diamond
            </button>
            <button 
              onClick={() => handleShapeSelect(null)} 
              className="md:col-span-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-lg font-semibold transition-colors border-2 border-gray-300"
            >
              ❌ No Shape Visible
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
