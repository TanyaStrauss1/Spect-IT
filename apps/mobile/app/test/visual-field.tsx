import { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

const testPositions = [
  { id: 1, x: 50, y: 20, zone: 'top' },
  { id: 2, x: 80, y: 20, zone: 'top-right' },
  { id: 3, x: 80, y: 50, zone: 'right' },
  { id: 4, x: 80, y: 80, zone: 'bottom-right' },
  { id: 5, x: 50, y: 80, zone: 'bottom' },
  { id: 6, x: 20, y: 80, zone: 'bottom-left' },
  { id: 7, x: 20, y: 50, zone: 'left' },
  { id: 8, x: 20, y: 20, zone: 'top-left' },
]

export default function VisualFieldTestScreen() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<'left' | 'right'>('left')
  const [currentTrial, setCurrentTrial] = useState(0)
  const [showStimulus, setShowStimulus] = useState(false)
  const [stimulusPosition, setStimulusPosition] = useState<any>(null)
  const [waitingForResponse, setWaitingForResponse] = useState(false)
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user } = useAuth()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user])

  useEffect(() => {
    if (step === 'test' && !waitingForResponse && currentTrial < testPositions.length) {
      const delay = 1000 + Math.random() * 2000
      timeoutRef.current = setTimeout(() => {
        showNextStimulus()
      }, delay)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [step, currentTrial, waitingForResponse])

  const showNextStimulus = () => {
    const position = testPositions[currentTrial]
    setStimulusPosition(position)
    setShowStimulus(true)
    setWaitingForResponse(true)

    setTimeout(() => {
      setShowStimulus(false)
    }, 500)
  }

  const handleResponse = (detected: boolean) => {
    if (!waitingForResponse) return

    const response = {
      trial: currentTrial + 1,
      position: stimulusPosition,
      detected,
      eye: currentEye,
      timestamp: Date.now()
    }

    const newResponses = [...responses, response]
    setResponses(newResponses)
    setWaitingForResponse(false)

    if (currentTrial < testPositions.length - 1) {
      setCurrentTrial(currentTrial + 1)
    } else {
      if (currentEye === 'left') {
        setCurrentEye('right')
        setCurrentTrial(0)
      } else {
        finishTest(newResponses)
      }
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    const leftEyeResponses = finalResponses.filter(r => r.eye === 'left')
    const rightEyeResponses = finalResponses.filter(r => r.eye === 'right')

    const leftDetected = leftEyeResponses.filter(r => r.detected).length
    const rightDetected = rightEyeResponses.filter(r => r.detected).length

    const leftPercentage = (leftDetected / leftEyeResponses.length) * 100
    const rightPercentage = (rightDetected / rightEyeResponses.length) * 100

    const missedZones = {
      left: leftEyeResponses.filter(r => !r.detected).map(r => r.position.zone),
      right: rightEyeResponses.filter(r => !r.detected).map(r => r.position.zone)
    }

    let assessment = ''
    if (leftPercentage >= 85 && rightPercentage >= 85) {
      assessment = 'Normal peripheral vision detected'
    } else if (leftPercentage >= 70 && rightPercentage >= 70) {
      assessment = 'Mild peripheral vision concerns - consider professional evaluation'
    } else {
      assessment = 'Peripheral vision concerns detected - consult an eye care professional'
    }

    const testResult = {
      leftEye: {
        detected: leftDetected,
        total: leftEyeResponses.length,
        percentage: Math.round(leftPercentage),
        missedZones: missedZones.left
      },
      rightEye: {
        detected: rightDetected,
        total: rightEyeResponses.length,
        percentage: Math.round(rightPercentage),
        missedZones: missedZones.right
      },
      assessment,
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
            test_type: 'Visual Field',
            test_name: 'Peripheral Vision Screening',
            test_data: testResult,
            score: Math.round((leftPercentage + rightPercentage) / 2),
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

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>Visual Field Test</Text>
          <Text style={styles.subtitle}>Peripheral Vision Screening</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is this test?</Text>
            <Text style={styles.text}>
              This test screens your peripheral (side) vision by presenting brief flashes 
              of light in different areas while you focus on a central point. It can help 
              detect blind spots or reduced peripheral vision.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. You'll test each eye separately</Text>
            <Text style={styles.text}>2. Cover one eye with your hand (don't press on it)</Text>
            <Text style={styles.text}>3. Keep your gaze fixed on the central dot - DO NOT look around</Text>
            <Text style={styles.text}>4. Tap "Saw It" if you see a flash in your peripheral vision</Text>
            <Text style={styles.text}>5. Tap "Missed It" if you don't see anything after a few seconds</Text>
            <Text style={styles.text}>6. Repeat for the other eye</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Important:</Text> Keep your eyes focused on the central dot at all times. 
              Use your peripheral vision to detect the flashes. Sit about 2 feet from your screen in good lighting.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              <Text style={styles.disclaimerBold}>Screening Notice:</Text> This is a basic screening, not full clinical perimetry. 
              Results do not constitute a medical diagnosis. Please consult an eye care professional for comprehensive visual field testing if you have concerns.
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
    const testAreaSize = Math.min(Dimensions.get('window').width - 80, 350)

    return (
      <View style={styles.testContainer}>
        <View style={styles.testCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye - Trial {currentTrial + 1} of {testPositions.length}
            </Text>
          </View>

          <Text style={styles.testTitle}>
            Cover your {currentEye === 'left' ? 'right' : 'left'} eye
          </Text>
          <Text style={styles.testSubtitle}>
            Keep your gaze on the center dot. Tap when you see a flash.
          </Text>

          <View style={[styles.testArea, { width: testAreaSize, height: testAreaSize }]}>
            {/* Central fixation point */}
            <View style={styles.centralDot} />

            {/* Stimulus */}
            {showStimulus && stimulusPosition && (
              <View 
                style={[
                  styles.stimulus,
                  {
                    left: `${stimulusPosition.x}%`,
                    top: `${stimulusPosition.y}%`,
                  }
                ]}
              />
            )}
          </View>

          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseButton, styles.sawItButton, !waitingForResponse && styles.disabledButton]}
              onPress={() => handleResponse(true)}
              disabled={!waitingForResponse}
            >
              <Text style={styles.responseButtonText}>Saw It ✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseButton, styles.missedItButton, !waitingForResponse && styles.disabledButton]}
              onPress={() => handleResponse(false)}
              disabled={!waitingForResponse}
            >
              <Text style={styles.responseButtonText}>Missed It ✗</Text>
            </TouchableOpacity>
          </View>

          {!waitingForResponse && (
            <Text style={styles.helpText}>
              Next flash coming soon... Keep your eyes on the center dot!
            </Text>
          )}

          <View style={styles.progress}>
            <Text style={styles.progressText}>
              Progress: {responses.filter(r => r.eye === currentEye).length} / {testPositions.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(responses.filter(r => r.eye === currentEye).length / testPositions.length) * 100}%` }
                ]}
              />
            </View>
          </View>
        </View>
      </View>
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
            <Text style={styles.resultItemLabel}>Left Eye</Text>
            <Text style={styles.resultItemValue}>{result.leftEye.percentage}%</Text>
            <Text style={styles.resultItemSubtext}>
              {result.leftEye.detected}/{result.leftEye.total} detected
            </Text>
            {result.leftEye.missedZones.length > 0 && (
              <Text style={styles.missedZonesText}>
                Missed: {result.leftEye.missedZones.join(', ')}
              </Text>
            )}
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Right Eye</Text>
            <Text style={styles.resultItemValue}>{result.rightEye.percentage}%</Text>
            <Text style={styles.resultItemSubtext}>
              {result.rightEye.detected}/{result.rightEye.total} detected
            </Text>
            {result.rightEye.missedZones.length > 0 && (
              <Text style={styles.missedZonesText}>
                Missed: {result.rightEye.missedZones.join(', ')}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Note:</Text> This is a basic screening result, not a comprehensive visual field test. 
            Missing peripheral stimuli may indicate potential vision concerns. Please consult an eye care professional for a full evaluation if concerns are detected.
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
  testContainer: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 20,
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
    borderRadius: 16,
    padding: 20,
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
    fontSize: 11,
    textAlign: 'center',
  },
  testTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  testSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  testArea: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  centralDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    left: '50%',
    top: '50%',
    marginLeft: -6,
    marginTop: -6,
  },
  stimulus: {
    position: 'absolute',
    width: 25,
    height: 25,
    backgroundColor: 'white',
    borderRadius: 12.5,
    marginLeft: -12.5,
    marginTop: -12.5,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  responseButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sawItButton: {
    backgroundColor: '#10B981',
  },
  missedItButton: {
    backgroundColor: '#EF4444',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  responseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  progress: {
    marginTop: 12,
  },
  progressText: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
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
    padding: 20,
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
    fontSize: 16,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  resultItemSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  missedZonesText: {
    fontSize: 10,
    color: '#DC2626',
    marginTop: 4,
  },
})
