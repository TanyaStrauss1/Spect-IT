import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

const snellenLines = [
  ['E'],                    // Line 1: 20/200
  ['F', 'P'],              // Line 2: 20/100
  ['T', 'O', 'Z'],         // Line 3: 20/70
  ['L', 'P', 'E', 'D'],    // Line 4: 20/50
  ['P', 'E', 'C', 'F', 'D'], // Line 5: 20/40
  ['E', 'D', 'F', 'C', 'Z', 'P'], // Line 6: 20/30
  ['F', 'E', 'L', 'O', 'P', 'Z', 'D'], // Line 7: 20/25
  ['D', 'E', 'F', 'P', 'O', 'T', 'E', 'C'], // Line 8: 20/20
]

const snellenScores = ['20/200', '20/100', '20/70', '20/50', '20/40', '20/30', '20/25', '20/20']

export default function AcuityTestScreen() {
  const [currentLine, setCurrentLine] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  const handleSubmit = () => {
    if (!currentLine) return

    const letter = currentLine.letters[currentLetterIndex]
    const correct = test.checkResponse(letter, userInput)
    const response: LetterResponse = { letter, userResponse: userInput.trim().toUpperCase(), correct }

    const currentLineLetters = lineResponses[currentLineIndex]?.letters || []
    const updatedLineLetters = [...currentLineLetters, response]

    if (updatedLineLetters.length === currentLine.letters.length) {
      const lineResponse = test.scoreLine(currentLine, updatedLineLetters)
      const updatedLineResponses = [...lineResponses]
      updatedLineResponses[currentLineIndex] = lineResponse
      setLineResponses(updatedLineResponses)

      if (test.shouldStop(lineResponse) || currentLineIndex >= chartLines.length - 1) {
        finishEye(updatedLineResponses)
      } else {
        setCurrentLineIndex(currentLineIndex + 1)
        setCurrentLetterIndex(0)
      }
    } else {
      setCurrentLetterIndex(currentLetterIndex + 1)
    }

    setUserInput('')
  }

  const finishEye = (responses: LineResponse[]) => {
    const eyeResult = test.processEyeResult(currentEye, responses)

    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      setCurrentEye('left')
      setCurrentLineIndex(0)
      setCurrentLetterIndex(0)
      setLineResponses([])
    } else {
      setLeftEyeResult(eyeResult)
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (rightEye: EyeResult, leftEye: EyeResult) => {
    const result = test.createResult(calibration, rightEye, leftEye)
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
            results: { rightEye, leftEye, methodology: result.methodology },
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

  if (completed && rightEyeResult && leftEyeResult) {
    return (
      <View style={styles.container}>
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
          </View>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Left Eye (OS)</Text>
            <Text style={styles.resultScore}>{leftEyeResult.finalSnellen}</Text>
            <Text style={styles.resultSmall}>logMAR: {leftEyeResult.finalLogMAR.toFixed(2)}</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Screening Result:</Text> ETDRS/LogMAR methodology with per-eye testing. 
              This is a screening, not a medical diagnosis. Consult an eye care professional.
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
      </View>
    )
  }

  const letterSizePx = currentLine ? calibrator.calculateETDRSLetterSize(currentLine.logMAR) || 60 : 60

  return (
    <View style={styles.container}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {currentEye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)'} - Letter {currentLetterIndex + 1}/{currentLine?.letters.length || 5}
            </Text>
          </View>
          <Text style={styles.instruction}>
            {currentEye === 'right' ? 'Cover LEFT eye' : 'Cover RIGHT eye'}
          </Text>
        </View>

        <View style={styles.lettersContainer}>
          <Text style={[styles.letters, { fontSize: letterSizePx }]}>
            {currentLine?.letters[currentLetterIndex] || ''}
          </Text>
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
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={!userInput}
          >
            <Text style={styles.submitButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Line: {currentLineIndex + 1} / {chartLines.length}
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
    padding: 20,
  },
  testCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
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
  },
  instruction: {
    fontSize: 18,
    color: '#6B7280',
  },
  lettersContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  letters: {
    fontWeight: 'bold',
    letterSpacing: 4,
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
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
  resultGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
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
  },
  resultItemValue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
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
