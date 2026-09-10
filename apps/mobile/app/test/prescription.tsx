import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { Svg, Line } from 'react-native-svg'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'

const testSizes = [
  { level: 1, size: 48, approximatePower: '+2.00 to +1.00' },
  { level: 2, size: 36, approximatePower: '+1.00 to 0.00' },
  { level: 3, size: 24, approximatePower: '0.00 (Plano)' },
  { level: 4, size: 18, approximatePower: '-0.50 to -1.00' },
  { level: 5, size: 14, approximatePower: '-1.50 to -2.00' },
  { level: 6, size: 12, approximatePower: '-2.50 to -3.00' },
]

const testLetters = ['E', 'F', 'P', 'T', 'O', 'Z', 'L', 'D']

export default function PrescriptionTestScreen() {
  const [step, setStep] = useState<'intro' | 'distance' | 'near' | 'astigmatism' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<'left' | 'right'>('left')
  const [distanceResults, setDistanceResults] = useState<any>({ left: null, right: null })
  const [nearResults, setNearResults] = useState<any>({ left: null, right: null })
  const [astigmatismResults, setAstigmatismResults] = useState<any>({ left: false, right: false })
  const [currentSize, setCurrentSize] = useState(3)
  const [currentLetter, setCurrentLetter] = useState('')
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
    if (step === 'distance' || step === 'near') {
      generateRandomLetter()
    }
  }, [step, currentSize])

  const generateRandomLetter = () => {
    const randomLetter = testLetters[Math.floor(Math.random() * testLetters.length)]
    setCurrentLetter(randomLetter)
  }

  const handleLetterResponse = (canRead: boolean) => {
    if (canRead && currentSize < testSizes.length) {
      setCurrentSize(currentSize + 1)
    } else {
      const eyeResult = {
        smallestReadable: currentSize - (canRead ? 0 : 1),
        estimatedPower: testSizes[Math.max(0, currentSize - (canRead ? 1 : 2))].approximatePower
      }

      if (step === 'distance') {
        const newDistanceResults = { ...distanceResults }
        newDistanceResults[currentEye] = eyeResult
        setDistanceResults(newDistanceResults)

        if (currentEye === 'left') {
          setCurrentEye('right')
          setCurrentSize(3)
        } else {
          setStep('near')
          setCurrentEye('left')
          setCurrentSize(3)
        }
      } else if (step === 'near') {
        const newNearResults = { ...nearResults }
        newNearResults[currentEye] = eyeResult
        setNearResults(newNearResults)

        if (currentEye === 'left') {
          setCurrentEye('right')
          setCurrentSize(3)
        } else {
          setStep('astigmatism')
          setCurrentEye('left')
        }
      }
    }
  }

  const handleAstigmatismResponse = (hasAstigmatism: boolean) => {
    const newAstigmatismResults = { ...astigmatismResults }
    newAstigmatismResults[currentEye] = hasAstigmatism

    if (currentEye === 'left') {
      setCurrentEye('right')
      setAstigmatismResults(newAstigmatismResults)
    } else {
      setAstigmatismResults(newAstigmatismResults)
      finishTest(newAstigmatismResults)
    }
  }

  const finishTest = async (finalAstigmatismResults: any) => {
    const leftPrescription = {
      distance: distanceResults.left?.estimatedPower || 'Unable to determine',
      near: nearResults.left?.estimatedPower || 'Unable to determine',
      astigmatism: finalAstigmatismResults.left ? 'Possible (requires professional measurement)' : 'Unlikely'
    }

    const rightPrescription = {
      distance: distanceResults.right?.estimatedPower || 'Unable to determine',
      near: nearResults.right?.estimatedPower || 'Unable to determine',
      astigmatism: finalAstigmatismResults.right ? 'Possible (requires professional measurement)' : 'Unlikely'
    }

    const testResult = {
      leftEye: leftPrescription,
      rightEye: rightPrescription,
      disclaimer: 'This is a screening-level estimate only. Accurate prescription requires professional refraction by an optometrist or ophthalmologist.',
      rawData: {
        distance: distanceResults,
        near: nearResults,
        astigmatism: finalAstigmatismResults
      }
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
            test_type: 'Prescription Measurement',
            test_name: 'Refractive Screening Estimate',
            test_data: testResult,
            score: 0,
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

  const RadialChart = () => (
    <Svg width={250} height={250} viewBox="0 0 250 250">
      {[...Array(12)].map((_, i) => {
        const angle = (i * Math.PI * 2) / 12
        const x1 = 125 + Math.cos(angle) * 15
        const y1 = 125 + Math.sin(angle) * 15
        const x2 = 125 + Math.cos(angle) * 110
        const y2 = 125 + Math.sin(angle) * 110
        return (
          <Line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="black"
            strokeWidth="2"
          />
        )
      })}
    </Svg>
  )

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🔬</Text>
          <Text style={styles.title}>Prescription Measurement</Text>
          <Text style={styles.subtitle}>Screening-Level Refractive Estimate</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>What is this test?</Text>
            <Text style={styles.text}>
              This screening provides a <Text style={styles.bold}>rough estimate</Text> of your refractive error 
              (nearsightedness, farsightedness) by testing your ability to read letters at different sizes and distances.
            </Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>⚠️ IMPORTANT LIMITATIONS:</Text>
            <Text style={styles.warningText}>• This is NOT a replacement for a professional eye exam</Text>
            <Text style={styles.warningText}>• Results are approximate estimates only</Text>
            <Text style={styles.warningText}>• Cannot measure cylinder power (astigmatism correction) precisely</Text>
            <Text style={styles.warningText}>• Cannot determine axis, prism, or other prescription details</Text>
            <Text style={styles.warningText}>• Screen quality and viewing distance affect accuracy</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. Remove any glasses or contact lenses</Text>
            <Text style={styles.text}>2. You'll test distance vision (far), near vision (reading), and astigmatism</Text>
            <Text style={styles.text}>3. Test each eye separately by covering the other</Text>
            <Text style={styles.text}>4. Indicate whether you can clearly read the displayed letter</Text>
            <Text style={styles.text}>5. Be honest - this helps generate a more accurate estimate</Text>
          </View>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Setup:</Text> Sit about 2 feet from your screen for distance testing. 
              For near testing, you'll move closer to about 14 inches. Use good, even lighting.
            </Text>
          </View>

          <View style={styles.screeningNotice}>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Screening Notice:</Text> This is a screening tool only. 
              For an accurate prescription, schedule a comprehensive eye exam with an optometrist or ophthalmologist.
            </Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={() => setStep('distance')}>
            <Text style={styles.primaryButtonText}>Start Screening</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }

  if (step === 'distance' || step === 'near') {
    const testSize = testSizes[currentSize - 1] || testSizes[testSizes.length - 1]
    const isDistance = step === 'distance'

    return (
      <View style={styles.testContainer}>
        <View style={styles.testCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {isDistance ? 'Distance' : 'Near'} Vision - Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye
            </Text>
          </View>

          <Text style={styles.testTitle}>
            Cover your {currentEye === 'left' ? 'right' : 'left'} eye
          </Text>
          <Text style={styles.testSubtitle}>
            {isDistance ? 'Sit 2 feet from screen' : 'Lean in to about 14 inches'}
          </Text>

          <View style={styles.letterDisplay}>
            <Text style={[styles.displayLetter, { fontSize: testSize.size }]}>
              {currentLetter}
            </Text>
          </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>Can you read this letter clearly?</Text>
            <Text style={styles.sizeText}>Size level {currentSize} of {testSizes.length}</Text>
          </View>

          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseButton, styles.yesButton]}
              onPress={() => handleLetterResponse(true)}
            >
              <Text style={styles.responseButtonText}>Yes, I can read it ✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseButton, styles.noButton]}
              onPress={() => handleLetterResponse(false)}
            >
              <Text style={styles.responseButtonText}>No, it's blurry ✗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  if (step === 'astigmatism') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Astigmatism Check - Testing {currentEye === 'left' ? 'Left' : 'Right'} Eye
            </Text>
          </View>

          <Text style={styles.testTitle}>
            Cover your {currentEye === 'left' ? 'right' : 'left'} eye
          </Text>
          <Text style={styles.testSubtitle}>
            Look at the lines below. Do some appear darker or sharper than others?
          </Text>

          <View style={styles.chartDisplay}>
            <RadialChart />
          </View>

          <View style={styles.questionBox}>
            <Text style={styles.questionText}>
              Do some lines appear noticeably darker or sharper than others?
            </Text>
          </View>

          <View style={styles.responseButtons}>
            <TouchableOpacity
              style={[styles.responseButton, styles.warningButton]}
              onPress={() => handleAstigmatismResponse(true)}
            >
              <Text style={styles.responseButtonText}>Yes, some are darker</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.responseButton, styles.yesButton]}
              onPress={() => handleAstigmatismResponse(false)}
            >
              <Text style={styles.responseButtonText}>No, all look the same</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.resultEmoji}>✓</Text>
        <Text style={styles.resultTitle}>Screening Complete!</Text>
        <Text style={styles.resultSubtitle}>
          {saving ? 'Saving estimates...' : 'Estimates saved'}
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>
            ⚠️ SCREENING ESTIMATE ONLY - NOT AN ACTUAL PRESCRIPTION
          </Text>
          <Text style={styles.warningText}>{result.disclaimer}</Text>
        </View>

        <View style={styles.prescriptionContainer}>
          <View style={styles.prescriptionCard}>
            <Text style={styles.prescriptionTitle}>Left Eye Estimate</Text>
            <View style={styles.prescriptionItem}>
              <Text style={styles.prescriptionLabel}>Distance (Sphere)</Text>
              <Text style={styles.prescriptionValue}>{result.leftEye.distance}</Text>
            </View>
            <View style={styles.prescriptionItem}>
              <Text style={styles.prescriptionLabel}>Near (Add)</Text>
              <Text style={styles.prescriptionValue}>{result.leftEye.near}</Text>
            </View>
            <View style={styles.prescriptionItem}>
              <Text style={styles.prescriptionLabel}>Astigmatism</Text>
              <Text style={styles.prescriptionValue}>{result.leftEye.astigmatism}</Text>
            </View>
          </View>

          <View style={styles.prescriptionCard}>
            <Text style={styles.prescriptionTitle}>Right Eye Estimate</Text>
            <View style={styles.prescriptionItem}>
              <Text style={styles.prescriptionLabel}>Distance (Sphere)</Text>
              <Text style={styles.prescriptionValue}>{result.rightEye.distance}</Text>
            </View>
            <View style={styles.prescriptionItem}>
              <Text style={styles.prescriptionLabel}>Near (Add)</Text>
              <Text style={styles.prescriptionValue}>{result.rightEye.near}</Text>
            </View>
            <View style={styles.prescriptionItem}>
              <Text style={styles.prescriptionLabel}>Astigmatism</Text>
              <Text style={styles.prescriptionValue}>{result.rightEye.astigmatism}</Text>
            </View>
          </View>
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={styles.disclaimerBold}>Next Steps:</Text> Schedule a comprehensive eye exam with an optometrist or 
            ophthalmologist for an accurate prescription. Bring these screening results to help guide the discussion. 
            Professional refraction can measure precise sphere, cylinder, axis, and other parameters this screening cannot detect.
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
  bold: {
    fontWeight: 'bold',
  },
  warningBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 11,
    color: '#7F1D1D',
    marginBottom: 4,
    lineHeight: 16,
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
  screeningNotice: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
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
  letterDisplay: {
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  displayLetter: {
    fontWeight: 'bold',
    letterSpacing: 3,
    color: '#000',
  },
  chartDisplay: {
    alignItems: 'center',
    marginVertical: 24,
  },
  questionBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  sizeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  responseButtons: {
    gap: 12,
  },
  responseButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: '#10B981',
  },
  noButton: {
    backgroundColor: '#EF4444',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  responseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 24,
  },
  prescriptionContainer: {
    marginBottom: 24,
  },
  prescriptionCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  prescriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  prescriptionItem: {
    marginBottom: 12,
  },
  prescriptionLabel: {
    fontSize: 10,
    color: '#6B7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  prescriptionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
})
