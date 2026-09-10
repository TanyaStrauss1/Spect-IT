import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

const contrastLevels = [
  { level: 1, contrast: 1.0, name: '100%' },
  { level: 2, contrast: 0.75, name: '75%' },
  { level: 3, contrast: 0.50, name: '50%' },
  { level: 4, contrast: 0.35, name: '35%' },
  { level: 5, contrast: 0.25, name: '25%' },
  { level: 6, contrast: 0.15, name: '15%' },
  { level: 7, contrast: 0.10, name: '10%' },
  { level: 8, contrast: 0.05, name: '5%' },
]

const letters = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z']

export default function ContrastTestScreen() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentLevel, setCurrentLevel] = useState(0)
  const [targetLetter, setTargetLetter] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  useEffect(() => {
    if (step === 'test') {
      generateNewLetter()
    }
  }, [step, currentLevel])

  const generateNewLetter = () => {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)]
    setTargetLetter(randomLetter)
  }

  const handleLetterSelect = (selectedLetter: string) => {
    const isCorrect = selectedLetter === targetLetter
    const newResponse = {
      level: currentLevel + 1,
      contrast: contrastLevels[currentLevel].contrast,
      targetLetter,
      selectedLetter,
      correct: isCorrect
    }

    const newResponses = [...responses, newResponse]
    setResponses(newResponses)

    if (!isCorrect || currentLevel >= contrastLevels.length - 1) {
      finishTest(newResponses)
    } else {
      setCurrentLevel(currentLevel + 1)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    const correctResponses = finalResponses.filter(r => r.correct)
    const lowestContrastLevel = correctResponses.length > 0 
      ? Math.max(...correctResponses.map(r => r.level))
      : 0

    const lowestContrast = correctResponses.length > 0
      ? Math.min(...correctResponses.map(r => r.contrast))
      : 1.0

    let assessment = ''
    if (lowestContrastLevel >= 7) {
      assessment = 'Excellent contrast sensitivity'
    } else if (lowestContrastLevel >= 5) {
      assessment = 'Good contrast sensitivity'
    } else if (lowestContrastLevel >= 3) {
      assessment = 'Fair contrast sensitivity'
    } else {
      assessment = 'Reduced contrast sensitivity - consult an eye care professional'
    }

    const testResult = {
      lowestContrastLevel,
      lowestContrast,
      assessment,
      correctCount: correctResponses.length,
      totalCount: finalResponses.length,
      responses: finalResponses
    }

    setResult(testResult)
    setStep('result')

    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            user_email: user.email,
            test_type: 'Contrast Sensitivity',
            test_name: 'Graded Contrast Letters',
            test_data: testResult,
            score: lowestContrastLevel,
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

  const getLetterColor = (contrast: number) => {
    const grayValue = Math.round(255 * (1 - contrast))
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`
  }

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🌓</Text>
          <Text style={styles.title}>Contrast Sensitivity Test</Text>
          <Text style={styles.subtitle}>Graded Contrast Letter Recognition</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is this test?</Text>
            <Text style={styles.text}>
              This test measures your ability to distinguish letters with decreasing contrast 
              against the background. Good contrast sensitivity is important for activities 
              like driving at night or in fog.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. A letter will appear in the center of the screen</Text>
            <Text style={styles.text}>2. The contrast will decrease progressively with each level</Text>
            <Text style={styles.text}>3. Identify the letter by tapping on the correct option below</Text>
            <Text style={styles.text}>4. The test ends when you make an incorrect identification</Text>
            <Text style={styles.text}>5. Try to read as many levels as possible</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Important:</Text> Take the test in good, even lighting. 
              Adjust your screen brightness to a comfortable level before starting. 
              Sit about 2 feet from your screen.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              <Text style={styles.disclaimerBold}>Screening Notice:</Text> This is a screening tool, not a diagnostic test. 
              Results do not constitute a medical diagnosis. Please consult an eye care professional for a comprehensive eye examination.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('test')}>
            <Text style={styles.primaryButtonText}>Start Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (step === 'test') {
    const currentContrast = contrastLevels[currentLevel]
    const letterColor = getLetterColor(currentContrast.contrast)

    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Level {currentLevel + 1} of {contrastLevels.length} - Contrast: {currentContrast.name}
            </Text>
          </View>

          <Text style={styles.testTitle}>Identify the letter</Text>
          <Text style={styles.testSubtitle}>Tap on the letter you see</Text>

          <View style={styles.letterDisplay}>
            <Text style={[styles.targetLetter, { color: letterColor }]}>
              {targetLetter}
            </Text>
          </View>

          <View style={styles.letterGrid}>
            {letters.map((letter) => (
              <TouchableOpacity
                key={letter}
                style={styles.letterButton}
                onPress={() => handleLetterSelect(letter)}
              >
                <Text style={styles.letterButtonText}>{letter}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.progress}>
            <Text style={styles.progressText}>
              Progress: {responses.length} correct
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${((currentLevel + 1) / contrastLevels.length) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.resultEmoji}>✓</Text>
        <Text style={styles.resultTitle}>Test Complete!</Text>
        <Text style={styles.resultSubtitle}>
          {saving ? 'Saving results...' : 'Results saved'}
        </Text>

        <View style={styles.resultMain}>
          <Text style={styles.resultLabel}>Assessment</Text>
          <Text style={styles.resultScore}>{result.assessment}</Text>
        </View>

        <View style={styles.resultGrid}>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Lowest Contrast Level</Text>
            <Text style={styles.resultItemValue}>{result.lowestContrastLevel}</Text>
            <Text style={styles.resultItemSubtext}>
              {Math.round(result.lowestContrast * 100)}% contrast
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Correct Identifications</Text>
            <Text style={styles.resultItemValue}>
              {result.correctCount}/{result.totalCount}
            </Text>
            <Text style={styles.resultItemSubtext}>
              {Math.round((result.correctCount / result.totalCount) * 100)}% accuracy
            </Text>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Note:</Text> This is a screening result, not a medical diagnosis. 
            Contrast sensitivity can be affected by various factors including lighting, screen quality, and eye conditions. 
            Please consult an eye care professional for a comprehensive evaluation.
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
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
  badge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  badgeText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 12,
  },
  testTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  testSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  letterDisplay: {
    height: 200,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  targetLetter: {
    fontSize: 100,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  letterButton: {
    width: 60,
    height: 60,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  letterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
    textAlign: 'center',
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
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultItemSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
})
