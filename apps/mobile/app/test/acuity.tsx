/**
 * Clinical Visual Acuity Test - Mobile
 * ETDRS/LogMAR methodology with Sloan optotypes
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { SloanOptotype } from '../../components/stimuli/SloanOptotype'
import { CalibrationScreen } from '../../components/calibration/CalibrationScreen'
import { 
  createVisualAcuityTest, 
  type ETDRSLine, 
  type LineResponse, 
  type EyeResult,
  type Eye,
  type CalibrationData,
  ScreenCalibrator 
} from '@spect-it/cv'

export default function AcuityTestScreen() {
  const { user, loading: authLoading } = useAuth()
  const [needsCalibration, setNeedsCalibration] = useState(true)
  const [calibration, setCalibration] = useState<CalibrationData | null>(null)
  const [calibrator, setCalibrator] = useState<ScreenCalibrator | null>(null)
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [lineResponses, setLineResponses] = useState<LineResponse[]>([])
  const [rightEyeResult, setRightEyeResult] = useState<EyeResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeResult | null>(null)
  const [completed, setCompleted] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [saving, setSaving] = useState(false)
  
  const test = createVisualAcuityTest({ startLogMAR: 0.5, stopOnMissedLine: false })
  const chartLines = test.getChartLines()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
      return
    }
    
    // Check for existing calibration
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

    const currentLine = chartLines[currentLineIndex]
    const letter = currentLine.letters[currentLetterIndex]
    const correct = test.checkResponse(letter, userInput)
    const response = { letter, userResponse: userInput.trim().toUpperCase(), correct }

    // Add to current line's responses
    const currentLineLetters = lineResponses[currentLineIndex]?.letters || []
    const updatedLineLetters = [...currentLineLetters, response]

    // Check if line is complete
    if (updatedLineLetters.length === currentLine.letters.length) {
      const lineResponse = test.scoreLine(currentLine, updatedLineLetters)
      const updatedLineResponses = [...lineResponses]
      updatedLineResponses[currentLineIndex] = lineResponse
      setLineResponses(updatedLineResponses)

      // Check if we should stop or continue
      if (test.shouldStop(lineResponse) || currentLineIndex >= chartLines.length - 1) {
        // Finish current eye
        finishEye(updatedLineResponses)
      } else {
        // Move to next line
        setCurrentLineIndex(currentLineIndex + 1)
        setCurrentLetterIndex(0)
      }
    } else {
      // Move to next letter in current line
      const updatedResponses = [...lineResponses]
      if (!updatedResponses[currentLineIndex]) {
        updatedResponses[currentLineIndex] = {
          line: currentLine,
          letters: updatedLineLetters,
          correctCount: updatedLineLetters.filter(r => r.correct).length,
          score: updatedLineLetters.filter(r => r.correct).length,
        }
      } else {
        updatedResponses[currentLineIndex].letters = updatedLineLetters
        updatedResponses[currentLineIndex].correctCount = updatedLineLetters.filter(r => r.correct).length
      }
      setLineResponses(updatedResponses)
      setCurrentLetterIndex(currentLetterIndex + 1)
    }

    setUserInput('')
  }

  const finishEye = (responses: LineResponse[]) => {
    const eyeResult = test.processEyeResult(currentEye, responses)

    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      // Start left eye
      setCurrentEye('left')
      setCurrentLineIndex(0)
      setCurrentLetterIndex(0)
      setLineResponses([])
    } else {
      setLeftEyeResult(eyeResult)
      // Test complete
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (rightEye: EyeResult, leftEye: EyeResult) => {
    const result = test.createResult(calibration!, rightEye, leftEye)
    setCompleted(true)

    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: 'Visual Acuity (Clinical)',
            test_data: result,
            results: { 
              rightEye, 
              leftEye, 
              methodology: result.methodology,
              calibration: calibration
            },
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

  if (completed && rightEyeResult && leftEyeResult) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>✓</Text>
          <Text style={styles.resultTitle}>Test Complete!</Text>
          <Text style={styles.resultSubtitle}>
            {saving ? 'Saving results...' : 'Results saved'}
          </Text>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Right Eye (OD)</Text>
            <Text style={styles.resultScore}>{rightEyeResult.finalSnellen}</Text>
            <Text style={styles.resultSmall}>logMAR: {rightEyeResult.finalLogMAR.toFixed(2)}</Text>
            <Text style={[styles.categoryBadge, styles[`badge${rightEyeResult.category}`]]}>
              {rightEyeResult.category}
            </Text>
          </View>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Left Eye (OS)</Text>
            <Text style={styles.resultScore}>{leftEyeResult.finalSnellen}</Text>
            <Text style={styles.resultSmall}>logMAR: {leftEyeResult.finalLogMAR.toFixed(2)}</Text>
            <Text style={[styles.categoryBadge, styles[`badge${leftEyeResult.category}`]]}>
              {leftEyeResult.category}
            </Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Screening Result:</Text> ETDRS/LogMAR methodology with 
              Sloan optotypes and per-eye testing. This is a screening, not a medical diagnosis. 
              Consult an eye care professional for comprehensive evaluation.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.primaryButtonText}>View Dashboard</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  const currentLine = chartLines[currentLineIndex]
  const currentLetter = currentLine?.letters[currentLetterIndex]
  const letterSizePx = calibrator?.calculateETDRSLetterSize(currentLine?.logMAR || 0.5) || 60
  const strokeWidthPx = Math.round(letterSizePx / 5)

  return (
    <View style={styles.container}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'} - Line {currentLineIndex + 1}/{chartLines.length}
            </Text>
          </View>
          <Text style={styles.instruction}>
            {currentEye === 'right' ? '🙋 Cover or close your LEFT eye' : '🙋 Cover or close your RIGHT eye'}
          </Text>
          <Text style={styles.instructionSmall}>
            Letter {currentLetterIndex + 1} of {currentLine?.letters.length || 5}
          </Text>
          <Text style={styles.lineInfo}>
            Line {currentLineIndex + 1} / {chartLines.length} - {currentLine?.snellen}
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
            onChangeText={(text) => setUserInput(text.toUpperCase())}
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
            <Text style={styles.submitButtonText}>Submit ({currentLetterIndex + 1}/{currentLine?.letters.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Line Progress: {currentLineIndex + 1} / {chartLines.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${((currentLineIndex + 1) / chartLines.length) * 100}%` }
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  testCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
    color: '#374151',
    fontWeight: '600',
    marginBottom: 4,
  },
  instructionSmall: {
    fontSize: 14,
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
    minHeight: 150,
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontWeight: '600',
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
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  resultEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  resultMain: {
    backgroundColor: '#EEF2FF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
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
  badgePASS: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  badgeBORDERLINE: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  badgeREFER: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  disclaimer: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    width: '100%',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1E40AF',
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
    width: '100%',
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
    width: '100%',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
  },
})
