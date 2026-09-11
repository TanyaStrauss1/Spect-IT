/**
 * Clinical Prescription Screening - Mobile
 * Dual-acuity pinhole methodology with Sloan optotypes
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { SloanOptotype } from '../../components/stimuli/SloanOptotype'
import { CalibrationScreen } from '../../components/calibration/CalibrationScreen'
import {
  createPrescriptionScreeningTest,
  type Eye,
  type PinholeResult,
  type CalibrationData,
  ScreenCalibrator,
  createVisualAcuityTest,
  ETDRS_CHART,
} from '@spect-it/cv'

export default function PrescriptionTestScreen() {
  const [needsCalibration, setNeedsCalibration] = useState(true)
  const [calibration, setCalibration] = useState<CalibrationData | null>(null)
  const [calibrator, setCalibrator] = useState<ScreenCalibrator | null>(null)
  const [step, setStep] = useState<'intro' | 'uncorrected' | 'pinhole' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [uncorrectedScores, setUncorrectedScores] = useState<{ right: number | null; left: number | null }>({ right: null, left: null })
  const [pinholeScores, setPinholeScores] = useState<{ right: number | null; left: number | null }>({ right: null, left: null })
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const test = createPrescriptionScreeningTest()
  const acuityTest = createVisualAcuityTest()
  const testLine = ETDRS_CHART.find(line => line.logMAR === 0.3) || ETDRS_CHART[6] // 6/12 line

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

    const letter = testLine.letters[currentLetterIndex]
    const correct = acuityTest.checkResponse(letter, userInput)

    if (correct) {
      setCorrectCount(correctCount + 1)
    }

    if (currentLetterIndex < testLine.letters.length - 1) {
      setCurrentLetterIndex(currentLetterIndex + 1)
      setUserInput('')
    } else {
      finishLineTest()
    }
  }

  const finishLineTest = () => {
    const logMAR = testLine.logMAR + (5 - correctCount) * 0.02

    if (step === 'uncorrected') {
      const updated = { ...uncorrectedScores }
      updated[currentEye] = logMAR
      setUncorrectedScores(updated)

      setCurrentLetterIndex(0)
      setCorrectCount(0)
      setUserInput('')
      setStep('pinhole')
    } else if (step === 'pinhole') {
      const updated = { ...pinholeScores }
      updated[currentEye] = logMAR
      setPinholeScores(updated)

      if (currentEye === 'right') {
        setCurrentEye('left')
        setCurrentLetterIndex(0)
        setCorrectCount(0)
        setUserInput('')
        setStep('uncorrected')
      } else {
        finishTest()
      }
    }
  }

  const finishTest = async () => {
    const rightPinhole = test.processPinholeResult(
      'right',
      uncorrectedScores.right || 0.5,
      pinholeScores.right || 0.5
    )
    const leftPinhole = test.processPinholeResult(
      'left',
      uncorrectedScores.left || 0.5,
      pinholeScores.left || 0.5
    )

    const testResult = test.createResult(calibration, rightPinhole, leftPinhole, null)
    const rightInterpretation = test.getInterpretation(rightPinhole)
    const leftInterpretation = test.getInterpretation(leftPinhole)

    setResult({
      ...testResult,
      rightInterpretation,
      leftInterpretation,
    })
    setStep('result')

    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: 'Prescription Screening (Clinical)',
            test_data: testResult,
            score: 0,
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
          <Text style={styles.emoji}>🔬</Text>
          <Text style={styles.title}>Prescription Screening</Text>
          <Text style={styles.subtitle}>Pinhole Method with Dual Acuity</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Clinical Methodology</Text>
            <Text style={styles.infoText}>
              This test compares your vision without correction (uncorrected acuity) to your vision 
              through a simulated pinhole. Significant improvement with pinhole indicates refractive 
              error that could benefit from glasses or contact lenses.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ IMPORTANT LIMITATION:</Text>
            <Text style={styles.warningText}>
              • This test provides SCREENING indication only - NOT a prescription
            </Text>
            <Text style={styles.warningText}>
              • Cannot measure sphere, cylinder, axis, or add power
            </Text>
            <Text style={styles.warningText}>
              • Only indicates whether correction might help
            </Text>
            <Text style={styles.warningText}>
              • Accurate prescription requires professional refraction
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. You'll test each eye twice: uncorrected and with pinhole effect</Text>
            <Text style={styles.text}>2. Read 5 letters from a standard line</Text>
            <Text style={styles.text}>3. Test is quick - approximately 20 letters total</Text>
            <Text style={styles.text}>4. Remove glasses/contacts before starting</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('uncorrected')}>
            <Text style={styles.primaryButtonText}>Start Screening</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (step === 'result') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.resultEmoji}>✓</Text>
          <Text style={styles.resultTitle}>Screening Complete!</Text>
          <Text style={styles.resultSubtitle}>
            {saving ? 'Saving estimates...' : 'Estimates saved'}
          </Text>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>
              ⚠️ SCREENING ESTIMATE ONLY - NOT A PRESCRIPTION
            </Text>
            <Text style={styles.warningText}>{result.disclaimer}</Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Right Eye (OD)</Text>
              <Text style={styles.resultItemValue}>
                {result.rightEye.significantImprovement ? 'Correction May Help' : 'Minimal Improvement'}
              </Text>
              <Text style={styles.resultItemSubtext}>
                Improvement: {result.rightEye.improvement.toFixed(2)} logMAR
              </Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Left Eye (OS)</Text>
              <Text style={styles.resultItemValue}>
                {result.leftEye.significantImprovement ? 'Correction May Help' : 'Minimal Improvement'}
              </Text>
              <Text style={styles.resultItemSubtext}>
                Improvement: {result.leftEye.improvement.toFixed(2)} logMAR
              </Text>
            </View>
          </View>

          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationTitle}>Right Eye Interpretation</Text>
            <Text style={styles.interpretationText}>{result.rightInterpretation}</Text>
          </View>

          <View style={styles.interpretationBox}>
            <Text style={styles.interpretationTitle}>Left Eye Interpretation</Text>
            <Text style={styles.interpretationText}>{result.leftInterpretation}</Text>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Recommendation</Text>
            <Text style={styles.recommendationText}>{result.recommendation}</Text>
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

  const currentLetter = testLine.letters[currentLetterIndex]
  const letterSizePx = calibrator?.calculateETDRSLetterSize(testLine.logMAR) || 60
  const strokeWidthPx = Math.round(letterSizePx / 5)

  return (
    <View style={styles.container}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {currentEye === 'right' ? 'Right' : 'Left'} Eye - {step === 'uncorrected' ? 'Uncorrected' : 'Pinhole'}
            </Text>
          </View>
          <Text style={styles.instruction}>
            {step === 'uncorrected' ? 'Read without correction' : 'Simulated pinhole effect'}
          </Text>
          <Text style={styles.lineInfo}>
            Letter {currentLetterIndex + 1} / {testLine.letters.length}
          </Text>
        </View>

        <View style={styles.lettersContainer}>
          {currentLetter && (
            <SloanOptotype
              letter={currentLetter}
              strokeWidthPx={strokeWidthPx}
              color="#000000"
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
  warningBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 11,
    color: '#7F1D1D',
    marginBottom: 4,
    lineHeight: 16,
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
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  lineInfo: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  lettersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
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
    marginBottom: 24,
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
  },
  resultItemLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  resultItemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultItemSubtext: {
    fontSize: 11,
    color: '#6B7280',
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
  recommendationBox: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
})
