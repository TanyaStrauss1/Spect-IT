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
import { TEST_TYPE_ID } from '@spect-it/cv'

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

// Standard screening frequencies (Hz) - ASHA school screening protocol
const SCREENING_FREQUENCIES = [500, 1000, 2000, 4000]

// Optional extended frequencies for advanced screening
const EXTENDED_FREQUENCIES = [250, 6000, 8000]

// Screening level: relative device volume
// IMPORTANT: Web Audio API uses relative device volumes (0.0 to 1.0), NOT calibrated dB HL
// This is uncalibrated screening; results indicate relative hearing sensitivity only
const SCREENING_LEVEL = 0.15 // Relative volume (0.0 to 1.0)

// Pulsed tone configuration (clinical screening best practice)
const TONE_PULSE_DURATION_MS = 500 // 500ms on
const TONE_PULSE_GAP_MS = 300 // 300ms off
const TONE_PULSE_COUNT = 3 // 3 pulses per presentation

// Catch trial configuration (to detect false positives)
const CATCH_TRIAL_PROBABILITY = 0.15 // 15% of trials are silent catch trials

export default function HearingTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()
  const { markTestComplete } = useJourney()

  const [phase, setPhase] = useState<TestPhase>('instructions')
  const [currentFreqIndex, setCurrentFreqIndex] = useState(0)
  const [currentEar, setCurrentEar] = useState<Ear>('right')
  const [results, setResults] = useState<ToneTest[]>([])
  const [volumeLevel, setVolumeLevel] = useState(SCREENING_LEVEL)
  const [isPlaying, setIsPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [ambientNoiseOk, setAmbientNoiseOk] = useState(false)
  const [currentTestIsCatchTrial, setCurrentTestIsCatchTrial] = useState(false)
  const [falsePositiveCount, setFalsePositiveCount] = useState(0)

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
      if (pulseIndex >= TONE_PULSE_COUNT) {
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
      gainNode.gain.setValueAtTime(volumeLevel, now + TONE_PULSE_DURATION_MS / 1000 - 0.01)
      gainNode.gain.linearRampToValueAtTime(0, now + TONE_PULSE_DURATION_MS / 1000) // 10ms release

      oscillator.connect(gainNode)
      gainNode.connect(panner)
      panner.connect(context.destination)

      oscillator.start(now)
      oscillator.stop(now + TONE_PULSE_DURATION_MS / 1000)

      oscillatorRef.current = oscillator
      gainNodeRef.current = gainNode
      pannerRef.current = panner

      pulseIndex++
      pulseTimeoutRef.current = setTimeout(playPulse, TONE_PULSE_DURATION_MS + TONE_PULSE_GAP_MS)
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
    // Determine if this should be a catch trial (15% probability)
    const isCatchTrial = Math.random() < CATCH_TRIAL_PROBABILITY
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
    const overallPass = leftEarPassCount >= totalFrequencies - 1 && rightEarPassCount >= totalFrequencies - 1

    // Pass/refer criteria per ASHA school screening guidelines:
    // Refer if fails at any frequency in either ear at screening level
    const leftEarRefer = leftEarPassCount < totalFrequencies
    const rightEarRefer = rightEarPassCount < totalFrequencies
    const shouldRefer = leftEarRefer || rightEarRefer

    const result = {
      methodology: `Clinical pure-tone screening protocol following ASHA school screening guidelines. Frequencies: 500, 1000, 2000, 4000 Hz (standard pure-tone air conduction screening frequencies). Presentation: pulsed tones (${TONE_PULSE_DURATION_MS}ms pulses with ${TONE_PULSE_GAP_MS}ms gaps, ${TONE_PULSE_COUNT} pulses per trial) to improve detection and reduce listener fatigue. Catch trials: ${catchTrials.length} silent trials included to assess response reliability (false positive rate: ${falsePositiveCount}/${catchTrials.length}). Left/right ear tested separately with stereo headphones. IMPORTANT: Screening levels use relative device volume (Web Audio API), NOT calibrated dB HL. Results indicate relative hearing sensitivity only, not absolute audiometric thresholds.`,
      protocol: 'ASHA-based pure-tone screening',
      frequencyResults,
      leftEarPassCount,
      rightEarPassCount,
      totalFrequencies,
      catchTrialCount: catchTrials.length,
      falsePositiveCount,
      overallStatus: shouldRefer ? 'REFER' : 'PASS',
      passCriteria: 'Pass all screening frequencies (500, 1000, 2000, 4000 Hz) in both ears. Refer if any frequency missed.',
      note: 'This is a SCREENING TOOL using a clinical screening protocol, not a diagnostic audiological examination. Screening levels are relative device volumes, NOT calibrated dB HL. For diagnostic audiometry with calibrated equipment (ANSI/ISO standards), threshold determination, bone conduction, tympanometry, or speech testing, consult a licensed audiologist.',
      timestamp: new Date().toISOString(),
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
    const overallPass = leftEarPassCount >= totalFrequencies - 1 && rightEarPassCount >= totalFrequencies - 1

    return { frequencyResults, leftEarPassCount, rightEarPassCount, totalFrequencies, overallPass }
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
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notice</h3>
                <p className="text-sm text-yellow-800">
                  This is a <strong>basic screening tool</strong>, not a diagnostic audiological examination. 
                  It cannot replace professional hearing evaluation by a licensed audiologist.
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">🔊 Calibration Limitation</h3>
                <p className="text-sm text-red-800">
                  This test uses <strong>relative device volumes, NOT calibrated dB HL</strong>. Results indicate 
                  relative hearing sensitivity only, not absolute hearing thresholds. For calibrated audiometric 
                  testing with standardized dB HL levels, consult an audiologist.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Before You Begin:</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Use <strong>stereo headphones or earbuds</strong> (not speakers)</li>
                  <li>✓ Find a <strong>quiet environment</strong> with minimal background noise</li>
                  <li>✓ Set your device volume to a <strong>comfortable level</strong></li>
                  <li>✓ The test takes about <strong>3-5 minutes</strong></li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">How It Works:</h3>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>We'll first check your headphones are connected correctly</li>
                  <li>You'll set a comfortable volume level</li>
                  <li>You'll listen for tones at different frequencies in each ear</li>
                  <li>Click "I Heard It" when you hear a tone</li>
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Headphone Check</h2>
              <p className="text-gray-600">Make sure your headphones are on correctly</p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-blue-800 mb-4">
                  Click each button to hear a tone. Verify that you hear the tone in the correct ear.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => playContinuousTone(1000, 'left', 1000)}
                    disabled={isPlaying}
                    className="bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    ← Left Ear
                  </button>
                  <button
                    onClick={() => playContinuousTone(1000, 'right', 1000)}
                    disabled={isPlaying}
                    className="bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Right Ear →
                  </button>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-800">
                  ✓ <strong>Headphones are required</strong> for reliable left/right ear separation. 
                  Speakers will not provide accurate screening results.
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Heard the correct tones in each ear?
                </p>
                <button
                  onClick={handleHeadphoneCheckPass}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Yes, Continue
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ambient Noise Check</h2>
              <p className="text-gray-600">Ensure a quiet testing environment</p>
            </div>

            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Environmental Requirements</h3>
                <p className="text-sm text-yellow-800 mb-4">
                  Clinical screening protocols require ambient noise levels below 50 dB for reliable results. 
                  Background noise can mask tones and cause false failures.
                </p>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>✓ Find a <strong>quiet room</strong> away from traffic, conversations, or machinery</li>
                  <li>✓ Close windows and doors to reduce external noise</li>
                  <li>✓ Turn off fans, air conditioning, or other noise sources if possible</li>
                  <li>✓ Avoid testing in busy environments (cafeterias, hallways, open offices)</li>
                  <li>✓ Silence phone notifications and other devices</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> This screening cannot measure actual ambient noise levels (would require microphone permissions 
                  and calibrated measurement). You are attesting that your environment meets the quiet conditions described above.
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  I am in a quiet environment suitable for hearing screening
                </p>
                <button
                  onClick={handleAmbientNoiseConfirm}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  ✓ Confirm & Continue
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
              <p className="text-xs text-gray-500 mt-1">(Relative volume only — not calibrated dB HL)</p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-sm text-blue-800 mb-4">
                  Adjust the volume slider until the tone is <strong>clearly audible but comfortable</strong>. 
                  Not too loud, not too soft.
                </p>

                <div className="space-y-4">
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={volumeLevel}
                    onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />

                  <button
                    onClick={() => playContinuousTone(1000, 'right', 1500)}
                    disabled={isPlaying}
                    className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
                  >
                    {isPlaying ? 'Playing...' : 'Play Test Tone (1000 Hz)'}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> The actual screening uses a soft tone. 
                  Set volume so you can hear soft tones clearly in a quiet room.
                </p>
              </div>

              <div className="text-center">
                <button
                  onClick={handleCalibrationComplete}
                  className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Volume Set, Start Test
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
                  You will hear {TONE_PULSE_COUNT} short pulses if a tone is present
                </p>

                <button
                  onClick={() => {
                    if (!currentTestIsCatchTrial) {
                      playPulsedTone(frequency, currentEar)
                    } else {
                      // Catch trial - no sound, but show "playing" state
                      setIsPlaying(true)
                      setTimeout(() => setIsPlaying(false), TONE_PULSE_DURATION_MS * TONE_PULSE_COUNT + TONE_PULSE_GAP_MS * (TONE_PULSE_COUNT - 1))
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

            {/* Overall Status */}
            <div className={`rounded-lg p-6 mb-6 text-center ${
              summary.overallPass 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: summary.overallPass ? '#059669' : '#d97706' }}>
                {summary.overallPass ? 'PASS' : 'REFER'}
              </h3>
              <p className={`text-sm ${summary.overallPass ? 'text-green-800' : 'text-yellow-800'}`}>
                {summary.overallPass 
                  ? 'Basic screening passed. No immediate concerns detected.'
                  : 'Screening indicates follow-up recommended. Please consult an audiologist.'}
              </p>
            </div>

            {/* Results by Ear */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">← Left Ear</h3>
                <p className="text-3xl font-bold text-purple-600 mb-2">
                  {summary.leftEarPassCount}/{summary.totalFrequencies}
                </p>
                <p className="text-sm text-gray-600">Frequencies passed</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Right Ear →</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-2">
                  {summary.rightEarPassCount}/{summary.totalFrequencies}
                </p>
                <p className="text-sm text-gray-600">Frequencies passed</p>
              </div>
            </div>

            {/* Frequency Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-gray-900 mb-4">Frequency Results</h4>
              <div className="space-y-2">
                {summary.frequencyResults.map(result => (
                  <div key={result.frequency} className="flex items-center justify-between bg-white rounded p-3">
                    <span className="font-medium text-gray-700">{result.frequency} Hz</span>
                    <div className="flex gap-4">
                      <span className={`text-sm ${result.leftEarPassed ? 'text-green-600' : 'text-red-600'}`}>
                        Left: {result.leftEarPassed ? '✓' : '✗'}
                      </span>
                      <span className={`text-sm ${result.rightEarPassed ? 'text-green-600' : 'text-red-600'}`}>
                        Right: {result.rightEarPassed ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Protocol Info */}
            {falsePositiveCount > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Response Reliability Note:</strong> You responded "heard" on {falsePositiveCount} silent catch trial(s). 
                  This may indicate guessing or difficulty maintaining attention. Consider retesting in a quieter environment 
                  or consulting an audiologist for comprehensive evaluation.
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                <strong>SCREENING PROTOCOL — NOT DIAGNOSTIC AUDIOMETRY:</strong> This test follows clinical pure-tone screening 
                methodology (pulsed tones, standard frequencies, catch trials) but uses relative device volumes via Web Audio API, 
                <strong> NOT calibrated dB HL</strong>. Results indicate relative hearing sensitivity and screening pass/refer 
                outcomes only, not absolute audiometric thresholds. This is <strong>NOT</strong> a diagnostic audiological 
                examination. For diagnostic audiometry with calibrated equipment (ANSI S3.6, ISO 8253), threshold determination, 
                bone conduction, tympanometry, otoacoustic emissions, or speech audiometry, consult a licensed audiologist.
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
