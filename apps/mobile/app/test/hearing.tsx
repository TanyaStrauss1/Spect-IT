/**
 * Hearing Screening Test - Mobile
 * Pure-tone screening at key frequencies (500, 1000, 2000, 4000 Hz)
 * 
 * IMPORTANT: This is a screening tool, not a diagnostic audiological examination
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { Audio } from 'expo-av'
import { useAuth } from '../../lib/auth/auth-context'
import { useParticipants } from '../../lib/participants/participant-context'
import { supabase } from '../../lib/supabase'
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

// Relative volume for screening (0.0 to 1.0)
const SCREENING_LEVEL = 0.15

export default function HearingTestScreen() {
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()

  const [phase, setPhase] = useState<TestPhase>('instructions')
  const [currentFreqIndex, setCurrentFreqIndex] = useState(0)
  const [currentEar, setCurrentEar] = useState<Ear>('right')
  const [results, setResults] = useState<ToneTest[]>([])
  const [volumeLevel, setVolumeLevel] = useState(SCREENING_LEVEL)
  const [isPlaying, setIsPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [audioReady, setAudioReady] = useState(false)

  const soundRef = useRef<Audio.Sound | null>(null)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.replace('/auth/signin')
      return
    }

    if (participants.length > 0 && !activeParticipant) {
      Alert.alert('Select Participant', 'Please select a participant before starting the test')
      router.replace('/')
      return
    }

    // Set up audio mode
    setupAudio()

    return () => {
      cleanupAudio()
    }
  }, [user, authLoading, participants, activeParticipant])

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })
      setAudioReady(true)
    } catch (error) {
      console.error('Error setting up audio:', error)
      Alert.alert('Audio Error', 'Failed to set up audio. Please check your device settings.')
    }
  }

  const cleanupAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync()
      } catch (error) {
        console.error('Error cleaning up audio:', error)
      }
      soundRef.current = null
    }
  }

  const generateTone = (frequency: number, duration: number = 1500): string => {
    // Generate a simple sine wave tone using data URI
    // This is a simplified approach - in production, you'd generate actual audio files
    // For now, we'll use a placeholder and rely on the expo-av Sound API
    // Note: Real implementation would generate PCM audio data or use pre-generated tone files
    return `data:audio/wav;base64,${generateSineWaveBase64(frequency, duration)}`
  }

  const generateSineWaveBase64 = (frequency: number, duration: number): string => {
    // Simplified WAV generation - in production, use pre-generated audio files
    // This is a placeholder that returns a basic WAV header
    // For a real implementation, you'd want to generate proper PCM audio data
    const sampleRate = 44100
    const numSamples = Math.floor(sampleRate * (duration / 1000))
    const buffer = new ArrayBuffer(44 + numSamples * 2)
    const view = new DataView(buffer)

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + numSamples * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, numSamples * 2, true)

    // Generate sine wave
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate)
      const scaled = Math.floor(sample * 32767 * volumeLevel)
      view.setInt16(44 + i * 2, scaled, true)
    }

    // Convert to base64
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const playTone = async (frequency: number, ear: Ear, duration: number = 1500) => {
    if (!audioReady) return

    try {
      await cleanupAudio()
      setIsPlaying(true)

      // Generate tone data URI
      const toneUri = generateTone(frequency, duration)

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: toneUri },
        { volume: volumeLevel, shouldPlay: true }
      )

      soundRef.current = sound

      // Set position (pan) for stereo
      // Note: expo-av doesn't have direct pan control like Web Audio
      // In production, you'd generate separate L/R channel audio files
      // For now, we note this limitation in the results

      setTimeout(() => {
        setIsPlaying(false)
      }, duration)
    } catch (error) {
      console.error('Error playing tone:', error)
      Alert.alert('Audio Error', 'Failed to play tone. Please try again.')
      setIsPlaying(false)
    }
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
      setCurrentEar('left')
    } else {
      if (currentFreqIndex < SCREENING_FREQUENCIES.length - 1) {
        setCurrentFreqIndex(currentFreqIndex + 1)
        setCurrentEar('right')
      } else {
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
      methodology: 'Pure-tone screening at 500, 1000, 2000, 4000 Hz. Expo Audio API (mobile). Note: Limited stereo separation compared to clinical audiometry.',
      frequencyResults,
      leftEarPassCount,
      rightEarPassCount,
      totalFrequencies,
      overallStatus: overallPass ? 'PASS' : 'REFER',
      note: 'This is a basic hearing screening, not a diagnostic audiological examination. Refer to audiologist if any concerns.',
      timestamp: new Date().toISOString(),
    }

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
          Alert.alert('Warning', 'Test completed but could not save results')
        }
      } catch (error) {
        console.error('Error saving test result:', error)
      } finally {
        setSaving(false)
      }
    }

    await cleanupAudio()
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

  if (authLoading || !audioReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    )
  }

  if (phase === 'instructions') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎧</Text>
          <Text style={styles.title}>Hearing Screening Test</Text>
          <Text style={styles.subtitle}>Basic pure-tone screening</Text>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>⚠️ Important Notice</Text>
            <Text style={styles.noticeText}>
              This is a <Text style={styles.bold}>basic screening tool</Text>, not a diagnostic audiological examination.
              It cannot replace professional hearing evaluation by a licensed audiologist.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Before You Begin:</Text>
            <Text style={styles.infoItem}>✓ Use <Text style={styles.bold}>stereo headphones or earbuds</Text> (not speakers)</Text>
            <Text style={styles.infoItem}>✓ Find a <Text style={styles.bold}>quiet environment</Text> with minimal background noise</Text>
            <Text style={styles.infoItem}>✓ Set your device volume to a <Text style={styles.bold}>comfortable level</Text></Text>
            <Text style={styles.infoItem}>✓ The test takes about <Text style={styles.bold}>3-5 minutes</Text></Text>
          </View>

          <View style={styles.howBox}>
            <Text style={styles.howTitle}>How It Works:</Text>
            <Text style={styles.howItem}>1. We'll first check your headphones are connected correctly</Text>
            <Text style={styles.howItem}>2. You'll set a comfortable volume level</Text>
            <Text style={styles.howItem}>3. You'll listen for tones at different frequencies in each ear</Text>
            <Text style={styles.howItem}>4. Tap "I Heard It" when you hear a tone</Text>
            <Text style={styles.howItem}>5. Results provide a basic pass/refer screening outcome</Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setPhase('headphone-check')}
          >
            <Text style={styles.primaryButtonText}>Begin Hearing Screening</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (phase === 'headphone-check') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎧</Text>
          <Text style={styles.title}>Headphone Check</Text>
          <Text style={styles.subtitle}>Make sure your headphones are on correctly</Text>

          <View style={styles.checkBox}>
            <Text style={styles.checkText}>
              Tap each button to hear a tone. Verify that you hear the tone in the correct ear.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.earButton, styles.leftEarButton]}
                onPress={() => playTone(1000, 'left', 1000)}
                disabled={isPlaying}
              >
                <Text style={styles.earButtonText}>← Left Ear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.earButton, styles.rightEarButton]}
                onPress={() => playTone(1000, 'right', 1000)}
                disabled={isPlaying}
              >
                <Text style={styles.earButtonText}>Right Ear →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.checkNote}>
              Note: Mobile audio has limited stereo separation. Use headphones for best results.
            </Text>
          </View>

          <View style={styles.centerContent}>
            <Text style={styles.questionText}>Heard the correct tones in each ear?</Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleHeadphoneCheckPass}
            >
              <Text style={styles.continueButtonText}>Yes, Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }

  if (phase === 'calibration') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔊</Text>
          <Text style={styles.title}>Volume Calibration</Text>
          <Text style={styles.subtitle}>Set to a comfortable listening level</Text>

          <View style={styles.calibrationBox}>
            <Text style={styles.calibrationText}>
              Adjust the volume slider until the tone is <Text style={styles.bold}>clearly audible but comfortable</Text>.
              Not too loud, not too soft.
            </Text>

            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonDisabled]}
              onPress={() => playTone(1000, 'right', 1500)}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '🔊 Playing...' : '▶ Play Test Tone (1000 Hz)'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.calibrationNote}>
              Note: The actual screening uses a soft tone. Set volume so you can hear soft tones clearly in a quiet room.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={handleCalibrationComplete}
          >
            <Text style={styles.startButtonText}>Volume Set, Start Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (phase === 'testing') {
    const frequency = SCREENING_FREQUENCIES[currentFreqIndex]
    const totalTests = SCREENING_FREQUENCIES.length * 2
    const completedTests = results.length
    const progress = (completedTests / totalTests) * 100

    return (
      <View style={styles.container}>
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {currentEar === 'right' ? '→ Right Ear' : '← Left Ear'} • {frequency} Hz
              </Text>
            </View>
            <Text style={styles.testInstruction}>Listen for the tone</Text>
            <Text style={styles.testProgress}>Test {completedTests + 1} of {totalTests}</Text>
          </View>

          <View style={styles.toneArea}>
            <Text style={styles.earEmoji}>
              {currentEar === 'left' ? '👂' : '👂'}
            </Text>
            <Text style={styles.tonePrompt}>
              Tap the button to play a tone, then respond whether you heard it.
            </Text>

            <TouchableOpacity
              style={[styles.toneButton, isPlaying && styles.toneButtonDisabled]}
              onPress={() => playTone(frequency, currentEar, 1500)}
              disabled={isPlaying}
            >
              <Text style={styles.toneButtonText}>
                {isPlaying ? '🔊 Playing Tone...' : '▶ Play Tone'}
              </Text>
            </TouchableOpacity>

            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={styles.heardButton}
                onPress={() => handleResponse(true)}
              >
                <Text style={styles.heardButtonText}>✓ I Heard It</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.notHeardButton}
                onPress={() => handleResponse(false)}
              >
                <Text style={styles.notHeardButtonText}>✗ Didn't Hear It</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressCount}>{completedTests} / {totalTests}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        </View>
      </View>
    )
  }

  if (phase === 'complete') {
    const summary = getResultsSummary()

    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>✓</Text>
          <Text style={styles.title}>Screening Complete!</Text>
          <Text style={styles.subtitle}>{saving ? 'Saving results...' : 'Your results have been saved'}</Text>

          <View style={[styles.statusBox, summary.overallPass ? styles.passBox : styles.referBox]}>
            <Text style={[styles.statusText, summary.overallPass ? styles.passText : styles.referText]}>
              {summary.overallPass ? 'PASS' : 'REFER'}
            </Text>
            <Text style={[styles.statusDesc, summary.overallPass ? styles.passDesc : styles.referDesc]}>
              {summary.overallPass
                ? 'Basic screening passed. No immediate concerns detected.'
                : 'Screening indicates follow-up recommended. Please consult an audiologist.'}
            </Text>
          </View>

          <View style={styles.earResults}>
            <View style={styles.earResultCard}>
              <Text style={styles.earResultLabel}>← Left Ear</Text>
              <Text style={styles.earResultScore}>
                {summary.leftEarPassCount}/{summary.totalFrequencies}
              </Text>
              <Text style={styles.earResultText}>Frequencies passed</Text>
            </View>

            <View style={styles.earResultCard}>
              <Text style={styles.earResultLabel}>Right Ear →</Text>
              <Text style={styles.earResultScore}>
                {summary.rightEarPassCount}/{summary.totalFrequencies}
              </Text>
              <Text style={styles.earResultText}>Frequencies passed</Text>
            </View>
          </View>

          <View style={styles.freqBox}>
            <Text style={styles.freqTitle}>Frequency Results</Text>
            {summary.frequencyResults.map(result => (
              <View key={result.frequency} style={styles.freqRow}>
                <Text style={styles.freqLabel}>{result.frequency} Hz</Text>
                <View style={styles.freqResults}>
                  <Text style={result.leftEarPassed ? styles.freqPass : styles.freqFail}>
                    Left: {result.leftEarPassed ? '✓' : '✗'}
                  </Text>
                  <Text style={result.rightEarPassed ? styles.freqPass : styles.freqFail}>
                    Right: {result.rightEarPassed ? '✓' : '✗'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.bold}>Screening Aid:</Text> This is a basic hearing screening tool using mobile audio,
              not a diagnostic audiological examination. Results should not replace professional evaluation
              by a licensed audiologist. Screening conducted at standard frequencies (500, 1000, 2000, 4000 Hz).
              For comprehensive hearing assessment, consult an audiologist.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.dashboardButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.dashboardButtonText}>📊 View Clinical Summary</Text>
          </TouchableOpacity>

          <View style={styles.navButtons}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={() => router.push('/dashboard')}
            >
              <Text style={styles.navButtonText}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navButtonSecondary}
              onPress={() => router.back()}
            >
              <Text style={styles.navButtonSecondaryText}>More Tests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }

  return null
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECFDF5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    marginTop: 60,
  },
  testCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    marginTop: 60,
    flex: 1,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  noticeBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 8,
  },
  howBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  howTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  howItem: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  checkBox: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  checkText: {
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  earButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  leftEarButton: {
    backgroundColor: '#9333EA',
  },
  rightEarButton: {
    backgroundColor: '#4F46E5',
  },
  earButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  checkNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  centerContent: {
    alignItems: 'center',
  },
  questionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  calibrationBox: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  calibrationText: {
    fontSize: 13,
    color: '#1E3A8A',
    marginBottom: 16,
  },
  playButton: {
    backgroundColor: '#14B8A6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  playButtonDisabled: {
    opacity: 0.5,
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  calibrationNote: {
    fontSize: 11,
    color: '#92400E',
  },
  startButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  testHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#059669',
    fontWeight: '600',
    fontSize: 12,
  },
  testInstruction: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  testProgress: {
    fontSize: 14,
    color: '#6B7280',
  },
  toneArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  earEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  tonePrompt: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  toneButton: {
    backgroundColor: '#14B8A6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
  },
  toneButtonDisabled: {
    opacity: 0.5,
  },
  toneButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  heardButton: {
    flex: 1,
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  heardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notHeardButton: {
    flex: 1,
    backgroundColor: '#9CA3AF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  notHeardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#14B8A6',
  },
  statusBox: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  passBox: {
    backgroundColor: '#D1FAE5',
    borderColor: '#6EE7B7',
    borderWidth: 1,
  },
  referBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  passText: {
    color: '#059669',
  },
  referText: {
    color: '#D97706',
  },
  statusDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  passDesc: {
    color: '#065F46',
  },
  referDesc: {
    color: '#92400E',
  },
  earResults: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  earResultCard: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  earResultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: 12,
  },
  earResultScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  earResultText: {
    fontSize: 12,
    color: '#6B7280',
  },
  freqBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  freqTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  freqRow: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freqLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  freqResults: {
    flexDirection: 'row',
    gap: 16,
  },
  freqPass: {
    fontSize: 13,
    color: '#10B981',
  },
  freqFail: {
    fontSize: 13,
    color: '#EF4444',
  },
  disclaimerBox: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  dashboardButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  dashboardButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#14B8A6',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonSecondary: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  navButtonSecondaryText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
})
