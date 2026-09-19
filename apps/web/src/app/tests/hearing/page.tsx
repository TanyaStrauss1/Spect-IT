/**
 * Hearing Screening Test Page
 * 
 * Pure-tone screening at key frequencies (500, 1000, 2000, 4000 Hz)
 * with headphone check and volume calibration
 * 
 * IMPORTANT: This is a screening tool, not a diagnostic audiological examination
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import { 
  TEST_TYPE_ID,
  SCREENING_FREQUENCIES,
  PULSED_TONE_CONFIG,
  CATCH_TRIAL_CONFIG,
  DEFAULT_SCREENING_LEVEL,
  PASS_REFER_CRITERIA,
  AMBIENT_NOISE_REQUIREMENTS,
  HEADPHONE_REQUIREMENTS,
  SCREENING_BANNERS,
  createMethodologyString,
  createScreeningNote,
  type ScreeningFrequency,
} from '@spect-it/cv'

type TestPhase = 'instructions' | 'headphone-check' | 'ambient-noise' | 'calibration' | 'testing' | 'complete'
type Ear = 'left' | 'right'

interface ToneTest {
  frequency: number | null // null = catch trial (no tone)
  ear: Ear
  heard: boolean | null
}

interface FrequencyResult {
  frequency: number
  leftEarPassed: boolean
  rightEarPassed: boolean
}

export default function HearingTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()
  const { markTestComplete } = useJourney()

  const [phase, setPhase] = useState<TestPhase>('instructions')
  const [currentFreqIndex, setCurrentFreqIndex] = useState(0)
  const [currentEar, setCurrentEar] = useState<Ear>('right')
  const [results, setResults] = useState<ToneTest[]>([])
  const [volumeLevel, setVolumeLevel] = useState(DEFAULT_SCREENING_LEVEL)
  const [isPlaying, setIsPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ambientNoiseOk, setAmbientNoiseOk] = useState(false)
  const [currentTestIsCatchTrial, setCurrentTestIsCatchTrial] = useState(false)
  const [falsePositiveCount, setFalsePositiveCount] = useState(0)
  const [catchTrialCount, setCatchTrialCount] = useState(0)

  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const pannerRef = useRef<StereoPannerNode | null>(null)
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
  }, [user, authLoading, router, participants, activeParticipant])

  useEffect(() => {
    // Initialize Web Audio API
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }

    return () => {
      stopTone()
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const playPulsedTone = (frequency: number, ear: Ear) => {
    if (!audioContextRef.current) return

    stopTone()
    setIsPlaying(true)

    const context = audioContextRef.current
    let pulseIndex = 0

    const playPulse = () => {
      if (pulseIndex >= PULSED_TONE_CONFIG.pulseCount) {
        setIsPlaying(false)
        return
      }

      const oscillator = context.createOscillator()
      const gainNode = context.createGain()
      const panner = context.createStereoPanner()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency

      // Set stereo position: -1 = left, 0 = center, 1 = right
      panner.pan.value = ear === 'left' ? -1 : 1

      // Ramp envelope for smooth pulse (reduces click artifacts)
      const now = context.currentTime
      gainNode.gain.setValueAtTime(0, now)
      gainNode.gain.linearRampToValueAtTime(volumeLevel, now + 0.01) // 10ms attack
      gainNode.gain.setValueAtTime(volumeLevel, now + PULSED_TONE_CONFIG.pulseDurationMs / 1000 - 0.01)
      gainNode.gain.linearRampToValueAtTime(0, now + PULSED_TONE_CONFIG.pulseDurationMs / 1000) // 10ms release

      oscillator.connect(gainNode)
      gainNode.connect(panner)
      panner.connect(context.destination)

      oscillator.start(now)
      oscillator.stop(now + PULSED_TONE_CONFIG.pulseDurationMs / 1000)

      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode
      pannerRef.current = panner

      pulseIndex++
      pulseTimeoutRef.current = setTimeout(playPulse, PULSED_TONE_CONFIG.pulseDurationMs + PULSED_TONE_CONFIG.pulseGapMs)
    }

    playPulse()
  }

  const playContinuousTone = (frequency: number, ear: Ear, duration: number = 1500) => {
    // For calibration/headphone check - uses continuous tone
    if (!audioContextRef.current) return

    stopTone()

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const panner = context.createStereoPanner()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    panner.pan.value = ear === 'left' ? -1 : 1
    gainNode.gain.value = volumeLevel

    oscillator.connect(gainNode)
    gainNode.connect(panner)
    panner.connect(context.destination)

    oscillator.start()
    oscillator.stop(context.currentTime + duration / 1000)

    oscillatorRef.current = oscillator
    gainNodeRef.current = gainNode
    pannerRef.current = panner

    setIsPlaying(true)

    setTimeout(() => {
      setIsPlaying(false)
    }, duration)
  }

  const stopTone = () => {
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current)
      pulseTimeoutRef.current = null
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop()
      } catch (e) {
        // Oscillator may already be stopped
      }
      oscillatorRef.current = null
    }
    setIsPlaying(false)
  }

  const handleHeadphoneCheckPass = () => {
    setPhase('ambient-noise')
  }

  const handleAmbientNoiseConfirm = () => {
    setAmbientNoiseOk(true)
    setPhase('calibration')
  }

  const handleCalibrationComplete = () => {
    setPhase('testing')
    prepareNextTest()
  }

  const prepareNextTest = () => {
    // Determine if this should be a catch trial
    // Cap at 3 total catch trials (slightly above minCatchTrials) to prevent unbounded chaining
    const maxCatchTrials = Math.max(CATCH_TRIAL_CONFIG.minCatchTrials, 3)
    const isCatchTrial = catchTrialCount < maxCatchTrials && Math.random() < CATCH_TRIAL_CONFIG.probability
    
    if (isCatchTrial) {
      setCatchTrialCount(prev => prev + 1)
    }
    
    setCurrentTestIsCatchTrial(isCatchTrial)
  }

  const handleResponse = (heard: boolean) => {
    // Check for false positive (heard sound on catch trial)
    if (currentTestIsCatchTrial && heard) {
      setFalsePositiveCount(prev => prev + 1)
    }

    const frequency = currentTestIsCatchTrial ? null : SCREENING_FREQUENCIES[currentFreqIndex]
    
    const newResult: ToneTest = {
      frequency,
      ear: currentEar,
      heard,
    }

    const updatedResults = [...results, newResult]
    setResults(updatedResults)

    // Advance to next test
    if (currentTestIsCatchTrial) {
      // Catch trial complete, stay on same frequency/ear
      prepareNextTest()
    } else if (currentEar === 'right') {
      // Switch to left ear for same frequency
      setCurrentEar('left')
      prepareNextTest()
    } else {
      // Move to next frequency
      if (currentFreqIndex < SCREENING_FREQUENCIES.length - 1) {
        setCurrentFreqIndex(currentFreqIndex + 1)
        setCurrentEar('right')
        prepareNextTest()
      } else {
        // Test complete
        finishTest(updatedResults)
      }
    }
  }

  const finishTest = async (testResults: ToneTest[]) => {
    setPhase('complete')

    // Separate catch trials from real tests
    const realTests = testResults.filter(t => t.frequency !== null)
    const catchTrials = testResults.filter(t => t.frequency === null)

    // Process results
    const frequencyResults: FrequencyResult[] = SCREENING_FREQUENCIES.map(freq => {
      const leftResult = realTests.find(r => r.frequency === freq && r.ear === 'left')
      const rightResult = realTests.find(r => r.frequency === freq && r.ear === 'right')
      
      return {
        frequency: freq,
        leftEarPassed: leftResult?.heard || false,
        rightEarPassed: rightResult?.heard || false,
      }
    })

    const leftEarPassCount = frequencyResults.filter(f => f.leftEarPassed).length
    const rightEarPassCount = frequencyResults.filter(f => f.rightEarPassed).length
    
    const totalFrequencies = SCREENING_FREQUENCIES.length
    
    // Pass/refer criteria per ASHA school screening guidelines:
    // Refer if fails at any frequency in either ear at screening level (strict: must pass ALL)
    const leftEarRefer = leftEarPassCount < totalFrequencies
    const rightEarRefer = rightEarPassCount < totalFrequencies
    const shouldRefer = leftEarRefer || rightEarRefer

    const result = {
      methodology: createMethodologyString(catchTrials.length, falsePositiveCount, 'web'),
      protocol: 'ASHA-based pure-tone screening',
      frequencyResults,
      leftEarPassCount,
      rightEarPassCount,
      totalFrequencies,
      catchTrialCount: catchTrials.length,
      falsePositiveCount,
      overallStatus: shouldRefer ? 'REFER' : 'PASS',
      passCriteria: PASS_REFER_CRITERIA.description,
      note: createScreeningNote(),
      timestamp: new Date().toISOString(),
      qualityGuard: {
        headphoneCheckCompleted: true,
        ambientNoiseConfirmed: ambientNoiseOk,
        calibrationCompleted: true,
        gatesCompleted: ['headphone-check', 'ambient-noise', 'calibration'],
        timestamp: Date.now(),
      },
    }

    // Mark test as complete in journey
    markTestComplete(TEST_TYPE_ID.HEARING)

    // Save to Supabase
    if (user) {
      setSaving(true)
      try {
        const testResultData: any = {
          user_id: user.id,
          test_type: TEST_TYPE_ID.HEARING,
          test_data: result,
          results: {
            overallStatus: result.overallStatus,
            leftEarPassCount,
            rightEarPassCount,
          },
        }

        if (activeParticipant) {
          testResultData.participant_id = activeParticipant.id
        }

        const { error } = await supabase
          .from('test_results')
          .insert(testResultData)

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

  const getResultsSummary = () => {
    const frequencyResults: FrequencyResult[] = SCREENING_FREQUENCIES.map(freq => {
      const leftResult = results.find(r => r.frequency === freq && r.ear === 'left')
      const rightResult = results.find(r => r.frequency === freq && r.ear === 'right')
      
      return {
        frequency: freq,
        leftEarPassed: leftResult?.heard || false,
        rightEarPassed: rightResult?.heard || false,
      }
    })

    const leftEarPassCount = frequencyResults.filter(f => f.leftEarPassed).length
    const rightEarPassCount = frequencyResults.filter(f => f.rightEarPassed).length
    const totalFrequencies = SCREENING_FREQUENCIES.length
    
    // Use strict ASHA criteria: must pass ALL frequencies (no misses allowed)
    const passed = leftEarPassCount >= totalFrequencies && rightEarPassCount >= totalFrequencies

    return { frequencyResults, leftEarPassCount, rightEarPassCount, totalFrequencies, passed }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (phase === 'instructions') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎧</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Hearing Screening Test</h1>
              <p className="text-gray-600">Basic pure-tone screening</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                  ⚠️ {SCREENING_BANNERS.notDiagnostic.title}
                </h3>
                <p className="text-sm text-yellow-800">
                  {SCREENING_BANNERS.notDiagnostic.message}
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  🔊 {SCREENING_BANNERS.calibrationLimitation.title}
                </h3>
                <p className="text-sm text-red-800">
                  {SCREENING_BANNERS.calibrationLimitation.message}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Before You Begin:</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Use <strong>stereo headphones or earbuds</strong> (NOT speakers — required!)</li>
                  <li>✓ Find a <strong>quiet environment</strong> with minimal background noise</li>
                  <li>✓ Set your device volume to a <strong>comfortable level</strong></li>
                  <li>✓ The test takes about <strong>3-5 minutes</strong></li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">How It Works:</h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>Verify your headphones are working correctly (left/right check)</li>
                  <li>Confirm your environment is quiet enough for testing</li>
                  <li>Set a comfortable volume level</li>
                  <li>Listen for tones at different frequencies in each ear</li>
                  <li>Click "I Heard It" when you hear a tone (respond honestly!)</li>
                  <li>Results provide a basic pass/refer screening outcome</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setPhase('headphone-check')}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-colors text-lg"
            >
              Begin Hearing Screening
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'headphone-check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{HEADPHONE_REQUIREMENTS.title}</h2>
              <p className="text-gray-600">{HEADPHONE_REQUIREMENTS.description}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  🚫 {HEADPHONE_REQUIREMENTS.warningNote}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-blue-900 font-semibold mb-4">
                  Step 1: Test Each Ear Separately
                </p>
                <p className="text-sm text-blue-800 mb-4">
                  Click each button below. You should hear a tone ONLY in the indicated ear. 
                  If you hear the tone in both ears or the wrong ear, your headphones may be worn incorrectly or your device may not support stereo output.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => playContinuousTone(1000, 'left', 1000)}
                    disabled={isPlaying}
                    className="bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    ← Test Left Ear
                  </button>
                  <button
                    onClick={() => playContinuousTone(1000, 'right', 1000)}
                    disabled={isPlaying}
                    className="bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Test Right Ear →
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-semibold mb-2">
                  Step 2: Verify Headphone Fit
                </p>
                <ul className="text-sm text-blue-800 space-y-1">
                  {HEADPHONE_REQUIREMENTS.instructions.map((instruction, idx) => (
                    <li key={idx}>✓ {instruction}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-700">
                  <strong>Troubleshooting:</strong> If you hear tones in the wrong ear or both ears:
                </p>
                <ul className="text-xs text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Check headphone L/R markings and ensure they're worn correctly</li>
                  <li>Verify your device's audio output is set to headphones (not speakers)</li>
                  <li>Try a different pair of headphones or earbuds</li>
                  <li>On some devices, mono audio settings may need to be disabled</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  ✓ I verified the correct tone plays in each ear
                </p>
                <button
                  onClick={handleHeadphoneCheckPass}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Headphones Verified, Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'ambient-noise') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔇</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{AMBIENT_NOISE_REQUIREMENTS.title}</h2>
              <p className="text-gray-600">Ensure a quiet testing environment</p>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-3">⚠️ {AMBIENT_NOISE_REQUIREMENTS.title}</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  {AMBIENT_NOISE_REQUIREMENTS.description}
                </p>
                <ul className="text-sm text-yellow-800 space-y-2">
                  {AMBIENT_NOISE_REQUIREMENTS.checklist.map((item, idx) => (
                    <li key={idx}>✓ {item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  🚫 {AMBIENT_NOISE_REQUIREMENTS.warningNote}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900 font-semibold mb-2">
                  💡 Why This Matters
                </p>
                <p className="text-xs text-blue-800">
                  {AMBIENT_NOISE_REQUIREMENTS.whyItMatters}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-700 mb-2">
                  <strong>Common noise sources that invalidate results:</strong>
                </p>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>HVAC / air conditioning hum (continuous background noise)</li>
                  <li>Computer fans or hard drive noise</li>
                  <li>Refrigerator compressor cycling</li>
                  <li>Distant traffic or outdoor construction</li>
                  <li>Conversations in adjacent rooms</li>
                  <li>Wind noise through windows or vents</li>
                </ul>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-700 mb-4 font-semibold">
                  {AMBIENT_NOISE_REQUIREMENTS.attestation}
                </p>
                <button
                  onClick={handleAmbientNoiseConfirm}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  ✓ Environment Verified, Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'calibration') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔊</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Volume Calibration</h2>
              <p className="text-gray-600">Set to a comfortable listening level</p>
            </div>

            <div className="space-y-6">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  🔊 {SCREENING_BANNERS.calibrationLimitation.title}
                </h3>
                <p className="text-sm text-red-800">
                  {SCREENING_BANNERS.calibrationLimitation.message}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-blue-800 mb-4">
                  Adjust the volume slider until the tone is <strong>clearly audible but comfortable</strong>. 
                  Not too loud, not too soft. The test tone should be easily heard in a quiet room.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-blue-900 font-semibold mb-2 block">
                      Relative Volume Level: {Math.round(volumeLevel * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.01"
                      value={volumeLevel}
                      onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Softer</span>
                      <span>Louder</span>
                    </div>
                  </div>

                  <button
                    onClick={() => playContinuousTone(1000, 'right', 1500)}
                    disabled={isPlaying}
                    className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? '🔊 Playing...' : '▶ Play Test Tone (1000 Hz)'}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-900 font-semibold mb-2">
                  💡 Calibration Guidance
                </p>
                <ul className="text-xs text-yellow-800 space-y-1">
                  <li>✓ The actual screening uses brief pulsed tones at this volume</li>
                  <li>✓ Set volume so you can hear soft tones clearly in your quiet room</li>
                  <li>✓ Avoid setting too loud—can cause discomfort or mask subtle hearing issues</li>
                  <li>✓ If you can't hear the tone at max volume, your device/headphones may not support screening</li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={handleCalibrationComplete}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Volume Calibrated, Start Screening
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'testing') {
    const frequency = SCREENING_FREQUENCIES[currentFreqIndex]
    const totalTests = SCREENING_FREQUENCIES.length * 2
    const completedRealTests = results.filter(r => r.frequency !== null).length
    const progress = (completedRealTests / totalTests) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-semibold mb-4">
                {currentEar === 'right' ? '→ Right Ear' : '← Left Ear'} • {frequency} Hz
              </div>
              <h3 className="text-xl text-gray-700 mb-2">
                Listen for the pulsed tone
              </h3>
              <p className="text-sm text-gray-500">
                Frequency {currentFreqIndex + 1} of {SCREENING_FREQUENCIES.length} • {completedRealTests} / {totalTests} tests
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">
                  {currentEar === 'left' ? '👂' : '👂‍♂️'}
                </div>
                <p className="text-gray-600 mb-2">
                  Click the button to play the tone, then respond whether you heard it.
                </p>
                <p className="text-xs text-gray-500 mb-6">
                  You will hear {PULSED_TONE_CONFIG.pulseCount} short pulses if a tone is present
                </p>

                <button
                  onClick={() => {
                    if (!currentTestIsCatchTrial) {
                      playPulsedTone(frequency, currentEar)
                    } else {
                      // Catch trial - no sound, but show "playing" state
                      setIsPlaying(true)
                      const totalDuration = PULSED_TONE_CONFIG.pulseDurationMs * PULSED_TONE_CONFIG.pulseCount + PULSED_TONE_CONFIG.pulseGapMs * (PULSED_TONE_CONFIG.pulseCount - 1)
                      setTimeout(() => setIsPlaying(false), totalDuration)
                    }
                  }}
                  disabled={isPlaying}
                  className="bg-teal-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg mb-6"
                >
                  {isPlaying ? '🔊 Playing...' : '▶ Play Tone'}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleResponse(true)}
                    className="bg-green-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    ✓ I Heard It
                  </button>
                  <button
                    onClick={() => handleResponse(false)}
                    className="bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold hover:bg-gray-500 transition-colors"
                  >
                    ✗ Didn't Hear It
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <strong>Clinical Protocol:</strong> Tones are presented as brief pulses 
                  (not continuous) following clinical screening best practices. Some trials may be silent 
                  to assess response reliability—respond honestly based on what you hear.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{completedRealTests} / {totalTests}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'complete') {
    const summary = getResultsSummary()

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Screening Complete!</h2>
              <p className="text-gray-600">Your results have been {saving ? 'saving...' : 'saved'}</p>
            </div>

            {/* Calibration Banner Reminder */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                🔊 {SCREENING_BANNERS.calibrationLimitation.title}
              </h3>
              <p className="text-sm text-red-800">
                {SCREENING_BANNERS.calibrationLimitation.message}
              </p>
            </div>

            {/* Overall Status */}
            <div className={`rounded-lg p-6 mb-6 text-center border-2 ${
              summary.passed 
                ? 'bg-green-50 border-green-300' 
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <h3 className="text-3xl font-bold mb-3" style={{ color: summary.passed ? '#059669' : '#d97706' }}>
                {summary.passed ? 'PASS' : 'REFER'}
              </h3>
              <p className={`text-sm font-semibold mb-2 ${summary.passed ? 'text-green-900' : 'text-yellow-900'}`}>
                {summary.passed 
                  ? PASS_REFER_CRITERIA.passDefinition
                  : PASS_REFER_CRITERIA.referDefinition}
              </p>
              <p className={`text-xs ${summary.passed ? 'text-green-800' : 'text-yellow-800'}`}>
                {summary.passed 
                  ? 'All screening frequencies detected at test volume in both ears.'
                  : 'One or more screening tones were not detected. Follow-up with a licensed audiologist is recommended for comprehensive hearing evaluation.'}
              </p>
            </div>

            {/* Results Interpretation Banner */}
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                📊 {SCREENING_BANNERS.resultsInterpretation.title}
              </h3>
              <p className="text-sm text-blue-800">
                {SCREENING_BANNERS.resultsInterpretation.message}
              </p>
            </div>

            {/* Results by Ear */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">← Left Ear</h3>
                <p className="text-4xl font-bold text-purple-600 mb-2">
                  {summary.leftEarPassCount}/{summary.totalFrequencies}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1">Frequencies detected</p>
                <p className={`text-xs font-semibold ${summary.leftEarPassCount >= summary.totalFrequencies ? 'text-green-700' : 'text-red-700'}`}>
                  {summary.leftEarPassCount >= summary.totalFrequencies ? '✓ PASS' : '✗ REFER'}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-indigo-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Ear →</h3>
                <p className="text-4xl font-bold text-indigo-600 mb-2">
                  {summary.rightEarPassCount}/{summary.totalFrequencies}
                </p>
                <p className="text-sm font-medium text-gray-700 mb-1">Frequencies detected</p>
                <p className={`text-xs font-semibold ${summary.rightEarPassCount >= summary.totalFrequencies ? 'text-green-700' : 'text-red-700'}`}>
                  {summary.rightEarPassCount >= summary.totalFrequencies ? '✓ PASS' : '✗ REFER'}
                </p>
              </div>
            </div>

            {/* Enhanced Frequency Grid - ASHA Audiogram Style */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 border-2 border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 text-center">
                Frequency Results — ASHA Screening Grid
              </h4>
              <p className="text-xs text-gray-600 text-center mb-4">
                {PASS_REFER_CRITERIA.description}
              </p>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Frequency</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Importance</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-purple-700">← Left</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold text-indigo-700">Right →</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.frequencyResults.map(result => {
                      const importance = PASS_REFER_CRITERIA.frequencyImportance[result.frequency as keyof typeof PASS_REFER_CRITERIA.frequencyImportance]
                      return (
                        <tr key={result.frequency} className="border-b border-gray-200 hover:bg-gray-100 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900">{result.frequency} Hz</span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600 text-center">
                            {importance}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-16 py-1 px-2 rounded-full text-sm font-bold ${
                              result.leftEarPassed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.leftEarPassed ? '✓ PASS' : '✗ MISS'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-16 py-1 px-2 rounded-full text-sm font-bold ${
                              result.rightEarPassed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {result.rightEarPassed ? '✓ PASS' : '✗ MISS'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Protocol Info */}
            {falsePositiveCount > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-900 font-semibold mb-2">
                  ⚠️ Response Reliability Alert
                </p>
                <p className="text-sm text-yellow-800">
                  You responded "heard" on {falsePositiveCount} silent catch trial(s) out of {catchTrialCount} total. 
                  This may indicate guessing, difficulty maintaining attention, or external noise interference. 
                  Consider retesting in a quieter environment or consulting an audiologist for comprehensive evaluation with controlled conditions.
                </p>
              </div>
            )}

            {/* Professional Care Banner */}
            {!summary.passed && (
              <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  👨‍⚕️ {SCREENING_BANNERS.requiresAudiologist.title}
                </h3>
                <p className="text-sm text-blue-800">
                  {SCREENING_BANNERS.requiresAudiologist.message}
                </p>
              </div>
            )}

            {/* Full Disclaimer */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
              <p className="text-xs text-red-900 leading-relaxed">
                <strong className="block mb-2">SCREENING PROTOCOL — NOT DIAGNOSTIC AUDIOMETRY</strong>
                This test follows clinical pure-tone screening methodology (pulsed tones, standard frequencies, catch trials) 
                but uses relative device volumes via Web Audio API, <strong>NOT calibrated dB HL</strong>. Results indicate 
                relative hearing sensitivity and screening pass/refer outcomes only, not absolute audiometric thresholds. 
                This is <strong>NOT</strong> a diagnostic audiological examination. For diagnostic audiometry with calibrated 
                equipment (ANSI S3.6, ISO 8253), threshold determination, bone conduction, tympanometry, otoacoustic emissions, 
                or speech audiometry, consult a licensed audiologist.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard/clinical-summary')}
                className="w-full bg-gradient-to-r from-teal-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-700 hover:to-green-700 transition-colors"
              >
                📊 View Clinical Summary
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => router.push('/tests')}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  More Tests
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}
