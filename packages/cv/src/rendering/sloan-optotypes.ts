/**
 * Sloan Optotype Geometry Renderer
 * 
 * Renders proper 5×5 grid-based Sloan letters with correct stroke width and gap geometry.
 * Each letter is constructed from strokes that maintain the critical 1:1:1 ratio
 * (stroke width : gap width : letter unit).
 * 
 * At 0.0 logMAR (6/6, 20/20), stroke width subtends 5 arc minutes at the viewing distance.
 * 
 * Reference: British Standard BS 4274-1:2003, ISO 8596:2017
 */

export type SloanLetter = 'C' | 'D' | 'H' | 'K' | 'N' | 'O' | 'R' | 'S' | 'V' | 'Z'

/**
 * Stroke segment: a rectangular element of a letter
 */
export interface StrokeSegment {
  x: number // Grid units (0-5)
  y: number // Grid units (0-5)
  width: number // Grid units
  height: number // Grid units
}

/**
 * Sloan letter geometry definition
 * Each letter is defined as a collection of stroke segments on a 5×5 grid
 * where 1 grid unit = stroke width = gap width
 */
export const SLOAN_GEOMETRIES: Record<SloanLetter, StrokeSegment[]> = {
  C: [
    // Top horizontal
    { x: 1, y: 0, width: 3, height: 1 },
    // Left vertical
    { x: 0, y: 0, width: 1, height: 5 },
    // Bottom horizontal
    { x: 1, y: 4, width: 3, height: 1 },
  ],
  
  D: [
    // Left vertical
    { x: 0, y: 0, width: 1, height: 5 },
    // Top horizontal
    { x: 1, y: 0, width: 3, height: 1 },
    // Right vertical (partial)
    { x: 4, y: 1, width: 1, height: 3 },
    // Bottom horizontal
    { x: 1, y: 4, width: 3, height: 1 },
  ],
  
  H: [
    // Left vertical
    { x: 0, y: 0, width: 1, height: 5 },
    // Middle horizontal
    { x: 1, y: 2, width: 3, height: 1 },
    // Right vertical
    { x: 4, y: 0, width: 1, height: 5 },
  ],
  
  K: [
    // Left vertical
    { x: 0, y: 0, width: 1, height: 5 },
    // Upper right diagonal (approximated with rectangles)
    { x: 1, y: 1, width: 1, height: 1 },
    { x: 2, y: 0, width: 1, height: 1 },
    { x: 3, y: 0, width: 2, height: 1 },
    // Middle connection
    { x: 1, y: 2, width: 2, height: 1 },
    // Lower right diagonal
    { x: 2, y: 3, width: 1, height: 1 },
    { x: 3, y: 4, width: 2, height: 1 },
  ],
  
  N: [
    // Left vertical
    { x: 0, y: 0, width: 1, height: 5 },
    // Diagonal strokes (approximated)
    { x: 1, y: 1, width: 1, height: 1 },
    { x: 2, y: 2, width: 1, height: 1 },
    { x: 3, y: 3, width: 1, height: 1 },
    // Right vertical
    { x: 4, y: 0, width: 1, height: 5 },
  ],
  
  O: [
    // Top horizontal
    { x: 1, y: 0, width: 3, height: 1 },
    // Left vertical
    { x: 0, y: 1, width: 1, height: 3 },
    // Right vertical
    { x: 4, y: 1, width: 1, height: 3 },
    // Bottom horizontal
    { x: 1, y: 4, width: 3, height: 1 },
  ],
  
  R: [
    // Left vertical
    { x: 0, y: 0, width: 1, height: 5 },
    // Top horizontal
    { x: 1, y: 0, width: 3, height: 1 },
    // Right vertical (upper)
    { x: 4, y: 1, width: 1, height: 1 },
    // Middle horizontal
    { x: 1, y: 2, width: 3, height: 1 },
    // Lower right leg
    { x: 2, y: 3, width: 1, height: 1 },
    { x: 3, y: 4, width: 2, height: 1 },
  ],
  
  S: [
    // Top horizontal
    { x: 1, y: 0, width: 4, height: 1 },
    // Upper left
    { x: 0, y: 1, width: 1, height: 1 },
    // Middle horizontal
    { x: 1, y: 2, width: 3, height: 1 },
    // Lower right
    { x: 4, y: 3, width: 1, height: 1 },
    // Bottom horizontal
    { x: 0, y: 4, width: 4, height: 1 },
  ],
  
  V: [
    // Left upper diagonal
    { x: 0, y: 0, width: 1, height: 2 },
    { x: 1, y: 2, width: 1, height: 2 },
    // Right upper diagonal  
    { x: 4, y: 0, width: 1, height: 2 },
    { x: 3, y: 2, width: 1, height: 2 },
    // Bottom center
    { x: 2, y: 4, width: 1, height: 1 },
  ],
  
  Z: [
    // Top horizontal
    { x: 0, y: 0, width: 5, height: 1 },
    // Diagonal (approximated)
    { x: 3, y: 1, width: 1, height: 1 },
    { x: 2, y: 2, width: 1, height: 1 },
    { x: 1, y: 3, width: 1, height: 1 },
    // Bottom horizontal
    { x: 0, y: 4, width: 5, height: 1 },
  ],
}

