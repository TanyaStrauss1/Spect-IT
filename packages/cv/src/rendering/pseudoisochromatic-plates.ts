/**
 * Pseudoisochromatic Plate Renderer
 * 
 * Generates confusion-line based color vision screening plates with dot fields
 * and embedded digits. NOT using copyrighted Ishihara designs - these are 
 * original implementations using confusion-line color science principles.
 * 
 * Confusion lines: Colors that appear similar to color-deficient viewers but
 * different to normal trichromats, or vice versa.
 * 
 * References: 
 * - Birch J. (2001) "Efficiency of the Ishihara test for identifying red-green colour deficiency"
 * - Cole BL. (2004) "The handicap of abnormal colour vision"
 */

export interface PlateConfig {
  id: string
  type: 'control' | 'protan' | 'deutan'
  digit: string // The number visible to normal viewers
  digitForDeficient?: string // Alternative number/path visible to deficient viewers (or null)
  backgroundHues: number[] // HSL hue values for background dots
  digitHues: number[] // HSL hue values for digit dots
  saturation: number // Saturation for all dots (0-100)
  lightness: number // Lightness for all dots (0-100)
  description: string
}

/**
 * Standard confusion-line plate configurations
 * Using HSL color space for precise control over confusion lines
 */
export const PSEUDOISOCHROMATIC_PLATES: PlateConfig[] = [
  // Control plate 1 - Easy for everyone
  {
    id: 'control-1',
    type: 'control',
    digit: '12',
    backgroundHues: [0, 15, 30, 45], // Red-orange range
    digitHues: [180, 195, 210, 225], // Cyan-blue range (opposite)
    saturation: 70,
    lightness: 50,
    description: 'Control plate - all viewers should see 12',
  },
  
  // Protan confusion plates (red-deficient)
  // Protans confuse red/green along specific confusion lines
  {
    id: 'protan-1',
    type: 'protan',
    digit: '6',
    digitForDeficient: null, // Protan may see nothing
    backgroundHues: [25, 35, 45, 55], // Orange-yellow (background)
    digitHues: [0, 10, 350, 340], // Red (digit) - confuses with background for protans
    saturation: 60,
    lightness: 55,
    description: 'Protan test - protanopes may miss 6',
  },
  {
    id: 'protan-2',
    type: 'protan',
    digit: '8',
    digitForDeficient: '3', // Protan may see 3 instead
    backgroundHues: [80, 90, 100, 110], // Yellow-green
    digitHues: [0, 10, 350, 5], // Red - creates different pattern for protans
    saturation: 65,
    lightness: 50,
    description: 'Protan test - protanopes may see 3 instead of 8',
  },
  {
    id: 'protan-3',
    type: 'protan',
    digit: '45',
    digitForDeficient: null,
    backgroundHues: [30, 40, 50, 60], // Orange-yellow range
    digitHues: [355, 5, 15, 25], // Red-orange confusion
    saturation: 70,
    lightness: 52,
    description: 'Protan test - protanopes may miss 45',
  },
  
  // Deutan confusion plates (green-deficient)
  // Deutans confuse red/green along different confusion lines than protans
  {
    id: 'deutan-1',
    type: 'deutan',
    digit: '3',
    digitForDeficient: null,
    backgroundHues: [50, 60, 70, 80], // Yellow-green
    digitHues: [120, 130, 140, 150], // Green - confuses for deutans
    saturation: 65,
    lightness: 48,
    description: 'Deutan test - deuteranopes may miss 3',
  },
  {
    id: 'deutan-2',
    type: 'deutan',
    digit: '5',
    digitForDeficient: '2',
    backgroundHues: [20, 30, 40, 50], // Orange-yellow
    digitHues: [110, 120, 130, 140], // Green-yellow confusion
    saturation: 70,
    lightness: 50,
    description: 'Deutan test - deuteranopes may see 2 instead of 5',
  },
  {
    id: 'deutan-3',
    type: 'deutan',
    digit: '74',
    digitForDeficient: null,
    backgroundHues: [35, 45, 55, 65], // Yellow range
    digitHues: [95, 105, 115, 125], // Green-yellow confusion
    saturation: 68,
    lightness: 51,
    description: 'Deutan test - deuteranopes may miss 74',
  },
  
  // Control plate 2 - Verification
  {
    id: 'control-2',
    type: 'control',
    digit: '9',
    backgroundHues: [200, 210, 220, 230], // Blue range
    digitHues: [30, 40, 50, 60], // Orange range (opposite)
    saturation: 65,
    lightness: 52,
    description: 'Control plate - all viewers should see 9',
  },
]

/**
 * Dot position and color
 */
export interface ColorDot {
  x: number // 0-1 normalized position
  y: number // 0-1 normalized position
  hue: number // HSL hue (0-360)
  saturation: number // HSL saturation (0-100)
  lightness: number // HSL lightness (0-100)
  radius: number // Relative radius (0-1)
}

