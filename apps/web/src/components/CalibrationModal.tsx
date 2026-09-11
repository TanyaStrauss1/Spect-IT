/**
 * Calibration Modal Component
 * 
 * Credit card-based screen calibration for clinical vision tests.
 * Enhanced with live letter preview, distance presets, validation, and re-check prompts.
 */

'use client'

import { useState, useEffect } from 'react'
import { createCalibrator, type ScreenCalibrator } from '@spect-it/cv'

interface CalibrationModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  calibrator: ScreenCalibrator
}

const DISTANCE_PRESETS = [
  { cm: 40, label: '40 cm', description: 'Close reading' },
  { cm: 60, label: '60 cm', description: 'Standard (arm\'s length)' },
  { cm: 200, label: '2 m', description: 'Moderate distance' },
  { cm: 300, label: '3 m', description: 'Room distance' },
  { cm: 600, label: '6 m', description: 'Clinical standard' },
]

// Validation ranges
const PX_PER_MM_MIN = 2.0  // ~50 DPI
const PX_PER_MM_MAX = 12.0 // ~300 DPI
const DISTANCE_MIN = 30    // 30 cm
const DISTANCE_MAX = 600   // 6 meters
const RECHECK_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function validateCalibration(pxPerMm: number, distanceCm: number): string[] {
  const warnings: string[] = []
  
  if (pxPerMm < PX_PER_MM_MIN || pxPerMm > PX_PER_MM_MAX) {
    warnings.push(`Screen size value seems unusual (${pxPerMm.toFixed(2)} px/mm). Please verify with a physical card.`)
  }
  
  if (distanceCm < DISTANCE_MIN) {
    warnings.push(`Viewing distance is very close (${distanceCm} cm). For accurate results, sit at least 50-60 cm away.`)
  }
  
  if (distanceCm > DISTANCE_MAX) {
    warnings.push(`Viewing distance is very far (${distanceCm} cm). This may affect test accuracy.`)
  }
  
  // Check if PPI is reasonable
  const ppi = pxPerMm * 25.4
  if (ppi < 70 || ppi > 400) {
    warnings.push(`Calculated screen density (${Math.round(ppi)} PPI) seems unusual. Double-check your measurements.`)
  }
  
  return warnings
}

function needsRecheck(): boolean {
  const timestamp = localStorage.getItem('spectit_calibration_timestamp')
  if (!timestamp) return true
  return (Date.now() - parseInt(timestamp)) > RECHECK_INTERVAL_MS
}

