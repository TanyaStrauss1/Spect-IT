/**
 * First-Run Onboarding Modal (React Native)
 * Guides new users through welcome, calibration, journey overview, and disclaimer
 */

import { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { RECOMMENDED_TESTS } from '../lib/journey/useJourney'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

type OnboardingStep = 'welcome' | 'calibration' | 'journey' | 'disclaimer'

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')

  const handleCalibrationLater = () => {
    setStep('journey')
  }

  const handleStartCalibration = () => {
    Alert.alert(
      'Calibration',
      'Calibration will be integrated with the first test you take. Continue to learn about your screening journey.',
      [{ text: 'OK', onPress: () => setStep('journey') }]
    )
  }

  const handleComplete = async () => {
    await AsyncStorage.setItem('spectit_onboarding_completed', 'true')
    onComplete()
  }

  const handleSkipOnboarding = () => {
    Alert.alert(
      'Skip Onboarding?',
      'You can access calibration and journey info from the dashboard anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: async () => {
            await AsyncStorage.setItem('spectit_onboarding_completed', 'true')
            onSkip()
          }
        }
      ]
    )
  }

  const essentialTests = RECOMMENDED_TESTS.filter(t => t.category === 'essential')

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleSkipOnboarding}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Welcome Step */}
            {step === 'welcome' && (
              <View style={styles.stepContainer}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>👁️</Text>
                  <Text style={styles.title}>Welcome to Spect-IT</Text>
                  <Text style={styles.subtitle}>Your personal vision screening platform</Text>
                </View>

                <View style={styles.featureList}>
                  <View style={[styles.featureCard, { backgroundColor: '#EEF2FF' }]}>
                    <Text style={styles.featureEmoji}>📏</Text>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Clinical-Grade Testing</Text>
                      <Text style={styles.featureText}>ETDRS methodology with properly calibrated optotypes and stimuli</Text>
                    </View>
                  </View>

                  <View style={[styles.featureCard, { backgroundColor: '#FAF5FF' }]}>
                    <Text style={styles.featureEmoji}>🗺️</Text>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Guided Journey</Text>
                      <Text style={styles.featureText}>Step-by-step screening path with progress tracking</Text>
                    </View>
                  </View>

                  <View style={[styles.featureCard, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={styles.featureEmoji}>📊</Text>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>Longitudinal Tracking</Text>
                      <Text style={styles.featureText}>Track your vision over time and detect meaningful changes</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setStep('calibration')}
                  >
                    <Text style={styles.primaryButtonText}>Get Started</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleSkipOnboarding}
                  >
                    <Text style={styles.secondaryButtonText}>Skip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Calibration Step */}
            {step === 'calibration' && (
              <View style={styles.stepContainer}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>📏</Text>
                  <Text style={styles.title}>Screen Calibration</Text>
                  <Text style={styles.subtitle}>For accurate results, we need to calibrate your display</Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Why Calibration Matters</Text>
                  <Text style={styles.infoText}>
                    Clinical vision tests require precise stimulus sizing. By measuring your screen with a credit card 
                    and noting your viewing distance, we can render optotypes at the correct angular sizes (arcminutes).
                  </Text>
                  <Text style={styles.infoDetail}>
                    What you'll need: A standard credit/debit card (85.6 × 54mm) and a way to measure 
                    or estimate your viewing distance.
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleStartCalibration}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={handleCalibrationLater}
                  >
                    <Text style={styles.secondaryButtonText}>Skip for now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Journey Step */}
            {step === 'journey' && (
              <View style={styles.stepContainer}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>🗺️</Text>
                  <Text style={styles.title}>Your Screening Journey</Text>
                  <Text style={styles.subtitle}>We recommend completing these tests in order</Text>
                </View>

                <View style={styles.testList}>
                  {essentialTests.map((test, idx) => (
                    <View key={test.id} style={styles.testCard}>
                      <View style={styles.testNumber}>
                        <Text style={styles.testNumberText}>{idx + 1}</Text>
                      </View>
                      <View style={styles.testContent}>
                        <View style={styles.testHeader}>
                          <Text style={styles.testEmoji}>{test.icon}</Text>
                          <Text style={styles.testName}>{test.name}</Text>
                          <Text style={styles.testDuration}>({test.duration})</Text>
                        </View>
                        <Text style={styles.testDescription}>{test.why}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.tipCard}>
                  <Text style={styles.tipTitle}>💡 Tip</Text>
                  <Text style={styles.tipText}>
                    You can pause anytime and resume later. Your progress is saved automatically. 
                    Access the full journey from your dashboard.
                  </Text>
                </View>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => setStep('disclaimer')}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setStep('welcome')}
                  >
                    <Text style={styles.secondaryButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Disclaimer Step */}
            {step === 'disclaimer' && (
              <View style={styles.stepContainer}>
                <View style={styles.header}>
                  <Text style={styles.emoji}>⚕️</Text>
                  <Text style={styles.title}>Important: Screening vs. Diagnosis</Text>
                  <Text style={styles.subtitle}>Please read carefully</Text>
                </View>

                <ScrollView style={styles.disclaimerScroll}>
                  <View style={styles.warningCard}>
                    <Text style={styles.warningTitle}>🚨 This is Screening, Not Diagnosis</Text>
                    <Text style={styles.warningText}>
                      Spect-IT provides <Text style={styles.bold}>screening results</Text> to help you understand your vision status. 
                      It is NOT a substitute for a comprehensive eye examination by a licensed optometrist or ophthalmologist.
                    </Text>
                  </View>

                  <View style={styles.infoCard}>
                    <Text style={styles.infoTitle}>✓ What We Provide</Text>
                    <Text style={styles.infoText}>• Clinical-grade vision screening using validated methodologies</Text>
                    <Text style={styles.infoText}>• Longitudinal tracking of your vision over time</Text>
                    <Text style={styles.infoText}>• Detection of potential changes that may warrant professional evaluation</Text>
                    <Text style={styles.infoText}>• Educational information about vision health</Text>
                  </View>

                  <View style={[styles.infoCard, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.infoTitle, { color: '#991B1B' }]}>✗ What We Don't Provide</Text>
                    <Text style={[styles.infoText, { color: '#991B1B' }]}>• Medical diagnoses or treatment recommendations</Text>
                    <Text style={[styles.infoText, { color: '#991B1B' }]}>• Prescription eyewear measurements (see an optometrist for Rx)</Text>
                    <Text style={[styles.infoText, { color: '#991B1B' }]}>• Detection of eye diseases (glaucoma, cataracts, retinal conditions)</Text>
                    <Text style={[styles.infoText, { color: '#991B1B' }]}>• Emergency medical advice</Text>
                  </View>

                  <View style={[styles.infoCard, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.infoTitle, { color: '#14532D' }]}>💚 When to See a Professional</Text>
                    <Text style={[styles.infoText, { color: '#14532D' }]}>Schedule an eye exam if you experience:</Text>
                    <Text style={[styles.infoText, { color: '#14532D' }]}>• Sudden vision changes or meaningful decline (≥0.1 logMAR)</Text>
                    <Text style={[styles.infoText, { color: '#14532D' }]}>• Eye pain, floaters, flashes of light, or visual disturbances</Text>
                    <Text style={[styles.infoText, { color: '#14532D' }]}>• Difficulty with daily activities due to vision</Text>
                    <Text style={[styles.infoText, { color: '#14532D' }]}>• No eye exam in the past 1-2 years (recommended frequency)</Text>
                  </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleComplete}
                  >
                    <Text style={styles.primaryButtonText}>I Understand — Start Testing</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => setStep('journey')}
                  >
                    <Text style={styles.secondaryButtonText}>Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

/**
 * Hook to manage onboarding state (React Native)
 */
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const completed = await AsyncStorage.getItem('spectit_onboarding_completed')
      if (!completed) {
        setHasCompletedOnboarding(false)
        setIsOnboardingOpen(true)
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error)
    }
  }

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('spectit_onboarding_completed', 'true')
      setHasCompletedOnboarding(true)
      setIsOnboardingOpen(false)
    } catch (error) {
      console.error('Error marking onboarding complete:', error)
    }
  }

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('spectit_onboarding_completed')
      setHasCompletedOnboarding(false)
      setIsOnboardingOpen(true)
    } catch (error) {
      console.error('Error resetting onboarding:', error)
    }
  }

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    setIsOnboardingOpen,
    markOnboardingComplete,
    resetOnboarding,
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  stepContainer: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  featureList: {
    marginBottom: 24,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 4,
  },
  infoDetail: {
    fontSize: 12,
    color: '#1E40AF',
    marginTop: 8,
    lineHeight: 18,
  },
  testList: {
    marginBottom: 16,
  },
  testCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  testNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  testNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  testContent: {
    flex: 1,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  testEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  testName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  testDuration: {
    fontSize: 12,
    color: '#6B7280',
  },
  testDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#FAF5FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#7C3AED',
    lineHeight: 20,
  },
  disclaimerScroll: {
    maxHeight: 300,
    marginBottom: 16,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
})
