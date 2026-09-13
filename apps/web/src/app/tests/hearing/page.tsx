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

type TestPhase = 'instructions' | 'headphone-check' | 'calibration' | 'testing' | 'complete'
type Ear = 'left' | 'right'

interface ToneTest {
  frequency: number
  ear: Ear
  heard: boolean | null
}

interface FrequencyResult {
  frequency: number
  leftEarPassed: boolean
  rightEarPassed: boolean
}

// Standard screening frequencies (Hz)
const SCREENING_FREQUENCIES = [500, 1000, 2000, 4000]

// Screening level in dB HL (typically 25 dB HL for school screenings)
// Note: Cannot accurately replicate dB HL with Web Audio without calibration hardware
// We use relative volume instead
const SCREENING_LEVEL = 0.15 // Relative volume (0.0 to 1.0)

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

  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const pannerRef = useRef<StereoPannerNode | null>(null)

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

  const playTone = (frequency: number, ear: Ear, duration: number = 1500) => {
    if (!audioContextRef.current) return

    stopTone()

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gainNode = context.createGain()
    const panner = context.createStereoPanner()

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    // Set stereo position: -1 = left, 0 = center, 1 = right
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
    setPhase('calibration')
  }

  const handleCalibrationComplete = () => {
    setPhase('testing')
  }

  const handleResponse = (heard: boolean) => {
    const frequency = SCREENING_FREQUENCIES[currentFreqIndex]
    
    const newResult: ToneTest = {
      frequency,
      ear: currentEar,
      heard,
    }

    const updatedResults = [...results, newResult]
    setResults(updatedResults)

    // Advance to next test
    if (currentEar === 'right') {
      // Switch to left ear for same frequency
      setCurrentEar('left')
    } else {
      // Move to next frequency
      if (currentFreqIndex < SCREENING_FREQUENCIES.length - 1) {
        setCurrentFreqIndex(currentFreqIndex + 1)
        setCurrentEar('right')
      } else {
        // Test complete
        finishTest(updatedResults)
      }
    }
  }

  const finishTest = async (testResults: ToneTest[]) => {
    setPhase('complete')

    // Process results
    const frequencyResults: FrequencyResult[] = SCREENING_FREQUENCIES.map(freq => {
      const leftResult = testResults.find(r => r.frequency === freq && r.ear === 'left')
      const rightResult = testResults.find(r => r.frequency === freq && r.ear === 'right')
      
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

    const result = {
      methodology: 'Pure-tone screening at 500, 1000, 2000, 4000 Hz. Web Audio API simulation.',
      frequencyResults,
      leftEarPassCount,
      rightEarPassCount,
      totalFrequencies,
      overallStatus: overallPass ? 'PASS' : 'REFER',
      note: 'This is a basic hearing screening, not a diagnostic audiological examination. Refer to audiologist if any concerns.',
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
                    onClick={() => playTone(1000, 'left', 1000)}
                    disabled={isPlaying}
                    className="bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    ← Left Ear
                  </button>
                  <button
                    onClick={() => playTone(1000, 'right', 1000)}
                    disabled={isPlaying}
                    className="bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    Right Ear →
                  </button>
                </div>
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
                    onClick={() => playTone(1000, 'right', 1500)}
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
    const completedTests = results.length
    const progress = (completedTests / totalTests) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full font-semibold mb-4">
                {currentEar === 'right' ? '→ Right Ear' : '← Left Ear'} • {frequency} Hz
              </div>
              <h3 className="text-xl text-gray-700 mb-2">
                Listen for the tone
              </h3>
              <p className="text-sm text-gray-500">
                Test {completedTests + 1} of {totalTests}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="text-6xl mb-4">
                  {currentEar === 'left' ? '👂' : '👂‍♂️'}
                </div>
                <p className="text-gray-600 mb-6">
                  Click the button to play a tone, then respond whether you heard it.
                </p>

                <button
                  onClick={() => playTone(frequency, currentEar, 1500)}
                  disabled={isPlaying}
                  className="bg-teal-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg mb-6"
                >
                  {isPlaying ? '🔊 Playing Tone...' : '▶ Play Tone'}
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

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{completedTests} / {totalTests}</span>
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

            {/* Disclaimer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Screening Aid:</strong> This is a basic hearing screening tool using Web Audio API, 
                not a diagnostic audiological examination. Results should not replace professional evaluation 
                by a licensed audiologist. Screening conducted at standard frequencies (500, 1000, 2000, 4000 Hz). 
                For comprehensive hearing assessment, consult an audiologist.
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
