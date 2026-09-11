/**
 * Clinical Color Vision Screening Test - Mobile
 * Pseudoisochromatic plates with confusion-line methodology
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { PseudoisochromaticPlate } from '../../components/stimuli/PseudoisochromaticPlate'
import { PSEUDOISOCHROMATIC_PLATES, type PlateConfig } from '@spect-it/cv'

export default function ColorVisionTestScreen() {
  const [currentPlateIndex, setCurrentPlateIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [completed, setCompleted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [instructions, setInstructions] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  const startTest = () => {
    setInstructions(false)
  }

  const handleSubmit = () => {
    if (!userInput.trim()) return

    const plate = PSEUDOISOCHROMATIC_PLATES[currentPlateIndex]
    const isCorrect = userInput.trim() === plate.digit
    
    const newResponses = [...responses, {
      plateId: plate.id,
      correctAnswer: plate.digit,
      userAnswer: userInput.trim(),
      correct: isCorrect,
      type: plate.type,
      description: plate.description
    }]
    setResponses(newResponses)
    setUserInput('')

    if (currentPlateIndex < PSEUDOISOCHROMATIC_PLATES.length - 1) {
      setCurrentPlateIndex(currentPlateIndex + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const handleCannotSee = () => {
    const plate = PSEUDOISOCHROMATIC_PLATES[currentPlateIndex]
    
    const newResponses = [...responses, {
      plateId: plate.id,
      correctAnswer: plate.digit,
      userAnswer: 'CANNOT_SEE',
      correct: false,
      type: plate.type,
      description: plate.description
    }]
    setResponses(newResponses)
    setUserInput('')

    if (currentPlateIndex < PSEUDOISOCHROMATIC_PLATES.length - 1) {
      setCurrentPlateIndex(currentPlateIndex + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    const controlResponses = finalResponses.filter(r => r.type === 'control')
    const protanResponses = finalResponses.filter(r => r.type === 'protan')
    const deutanResponses = finalResponses.filter(r => r.type === 'deutan')
    
    const controlCorrect = controlResponses.filter(r => r.correct).length
    const protanCorrect = protanResponses.filter(r => r.correct).length
    const deutanCorrect = deutanResponses.filter(r => r.correct).length
    
    const totalCorrect = finalResponses.filter(r => r.correct).length
    
    let screeningResult = 'Normal color vision'
    let recommendations = 'Your color vision appears normal based on this screening.'
    let category: 'PASS' | 'BORDERLINE' | 'REFER' = 'PASS'
    
    if (controlCorrect < controlResponses.length) {
      screeningResult = 'Test inconclusive'
      recommendations = 'Control plates were not read correctly. This may indicate difficulty with the test format rather than color vision deficiency. Please consult an eye care professional.'
      category = 'REFER'
    } else if (protanCorrect === 0) {
      screeningResult = 'Possible protan-type color vision deficiency detected'
      recommendations = 'This screening suggests you may have protanopia or protanomaly (red deficiency). Please consult an eye care professional for comprehensive testing with standardized clinical tests.'
      category = 'REFER'
    } else if (deutanCorrect === 0) {
      screeningResult = 'Possible deutan-type color vision deficiency detected'
      recommendations = 'This screening suggests you may have deuteranopia or deuteranomaly (green deficiency). Please consult an eye care professional for comprehensive testing with standardized clinical tests.'
      category = 'REFER'
    } else if (totalCorrect < finalResponses.length * 0.7) {
      screeningResult = 'Possible color vision deficiency detected'
      recommendations = 'This screening suggests you may have some difficulty with color discrimination. Please consult an eye care professional for comprehensive testing.'
      category = 'BORDERLINE'
    }

    const testResult = {
      screeningResult,
      recommendations,
      category,
      platesCorrect: totalCorrect,
      platesTotal: finalResponses.length,
      controlPlatesCorrect: controlCorrect,
      protanPlatesCorrect: protanCorrect,
      deutanPlatesCorrect: deutanCorrect,
      responses: finalResponses,
      methodology: 'Confusion-line pseudoisochromatic plates with protan/deutan specificity'
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
            test_type: 'Color Vision (Clinical)',
            test_name: 'Pseudoisochromatic Plate Test',
            test_data: testResult,
            score: totalCorrect,
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

  if (instructions) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.instructionsCard}>
          <Text style={styles.emoji}>🎨</Text>
          <Text style={styles.title}>Color Vision Screening</Text>
          <Text style={styles.subtitle}>Pseudoisochromatic Plate Test</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Clinical Methodology</Text>
            <Text style={styles.infoText}>
              This test uses confusion-line pseudoisochromatic plates to screen for 
              red-green color vision deficiencies. Plates are designed with specific hues 
              that appear different to normal trichromats but similar to color-deficient viewers.
            </Text>
          </View>

          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionItem}>1. Ensure you're in good, even lighting conditions</Text>
            <Text style={styles.instructionItem}>2. Remove any tinted glasses (clear glasses are fine)</Text>
            <Text style={styles.instructionItem}>3. Look at each plate and identify the number you see</Text>
            <Text style={styles.instructionItem}>4. Type the number(s) you see, or tap "Cannot See" if no number is visible</Text>
            <Text style={styles.instructionItem}>5. You'll see {PSEUDOISOCHROMATIC_PLATES.length} plates total</Text>
            <Text style={styles.instructionItem}>6. Take 3-5 seconds per plate - don't strain</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Important Note</Text>
            <Text style={styles.warningText}>
              This is a screening tool, not a diagnostic test. Results should be confirmed 
              by an eye care professional using standardized clinical tests like the Ishihara 
              or Farnsworth D-15.
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startTest}>
            <Text style={styles.startButtonText}>Begin Test</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (completed && result) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>✓</Text>
          <Text style={styles.resultTitle}>Screening Complete!</Text>
          <Text style={styles.resultSubtitle}>
            {saving ? 'Saving results...' : 'Results saved'}
          </Text>

          <View style={styles.resultMain}>
            <Text style={styles.resultLabel}>Screening Result</Text>
            <Text style={styles.resultScore}>{result.screeningResult}</Text>
            <Text style={[styles.categoryBadge, styles[`badge${result.category}`]]}>
              {result.category}
            </Text>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Total Correct</Text>
              <Text style={styles.resultItemValue}>{result.platesCorrect}/{result.platesTotal}</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Control Plates</Text>
              <Text style={styles.resultItemValue}>{result.controlPlatesCorrect}/2</Text>
            </View>
          </View>

          <View style={styles.recommendationBox}>
            <Text style={styles.recommendationTitle}>Recommendations</Text>
            <Text style={styles.recommendationText}>{result.recommendations}</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Screening Notice:</Text> This is a screening result, not a medical diagnosis. 
              Color vision deficiency can only be definitively diagnosed by a qualified eye care 
              professional using standardized clinical tests. If concerns are detected, please consult 
              an optometrist or ophthalmologist.
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

  const plate = PSEUDOISOCHROMATIC_PLATES[currentPlateIndex]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Plate {currentPlateIndex + 1} of {PSEUDOISOCHROMATIC_PLATES.length}
            </Text>
          </View>
          <Text style={styles.instruction}>What number do you see?</Text>
        </View>

        <View style={styles.plateContainer}>
          <PseudoisochromaticPlate 
            config={plate}
            diameter={280}
            dotsCount={2000}
          />
          <Text style={styles.plateNote}>{plate.type} plate</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Enter the number you see"
            keyboardType="number-pad"
            autoFocus
            onSubmitEditing={handleSubmit}
          />

          <TouchableOpacity
            style={[styles.submitButton, !userInput && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!userInput}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cannotSeeButton}
            onPress={handleCannotSee}
          >
            <Text style={styles.cannotSeeButtonText}>Cannot See</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Progress: {responses.length} / {PSEUDOISOCHROMATIC_PLATES.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(responses.length / PSEUDOISOCHROMATIC_PLATES.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E8FF',
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
    backgroundColor: '#9333EA',
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
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    color: '#9333EA',
    fontWeight: '600',
  },
  instruction: {
    fontSize: 18,
    color: '#6B7280',
  },
  plateContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  plateNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
    textTransform: 'capitalize',
  },
  inputContainer: {
    gap: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    fontSize: 20,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  submitButton: {
    backgroundColor: '#9333EA',
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
  cannotSeeButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cannotSeeButtonText: {
    color: '#374151',
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
    backgroundColor: '#9333EA',
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
    backgroundColor: '#F3E8FF',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9333EA',
    textAlign: 'center',
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
  recommendationBox: {
    backgroundColor: '#F3E8FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 13,
    color: '#6B21A8',
    lineHeight: 20,
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
    backgroundColor: '#9333EA',
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
