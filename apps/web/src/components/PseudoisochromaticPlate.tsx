/**
 * PseudoisochromaticPlate React Component
 * 
 * Renders confusion-line based color vision screening plates with dot fields.
 * NOT using copyrighted Ishihara images - these are generated programmatically
 * using confusion-line color science principles.
 */

'use client'

import { useMemo, useRef, useEffect } from 'react'
import { generatePlateDots, renderPlateToCanvas, type PlateConfig } from '@spect-it/cv'

interface PseudoisochromaticPlateProps {
  config: PlateConfig
  diameterPx?: number
  className?: string
}

/**
 * PseudoisochromaticPlate component
 * Renders a color vision test plate with dot field and embedded digit
 */
export default function PseudoisochromaticPlate({
  config,
  diameterPx = 400,
  className = '',
}: PseudoisochromaticPlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Generate dots (memoized by config id)
  const dots = useMemo(
    () => generatePlateDots(config, diameterPx, 2000),
    [config.id, diameterPx]
  )

  // Render to canvas when component mounts or updates
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, diameterPx, diameterPx)

    // Render plate
    renderPlateToCanvas(ctx, dots, diameterPx)
  }, [dots, diameterPx])

  return (
    <div className={`inline-block ${className}`}>
      <canvas
        ref={canvasRef}
        width={diameterPx}
        height={diameterPx}
        className="rounded-full shadow-lg"
        style={{
          width: `${diameterPx}px`,
          height: `${diameterPx}px`,
        }}
        aria-label={`Color vision test plate: ${config.description}`}
      />
    </div>
  )
}
