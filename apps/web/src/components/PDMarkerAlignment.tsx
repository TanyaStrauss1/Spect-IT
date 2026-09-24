/**
 * PD Marker Alignment Component
 * Interactive interface for aligning markers to pupil centers
 */

'use client'

import { useState, useRef } from 'react'

interface PDMarkerAlignmentProps {
  onMeasurementComplete: (leftPupilX: number, rightPupilX: number) => void
  containerWidth?: number
  containerHeight?: number
}

export default function PDMarkerAlignment({
  onMeasurementComplete,
  containerWidth = 600,
  containerHeight = 400,
}: PDMarkerAlignmentProps) {
  const [leftMarkerX, setLeftMarkerX] = useState(containerWidth * 0.35)
  const [rightMarkerX, setRightMarkerX] = useState(containerWidth * 0.65)
  const [dragging, setDragging] = useState<'left' | 'right' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const markerY = containerHeight / 2

  const handleMouseDown = (marker: 'left' | 'right') => {
    setDragging(marker)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(containerWidth, e.clientX - rect.left))

    if (dragging === 'left') {
      setLeftMarkerX(x)
    } else {
      setRightMarkerX(x)
    }
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  const handleTouchStart = (marker: 'left' | 'right') => {
    setDragging(marker)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return

    const touch = e.touches[0]
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(containerWidth, touch.clientX - rect.left))

    if (dragging === 'left') {
      setLeftMarkerX(x)
    } else {
      setRightMarkerX(x)
    }
  }

  const handleTouchEnd = () => {
    setDragging(null)
  }

  const handleConfirmMeasurement = () => {
    onMeasurementComplete(leftMarkerX, rightMarkerX)
  }

  const pdPx = Math.abs(rightMarkerX - leftMarkerX)

  return (
    <div className="space-y-4">
      {/* Alignment Container */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-gray-50 to-gray-100 border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
        style={{
          width: `${containerWidth}px`,
          height: `${containerHeight}px`,
          touchAction: 'none',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Reference face outline (optional visual guide) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="text-gray-400 text-6xl">👤</div>
        </div>

        {/* Center line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-300 pointer-events-none"
          style={{ left: `${containerWidth / 2}px` }}
        />

        {/* Horizontal reference line at marker height */}
        <div
          className="absolute left-0 right-0 h-0.5 bg-gray-300 pointer-events-none"
          style={{ top: `${markerY}px` }}
        />

        {/* Left Marker */}
        <div
          className="absolute cursor-move"
          style={{
            left: `${leftMarkerX}px`,
            top: `${markerY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseDown={() => handleMouseDown('left')}
          onTouchStart={() => handleTouchStart('left')}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-red-500 border-2 border-red-700 rounded-full shadow-lg" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-red-700 whitespace-nowrap">
              LEFT
            </div>
          </div>
        </div>

        {/* Right Marker */}
        <div
          className="absolute cursor-move"
          style={{
            left: `${rightMarkerX}px`,
            top: `${markerY}px`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseDown={() => handleMouseDown('right')}
          onTouchStart={() => handleTouchStart('right')}
        >
          <div className="relative">
            <div className="w-6 h-6 bg-blue-500 border-2 border-blue-700 rounded-full shadow-lg" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-semibold text-blue-700 whitespace-nowrap">
              RIGHT
            </div>
          </div>
        </div>

        {/* Distance indicator line */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: `${Math.min(leftMarkerX, rightMarkerX)}px`,
            top: `${markerY + 30}px`,
            width: `${pdPx}px`,
            height: '40px',
          }}
        >
          <line
            x1="0"
            y1="10"
            x2={pdPx}
            y2="10"
            stroke="#10b981"
            strokeWidth="2"
          />
          <line x1="0" y1="5" x2="0" y2="15" stroke="#10b981" strokeWidth="2" />
          <line
            x1={pdPx}
            y1="5"
            x2={pdPx}
            y2="15"
            stroke="#10b981"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Instructions:</strong> Drag the RED marker to align with your LEFT
          pupil center. Drag the BLUE marker to align with your RIGHT pupil center.
          Use a mirror or front-camera preview to see your eyes while aligning.
        </p>
      </div>

      {/* Current measurement display */}
      <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 mb-1">Current Distance</p>
        <p className="text-3xl font-bold text-gray-900">{pdPx.toFixed(0)} px</p>
        <p className="text-xs text-gray-500 mt-1">
          (Will be converted to millimeters using screen calibration)
        </p>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirmMeasurement}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 shadow-lg"
      >
        ✓ Confirm This Measurement
      </button>

      <p className="text-xs text-gray-500 text-center">
        Take 3-5 measurements for best accuracy. The average will be calculated.
      </p>
    </div>
  )
}