export default function CalibrationModal({
  isOpen,
  onClose,
  onComplete,
  calibrator,
}: CalibrationModalProps) {
  const config = calibrator.getConfig()
  const [step, setStep] = useState<'card' | 'distance' | 'preview'>('card')
  const [pxPerMm, setPxPerMm] = useState(calibrator.getPxPerMm() || 3.8)
  const [distanceCm, setDistanceCm] = useState(calibrator.getDistanceCm() || config.defaultDistance)
  const [showSkipWarning, setShowSkipWarning] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])
  const [showRecheckPrompt, setShowRecheckPrompt] = useState(false)

  useEffect(() => {
    const currentPx = calibrator.getPxPerMm()
    const currentDist = calibrator.getDistanceCm()
    if (currentPx) setPxPerMm(currentPx)
    if (currentDist) setDistanceCm(currentDist)

    // Check if re-check is needed
    if (calibrator.isReady() && needsRecheck()) {
      setShowRecheckPrompt(true)
    }
  }, [calibrator])

  useEffect(() => {
    // Update warnings when values change
    setWarnings(validateCalibration(pxPerMm, distanceCm))
  }, [pxPerMm, distanceCm])

  const handleSave = () => {
    calibrator.saveCalibration(pxPerMm, distanceCm)
    // Save timestamp and validation flag
    localStorage.setItem('spectit_calibration_timestamp', Date.now().toString())
    localStorage.setItem('spectit_calibration_validated', '1')
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    if (!showSkipWarning) {
      setShowSkipWarning(true)
      return
    }
    calibrator.markSkipped()
    onComplete()
    onClose()
  }

  const handleNext = () => {
    if (step === 'card') {
      setStep('distance')
    } else if (step === 'distance') {
      setStep('preview')
    }
  }

  const handleBack = () => {
    if (step === 'preview') {
      setStep('distance')
    } else if (step === 'distance') {
      setStep('card')
    }
  }

  if (!isOpen) return null

  const cardWidthPx = config.cardWidthMm * pxPerMm
  
  // Calculate preview letter size for 6/6 (0.0 logMAR) at current calibration
  // Using 5 arcmin stroke width = 25 arcmin letter height for 5×5 optotype
  const previewLetterSizePx = calibrator.calculateETDRSLetterSize(0.0) || 60

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Screen Calibration</h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 'card' && 'Step 1: Screen Size'}
              {step === 'distance' && 'Step 2: Viewing Distance'}
              {step === 'preview' && 'Step 3: Verify'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none font-light"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          <div className={`h-1 flex-1 rounded ${step === 'card' || step === 'distance' || step === 'preview' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded ${step === 'distance' || step === 'preview' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          <div className={`h-1 flex-1 rounded ${step === 'preview' ? 'bg-indigo-600' : 'bg-gray-200'}`} />
        </div>

        {/* Re-check Prompt */}
        {showRecheckPrompt && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 font-semibold mb-2">
              🔄 Calibration Re-check Recommended
            </p>
            <p className="text-xs text-blue-800">
              It's been over 30 days since your last calibration. Please verify your settings for continued accuracy.
            </p>
          </div>
        )}

        {/* Card Size Step */}
        {step === 'card' && (
          <div className="space-y-6">
            <div>
              <p className="text-gray-700 mb-4">
                Use a standard credit card (85.6mm × 54mm) to calibrate your screen size.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>📏 Hold your card:</strong> Place a physical credit card against the screen and 
                  adjust the slider until the blue box matches the card width exactly.
                </p>
              </div>
            </div>

            {/* Visual reference box */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div
                  className="border-4 border-indigo-600 bg-indigo-50 rounded-sm shadow-lg transition-all duration-200"
                  style={{ width: `${cardWidthPx}px`, height: '54px' }}
                >
                  <div className="h-full flex flex-col items-center justify-center text-indigo-700">
                    <div className="text-lg font-bold">{config.cardWidthMm}mm</div>
                    <div className="text-xs">Credit Card Width</div>
                  </div>
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">
                  {cardWidthPx.toFixed(0)}px wide
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adjust card width
              </label>
              <input
                type="range"
                min={PX_PER_MM_MIN}
                max={PX_PER_MM_MAX}
                step="0.05"
                value={pxPerMm}
                onChange={(e) => setPxPerMm(parseFloat(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smaller</span>
                <span>{pxPerMm.toFixed(2)} px/mm (~{Math.round(pxPerMm * 25.4)} PPI)</span>
                <span>Larger</span>
              </div>
            </div>

            {/* Validation Warnings */}
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-900 font-semibold mb-2">⚠️ Please verify:</p>
                <ul className="list-disc list-inside text-xs text-yellow-800 space-y-1">
                  {warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Distance Step */}
        {step === 'distance' && (
          <div className="space-y-6">
            <div>
              <p className="text-gray-700 mb-4">
                Measure or estimate the distance from your eyes to the screen.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>📐 Tip:</strong> Extend your arm - fingertip to shoulder is approximately 60cm (standard testing distance).
                </p>
              </div>
            </div>

            {/* Distance Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Quick presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DISTANCE_PRESETS.map((preset) => (
                  <button
                    key={preset.cm}
                    onClick={() => setDistanceCm(preset.cm)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      distanceCm === preset.cm
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{preset.label}</div>
                    <div className="text-xs text-gray-600">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Distance */}
            <div>
              <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
                Or enter custom distance
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="distance"
                  min={config.minDistance}
                  max={config.maxDistance}
                  value={distanceCm}
                  onChange={(e) => setDistanceCm(Math.max(config.minDistance, Math.min(config.maxDistance, parseInt(e.target.value) || config.defaultDistance)))}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
                />
                <span className="text-gray-700 font-medium">cm</span>
              </div>
            </div>
          </div>
        )}

        {/* Preview Step */}
        {step === 'preview' && (
          <div className="space-y-6">
            <div>
              <p className="text-gray-700 mb-4">
                This letter is sized for 6/6 (20/20) visual acuity at your calibrated distance.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>✓ Visual Check:</strong> At {distanceCm}cm distance, this letter should be challenging 
                  but readable with good vision. If it looks too large or small, go back and adjust.
                </p>
              </div>
            </div>

            {/* Preview Letter */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-12 flex flex-col items-center justify-center border-2 border-gray-200">
              <div className="text-gray-500 text-sm mb-4">6/6 (20/20) letter at {distanceCm}cm</div>
              <div 
                className="font-bold tracking-wider text-gray-900 select-none"
                style={{ fontSize: `${previewLetterSizePx}px` }}
              >
                E
              </div>
              <div className="text-gray-500 text-xs mt-4">
                {previewLetterSizePx.toFixed(0)}px ({(previewLetterSizePx * 0.353).toFixed(1)}mm tall)
              </div>
            </div>

            {/* Calibration Summary */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Screen PPI:</span>
                <span className="font-semibold text-gray-900">{Math.round(pxPerMm * 25.4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Distance:</span>
                <span className="font-semibold text-gray-900">{distanceCm} cm ({(distanceCm / 100).toFixed(2)} m)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">1° visual angle:</span>
                <span className="font-semibold text-gray-900">{(distanceCm * 10 * Math.tan(Math.PI / 180)).toFixed(1)} mm on screen</span>
              </div>
            </div>
          </div>
        )}

        {/* Skip Warning */}
        {showSkipWarning && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mt-6 animate-pulse">
            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ Calibration Recommended</p>
            <p className="text-xs text-red-700">
              Skipping calibration will reduce accuracy. Test results will use estimated values. 
              Click Skip again to confirm.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          {step === 'card' ? (
            <>
              <button
                onClick={handleSkip}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                {showSkipWarning ? 'Skip Anyway' : 'Skip'}
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold transition-colors shadow-md"
              >
                Next: Distance →
              </button>
            </>
          ) : step === 'distance' ? (
            <>
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold transition-colors shadow-md"
              >
                Preview →
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold transition-colors shadow-md"
              >
                ✓ Save & Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to manage calibration state
 */
export function useCalibration() {
  const [calibrator] = useState(() => createCalibrator())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalibrated, setIsCalibrated] = useState(false)

  useEffect(() => {
    setIsCalibrated(calibrator.isReady())
  }, [calibrator])

  const ensureCalibration = (onReady: () => void, force?: boolean) => {
    if (calibrator.isReady() && !force) {
      onReady()
      return
    }

    setIsModalOpen(true)
    
    // Set up completion handler
    const handleComplete = () => {
      setIsCalibrated(true)
      onReady()
    }

    return handleComplete
  }

  return {
    calibrator,
    isCalibrated,
    isModalOpen,
    setIsModalOpen,
    ensureCalibration,
  }
}
