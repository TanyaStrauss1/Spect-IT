/**
 * Calibration Modal Component
 * 
 * Credit card-based screen calibration for clinical vision tests.
 * Based on spectit-calibration.js from PR #57
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

export default function CalibrationModal({
  isOpen,
  onClose,
  onComplete,
  calibrator,
}: CalibrationModalProps) {
  const config = calibrator.getConfig()
  const [pxPerMm, setPxPerMm] = useState(calibrator.getPxPerMm() || 3.8)
  const [distanceCm, setDistanceCm] = useState(calibrator.getDistanceCm() || config.defaultDistance)

  useEffect(() => {
    const currentPx = calibrator.getPxPerMm()
    const currentDist = calibrator.getDistanceCm()
    if (currentPx) setPxPerMm(currentPx)
    if (currentDist) setDistanceCm(currentDist)
  }, [calibrator])

  const handleSave = () => {
    calibrator.saveCalibration(pxPerMm, distanceCm)
    onComplete()
    onClose()
  }

  const handleSkip = () => {
    calibrator.markSkipped()
    onComplete()
    onClose()
  }

  if (!isOpen) return null

  const cardWidthPx = config.cardWidthMm * pxPerMm

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Screen Calibration</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          For accurate results, calibrate your screen size and viewing distance once.
        </p>

        <div className="space-y-6">
          {/* Credit Card Width Calibration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card width on screen
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Drag the slider until a credit card would fit exactly within the box below:
            </p>
            
            {/* Visual reference box */}
            <div className="flex justify-center mb-3">
              <div
                className="border-2 border-indigo-600 bg-indigo-50"
                style={{ width: `${cardWidthPx}px`, height: '54px' }}
              >
                <div className="h-full flex items-center justify-center text-xs text-indigo-600">
                  {config.cardWidthMm}mm
                </div>
              </div>
            </div>

            <input
              type="range"
              min="2"
              max="8"
              step="0.05"
              value={pxPerMm}
              onChange={(e) => setPxPerMm(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-sm text-gray-500 mt-1 text-center">
              ~{pxPerMm.toFixed(2)} px/mm (~{Math.round(pxPerMm * 25.4)} PPI)
            </p>
          </div>

          {/* Viewing Distance */}
          <div>
            <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-2">
              Viewing distance (cm)
            </label>
            <input
              type="number"
              id="distance"
              min={config.minDistance}
              max={config.maxDistance}
              value={distanceCm}
              onChange={(e) => setDistanceCm(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-500 mt-1">
              Measure from your eyes to the screen
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-colors"
          >
            Save & Continue
          </button>
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
