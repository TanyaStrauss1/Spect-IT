/**
 * First-Run Onboarding Modal
 * Guides new users through calibration, journey overview, and screening disclaimer
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CalibrationModal, { useCalibration } from './CalibrationModal'
import { RECOMMENDED_TESTS } from '@/lib/journey/useJourney'

interface OnboardingModalProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

type OnboardingStep = 'welcome' | 'calibration' | 'journey' | 'disclaimer'

export function OnboardingModal({ isOpen, onComplete, onSkip }: OnboardingModalProps) {
  const router = useRouter()
  const { calibrator, isModalOpen: isCalibrationOpen, setIsModalOpen: setIsCalibrationOpen, ensureCalibration } = useCalibration()
  const [step, setStep] = useState<OnboardingStep>('welcome')

  if (!isOpen) return null

  const handleCalibrationComplete = () => {
    setIsCalibrationOpen(false)
    setStep('journey')
  }

  const handleStartCalibration = () => {
    setStep('calibration')
    setIsCalibrationOpen(true)
  }

  const handleComplete = () => {
    localStorage.setItem('spectit_onboarding_completed', 'true')
    onComplete()
  }

  const handleSkipOnboarding = () => {
    if (confirm('Skip onboarding? You can access calibration and journey info from the dashboard anytime.')) {
      localStorage.setItem('spectit_onboarding_completed', 'true')
      onSkip()
    }
  }

  const essentialTests = RECOMMENDED_TESTS.filter(t => t.category === 'essential')

  return (
    <>
      {/* Calibration Modal (nested) */}
      <CalibrationModal 
        isOpen={isCalibrationOpen} 
        onClose={() => setIsCalibrationOpen(false)}
        onComplete={handleCalibrationComplete}
        calibrator={calibrator}
      />

      {/* Onboarding Modal Overlay */}
      {!isCalibrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            
            {/* Welcome Step */}
            {step === 'welcome' && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">👁️</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Spect-IT</h2>
                  <p className="text-lg text-gray-600">Your personal vision screening platform</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg">
                    <span className="text-3xl">📏</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Clinical-Grade Testing</h3>
                      <p className="text-sm text-gray-600">ETDRS methodology with properly calibrated optotypes and stimuli</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                    <span className="text-3xl">🗺️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Guided Journey</h3>
                      <p className="text-sm text-gray-600">Step-by-step screening path with progress tracking</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <span className="text-3xl">📊</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Longitudinal Tracking</h3>
                      <p className="text-sm text-gray-600">Track your vision over time and detect meaningful changes</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('calibration')}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={handleSkipOnboarding}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Calibration Step */}
            {step === 'calibration' && !isCalibrationOpen && (
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">📏</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Screen Calibration</h2>
                  <p className="text-gray-600">For accurate results, we need to calibrate your display</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Why Calibration Matters</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Clinical vision tests require precise stimulus sizing. By measuring your screen with a credit card 
                    and noting your viewing distance, we can render optotypes at the correct angular sizes (arcminutes).
                  </p>
                  <div className="text-xs text-blue-700">
                    <strong>What you'll need:</strong> A standard credit/debit card (85.6 × 54mm) and a way to measure 
                    or estimate your viewing distance.
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStartCalibration}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Calibrate Now
                  </button>
                  <button
                    onClick={() => setStep('journey')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            )}

            {/* Journey Step */}
            {step === 'journey' && (
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">🗺️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Screening Journey</h2>
                  <p className="text-gray-600">We recommend completing these tests in order</p>
                </div>

                <div className="space-y-3 mb-6">
                  {essentialTests.map((test, idx) => (
                    <div key={test.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{test.icon}</span>
                          <h3 className="font-semibold text-gray-900">{test.name}</h3>
                          <span className="text-xs text-gray-500">({test.duration})</span>
                        </div>
                        <p className="text-sm text-gray-600">{test.why}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-900 mb-2">💡 Tip</h3>
                  <p className="text-sm text-purple-800">
                    You can pause anytime and resume later. Your progress is saved automatically. 
                    Access the full journey from your dashboard.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('disclaimer')}
                    className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => setStep('welcome')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {/* Disclaimer Step */}
            {step === 'disclaimer' && (
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">⚕️</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Important: Screening vs. Diagnosis</h2>
                  <p className="text-gray-600">Please read carefully</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                    <h3 className="font-semibold text-amber-900 mb-2">🚨 This is Screening, Not Diagnosis</h3>
                    <p className="text-sm text-amber-800 mb-2">
                      Spect-IT provides <strong>screening results</strong> to help you understand your vision status. 
                      It is NOT a substitute for a comprehensive eye examination by a licensed optometrist or ophthalmologist.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">✓ What We Provide</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Clinical-grade vision screening using validated methodologies</li>
                      <li>• Longitudinal tracking of your vision over time</li>
                      <li>• Detection of potential changes that may warrant professional evaluation</li>
                      <li>• Educational information about vision health</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-900 mb-2">✗ What We Don't Provide</h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• Medical diagnoses or treatment recommendations</li>
                      <li>• Prescription eyewear measurements (see an optometrist for Rx)</li>
                      <li>• Detection of eye diseases (glaucoma, cataracts, retinal conditions)</li>
                      <li>• Emergency medical advice</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">💚 When to See a Professional</h3>
                    <p className="text-sm text-green-800 mb-2">
                      Schedule an eye exam if you experience:
                    </p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Sudden vision changes or meaningful decline (≥0.1 logMAR)</li>
                      <li>• Eye pain, floaters, flashes of light, or visual disturbances</li>
                      <li>• Difficulty with daily activities due to vision</li>
                      <li>• No eye exam in the past 1-2 years (recommended frequency)</li>
                    </ul>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleComplete}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    I Understand — Start Testing
                  </button>
                  <button
                    onClick={() => setStep('journey')}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Hook to manage onboarding state
 */
export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true)

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem('spectit_onboarding_completed')
    if (!completed) {
      setHasCompletedOnboarding(false)
      setIsOnboardingOpen(true)
    }
  }, [])

  const markOnboardingComplete = () => {
    setHasCompletedOnboarding(true)
    setIsOnboardingOpen(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem('spectit_onboarding_completed')
    setHasCompletedOnboarding(false)
    setIsOnboardingOpen(true)
  }

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    setIsOnboardingOpen,
    markOnboardingComplete,
    resetOnboarding,
  }
}
