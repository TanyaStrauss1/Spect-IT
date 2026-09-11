/**
 * Enhanced Clock Dial Component for Astigmatism Screening
 * 
 * Clinical-grade clock dial with:
 * - 12 crisp, equal-weight radial lines (30° apart)
 * - Precise SVG rendering for consistent line quality
 * - Interactive selection of darker/sharper lines
 * - Visual feedback for selections
 */

'use client'

import { useState, useMemo } from 'react'
import { type ClockPosition } from '@spect-it/cv'

interface EnhancedClockDialProps {
  selectedPositions: ClockPosition[]
  onTogglePosition: (position: ClockPosition) => void
  diameterPx?: number
  lineWeight?: number
  showInstructions?: boolean
  className?: string
}

/**
 * EnhancedClockDial - crisp radial lines for astigmatism screening
 */
export default function EnhancedClockDial({
  selectedPositions,
  onTogglePosition,
  diameterPx = 400,
  lineWeight = 3,
  showInstructions = true,
  className = '',
}: EnhancedClockDialProps) {
  const radius = diameterPx / 2
  const innerRadius = 30
  const outerRadius = radius - 40

  // Generate line paths
  const lines = useMemo(() => {
    const positions: ClockPosition[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    
    return positions.map(pos => {
      // Convert clock position to angle (12 o'clock = -90°, clockwise)
      const angle = ((pos - 3) * 30) * (Math.PI / 180)
      
      // Calculate line endpoints
      const x1 = radius + Math.cos(angle) * innerRadius
      const y1 = radius + Math.sin(angle) * innerRadius
      const x2 = radius + Math.cos(angle) * outerRadius
      const y2 = radius + Math.sin(angle) * outerRadius
      
      // Calculate label position (slightly outside the lines)
      const labelX = radius + Math.cos(angle) * (outerRadius + 25)
      const labelY = radius + Math.sin(angle) * (outerRadius + 25)
      
      const isSelected = selectedPositions.includes(pos)
      
      return {
        position: pos,
        x1,
        y1,
        x2,
        y2,
        labelX,
        labelY,
        isSelected,
      }
    })
  }, [radius, innerRadius, outerRadius, selectedPositions])

  return (
    <div className={className}>
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Look at the center of the clock dial</li>
            <li>Observe all 12 radial lines</li>
            <li>Select any lines that appear darker or sharper than others</li>
            <li>If all lines look the same, don't select any</li>
          </ul>
        </div>
      )}

      {/* SVG Clock Dial */}
      <div className="flex justify-center mb-4">
        <svg
          width={diameterPx}
          height={diameterPx}
          viewBox={`0 0 ${diameterPx} ${diameterPx}`}
          className="border-2 border-gray-300 rounded-lg bg-white"
          style={{ maxWidth: '100%', height: 'auto' }}
        >
          {/* Central fixation circle */}
          <circle
            cx={radius}
            cy={radius}
            r={8}
            fill="#666666"
            opacity={0.3}
          />

          {/* Radial lines */}
          {lines.map(line => (
            <line
              key={line.position}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.isSelected ? '#d97706' : '#000000'} // Amber for selected
              strokeWidth={line.isSelected ? lineWeight + 1 : lineWeight}
              strokeLinecap="round"
              style={{
                cursor: 'pointer',
                transition: 'stroke 0.2s, stroke-width 0.2s',
              }}
              onClick={() => onTogglePosition(line.position)}
            />
          ))}

          {/* Clock position labels */}
          {lines.map(line => (
            <text
              key={`label-${line.position}`}
              x={line.labelX}
              y={line.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={line.isSelected ? '#d97706' : '#666666'}
              fontSize="16"
              fontWeight={line.isSelected ? 'bold' : 'normal'}
              style={{
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'fill 0.2s, font-weight 0.2s',
              }}
              onClick={() => onTogglePosition(line.position)}
            >
              {line.position}
            </text>
          ))}
        </svg>
      </div>

      {/* Selection buttons (alternative to clicking on SVG) */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2 text-center">
          Selected positions: {selectedPositions.length > 0 ? selectedPositions.sort((a, b) => a - b).join(', ') : 'None'}
        </p>
        <div className="grid grid-cols-6 gap-2 max-w-md mx-auto">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as ClockPosition[]).map(pos => (
            <button
              key={pos}
              onClick={() => onTogglePosition(pos)}
              className={`py-2 rounded-lg font-semibold transition-colors ${
                selectedPositions.includes(pos)
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Clinical note */}
      <p className="text-xs text-gray-500 text-center">
        12 equal-weight radial lines at 30° intervals • 
        Click lines or numbers to select • 
        SVG rendering for crisp lines
      </p>
    </div>
  )
}
