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
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user])

  const handleSubmit = () => {
    const correctLetters = snellenLines[currentLine]
    const userLetters = userInput.trim().toUpperCase().split(/\s+/)
    const isCorrect = userLetters.length === correctLetters.length && 
                      userLetters.every((letter, i) => letter === correctLetters[i])

    const newResponses = [...responses, {
      line: currentLine + 1,
      letters: correctLetters,
      userInput: userLetters,
      correct: isCorrect
    }]
    setResponses(newResponses)
    setUserInput('')

    if (isCorrect && currentLine < snellenLines.length - 1) {
      setCurrentLine(currentLine + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    const lastCorrect = finalResponses.filter(r => r.correct).length
    const snellenScore = snellenScores[Math.min(lastCorrect, snellenScores.length - 1)]
    
    const testResult = {
      snellen: snellenScore,
      decimal: parseFloat((20 / parseInt(snellenScore.split('/')[1])).toFixed(2)),
      logMAR: parseFloat((Math.log10(parseInt(snellenScore.split('/')[1]) / 20)).toFixed(2)),
      linesRead: lastCorrect,
      responses: finalResponses
    }

    setResult(testResult)
    setCompleted(true)

    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            user_email: user.email,
            test_type: 'Visual Acuity',
            test_name: 'Snellen Chart',
            test_data: testResult,
            score: lastCorrect,
            decimal_acuity: testResult.decimal,
            test_date: new Date().toISOString(),
            test_distance: 2.0,
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

  if (completed && result) {
    return (
      <View style={styles.container}>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>✓</Text>
          <Text style={styles.resultTitle}>Test Complete!</Text>
          <Text style={styles.resultSubtitle}>
            {saving ? 'Saving results...' : 'Results saved'}
          </Text>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Snellen Acuity</Text>
            <Text style={styles.resultScore}>{result.snellen}</Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Decimal</Text>
              <Text style={styles.resultItemValue}>{result.decimal}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>LogMAR</Text>
              <Text style={styles.resultItemValue}>{result.logMAR}</Text>
            </View>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Note:</Text> This is a screening result, not a medical diagnosis. 
              Please consult an eye care professional for a comprehensive eye examination.
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

  const fontSize = Math.max(24, 96 - (currentLine * 10))

  return (
    <View style={styles.container}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Line {currentLine + 1} of {snellenLines.length}
            </Text>
          </View>
          <Text style={styles.instruction}>Read the letters below</Text>
        </View>

        <View style={styles.lettersContainer}>
          <Text style={[styles.letters, { fontSize }]}>
            {snellenLines[currentLine].join(' ')}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type letters (space between)"
            autoCapitalize="characters"
            autoFocus
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Progress: {responses.length} / {snellenLines.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(responses.length / snellenLines.length) * 100}%` }
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
