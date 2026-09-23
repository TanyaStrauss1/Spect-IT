/**
 * Random-Dot Stereogram Component
 * Renders anaglyph (red-cyan) random-dot pattern with target shape
 */

'use client'

import { useEffect, useRef } from 'react'
import type { StereoShape } from '@spect-it/cv'

interface RandomDotStereogramProps {
  shape: StereoShape
  disparityPx: number
  sizePx?: number
  dotDensity?: number
  className?: string
}

export default function RandomDotStereogram({
  shape,
  disparityPx,
  sizePx = 400,
  dotDensity = 0.3,
  className = '',
}: RandomDotStereogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, sizePx, sizePx)

    // Generate random dots for background
    const numDots = Math.floor(sizePx * sizePx * dotDensity)
    const dots: { x: number; y: number }[] = []
    
    for (let i = 0; i < numDots; i++) {
      dots.push({
        x: Math.random() * sizePx,
        y: Math.random() * sizePx,
      })
    }

    // Define target shape mask (centered)
    const centerX = sizePx / 2
    const centerY = sizePx / 2
    const shapeSize = sizePx * 0.3
    
    const isInShape = (x: number, y: number): boolean => {
      const dx = x - centerX
      const dy = y - centerY
      
      switch (shape) {
        case 'circle':
          return Math.sqrt(dx * dx + dy * dy) <= shapeSize / 2
        case 'square':
          return Math.abs(dx) <= shapeSize / 2 && Math.abs(dy) <= shapeSize / 2
        case 'triangle': {
          // Equilateral triangle pointing up
          const h = shapeSize / 2
          const ty = -h / 2
          if (dy < ty - h) return false
          if (dy > ty + h) return false
          const slope = h / (shapeSize / 2)
          const leftEdge = -(dy - ty) / slope
          const rightEdge = (dy - ty) / slope
          return dx >= leftEdge && dx <= rightEdge
        }
        case 'diamond': {
          // Diamond (square rotated 45°)
          const dist = Math.abs(dx) + Math.abs(dy)
          return dist <= shapeSize / 2
        }
        default:
          return false
      }
    }

    // Render dots with anaglyph offset
    // Red (left eye) - no offset
    // Cyan (right eye) - horizontal offset
    
    dots.forEach(dot => {
      const inShape = isInShape(dot.x, dot.y)
      const offset = inShape ? disparityPx : 0
      
      // Red channel (left eye)
      ctx.fillStyle = '#FF0000'
      ctx.fillRect(dot.x, dot.y, 2, 2)
      
      // Cyan channel (right eye) with disparity
      ctx.fillStyle = '#00FFFF'
      ctx.fillRect(dot.x + offset, dot.y, 2, 2)
    })
  }, [shape, disparityPx, sizePx, dotDensity])

  return (
    <canvas
      ref={canvasRef}
      width={sizePx}
      height={sizePx}
      className={className}
      style={{ border: '2px solid #333' }}
    />
  )
}
