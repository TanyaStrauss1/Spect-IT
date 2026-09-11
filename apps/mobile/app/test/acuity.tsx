/**
 * Clinical Visual Acuity Test - Mobile
 * 
 * ETDRS/LogMAR standard with Sloan letters, per-eye testing, calibration-based angular sizing
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import {
  createVisualAcuityTest,
  createCalibrator,
  type VisualAcuityTest,
  type ScreenCalibrator,
  type ETDRSLine,
  type LetterResponse,
  type LineResponse,
  type EyeResult,
} from '@spect-it/cv'

type Eye = 'right' | 'left'

export default function AcuityTestScreen() {
  const { user, loading: authLoading } = useAuth()
  const [test] = useState(() => createVisualAcuityTest({ startLogMAR: 0.5 }))
  const [calibrator] = useState(() => createCalibrator())
  
  const [showInstructions, setShowInstructions] = useState(true)
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [lineResponses, setLineResponses] = useState<LineResponse[]>([])
  const [rightEyeResult, setRightEyeResult] = useState<EyeResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeResult | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [saving, setSaving] = useState(false)

  const chartLines = test.getChartLines()
  const calibration = calibrator.getCalibration() || calibrator.getDefaultCalibration()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  const startTest = () => {
    setShowInstructions(false)
  }

  const currentLine = chartLines[currentLineIndex]
  
  // Calculate letter size based on calibration
  const letterSizePx = currentLine 
    ? calibrator.calculateETDRSLetterSize(currentLine.logMAR) || 60
    : 60

  const handleLetterSubmit = () => {
    if (!currentLine) return

    const letter = currentLine.letters[currentLetterIndex]
    const correct = test.checkResponse(letter, userInput)
    
    const response: LetterResponse = {
      letter,
      userResponse: userInput.trim().toUpperCase(),
      correct,
    }

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
    const result = test.createResult(calibration, rightEye, leftEye)
    setIsComplete(true)

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
              rightEye: {
                snellen: rightEye.finalSnellen,
                logMAR: rightEye.finalLogMAR,
                category: rightEye.category,
              },
              leftEye: {
                snellen: leftEye.finalSnellen,
                logMAR: leftEye.finalLogMAR,
                category: leftEye.category,
              },
              methodology: result.methodology,
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

  if (showInstructions) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsCard}>
          <Text style={styles.emoji}>👁️</Text>
          <Text style={styles.title}>Visual Acuity Test</Text>
          <Text style={styles.subtitle}>ETDRS/LogMAR Clinical Standard</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>About This Test</Text>
            <Text style={styles.infoText}>
              This test uses the ETDRS (Early Treatment Diabetic Retinopathy Study) chart with Sloan letters - 
              the gold standard for clinical visual acuity assessment.
            </Text>
          </View>

          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionItem}>1. Test each eye separately (you'll be prompted)</Text>
            <Text style={styles.instructionItem}>2. Cover the opposite eye completely</Text>
            <Text style={styles.instructionItem}>3. Read each letter as it appears</Text>
            <Text style={styles.instructionItem}>4. Letters get smaller as you progress</Text>
            <Text style={styles.instructionItem}>5. Sloan letters used: C D H K N O R S V Z</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ Important</Text>
            <Text style={styles.warningText}>
              • Hold device at comfortable reading distance{'\n'}
              • Ensure good lighting{'\n'}
              • This is a screening, not a diagnosis{'\n'}
              • Consult an eye care professional for comprehensive testing
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startTest}>
            <Text style={styles.startButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (isComplete && rightEyeResult && leftEyeResult) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
            <Text style={[
              styles.resultCategory,
              rightEyeResult.category === 'PASS' ? styles.categoryPass :
              rightEyeResult.category === 'BORDERLINE' ? styles.categoryBorderline :
              styles.categoryRefer
            ]}>
              {rightEyeResult.category}
            </Text>
          </View>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Left Eye (OS)</Text>
            <Text style={styles.resultScore}>{leftEyeResult.finalSnellen}</Text>
            <Text style={styles.resultSmall}>logMAR: {leftEyeResult.finalLogMAR.toFixed(2)}</Text>
            <Text style={[
              styles.resultCategory,
              leftEyeResult.category === 'PASS' ? styles.categoryPass :
              leftEyeResult.category === 'BORDERLINE' ? styles.categoryBorderline :
              styles.categoryRefer
            ]}>
              {leftEyeResult.category}
            </Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Screening Result:</Text> This is a screening test using 
              ETDRS methodology with letter-by-letter scoring, not a medical diagnosis. Please consult an 
              eye care professional for comprehensive examination and prescription.
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
        </View>

        <View style={styles.lettersContainer}>
          <Text style={[styles.letters, { fontSize: Math.min(letterSizePx, 120) }]}>
            {currentLine?.letters[currentLetterIndex] || ''}
          </Text>
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
            onSubmitEditing={handleLetterSubmit}
          />

          <TouchableOpacity
            style={[styles.submitButton, !userInput && styles.submitButtonDisabled]}
            onPress={handleLetterSubmit}
            disabled={!userInput}
          >
            <Text style={styles.submitButtonText}>Submit ({currentLetterIndex + 1}/{currentLine?.letters.length})</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Progress: Line {currentLineIndex + 1} / {chartLines.length}
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
  instructionsCard: {
    backgroundColor: 'white',
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
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  instructionItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 4,
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
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
  },
  lettersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
    minHeight: 150,
  },
  letters: {
    fontWeight: 'bold',
    letterSpacing: 4,
    color: '#1F2937',
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
  },
  resultSmall: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  resultCategory: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  categoryPass: {
    color: '#059669',
  },
  categoryBorderline: {
    color: '#D97706',
  },
  categoryRefer: {
    color: '#DC2626',
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
