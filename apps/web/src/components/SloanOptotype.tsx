/**
 * Sloan Optotype React Component
 * 
 * Renders clinically accurate Sloan letters with proper 5×5 grid geometry
 * for visual acuity testing. Uses the geometric definitions from @spect-it/cv.
 */

'use client'

import { useMemo } from 'react'
import { generateSloanSVGPath, type SloanLetter } from '@spect-it/cv'

interface SloanOptotypeProps {
  letter: SloanLetter
  strokeWidthPx: number
  color?: string
  className?: string
  'aria-hidden'?: boolean
}

/**
 * SloanOptotype component - renders a single Sloan letter as SVG
 * 
 * @param letter - The Sloan letter to render (C, D, H, K, N, O, R, S, V, Z)
 * @param strokeWidthPx - The stroke width in pixels (determines overall size)
 * @param color - Fill color (default black)
 * @param className - Optional CSS classes
 * @param aria-hidden - Optional aria-hidden attribute for accessibility
 */
export default function SloanOptotype({
  letter,
  strokeWidthPx,
  color = '#000000',
  className = '',
  'aria-hidden': ariaHidden = true,
}: SloanOptotypeProps) {
  // Generate SVG path from geometry
  const path = useMemo(
    () => generateSloanSVGPath(letter, strokeWidthPx),
    [letter, strokeWidthPx]
  )

  // Total size is 5x stroke width (5×5 grid)
  const totalSize = strokeWidthPx * 5

  return (
    <svg
      width={totalSize}
      height={totalSize}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      className={className}
      aria-hidden={ariaHidden}
      style={{ 
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
    >
      <path d={path} fill={color} />
    </svg>
  )
}

/**
 * Calculate the stroke width needed for a specific logMAR value
 * Helper function for use in parent components
 */
export function useSloanStrokeWidth(
  logMAR: number,
  pxPerMm: number,
  distanceMm: number
): number {
  return useMemo(() => {
    // At logMAR 0.0, stroke width = 5 arc minutes
    const arcMinAt0 = 5
    const arcMinAtLogMAR = arcMinAt0 * Math.pow(10, logMAR)
    
    // Convert to radians and calculate physical size
    const angleRad = (arcMinAtLogMAR / 60) * (Math.PI / 180)
    const strokeWidthMm = Math.tan(angleRad) * distanceMm
    const strokeWidthPx = strokeWidthMm * pxPerMm
    
    return Math.max(1, Math.round(strokeWidthPx))
  }, [logMAR, pxPerMm, distanceMm])
}
