/**
 * Color Vision Screening Test - Mobile
 * 
 * Uses generated pseudoisochromatic plates (Ishihara-style)
 * NOT using copyrighted Ishihara plates - these are original generated plates
 */

import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { router } from 'expo-router'
import Svg, { Circle } from 'react-native-svg'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

interface ColorPlate {
  id: number
  correctAnswer: string
  type: 'normal' | 'protanopia' | 'deuteranopia' | 'control'
  description: string
}

const testPlates: ColorPlate[] = [
  { id: 1, correctAnswer: '12', type: 'control', description: 'Control plate - visible to all' },
  { id: 2, correctAnswer: '8', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 3, correctAnswer: '6', type: 'protanopia', description: 'Protan deficiency screening' },
  { id: 4, correctAnswer: '45', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 5, correctAnswer: '5', type: 'deuteranopia', description: 'Deutan deficiency screening' },
  { id: 6, correctAnswer: '73', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 7, correctAnswer: '2', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 8, correctAnswer: '16', type: 'control', description: 'Control plate - visible to all' },
]

export default function ColorVisionTestScreen() {
  const [currentPlate, setCurrentPlate] = useState(0)
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

    const plate = testPlates[currentPlate]
    const isCorrect = userInput.trim() === plate.correctAnswer
    
    const newResponses = [...responses, {
      plateId: plate.id,
      correctAnswer: plate.correctAnswer,
      userAnswer: userInput.trim(),
      correct: isCorrect,
      type: plate.type
    }]
    setResponses(newResponses)
    setUserInput('')

    if (currentPlate < testPlates.length - 1) {
      setCurrentPlate(currentPlate + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const handleCannotSee = () => {
    const plate = testPlates[currentPlate]
    
    const newResponses = [...responses, {
      plateId: plate.id,
      correctAnswer: plate.correctAnswer,
      userAnswer: 'CANNOT_SEE',
      correct: false,
      type: plate.type
    }]
    setResponses(newResponses)
    setUserInput('')

    if (currentPlate < testPlates.length - 1) {
      setCurrentPlate(currentPlate + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    const controlCorrect = finalResponses.filter(r => r.type === 'control' && r.correct).length
    const controlTotal = finalResponses.filter(r => r.type === 'control').length
    const normalCorrect = finalResponses.filter(r => r.type === 'normal' && r.correct).length
    const normalTotal = finalResponses.filter(r => r.type === 'normal').length
    const totalCorrect = finalResponses.filter(r => r.correct).length
    
    let screeningResult = 'Normal color vision'
    let recommendations = 'Your color vision appears normal based on this screening.'
    
    if (controlCorrect < controlTotal) {
      screeningResult = 'Test inconclusive'
      recommendations = 'Control plates were not read correctly. This may indicate difficulty with the test format rather than color vision deficiency. Please consult an eye care professional.'
    } else if (normalCorrect === 0) {
      screeningResult = 'Possible red-green color vision deficiency detected'
      recommendations = 'This screening suggests you may have difficulty distinguishing red and green colors. Please consult an eye care professional for comprehensive testing.'
    } else if (normalCorrect < normalTotal / 2) {
      screeningResult = 'Possible color vision deficiency detected'
      recommendations = 'This screening suggests you may have some difficulty with color discrimination. Please consult an eye care professional for comprehensive testing.'
    }

    const testResult = {
      screeningResult,
      recommendations,
      platesCorrect: totalCorrect,
      platesTotal: finalResponses.length,
      controlPlatesCorrect: controlCorrect,
      normalPlatesCorrect: normalCorrect,
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
            test_type: 'Color Vision',
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
          <Text style={styles.subtitle}>Test your ability to distinguish colors</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              This is a <Text style={styles.bold}>screening test</Text>, not a diagnostic tool. 
              It uses generated pseudoisochromatic plates similar to Ishihara plates.
            </Text>
            <Text style={styles.infoText}>
              Results should be confirmed by an eye care professional using standardized clinical tests.
            </Text>
          </View>

          <View style={styles.instructionsSection}>
            <Text style={styles.instructionsTitle}>Instructions:</Text>
            <Text style={styles.instructionItem}>1. Ensure you're in good lighting conditions</Text>
            <Text style={styles.instructionItem}>2. Remove any tinted glasses (clear glasses are fine)</Text>
            <Text style={styles.instructionItem}>3. Look at each plate and identify the number you see</Text>
            <Text style={styles.instructionItem}>4. Type the number(s) you see, or tap "Cannot See" if you cannot identify a number</Text>
            <Text style={styles.instructionItem}>5. You'll see 8 plates in total</Text>
            <Text style={styles.instructionItem}>6. Take your time with each plate</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Test Environment</Text>
            <Text style={styles.warningText}>
              For best results, take this test on a device with good color accuracy. 
              Results may vary on different screens or in poor lighting.
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
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultItem}>
              <Text style={styles.resultItemLabel}>Plates Correct</Text>
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
              <Text style={styles.disclaimerBold}>Important:</Text> This is a screening result, not a medical diagnosis. 
              Color vision deficiency can only be definitively diagnosed by a qualified eye care 
              professional using standardized clinical tests. If you have concerns, please consult 
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

  const plate = testPlates[currentPlate]

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.testCard}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Plate {currentPlate + 1} of {testPlates.length}
            </Text>
          </View>
          <Text style={styles.instruction}>What number do you see?</Text>
        </View>

        <View style={styles.plateContainer}>
          <ColorPlateVisualization 
            plateId={plate.id}
            number={plate.correctAnswer}
            type={plate.type}
          />
          <Text style={styles.plateNote}>Generated pseudoisochromatic plate</Text>
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
            Progress: {responses.length} / {testPlates.length}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(responses.length / testPlates.length) * 100}%` }
              ]}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

/**
 * ColorPlateVisualization Component
 * Generates pseudoisochromatic plates using SVG
 * These are NOT copyrighted Ishihara plates - they are original generated plates
 */
interface ColorPlateVisualizationProps {
  plateId: number
  number: string
  type: 'normal' | 'protanopia' | 'deuteranopia' | 'control'
}

function ColorPlateVisualization({ plateId, number, type }: ColorPlateVisualizationProps) {
  const size = 300
  const circleRadius = 6
  const seed = plateId * 1000

  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000
    return x - Math.floor(x)
  }

  const getColorPalette = () => {
    switch (type) {
      case 'control':
        return {
          numberColors: ['#FF0000', '#D40000', '#FF2020'],
          backgroundColors: ['#00AA00', '#00CC00', '#00DD00', '#009900']
        }
      case 'protanopia':
        return {
          numberColors: ['#CC6600', '#DD7700', '#EE8800'],
          backgroundColors: ['#88AA00', '#99BB00', '#77AA22', '#668811']
        }
      case 'deuteranopia':
        return {
          numberColors: ['#DD6644', '#CC5533', '#EE7755'],
          backgroundColors: ['#88AA66', '#99BB77', '#77AA55', '#6699AA']
        }
      case 'normal':
      default:
        return {
          numberColors: ['#DD5500', '#CC4400', '#EE6600'],
          backgroundColors: ['#88BB44', '#99CC55', '#77AA33', '#669922']
        }
    }
  }

  const palette = getColorPalette()

  const isPartOfNumber = (x: number, y: number) => {
    const centerX = size / 2
    const centerY = size / 2
    const relX = (x - centerX) / 22
    const relY = (y - centerY) / 22

    if (number === '12') {
      if (relX >= -3 && relX <= -1 && relY >= -2.5 && relY <= 2.5) return true
      if (relX >= 0.5 && relX <= 3 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
    } else if (number === '8') {
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if ((Math.abs(relX) >= 1.5 && Math.abs(relX) <= 2.5) && 
          Math.abs(relY) <= 2.5) return true
    } else if (number === '6') {
      if ((Math.abs(relX) >= 1.5 && Math.abs(relX) <= 2.5) && relY <= 2.5) return true
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
    } else if (number === '45') {
      if (relX >= -3.5 && relX <= -2 && relY >= -2.5 && relY <= 0) return true
      if (relX >= -3.5 && relX <= -1 && relY >= -0.5 && relY <= 0.5) return true
      if (relX >= -2.5 && relX <= -1.5 && relY >= -2.5 && relY <= 2.5) return true
      if (relX >= 0.5 && relX <= 3 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= 0.5 && relX <= 1.5 && relY >= -2.5 && relY <= 0) return true
      if (relX >= 2 && relX <= 3 && relY >= 0 && relY <= 2.5) return true
    } else if (number === '5') {
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= -2 && relX <= -1 && relY >= -2.5 && relY <= 0) return true
      if (relX >= 1 && relX <= 2 && relY >= 0 && relY <= 2.5) return true
    } else if (number === '73') {
      if (relX >= -3.5 && relX <= -1 && relY >= -2.5 && relY <= -1.5) return true
      if (relX >= -2.5 && relX <= -1.5 && relY >= -2.5 && relY <= 2.5) return true
      if (relX >= 0.5 && relX <= 3 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= 2 && relX <= 3 && Math.abs(relY) <= 2.5) return true
    } else if (number === '2') {
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= 1 && relX <= 2 && relY >= -2.5 && relY <= 0) return true
      if (relX >= -2 && relX <= -1 && relY >= 0 && relY <= 2.5) return true
    } else if (number === '16') {
      if (relX >= -3 && relX <= -1 && relY >= -2.5 && relY <= 2.5) return true
      if ((Math.abs(relX - 1.5) >= 1 && Math.abs(relX - 1.5) <= 2) && relY <= 2.5) return true
      if (Math.abs(relX - 1.5) <= 1.5 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
    }

    return false
  }

  const circles: any[] = []
  const numCircles = 300

  for (let i = 0; i < numCircles; i++) {
    const angle = seededRandom(i * 2) * Math.PI * 2
    const radius = Math.sqrt(seededRandom(i * 2 + 1)) * (size * 0.45)
    const cx = size / 2 + Math.cos(angle) * radius
    const cy = size / 2 + Math.sin(angle) * radius
    
    const inNumber = isPartOfNumber(cx, cy)
    const colors = inNumber ? palette.numberColors : palette.backgroundColors
    const color = colors[Math.floor(seededRandom(i * 3) * colors.length)]
    const r = circleRadius * (0.7 + seededRandom(i * 4) * 0.6)
    const opacity = 0.8 + seededRandom(i * 5) * 0.2
    
    circles.push(
      <Circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        opacity={opacity}
      />
    )
  }

  return (
    <View style={styles.svgContainer}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={size/2} cy={size/2} r={size/2} fill="#F5F5DC" />
        {circles}
      </Svg>
    </View>
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
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
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
  svgContainer: {
    borderRadius: 150,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  plateNote: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9333EA',
    textAlign: 'center',
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
