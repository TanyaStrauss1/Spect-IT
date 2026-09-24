/**
 * Pupillary Distance (PD) Screening Test Page
 * Manual marker-based PD measurement with screen calibration
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { useParticipants } from '@/lib/participants/participant-context'
import { supabase } from '@/lib/supabase'
import { useJourney } from '@/lib/journey/useJourney'
import CalibrationModal, { useCalibration } from '@/components/CalibrationModal'
import PDMarkerAlignment from '@/components/PDMarkerAlignment'
import { createPDTest, TEST_TYPE_ID, type PDMeasurement } from '@spect-it/cv'

type TestPhase = 'intro' | 'measurement' | 'result'

export default function PDTestPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeParticipant, participants } = useParticipants()
  const { calibrator, isModalOpen, setIsModalOpen, ensureCalibration } = useCalibration()
  const { markTestComplete } = useJourney()
  const [test] = useState(() => createPDTest())
  const [step, setStep] = useState<TestPhase>('intro')
  const [measurements, setMeasurements] = useState<PDMeasurement[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const calibration = calibrator.getCalibration() || calibrator.getDefaultCalibration()

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/auth/signin')
      return
    }
    if (participants.length > 0 && !activeParticipant) {
      alert('Please select a participant before starting the test')
      router.push('/dashboard/participants')
      return
    }
    ensureCalibration(() => {})
  }, [user, authLoading, participants, activeParticipant, ensureCalibration])

  useEffect(() => {
    if (calibration) {
      test.initialize(calibration.pxPerMm)
    }
  }, [calibration, test])

  const handleMeasurementComplete = (leftPupilX: number, rightPupilX: number) => {
    const measurement = test.recordMeasurement(leftPupilX, rightPupilX)
    setMeasurements([...test.getMeasurements()])

    if (!test.isValidMeasurement(measurement.pdMm)) {
      alert(
        `Measurement rejected: ${measurement.pdMm} mm is outside the valid range (40-85 mm). This may indicate incorrect marker placement or calibration error. Please try again.`
      )
      return
    }
  }

  const handleFinishMeasurements = async () => {
    if (measurements.length < 3) {
      if (!confirm('You have fewer than 3 measurements. For best accuracy, take at least 3 measurements. Continue anyway?')) {
        return
      }
    }

    const testResult = test.createResult(calibration)
    setResult(testResult)
    setStep('result')

    markTestComplete(TEST_TYPE_ID.PD)

    if (user) {
      setSaving(true)
      try {
        const testResultData: any = {
          user_id: user.id,
          test_type: TEST_TYPE_ID.PD,
          test_data: testResult,
          results: {
            averagePdMm: testResult.averagePdMm,
            category: testResult.category,
            confidence: testResult.confidence,
            measurementCount: testResult.measurements.length,
          },
        }

        if (activeParticipant) {
          testResultData.participant_id = activeParticipant.id
        }

        await supabase.from('test_results').insert(testResultData)
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  const handleRetakeMeasurement = () => {
    const newMeasurements = measurements.slice(0, -1)
    setMeasurements(newMeasurements)
    test.getMeasurements().pop()
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-12 px-4">
        <CalibrationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={() => setIsModalOpen(false)}
          calibrator={calibrator}
        />
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Pupillary Distance (PD) Screening
            </h1>

            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <h3 className="font-semibold text-yellow-900 mb-2">
                ⚠️ Screening Only - Not for Ordering Glasses
              </h3>
              <p className="text-sm text-yellow-800">
                This is a <strong>screening measurement</strong>, NOT a dispensable PD for
                ordering glasses online. Professional PD measurement by an optician or
                optometrist is authoritative for eyewear. Use this result for informational
                purposes only.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-gray-700">
                Pupillary Distance (PD) is the distance between the centers of your pupils,
                measured in millimeters. This screening test uses on-screen marker alignment
                with screen calibration to estimate your PD.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">What You'll Need</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>
                    <strong>Calibrated screen:</strong> Complete screen calibration first
                  </li>
                  <li>
                    <strong>Mirror or front camera:</strong> To see your eyes while aligning
                    markers
                  </li>
                  <li>
                    <strong>Normal viewing distance:</strong> 40-60 cm from screen
                  </li>
                  <li>
                    <strong>Good lighting:</strong> Ensure pupils are clearly visible
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>Two markers (red and blue) appear on screen</li>
                  <li>
                    Use a mirror or camera to see your eyes while looking at the screen
                  </li>
                  <li>Drag the LEFT (red) marker to align with your LEFT pupil center</li>
                  <li>Drag the RIGHT (blue) marker to align with your RIGHT pupil center</li>
                  <li>Confirm the measurement</li>
                  <li>Take 3-5 measurements for best accuracy</li>
                  <li>The average PD will be calculated</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Clinical Note</h3>
                <p className="text-sm text-purple-800">
                  Normal adult PD ranges from 54-74 mm (average 60-65 mm). Children have
                  smaller PD (43-54 mm) that increases with age. This screening provides an
                  estimate. For precise PD measurement for glasses, an optician uses a
                  pupillometer or millimeter ruler.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('measurement')}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700"
            >
              Start PD Measurement
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'result' && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {result.confidence === 'HIGH' ? '✓' : result.confidence === 'MODERATE' ? '⚠️' : '❌'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Measurement Complete!
              </h2>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your PD Result</h3>
              <p className="text-5xl font-bold text-cyan-600 mb-2">
                {result.averagePdMm} mm
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Average Pupillary Distance (from {result.measurements.length} measurement
                {result.measurements.length !== 1 ? 's' : ''})
              </p>
              <div className="mt-4 text-sm text-gray-700 whitespace-pre-line">
                {test.getInterpretation(result.category, result.averagePdMm, result.confidence)}
              </div>
            </div>

            {/* Measurement History */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Measurement History
              </h4>
              <div className="space-y-1">
                {result.measurements.map((m: PDMeasurement, i: number) => (
                  <div key={i} className="text-xs text-gray-600 flex justify-between">
                    <span>
                      Measurement {i + 1}:
                    </span>
                    <span className="font-mono">{m.pdMm} mm</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300 flex justify-between text-sm font-semibold text-gray-900">
                <span>Average:</span>
                <span className="font-mono">{result.averagePdMm} mm</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Screening Method:</strong> {result.methodology}
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important Disclaimer</h4>
              <p className="text-sm text-yellow-800">{test.getDisclaimer()}</p>
            </div>

            {result.confidence === 'LOW' && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-red-900 mb-1 text-sm">
                  🚨 LOW CONFIDENCE - RECOMMEND RE-MEASUREMENT
                </h4>
                <p className="text-sm text-red-800">
                  Your measurements showed significant variation, indicating inconsistent
                  marker placement. For accurate results, please re-test with careful
                  attention to aligning markers precisely to pupil centers.
                </p>
              </div>
            )}

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-purple-900 mb-1 text-sm">
                📋 What This Means
              </h4>
              <p className="text-sm text-purple-800 mb-2">
                <strong>For informational screening only.</strong> This PD estimate can help you
                understand your approximate pupillary distance, but should NOT be used to
                order glasses online without professional confirmation.
              </p>
              <p className="text-sm text-purple-800">
                For accurate PD measurement for eyewear, visit an optician who will measure
                using a pupillometer or millimeter ruler. Professional measurement also
                captures monocular PD (distance from each pupil to your nose bridge) and
                near PD for reading glasses when needed.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Setup:</strong> Use a mirror or front camera to see your eyes •
              Position yourself {calibration.distanceCm} cm from screen • Ensure good
              lighting
            </p>
          </div>

          <div className="text-center mb-6">
            <div className="inline-block bg-cyan-100 text-cyan-600 px-4 py-2 rounded-full font-semibold mb-4">
              Measurement {measurements.length + 1} • Target: 3-5 measurements
            </div>
            <h3 className="text-xl text-gray-600 mb-2">
              Align the markers to your pupil centers
            </h3>
            <p className="text-sm text-gray-500">
              Use a mirror or camera preview to see your eyes while aligning
            </p>
          </div>

          <div className="flex justify-center items-center mb-6">
            <PDMarkerAlignment
              onMeasurementComplete={handleMeasurementComplete}
              containerWidth={600}
              containerHeight={400}
            />
          </div>

          {measurements.length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">
                Completed Measurements
              </h4>
              <div className="space-y-2">
                {measurements.map((m, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200"
                  >
                    <span className="text-gray-600">Measurement {i + 1}:</span>
                    <span className="font-mono font-semibold text-gray-900">
                      {m.pdMm} mm
                    </span>
                  </div>
                ))}
              </div>
              {measurements.length >= 2 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current average:</span>
                    <span className="font-mono font-bold text-cyan-600">
                      {test.calculateAveragePD()} mm
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Consistency:</span>
                    <span>{test.assessConfidence()}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            {measurements.length > 0 && (
              <button
                onClick={handleRetakeMeasurement}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
              >
                ← Remove Last
              </button>
            )}
            {measurements.length >= 3 && (
              <button
                onClick={handleFinishMeasurements}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-blue-700"
              >
                Finish & Calculate Average →
              </button>
            )}
          </div>

          {measurements.length < 3 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Take at least {3 - measurements.length} more measurement
              {3 - measurements.length !== 1 ? 's' : ''} for best accuracy
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
