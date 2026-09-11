/**
 * Clinical Astigmatism Screening - Mobile
 * Clock dial with proper axis analysis
 */

import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import Svg, { Line, Circle } from 'react-native-svg'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import { 
  createAstigmatismTest,
  type ClockPosition,
  type EyeAstigmatismResult,
  type Eye,
  type CalibrationData,
  ScreenCalibrator,
} from '@spect-it/cv'

export default function AstigmatismTestScreen() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [selectedPositions, setSelectedPositions] = useState<ClockPosition[]>([])
  const [rightEyeResult, setRightEyeResult] = useState<EyeAstigmatismResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeAstigmatismResult | null>(null)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()
  
  const test = createAstigmatismTest()
  const clockPositions = test.getClockPositions()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  const handlePositionToggle = (position: ClockPosition) => {
    if (selectedPositions.includes(position)) {
      setSelectedPositions(selectedPositions.filter(p => p !== position))
    } else {
      setSelectedPositions([...selectedPositions, position])
    }
  }

  const handleSubmitEye = () => {
    const eyeResult = test.processEyeResult(currentEye, selectedPositions)
    
    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      setCurrentEye('left')
      setSelectedPositions([])
    } else {
      setLeftEyeResult(eyeResult)
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (rightEye: EyeAstigmatismResult, leftEye: EyeAstigmatismResult) => {
    const calibrator = new ScreenCalibrator()
    const calibration = calibrator.isReady() ? calibrator.getCalibration() : undefined
    
    const testResult = test.createResult(calibration, rightEye, leftEye)
    const rightInterpretation = test.getInterpretation(rightEye)
    const leftInterpretation = test.getInterpretation(leftEye)
    
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
            test_type: 'Astigmatism (Clinical)',
            test_data: testResult,
            score: (rightEye.hasAstigmatism ? 1 : 0) + (leftEye.hasAstigmatism ? 1 : 0),
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

  const RadialChart = ({ size = 280 }: { size?: number }) => {
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 20
    const numLines = 12

    const lines = []
    for (let i = 0; i < numLines; i++) {
      const angle = (i * Math.PI * 2) / numLines
      const x1 = centerX + Math.cos(angle) * 20
      const y1 = centerY + Math.sin(angle) * 20
      const x2 = centerX + Math.cos(angle) * radius
      const y2 = centerY + Math.sin(angle) * radius
      
      lines.push(
        <Line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="black"
          strokeWidth="2.5"
        />
      )
    }

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {lines}
        <Circle cx={centerX} cy={centerY} r={8} fill="#EF4444" />
      </Svg>
    )
  }

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🌀</Text>
          <Text style={styles.title}>Astigmatism Screening</Text>
          <Text style={styles.subtitle}>Clock Dial Methodology</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Clinical Methodology</Text>
            <Text style={styles.infoText}>
              This test uses a clock dial with 12 radial lines spaced 30° apart. 
              If you have astigmatism, some lines may appear darker or sharper than others, 
              indicating the potential axis of astigmatism.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. You'll test each eye separately</Text>
            <Text style={styles.text}>2. Cover one eye with your hand (don't press on it)</Text>
            <Text style={styles.text}>3. Look at the red center dot of the clock dial</Text>
            <Text style={styles.text}>4. Select the numbers next to lines that appear darker or sharper</Text>
            <Text style={styles.text}>5. If all lines look the same, leave nothing selected</Text>
            <Text style={styles.text}>6. Repeat for the other eye</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Important Limitation</Text>
            <Text style={styles.warningText}>
              This test provides axis indication ONLY. It cannot measure cylinder power or 
              provide a prescription. Astigmatism requires comprehensive refraction by an 
              optometrist or ophthalmologist.
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
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Testing {currentEye === 'right' ? 'Right' : 'Left'} Eye
            </Text>
          </View>
          
          <Text style={styles.testTitle}>
            Cover your {currentEye === 'right' ? 'left' : 'right'} eye
          </Text>
          <Text style={styles.testSubtitle}>
            Look at the center red dot. Select numbers next to darker/sharper lines.
          </Text>

          <View style={styles.chartContainer}>
            <RadialChart size={280} />
          </View>

          <View style={styles.lineGrid}>
            {clockPositions.map((position) => (
              <TouchableOpacity
                key={position}
                style={[
                  styles.lineButton,
                  selectedPositions.includes(position) && styles.lineButtonSelected
                ]}
                onPress={() => handlePositionToggle(position)}
              >
                <Text style={[
                  styles.lineButtonText,
                  selectedPositions.includes(position) && styles.lineButtonTextSelected
                ]}>
                  {position}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitEye}>
            <Text style={styles.primaryButtonText}>
              {currentEye === 'right' ? 'Continue to Left Eye' : 'Finish Test'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setSelectedPositions([])}>
            <Text style={styles.secondaryButtonText}>Clear Selection</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>
            If all lines look the same, leave nothing selected and continue
          </Text>
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

        <View style={styles.resultGrid}>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Right Eye (OD)</Text>
            <Text style={styles.resultItemValue}>
              {result.rightEye.hasAstigmatism ? 'Possible Astigmatism' : 'No Astigmatism'}
            </Text>
            {result.rightEye.estimatedAxis !== null && (
              <Text style={styles.resultItemSubtext}>Axis: ~{result.rightEye.estimatedAxis}°</Text>
            )}
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Left Eye (OS)</Text>
            <Text style={styles.resultItemValue}>
              {result.leftEye.hasAstigmatism ? 'Possible Astigmatism' : 'No Astigmatism'}
            </Text>
            {result.leftEye.estimatedAxis !== null && (
              <Text style={styles.resultItemSubtext}>Axis: ~{result.leftEye.estimatedAxis}°</Text>
            )}
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

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Important Limitation:</Text> {result.limitations}
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
  chartContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  lineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  lineButton: {
    width: 50,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  lineButtonSelected: {
    backgroundColor: '#4F46E5',
  },
  lineButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  lineButtonTextSelected: {
    color: 'white',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
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
  disclaimer: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: 'bold',
  },
})
