/**
 * Interactive Amsler Grid Component
 * 
 * Clinical-grade Amsler grid for detecting central visual field defects:
 * - 10×10 grid covering central 20° of visual field
 * - Click to mark distorted/missing cells
 * - Maintains fixation point
 * - Records region map of issues
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { type GridPosition, type GridIssue, type IssueType } from '@spect-it/cv'

interface InteractiveAmslerGridProps {
  gridSize?: number // Number of cells per side (default 10)
  pixelSize?: number // Total grid size in pixels (default 400)
  onIssuesChange?: (issues: GridIssue[]) => void
  showInstructions?: boolean
  className?: string
}

type MarkedCell = {
  position: GridPosition
  type: IssueType
}

/**
 * InteractiveAmslerGrid - clickable grid for marking visual field issues
 */
export default function InteractiveAmslerGrid({
  gridSize = 10,
  pixelSize = 400,
  onIssuesChange,
  showInstructions = true,
  className = '',
}: InteractiveAmslerGridProps) {
  const [markedCells, setMarkedCells] = useState<MarkedCell[]>([])
  const [selectedIssueType, setSelectedIssueType] = useState<IssueType>('distorted')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const cellSize = pixelSize / gridSize

  // Draw the Amsler grid
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, pixelSize, pixelSize)

    // Draw grid lines (black on white for maximum contrast)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 1

    // Vertical lines
    for (let i = 0; i <= gridSize; i++) {
      const x = i * cellSize
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, pixelSize)
      ctx.stroke()
    }

    // Horizontal lines
    for (let i = 0; i <= gridSize; i++) {
      const y = i * cellSize
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(pixelSize, y)
      ctx.stroke()
    }

    // Draw central fixation point (larger, more visible)
    const centerX = pixelSize / 2
    const centerY = pixelSize / 2
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw marked cells with color coding
    markedCells.forEach(({ position, type }) => {
      const x = position.col * cellSize
      const y = position.row * cellSize

      // Color coding for issue types
      let fillColor = 'rgba(255, 0, 0, 0.3)' // Default red for distorted
      if (type === 'missing') fillColor = 'rgba(100, 100, 100, 0.5)'
      if (type === 'blurry') fillColor = 'rgba(255, 165, 0, 0.3)'
      if (type === 'dark') fillColor = 'rgba(50, 50, 150, 0.3)'

      ctx.fillStyle = fillColor
      ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
    })

  }, [gridSize, pixelSize, cellSize, markedCells])

  // Handle click on grid to mark cell
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Scale to canvas coordinates
    const scaleX = pixelSize / rect.width
    const scaleY = pixelSize / rect.height
    const canvasX = x * scaleX
    const canvasY = y * scaleY

    // Convert to grid position
    const col = Math.floor(canvasX / cellSize)
    const row = Math.floor(canvasY / cellSize)

    // Validate position
    if (col < 0 || col >= gridSize || row < 0 || row >= gridSize) return

    const position: GridPosition = { row, col }

    // Check if this cell is already marked
    const existingIndex = markedCells.findIndex(
      m => m.position.row === row && m.position.col === col
    )

    let newMarkedCells: MarkedCell[]
    if (existingIndex >= 0) {
      // Toggle: if same type, remove; if different type, update
      if (markedCells[existingIndex].type === selectedIssueType) {
        newMarkedCells = markedCells.filter((_, i) => i !== existingIndex)
      } else {
        newMarkedCells = [...markedCells]
        newMarkedCells[existingIndex] = { position, type: selectedIssueType }
      }
    } else {
      // Add new marked cell
      newMarkedCells = [...markedCells, { position, type: selectedIssueType }]
    }

    setMarkedCells(newMarkedCells)

    // Notify parent component
    if (onIssuesChange) {
      const issues: GridIssue[] = newMarkedCells.map(m => ({
        position: m.position,
        type: m.type,
      }))
      onIssuesChange(issues)
    }
  }

  // Clear all markings
  const handleClear = () => {
    setMarkedCells([])
    if (onIssuesChange) {
      onIssuesChange([])
    }
  }

  return (
    <div className={`${className}`}>
      {showInstructions && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
          <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
            <li>Look directly at the central black dot</li>
            <li>Do NOT look away from the center</li>
            <li>While maintaining fixation, notice any distorted, missing, blurry, or dark areas</li>
            <li>Click on any problem areas to mark them</li>
            <li>Select the issue type before marking</li>
          </ul>
        </div>
      )}

      {/* Issue type selector */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700 mb-2">Select issue type:</p>
        <div className="flex gap-2 flex-wrap">
          {(['distorted', 'missing', 'blurry', 'dark'] as IssueType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedIssueType(type)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                selectedIssueType === type
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas grid */}
      <div className="flex justify-center mb-4">
        <canvas
          ref={canvasRef}
          width={pixelSize}
          height={pixelSize}
          onClick={handleCanvasClick}
          className="border-4 border-black bg-white cursor-crosshair"
          style={{
            width: `${pixelSize}px`,
            height: `${pixelSize}px`,
          }}
          aria-label="Interactive Amsler grid - click to mark problem areas"
        />
      </div>

      {/* Status and controls */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {markedCells.length === 0 ? (
            'No issues marked (click grid to mark problem areas)'
          ) : (
            `${markedCells.length} area(s) marked with issues`
          )}
        </p>
        {markedCells.length > 0 && (
          <button
            onClick={handleClear}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs font-semibold text-gray-700 mb-2">Color Legend:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 0, 0, 0.3)' }} />
            <span>Distorted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(100, 100, 100, 0.5)' }} />
            <span>Missing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(255, 165, 0, 0.3)' }} />
            <span>Blurry</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(50, 50, 150, 0.3)' }} />
            <span>Dark</span>
          </div>
        </div>
      </div>
    </div>
  )
}
