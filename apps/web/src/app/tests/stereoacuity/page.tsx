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
} from '@spect-it/cv'

type TestPhase = 'intro' | 'glasses-check' | 'test' | 'result'

export default function StereoacuityTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createStereoacuityTest())
  const [step, setStep] = useState<TestPhase>('intro')
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
            
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">⚠️ REQUIRES RED-CYAN ANAGLYPH GLASSES</h3>
              <p className="text-sm text-red-800">
                This test <strong>REQUIRES</strong> red-cyan anaglyph 3D glasses to work. Without proper anaglyph glasses, you will not see any depth effect and the test will be invalid.
              </p>
            </div>

            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Screening Only - Not Diagnostic</h3>
              <p className="text-sm text-yellow-800">
                This is a <strong>screening test</strong>, not a diagnostic assessment. Results provide an estimate of binocular depth perception but do not replace comprehensive clinical stereoacuity testing (Randot, Titmus, TNO).
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-gray-700">This test screens your ability to perceive depth using both eyes together (stereopsis). It uses random-dot stereograms displayed through red-cyan anaglyph glasses.</p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Required Equipment</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li><strong>Red-cyan anaglyph 3D glasses</strong> (red filter over LEFT eye, cyan over RIGHT eye)</li>
                  <li><strong>Distance:</strong> 35–40 cm from screen</li>
                  <li><strong>Correction:</strong> Wear distance glasses if you normally use them</li>
                  <li><strong>Lighting:</strong> Moderate ambient lighting (not too bright or dark)</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Look at the random dot pattern with your anaglyph glasses on</li>
                  <li>A shape (circle, square, triangle, or diamond) will appear to "float" in depth</li>
                  <li>Identify which shape you see floating</li>
                  <li>If you see no shape in depth, select "No shape visible"</li>
                  <li>Test progresses from easy (obvious depth) to difficult (subtle depth)</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Clinical Note</h3>
                <p className="text-sm text-purple-800">
                  Stereoacuity (stereo threshold) measures the finest binocular disparity you can detect, reported in arcseconds. Normal stereopsis is typically ≤60 arcseconds. This test uses horizontal disparity in random-dot patterns to isolate binocular depth perception from monocular cues.
                </p>
              </div>
            </div>
            
            <button onClick={() => setStep('glasses-check')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700">
              Continue
            </button>
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
                {test.getDisclaimer()}
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
              <strong>Ensure:</strong> Wearing red-cyan anaglyph glasses (red over LEFT eye, cyan over RIGHT eye) • 
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
            <p className="text-sm text-gray-500">Look at the random dots with your anaglyph glasses</p>
          </div>
          
          <div className="flex justify-center items-center mb-8">
            {currentLevel && (
              <RandomDotStereogram
                shape={currentLevel.shape}
                disparityPx={currentLevel.disparityPx}
                sizePx={400}
                dotDensity={0.3}
                className="rounded-lg"
              />
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mb-6">
            Random-dot stereogram • Anaglyph display • 
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