/**
 * Digit path data - defines which dots belong to the digit
 * Using a simple grid-based system for digit rendering
 */
const DIGIT_PATHS: Record<string, boolean[][]> = {
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '2': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,1,1,1,1],
  ],
  '3': [
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  '5': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  '6': [
    [0,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '8': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '9': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
  ],
}

// Composite digits (rendered side by side)
function getDigitPath(digit: string): boolean[][] {
  if (digit.length === 1 && digit in DIGIT_PATHS) {
    return DIGIT_PATHS[digit]
  }
  
  // For multi-digit numbers (e.g., "12", "45"), render side by side
  if (digit.length === 2) {
    const d1 = DIGIT_PATHS[digit[0]]
    const d2 = DIGIT_PATHS[digit[1]]
    if (d1 && d2) {
      return d1.map((row, i) => [...row, false, ...d2[i]]) // Add gap between digits
    }
  }
  
  // Default: empty path
  return Array(7).fill(null).map(() => Array(5).fill(false))
}

/**
 * Generate dots for a pseudoisochromatic plate
 */
export function generatePlateDots(
  config: PlateConfig,
  plateDiameterPx: number = 400,
  dotsCount: number = 2000
): ColorDot[] {
  const dots: ColorDot[] = []
  const random = createSeededRandom(config.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0))
  
  // Get digit path
  const digitPath = getDigitPath(config.digit)
  const pathRows = digitPath.length
  const pathCols = digitPath[0]?.length || 0
  
  // Generate dots
  for (let i = 0; i < dotsCount; i++) {
    // Random position in unit circle
    let x, y, distFromCenter
    do {
      x = random() * 2 - 1 // -1 to 1
      y = random() * 2 - 1
      distFromCenter = Math.sqrt(x * x + y * y)
    } while (distFromCenter > 1) // Reject if outside circle
    
    // Normalize to 0-1 range for the circle
    x = (x + 1) / 2
    y = (y + 1) / 2
    
    // Check if dot is part of digit
    const pathX = Math.floor(x * pathCols)
    const pathY = Math.floor(y * pathRows)
    const isInDigit = digitPath[pathY]?.[pathX] || false
    
    // Select hue from appropriate set
    const hues = isInDigit ? config.digitHues : config.backgroundHues
    const hue = hues[Math.floor(random() * hues.length)]
    
    // Vary lightness and saturation slightly for natural appearance
    const satVariation = (random() - 0.5) * 10
    const lightVariation = (random() - 0.5) * 10
    
    // Vary dot size
    const radius = 0.008 + random() * 0.012 // 0.8-2.0% of diameter
    
    dots.push({
      x,
      y,
      hue,
      saturation: Math.max(0, Math.min(100, config.saturation + satVariation)),
      lightness: Math.max(0, Math.min(100, config.lightness + lightVariation)),
      radius,
    })
  }
  
  return dots
}

/**
 * Seeded random number generator for reproducible dot patterns
 */
function createSeededRandom(seed: number): () => number {
  let state = seed
  return function() {
    state = (state * 9301 + 49297) % 233280
    return state / 233280
  }
}

/**
 * Render dots to SVG
 */
export function renderPlateToSVG(
  dots: ColorDot[],
  diameterPx: number = 400
): string {
  const radius = diameterPx / 2
  
  const circles = dots
    .map(dot => {
      const cx = dot.x * diameterPx
      const cy = dot.y * diameterPx
      const r = dot.radius * diameterPx
      const fill = `hsl(${dot.hue}, ${dot.saturation}%, ${dot.lightness}%)`
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" />`
    })
    .join('\n  ')
  
  return `<svg width="${diameterPx}" height="${diameterPx}" viewBox="0 0 ${diameterPx} ${diameterPx}" xmlns="http://www.w3.org/2000/svg">
  <clipPath id="plateClip">
    <circle cx="${radius}" cy="${radius}" r="${radius}" />
  </clipPath>
  <g clip-path="url(#plateClip)">
    ${circles}
  </g>
</svg>`
}

/**
 * Render dots to Canvas
 */
export function renderPlateToCanvas(
  ctx: CanvasRenderingContext2D,
  dots: ColorDot[],
  diameterPx: number = 400
): void {
  const radius = diameterPx / 2
  
  // Clip to circle
  ctx.save()
  ctx.beginPath()
  ctx.arc(radius, radius, radius, 0, Math.PI * 2)
  ctx.clip()
  
  // Render dots
  for (const dot of dots) {
    const cx = dot.x * diameterPx
    const cy = dot.y * diameterPx
    const r = dot.radius * diameterPx
    
    ctx.fillStyle = `hsl(${dot.hue}, ${dot.saturation}%, ${dot.lightness}%)`
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
  
  ctx.restore()
}
