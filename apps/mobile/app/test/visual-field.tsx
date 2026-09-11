/**
 * Clinical Visual Field Screening - Mobile
 * Interactive Amsler grid methodology
 */

import { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import Svg, { Line, Circle, Rect } from 'react-native-svg'
import { router } from 'expo-router'
import { useAuth } from '../../lib/auth/auth-context'
import { supabase } from '../../lib/supabase'
import {
  createVisualFieldTest,
  type GridPosition,
  type GridIssue,
  type EyeVisualFieldResult,
  type Eye,
  type IssueType,
  type CalibrationData,
  ScreenCalibrator,
} from '@spect-it/cv'

export default function VisualFieldTestScreen() {
  const [step, setStep] = useState<'intro' | 'test' | 'report' | 'result'>('intro')
  const [currentEye, setCurrentEye] = useState<Eye>('right')
  const [issues, setIssues] = useState<GridIssue[]>([])
  const [centralFixation, setCentralFixation] = useState(true)
  const [rightEyeResult, setRightEyeResult] = useState<EyeVisualFieldResult | null>(null)
  const [leftEyeResult, setLeftEyeResult] = useState<EyeVisualFieldResult | null>(null)
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()

  const test = createVisualFieldTest({ gridSize: 10, gridCoverageArcMin: 1200 })
  const gridConfig = test.getGridConfig()

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.replace('/auth/signin')
    }
  }, [user, authLoading])

  const handleContinueToReport = () => {
    setStep('report')
  }

  const handleReportIssue = (type: IssueType) => {
    const issue: GridIssue = {
      position: { row: 5, col: 5 }, // Center for demo
      type,
      description: `${type} area detected`,
    }
    setIssues([...issues, issue])
  }

  const handleNoIssues = () => {
    setCentralFixation(true)
    finishEye()
  }

  const finishEye = () => {
    const eyeResult = test.processEyeResult(currentEye, issues, centralFixation)

    if (currentEye === 'right') {
      setRightEyeResult(eyeResult)
      setCurrentEye('left')
      setIssues([])
      setCentralFixation(true)
      setStep('test')
    } else {
      setLeftEyeResult(eyeResult)
      finishTest(rightEyeResult!, eyeResult)
    }
  }

  const finishTest = async (rightEye: EyeVisualFieldResult, leftEye: EyeVisualFieldResult) => {
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
            test_type: 'Visual Field (Clinical)',
            test_data: testResult,
            score: (rightEye.hasAbnormalities ? 0 : 1) + (leftEye.hasAbnormalities ? 0 : 1),
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

  const AmslerGrid = ({ size = 280 }: { size?: number }) => {
    const gridLines = []
    const squareSize = size / gridConfig.size

    // Vertical lines
    for (let i = 0; i <= gridConfig.size; i++) {
      const x = i * squareSize
      gridLines.push(
        <Line
          key={`v${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={size}
          stroke="#374151"
          strokeWidth="1"
        />
      )
    }

    // Horizontal lines
    for (let i = 0; i <= gridConfig.size; i++) {
      const y = i * squareSize
      gridLines.push(
        <Line
          key={`h${i}`}
          x1={0}
          y1={y}
          x2={size}
          y2={y}
          stroke="#374151"
          strokeWidth="1"
        />
      )
    }

    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Rect x={0} y={0} width={size} height={size} fill="white" />
        {gridLines}
        <Circle cx={size / 2} cy={size / 2} r={4} fill="#EF4444" />
      </Svg>
    )
  }

  if (step === 'intro') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>Visual Field Screening</Text>
          <Text style={styles.subtitle}>Amsler Grid Methodology</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Clinical Methodology</Text>
            <Text style={styles.infoText}>
              This test uses a 10×10 Amsler grid covering the central 20° of visual field. 
              It screens for central scotomas, metamorphopsia, or distortion that may indicate 
              macular conditions.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions:</Text>
            <Text style={styles.text}>1. You'll test each eye separately</Text>
            <Text style={styles.text}>2. Cover one eye with your hand (don't press on it)</Text>
            <Text style={styles.text}>3. Look at the red center dot - DO NOT look away</Text>
            <Text style={styles.text}>4. While maintaining fixation, notice if any grid squares appear missing, distorted, blurry, or dark</Text>
            <Text style={styles.text}>5. Report any abnormalities you observe</Text>
            <Text style={styles.text}>6. Repeat for the other eye</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>Important Limitation</Text>
            <Text style={styles.warningText}>
              This test screens the CENTRAL visual field only (central 20°). It does NOT detect 
              peripheral field loss, glaucoma, or other conditions affecting peripheral vision. 
              Comprehensive perimetry is required for full visual field assessment.
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
      <View style={styles.container}>
        <View style={styles.testCard}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Testing {currentEye === 'right' ? 'Right' : 'Left'} Eye
            </Text>
          </View>

          <Text style={styles.testTitle}>
            Cover your {currentEye === 'right' ? 'left' : 'right'} eye
          </Text>
          <Text style={styles.testSubtitle}>
            Keep your eyes on the red center dot. Observe the entire grid.
          </Text>

          <View style={styles.gridContainer}>
            <AmslerGrid size={280} />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleContinueToReport}
          >
            <Text style={styles.primaryButtonText}>Continue to Report</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (step === 'report') {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Report for {currentEye === 'right' ? 'Right' : 'Left'} Eye
            </Text>
          </View>

          <Text style={styles.testTitle}>Did you notice any abnormalities?</Text>
          <Text style={styles.testSubtitle}>
            Select all that apply
          </Text>

          <View style={styles.issueButtonsContainer}>
            <TouchableOpacity
              style={styles.issueButton}
              onPress={() => handleReportIssue('missing')}
            >
              <Text style={styles.issueButtonText}>Missing Areas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.issueButton}
              onPress={() => handleReportIssue('distorted')}
            >
              <Text style={styles.issueButtonText}>Distorted Lines</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.issueButton}
              onPress={() => handleReportIssue('blurry')}
            >
              <Text style={styles.issueButtonText}>Blurry Areas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.issueButton}
              onPress={() => handleReportIssue('dark')}
            >
              <Text style={styles.issueButtonText}>Dark Areas</Text>
            </TouchableOpacity>
          </View>

          {issues.length > 0 && (
            <View style={styles.issuesReported}>
              <Text style={styles.issuesReportedText}>
                {issues.length} issue(s) reported
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, styles.noIssuesButton]}
            onPress={handleNoIssues}
          >
            <Text style={styles.primaryButtonText}>
              No Abnormalities - Grid Looks Normal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={finishEye}
            disabled={issues.length === 0}
          >
            <Text style={styles.secondaryButtonText}>
              Done Reporting for This Eye
            </Text>
          </TouchableOpacity>
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
              {result.rightEye.hasAbnormalities ? 'Abnormalities Detected' : 'Normal'}
            </Text>
            <Text style={styles.resultItemSubtext}>
              {result.rightEye.issues.length} issue(s)
            </Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultItemLabel}>Left Eye (OS)</Text>
            <Text style={styles.resultItemValue}>
              {result.leftEye.hasAbnormalities ? 'Abnormalities Detected' : 'Normal'}
            </Text>
            <Text style={styles.resultItemSubtext}>
              {result.leftEye.issues.length} issue(s)
            </Text>
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
  testCard: {
    flex: 1,
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
  gridContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  issueButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  issueButton: {
    backgroundColor: '#F59E0B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  issueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  issuesReported: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  issuesReportedText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '600',
  },
  noIssuesButton: {
    backgroundColor: '#10B981',
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
