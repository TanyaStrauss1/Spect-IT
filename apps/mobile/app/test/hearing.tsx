/**
 * Hearing Screening Test - Mobile
 * Pure-tone screening at key frequencies (500, 1000, 2000, 4000 Hz)
 * 
 * IMPORTANT: This is a screening tool, not a diagnostic audiological examination
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native'
import Slider from '@react-native-community/slider'
import { router } from 'expo-router'
import { Audio } from 'expo-av'
import { useAuth } from '../../lib/auth/auth-context'
import { useParticipants } from '../../lib/participants/participant-context'
import { supabase } from '../../lib/supabase'
import { 
  TEST_TYPE_ID,
  SCREENING_FREQUENCIES,
  PULSED_TONE_CONFIG,
  CATCH_TRIAL_CONFIG,
  DEFAULT_SCREENING_LEVEL,
  PASS_REFER_CRITERIA,
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

export default function HearingTestScreen() {
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()

  const [phase, setPhase] = useState<TestPhase>('instructions')
  const [currentFreqIndex, setCurrentFreqIndex] = useState(0)
  const [currentEar, setCurrentEar] = useState<Ear>('right')
  const [results, setResults] = useState<ToneTest[]>([])
  const [volumeLevel, setVolumeLevel] = useState(DEFAULT_SCREENING_LEVEL)
  const [isPlaying, setIsPlaying] = useState(false)
  const [saving, setSaving] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  const [ambientNoiseOk, setAmbientNoiseOk] = useState(false)
  const [currentTestIsCatchTrial, setCurrentTestIsCatchTrial] = useState(false)
  const [falsePositiveCount, setFalsePositiveCount] = useState(0)
  const [catchTrialCount, setCatchTrialCount] = useState(0)

  const soundRef = useRef<Audio.Sound | null>(null)
  const pulseTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
    if (pulseTimeoutRef.current) {
      clearTimeout(pulseTimeoutRef.current)
      pulseTimeoutRef.current = null
    }
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync()
      } catch (error) {
        console.error('Error cleaning up audio:', error)
      }
      soundRef.current = null
    }
  }

  // Safe base64 encoding for React Native/Hermes
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    // Use base64-js or similar if btoa is unavailable, but btoa works in RN 0.73+
    if (typeof btoa !== 'undefined') {
      return btoa(binary)
    }
    // Fallback: simple base64 encoding
    const b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    let result = ''
    for (let i = 0; i < binary.length; i += 3) {
      const byte1 = binary.charCodeAt(i)
      const byte2 = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0
      const byte3 = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0
      
      result += b64chars[byte1 >> 2]
      result += b64chars[((byte1 & 3) << 4) | (byte2 >> 4)]
      result += i + 1 < binary.length ? b64chars[((byte2 & 15) << 2) | (byte3 >> 6)] : '='
      result += i + 2 < binary.length ? b64chars[byte3 & 63] : '='
    }
    return result
  }

  const generateStereoTone = (frequency: number, ear: Ear, duration: number = 1500): string => {
    // Generate stereo WAV with tone only on requested ear, silence on the other
    const sampleRate = 44100
    const numChannels = 2 // Stereo
    const bitsPerSample = 16
    const bytesPerSample = bitsPerSample / 8
    const blockAlign = numChannels * bytesPerSample
    const numSamples = Math.floor(sampleRate * (duration / 1000))
    const dataSize = numSamples * blockAlign
    const buffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(buffer)

    // WAV header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // PCM format chunk size
    view.setUint16(20, 1, true) // Audio format (1 = PCM)
    view.setUint16(22, numChannels, true) // Number of channels
    view.setUint32(24, sampleRate, true) // Sample rate
    view.setUint32(28, sampleRate * blockAlign, true) // Byte rate
    view.setUint16(32, blockAlign, true) // Block align
    view.setUint16(34, bitsPerSample, true) // Bits per sample
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)

    // Generate stereo sine wave: tone on requested ear, silence on other
    let offset = 44
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate)
      const scaled = Math.floor(sample * 32767 * volumeLevel)
      
      if (ear === 'left') {
        // Left channel: tone, Right channel: silence
        view.setInt16(offset, scaled, true)
        view.setInt16(offset + 2, 0, true)
      } else {
        // Left channel: silence, Right channel: tone
        view.setInt16(offset, 0, true)
        view.setInt16(offset + 2, scaled, true)
      }
      offset += 4
    }

    return `data:audio/wav;base64,${arrayBufferToBase64(buffer)}`
  }

  const playContinuousTone = async (frequency: number, ear: Ear, duration: number = 1500) => {
    // For calibration/headphone check - uses continuous tone
    if (!audioReady) return

    try {
      await cleanupAudio()
      setIsPlaying(true)

      // Generate stereo WAV with tone only on requested ear
      const toneUri = generateStereoTone(frequency, ear, duration)

      // Create and play sound at full volume (tone already scaled by volumeLevel)
      const { sound } = await Audio.Sound.createAsync(
        { uri: toneUri },
        { volume: 1.0, shouldPlay: true }
      )

      soundRef.current = sound

      setTimeout(() => {
        setIsPlaying(false)
      }, duration)
    } catch (error) {
      console.error('Error playing tone:', error)
      Alert.alert('Audio Error', 'Failed to play tone. Please try again.')
      setIsPlaying(false)
    }
  }

  const playPulsedTone = async (frequency: number, ear: Ear) => {
    // Clinical screening protocol: pulsed tones (500ms on, 300ms off, 3 pulses)
    if (!audioReady) return

    try {
      await cleanupAudio()
      setIsPlaying(true)

      let pulseIndex = 0

      const playPulse = async () => {
        if (pulseIndex >= PULSED_TONE_CONFIG.pulseCount) {
          setIsPlaying(false)
          return
        }

        // Generate and play one pulse
        const toneUri = generateStereoTone(frequency, ear, PULSED_TONE_CONFIG.pulseDurationMs)
        const { sound } = await Audio.Sound.createAsync(
          { uri: toneUri },
          { volume: 1.0, shouldPlay: true }
        )

        soundRef.current = sound

        pulseIndex++

        if (pulseIndex < PULSED_TONE_CONFIG.pulseCount) {
          // Schedule next pulse after pulse duration + gap
          pulseTimeoutRef.current = setTimeout(async () => {
            await cleanupAudio()
            playPulse()
          }, PULSED_TONE_CONFIG.pulseDurationMs + PULSED_TONE_CONFIG.pulseGapMs)
        } else {
          // Last pulse - clean up after it finishes
          setTimeout(() => {
            setIsPlaying(false)
          }, PULSED_TONE_CONFIG.pulseDurationMs)
        }
      }

      await playPulse()
    } catch (error) {
      console.error('Error playing pulsed tone:', error)
      Alert.alert('Audio Error', 'Failed to play tone. Please try again.')
      setIsPlaying(false)
    }
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
      setCurrentEar('left')
      prepareNextTest()
    } else {
      if (currentFreqIndex < SCREENING_FREQUENCIES.length - 1) {
        setCurrentFreqIndex(currentFreqIndex + 1)
        setCurrentEar('right')
        prepareNextTest()
      } else {
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
    // Refer if fails at any frequency in either ear at screening level
    const leftEarRefer = leftEarPassCount < totalFrequencies
    const rightEarRefer = rightEarPassCount < totalFrequencies
    const shouldRefer = leftEarRefer || rightEarRefer

    const result = {
      methodology: createMethodologyString(catchTrials.length, falsePositiveCount, 'mobile'),
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
    
    // Use strict ASHA criteria: must pass ALL frequencies (no misses allowed)
    const passed = leftEarPassCount >= totalFrequencies && rightEarPassCount >= totalFrequencies

    return { frequencyResults, leftEarPassCount, rightEarPassCount, totalFrequencies, passed }
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
                onPress={() => playContinuousTone(1000, 'left', 1000)}
                disabled={isPlaying}
              >
                <Text style={styles.earButtonText}>← Left Ear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.earButton, styles.rightEarButton]}
                onPress={() => playContinuousTone(1000, 'right', 1000)}
                disabled={isPlaying}
              >
                <Text style={styles.earButtonText}>Right Ear →</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.checkNote}>
              ✓ Headphones are required for reliable left/right ear separation. Speakers will not provide accurate screening results.
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

  if (phase === 'ambient-noise') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔇</Text>
          <Text style={styles.title}>Ambient Noise Check</Text>
          <Text style={styles.subtitle}>Ensure a quiet testing environment</Text>

          <View style={styles.noticeBox}>
            <Text style={styles.noticeTitle}>⚠️ Environmental Requirements</Text>
            <Text style={styles.noticeText}>
              Clinical screening protocols require ambient noise levels below 50 dB for reliable results. 
              Background noise can mask tones and cause false failures.
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Before proceeding, ensure:</Text>
            <Text style={styles.infoItem}>✓ You are in a <Text style={styles.bold}>quiet room</Text> away from traffic, conversations, or machinery</Text>
            <Text style={styles.infoItem}>✓ Windows and doors are closed to reduce external noise</Text>
            <Text style={styles.infoItem}>✓ Fans, air conditioning, or other noise sources are off if possible</Text>
            <Text style={styles.infoItem}>✓ You are not in a busy environment (cafeteria, hallway, open office)</Text>
            <Text style={styles.infoItem}>✓ Phone notifications and other devices are silenced</Text>
          </View>

          <View style={[styles.infoBox, { backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.infoItem, { fontSize: 11, color: '#1E3A8A' }]}>
              <Text style={styles.bold}>Note:</Text> This screening cannot measure actual ambient noise levels. You are attesting that your environment meets the quiet conditions described above.
            </Text>
          </View>

          <View style={styles.centerContent}>
            <Text style={[styles.questionText, { fontWeight: '600' }]}>
              I am in a quiet environment suitable for hearing screening
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleAmbientNoiseConfirm}
            >
              <Text style={styles.continueButtonText}>✓ Confirm & Continue</Text>
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

            <View style={styles.volumeControl}>
              <Text style={styles.volumeLabel}>Volume: {Math.round(volumeLevel * 100)}%</Text>
              <Slider
                style={styles.slider}
                minimumValue={0.05}
                maximumValue={0.5}
                step={0.01}
                value={volumeLevel}
                onValueChange={setVolumeLevel}
                minimumTrackTintColor="#14B8A6"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#14B8A6"
              />
            </View>

            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonDisabled]}
              onPress={() => playContinuousTone(1000, 'right', 1500)}
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
    const completedRealTests = results.filter(r => r.frequency !== null).length
    const progress = (completedRealTests / totalTests) * 100

    return (
      <View style={styles.container}>
        <View style={styles.testCard}>
          <View style={styles.testHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {currentEar === 'right' ? '→ Right Ear' : '← Left Ear'} • {frequency} Hz
              </Text>
            </View>
            <Text style={styles.testInstruction}>Listen for the pulsed tone</Text>
            <Text style={styles.testProgress}>Frequency {currentFreqIndex + 1} of {SCREENING_FREQUENCIES.length} • {completedRealTests} / {totalTests} tests</Text>
          </View>

          <View style={styles.toneArea}>
            <Text style={styles.earEmoji}>
              {currentEar === 'left' ? '👂' : '👂'}
            </Text>
            <Text style={styles.tonePrompt}>
              Tap the button to play the tone, then respond whether you heard it.
            </Text>
            <Text style={[styles.tonePrompt, { fontSize: 11, marginTop: 4 }]}>
              You will hear {PULSED_TONE_CONFIG.pulseCount} short pulses if a tone is present
            </Text>

            <TouchableOpacity
              style={[styles.toneButton, isPlaying && styles.toneButtonDisabled]}
              onPress={() => {
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
            >
              <Text style={styles.toneButtonText}>
                {isPlaying ? '🔊 Playing...' : '▶ Play Tone'}
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

            <Text style={[styles.checkNote, { marginTop: 12, textAlign: 'center' }]}>
              <Text style={styles.bold}>Clinical Protocol:</Text> Tones are presented as brief pulses. 
              Some trials may be silent to assess response reliability—respond honestly based on what you hear.
            </Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Overall Progress</Text>
              <Text style={styles.progressCount}>{completedRealTests} / {totalTests}</Text>
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

          <View style={[styles.statusBox, summary.passed ? styles.passBox : styles.referBox]}>
            <Text style={[styles.statusText, summary.passed ? styles.passText : styles.referText]}>
              {summary.passed ? 'PASS' : 'REFER'}
            </Text>
            <Text style={[styles.statusDesc, summary.passed ? styles.passDesc : styles.referDesc]}>
              {summary.passed
                ? 'Screening passed. Heard all frequencies in both ears.'
                : 'Screening incomplete or missed frequency detected. Audiological follow-up recommended.'}
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

          {falsePositiveCount > 0 && (
            <View style={[styles.noticeBox, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D', marginBottom: 16 }]}>
              <Text style={[styles.disclaimerText, { color: '#92400E' }]}>
                <Text style={styles.bold}>Response Reliability Note:</Text> You responded "heard" on {falsePositiveCount} silent catch trial(s). 
                This may indicate guessing or difficulty maintaining attention. Consider retesting in a quieter environment 
                or consulting an audiologist for comprehensive evaluation.
              </Text>
            </View>
          )}

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.bold}>SCREENING PROTOCOL — NOT DIAGNOSTIC AUDIOMETRY:</Text> This test follows clinical pure-tone screening 
              methodology (pulsed tones, standard frequencies, catch trials) but uses relative device volumes, 
              <Text style={styles.bold}> NOT calibrated dB HL</Text>. Results indicate relative hearing sensitivity and screening pass/refer 
              outcomes only, not absolute audiometric thresholds. This is <Text style={styles.bold}>NOT</Text> a diagnostic audiological 
              examination. For diagnostic audiometry with calibrated equipment (ANSI S3.6, ISO 8253), threshold determination, 
              bone conduction, tympanometry, otoacoustic emissions, or speech audiometry, consult a licensed audiologist.
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
  volumeControl: {
    width: '100%',
    marginBottom: 16,
  },
  volumeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
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
