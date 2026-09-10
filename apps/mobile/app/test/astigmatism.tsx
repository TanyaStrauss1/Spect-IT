import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { Canvas, Path } from '@shopify/react-native-skia'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

export default function AstigmatismTestScreen() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [leftEyeResponse, setLeftEyeResponse] = useState<number | null>(null)
  const [rightEyeResponse, setRightEyeResponse] = useState<number | null>(null)
  const [currentEye, setCurrentEye] = useState<'left' | 'right'>('left')
  const [selectedLines, setSelectedLines] = useState<number[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  const handleLineSelection = (lineNumber: number) => {
    if (selectedLines.includes(lineNumber)) {
      setSelectedLines(selectedLines.filter(l => l !== lineNumber))
    } else {
      setSelectedLines([...selectedLines, lineNumber])
    }
  }

  const handleSubmitEye = () => {
    const response = selectedLines.length
    
    if (currentEye === 'left') {
      setLeftEyeResponse(response)
      setCurrentEye('right')
      setSelectedLines([])
    } else {
      setRightEyeResponse(response)
      finishTest(leftEyeResponse!, response)
    }
  }

  const finishTest = async (leftResponse: number, rightResponse: number) => {
    const leftStatus = leftResponse <= 1 ? 'Normal' : 'Possible Astigmatism'
    const rightStatus = rightResponse <= 1 ? 'Normal' : 'Possible Astigmatism'
    
    const testResult = {
      leftEye: {
        darkerLines: leftResponse,
        status: leftStatus
      },
      rightEye: {
        darkerLines: rightResponse,
        status: rightStatus
      },
      overallAssessment: leftResponse <= 1 && rightResponse <= 1 
        ? 'No signs of astigmatism detected' 
        : 'Possible astigmatism detected - consult an eye care professional'
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
            test_type: 'Astigmatism',
            test_name: 'Radial Fan Chart',
            test_data: testResult,
            score: leftResponse + rightResponse,
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

  const RadialChart = () => {
    const size = 300
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 20
    const numLines = 12

    const paths: string[] = []
    for (let i = 0; i < numLines; i++) {
      const angle = (i * Math.PI * 2) / numLines
      const x1 = centerX + Math.cos(angle) * 20
      const y1 = centerY + Math.sin(angle) * 20
      const x2 = centerX + Math.cos(angle) * radius
      const y2 = centerY + Math.sin(angle) * radius
      paths.push(`M ${x1} ${y1} L ${x2} ${y2}`)
    }

    return (
      <Canvas style={{ width: size, height: size }}>
        {paths.map((pathData, i) => (
          <Path key={i} path={pathData} color="black" style="stroke" strokeWidth={2} />
        ))}
      </Canvas>
    )
  }

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🌀</Text>
          <Text style={styles.title}>Astigmatism Test</Text>
          <Text style={styles.subtitle}>Radial Fan Chart Screening</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is this test?</Text>
            <Text style={styles.text}>
              This test uses a radial fan chart with lines radiating from the center. 
              If you have astigmatism, some lines may appear darker or sharper than others.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. You'll test each eye separately</Text>
            <Text style={styles.text}>2. Cover one eye with your hand (don't press on it)</Text>
            <Text style={styles.text}>3. Look at the radial chart and identify which lines appear darker or sharper</Text>
            <Text style={styles.text}>4. Select all lines that appear darker than the others</Text>
            <Text style={styles.text}>5. Repeat for the other eye</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Important:</Text> Sit about 2 feet from your screen in good lighting.
              If all lines appear equally dark, that's normal! Only select lines that appear noticeably darker or sharper.
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
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye</Text>
          </View>
          
          <Text style={styles.testTitle}>
            Cover your {currentEye === 'left' ? 'right' : 'left'} eye
          </Text>
          <Text style={styles.testSubtitle}>
            Select the numbers of any lines that appear darker or sharper
          </Text>

          <View style={styles.chartContainer}>
            <RadialChart />
          </View>

          <View style={styles.lineGrid}>
            {[...Array(12)].map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.lineButton,
                  selectedLines.includes(i + 1) && styles.lineButtonSelected
                ]}
                onPress={() => handleLineSelection(i + 1)}
              >
                <Text style={[
                  styles.lineButtonText,
                  selectedLines.includes(i + 1) && styles.lineButtonTextSelected
                ]}>
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmitEye}>
            <Text style={styles.primaryButtonText}>
              {currentEye === 'left' ? 'Continue to Right Eye' : 'Finish Test'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => setSelectedLines([])}>
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

        <View style={styles.resultMain}>
          <Text style={styles.resultLabel}>Assessment</Text>
          <Text style={styles.resultScore}>{result.overallAssessment}</Text>
        </View>

        <View style={styles.resultGrid}>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Left Eye</Text>
            <Text style={styles.resultItemValue}>{result.leftEye.status}</Text>
            <Text style={styles.resultItemSubtext}>{result.leftEye.darkerLines} line(s) selected</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Right Eye</Text>
            <Text style={styles.resultItemValue}>{result.rightEye.status}</Text>
            <Text style={styles.resultItemSubtext}>{result.rightEye.darkerLines} line(s) selected</Text>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Note:</Text> This is a screening result, not a medical diagnosis. 
            If possible astigmatism is detected, please consult an eye care professional for a comprehensive eye examination and precise measurement.
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
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultItemSubtext: {
    fontSize: 11,
    color: '#6B7280',
  },
})
