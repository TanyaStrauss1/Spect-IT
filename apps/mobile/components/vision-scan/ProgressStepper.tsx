/**
 * Vision Scan Progress Stepper
 * Shows current progress through the Vision Scan modules
 */

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type VisionScanStep = 'qualification' | 'calibration' | 'alignment' | 'cover-uncover' | 'motility' | 'convergence' | 'pupil-examination' | 'quality-review' | 'complete'

interface ProgressStepperProps {
  currentStep: VisionScanStep
}

const STEPS: { id: VisionScanStep; label: string }[] = [
  { id: 'qualification', label: 'Setup' },
  { id: 'calibration', label: 'Calibration' },
  { id: 'alignment', label: 'Alignment' },
  { id: 'cover-uncover', label: 'Cover Test' },
  { id: 'motility', label: 'Motility' },
  { id: 'convergence', label: 'Convergence' },
  { id: 'pupil-examination', label: 'Pupils' },
  { id: 'quality-review', label: 'Review' },
  { id: 'complete', label: 'Complete' },
]

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep)

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        {STEPS.map((step, index) => {
          const isComplete = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex

          return (
            <View key={step.id} style={styles.stepWrapper}>
              <View
                style={[
                  styles.stepDot,
                  isComplete && styles.stepDotComplete,
                  isCurrent && styles.stepDotCurrent,
                  isUpcoming && styles.stepDotUpcoming,
                ]}
              >
                {isComplete && <Text style={styles.stepDotCompleteText}>✓</Text>}
                {isCurrent && <View style={styles.stepDotCurrentInner} />}
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    index < currentIndex && styles.stepLineComplete,
                  ]}
                />
              )}
            </View>
          )
        })}
      </View>
      <View style={styles.labelsContainer}>
        {STEPS.map((step, index) => {
          const isCurrent = index === currentIndex
          return (
            <Text
              key={step.id}
              style={[
                styles.stepLabel,
                isCurrent && styles.stepLabelCurrent,
              ]}
            >
              {step.label}
            </Text>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotComplete: {
    backgroundColor: '#10B981',
  },
  stepDotCurrent: {
    backgroundColor: '#4F46E5',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  stepDotUpcoming: {
    backgroundColor: '#E5E7EB',
  },
  stepDotCompleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDotCurrentInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineComplete: {
    backgroundColor: '#10B981',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    flex: 1,
    textAlign: 'center',
  },
  stepLabelCurrent: {
    color: '#4F46E5',
    fontWeight: '600',
  },
})
