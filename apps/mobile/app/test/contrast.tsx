/**
 * Clinical Contrast Sensitivity Test - Mobile
 * Pelli-Robson style with calibrated Sloan optotypes
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { SloanOptotype } from '../../components/stimuli/SloanOptotype'
import { CalibrationScreen } from '../../components/calibration/CalibrationScreen'
import {
  createContrastSensitivityTest,
  type ContrastLevel,
  type ContrastTripletResponse,
  type CalibrationData,
  ScreenCalibrator,
} from '@spect-it/cv'

export default function ContrastTestScreen() {
  const [needsCalibration, setNeedsCalibration] = useState(true)
  const [calibration, setCalibration] = useState<CalibrationData | null>(null)
  const [calibrator, setCalibrator] = useState<ScreenCalibrator | null>(null)
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [tripletResponses, setTripletResponses] = useState<ContrastTripletResponse[]>([])
  const [currentTripletLetters, setCurrentTripletLetters] = useState<any[]>([])
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const test = createContrastSensitivityTest({ letterSizeArcMin: 180 })
  const contrastLevels = test.getContrastLevels()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.replace('/auth/signin')
    }

    const cal = new ScreenCalibrator()
    setCalibrator(cal)

    if (cal.isReady()) {
      const existingCal = cal.getCalibration() || cal.getDefaultCalibration()
      setCalibration(existingCal)
      setNeedsCalibration(false)
    }
  }, [user, authLoading])

  const handleCalibrationComplete = (cal: CalibrationData) => {
    setCalibration(cal)
    setNeedsCalibration(false)
  }

  const handleCalibrationSkip = () => {
    if (calibrator) {
      calibrator.markSkipped()
      const defaultCal = calibrator.getDefaultCalibration()
      setCalibration(defaultCal)
      setNeedsCalibration(false)
    }
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return

    const currentLevel = contrastLevels[currentLevelIndex]
    const letter = currentLevel.letters[currentLetterIndex]
    const correct = test.checkResponse(letter, userInput)

    const updatedTripletLetters = [
      ...currentTripletLetters,
      { letter, userResponse: userInput.trim().toUpperCase(), correct },
    ]
    setCurrentTripletLetters(updatedTripletLetters)
    setUserInput('')

    if (updatedTripletLetters.length === 3) {
      const tripletResponse = test.scoreTriplet(currentLevel, updatedTripletLetters)
      const updatedTriplets = [...tripletResponses, tripletResponse]
      setTripletResponses(updatedTriplets)

      if (test.shouldStop(tripletResponse) || currentLevelIndex >= contrastLevels.length - 1) {
        finishTest(updatedTriplets)
      } else {
        setCurrentLevelIndex(currentLevelIndex + 1)
        setCurrentLetterIndex(0)
        setCurrentTripletLetters([])
      }
    } else {
      setCurrentLetterIndex(currentLetterIndex + 1)
    }
  }

  const finishTest = async (finalTriplets: ContrastTripletResponse[]) => {
    const testResult = test.createResult(calibration!, finalTriplets)
    const interpretation = test.getInterpretation(testResult.category, testResult.finalLogCS)
    
    setResult({
      ...testResult,
      interpretation,
    })
    setStep('result')

    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: 'Contrast Sensitivity (Clinical)',
            test_data: testResult,
            score: Math.round(testResult.finalLogCS * 100),
            test_date: new Date().toISOString(),
          })

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
  }

  if (needsCalibration) {
    return (
      <CalibrationScreen
        onComplete={handleCalibrationComplete}
        onSkip={handleCalibrationSkip}
      />
    )
  }

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🌓</Text>
          <Text style={styles.title}>Contrast Sensitivity Test</Text>
          <Text style={styles.subtitle}>Pelli-Robson Style Screening</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Clinical Methodology</Text>
            <Text style={styles.infoText}>
              This test measures your ability to distinguish letters at decreasing contrast levels. 
              Letters remain the same size but become progressively lighter. This tests your 
              contrast sensitivity function (CSF), which is important for vision in low light, 
              fog, or glare conditions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. Letters appear at the same size but varying contrast</Text>
            <Text style={styles.text}>2. Read each letter you can see clearly</Text>
            <Text style={styles.text}>3. As contrast decreases, letters become harder to see</Text>
            <Text style={styles.text}>4. Type your best guess for each letter</Text>
            <Text style={styles.text}>5. Test stops when letters become invisible</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Important:</Text> Adjust your screen brightness to a 
              comfortable level before starting. Test in good, even lighting. Sit at your calibrated 
              viewing distance.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('test')}>
            <Text style={styles.primaryButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (step === 'result') {
    const thresholdPercent = (Math.pow(10, -result.finalLogCS) * 100).toFixed(1)
    
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultEmoji}>✓</Text>
          <Text style={styles.resultTitle}>Test Complete!</Text>
          <Text style={styles.resultSubtitle}>
            {saving ? 'Saving results...' : 'Results saved'}
          </Text>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Log Contrast Sensitivity</Text>
            <Text style={styles.resultScore}>{result.finalLogCS.toFixed(2)}</Text>
            <Text style={styles.resultSmall}>
              Threshold: ~{thresholdPercent}% contrast
            </Text>
            <Text style={[styles.categoryBadge, styles[`badge${result.category}`]]}>
              {result.category}
            </Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Triplets Completed</Text>
              <Text style={styles.resultItemValue}>{result.triplets.length}/{contrastLevels.length}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Total Correct</Text>
              <Text style={styles.resultItemValue}>
                {result.triplets.reduce((sum: number, t: ContrastTripletResponse) => sum + t.correctCount, 0)}
              </Text>
            </View>
          </View>

          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationTitle}>Interpretation</Text>
            <Text style={styles.interpretationText}>{result.interpretation}</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Screening Notice:</Text> This is a screening result, not a medical diagnosis. 
              Reduced contrast sensitivity can indicate various eye conditions. Please consult an eye care 
              professional for comprehensive evaluation.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/dashboard')}>
            <Text style={styles.primaryButtonText}>View Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  const currentLevel = contrastLevels[currentLevelIndex]
  const currentLetter = currentLevel?.letters[currentLetterIndex]
  
  // Calculate letter size for ~3° visual angle (180 arc minutes)
  const letterSizePx = calibrator?.calculateSizeForVisualAngle(180) || 120
  const strokeWidthPx = Math.round(letterSizePx / 5)
  
  // Calculate letter color based on contrast
  const grayValue = Math.round(255 * (1 - currentLevel.contrast))
  const letterColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`

  return (
    <View style={styles.container}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Triplet {currentLevel.triplet} - Letter {currentLetterIndex + 1}/3
            </Text>
          </View>
          <Text style={styles.instruction}>
            Contrast: {(currentLevel.contrast * 100).toFixed(0)}% (logCS {currentLevel.logCS.toFixed(2)})
          </Text>
        </View>

        <View style={styles.lettersContainer}>
          {currentLetter && (
            <SloanOptotype
              letter={currentLetter}
              strokeWidthPx={strokeWidthPx}
              color={letterColor}
            />
          )}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type the letter"
            autoCapitalize="characters"
            autoFocus
            maxLength={1}
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[styles.submitButton, !userInput && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!userInput}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Triplet Progress: {tripletResponses.length} / {contrastLevels.length} completed
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(tripletResponses.length / contrastLevels.length) * 100}%` },
              ]}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  card: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  testCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  disclaimer: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  badge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 12,
  },
  instruction: {
    fontSize: 14,
    color: '#6B7280',
  },
  lettersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    backgroundColor: 'white',
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 18,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  progress: {
    marginTop: 24,
  },
  progressText: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
  },
  resultEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  resultMain: {
    backgroundColor: '#EEF2FF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  resultSmall: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  badgeNORMAL: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  badgeBORDERLINE: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeREDUCED: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  resultGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  resultItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resultItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  resultItemValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  interpretationBox: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  interpretationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  interpretationText: {
    fontSize: 13,
    color: '#6B21A8',
    lineHeight: 20,
  },
})