/**
 * Generate SVG path data for a Sloan letter
 * @param letter The Sloan letter to render
 * @param gridSize Size of one grid unit in SVG units (typically stroke width in pixels)
 * @returns SVG path data string
 */
export function generateSloanSVGPath(letter: SloanLetter, gridSize: number = 20): string {
  const segments = SLOAN_GEOMETRIES[letter]
  
  const rects = segments.map(seg => {
    const x = seg.x * gridSize
    const y = seg.y * gridSize
    const w = seg.width * gridSize
    const h = seg.height * gridSize
    return `M${x},${y} h${w} v${h} h${-w} z`
  })
  
  return rects.join(' ')
}

/**
 * Generate complete SVG element for a Sloan letter
 * @param letter The Sloan letter to render
 * @param strokeWidthPx The desired stroke width in pixels (determines overall size)
 * @param color Fill color (default black)
 * @returns Complete SVG string
 */
export function generateSloanSVG(
  letter: SloanLetter, 
  strokeWidthPx: number,
  color: string = '#000000'
): string {
  // Letter is 5 grid units, where 1 unit = stroke width
  const totalSize = strokeWidthPx * 5
  const path = generateSloanSVGPath(letter, strokeWidthPx)
  
  return `<svg width="${totalSize}" height="${totalSize}" viewBox="0 0 ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">
  <path d="${path}" fill="${color}" />
</svg>`
}

/**
 * Render Sloan letter to canvas
 * @param ctx Canvas 2D context
 * @param letter The Sloan letter to render
 * @param x X position (top-left)
 * @param y Y position (top-left)
 * @param strokeWidthPx Stroke width in pixels
 * @param color Fill color (default black)
 */
export function renderSloanToCanvas(
  ctx: CanvasRenderingContext2D,
  letter: SloanLetter,
  x: number,
  y: number,
  strokeWidthPx: number,
  color: string = '#000000'
): void {
  const segments = SLOAN_GEOMETRIES[letter]
  
  ctx.fillStyle = color
  
  for (const seg of segments) {
    const rectX = x + seg.x * strokeWidthPx
    const rectY = y + seg.y * strokeWidthPx
    const rectW = seg.width * strokeWidthPx
    const rectH = seg.height * strokeWidthPx
    
    ctx.fillRect(rectX, rectY, rectW, rectH)
  }
}

/**
 * Calculate stroke width in pixels for a given logMAR at calibrated viewing conditions
 * @param logMAR The logMAR size to render
 * @param pxPerMm Pixels per millimeter (from calibration)
 * @param distanceMm Viewing distance in millimeters
 * @returns Stroke width in pixels
 * 
 * At 0.0 logMAR, stroke width should subtend 5 arc minutes (1/12 of a degree)
 * Letter height is 5x stroke width, so it subtends 25 arc minutes (5/12 of a degree)
 */
export function calculateSloanStrokeWidth(
  logMAR: number,
  pxPerMm: number,
  distanceMm: number
): number {
  // At logMAR 0.0, stroke width = 5 arc minutes = 5/60 degrees = 0.0833 degrees
  const arcMinAt0 = 5
  const arcMinAtLogMAR = arcMinAt0 * Math.pow(10, logMAR)
  
  // Convert arc minutes to radians
  const angleRad = (arcMinAtLogMAR / 60) * (Math.PI / 180)
  
  // Calculate physical size at viewing distance using small angle approximation
  const strokeWidthMm = Math.tan(angleRad) * distanceMm
  
  // Convert to pixels
  const strokeWidthPx = strokeWidthMm * pxPerMm
  
  return Math.max(1, Math.round(strokeWidthPx)) // Minimum 1px for visibility
}

/**
 * Get the total letter size (5x stroke width) for a given logMAR
 */
export function calculateSloanLetterSize(
  logMAR: number,
  pxPerMm: number,
  distanceMm: number
): number {
  const strokeWidth = calculateSloanStrokeWidth(logMAR, pxPerMm, distanceMm)
  return strokeWidth * 5
}

/**
 * Validate that a letter is a valid Sloan letter
 */
export function isSloanLetter(letter: string): letter is SloanLetter {
  return letter in SLOAN_GEOMETRIES
}

/**
 * Get all valid Sloan letters
 */
export function getSloanLetters(): SloanLetter[] {
  return Object.keys(SLOAN_GEOMETRIES) as SloanLetter[]
}
