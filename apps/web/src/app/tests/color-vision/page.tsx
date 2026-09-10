/**
 * Color Vision Screening Test Page
 * 
 * Uses generated pseudoisochromatic plates (Ishihara-style)
 * NOT using copyrighted Ishihara plates - these are original generated plates
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

// Plate configuration for the test
interface ColorPlate {
  id: number
  correctAnswer: string
  type: 'normal' | 'protanopia' | 'deuteranopia' | 'control'
  description: string
}

const testPlates: ColorPlate[] = [
  { id: 1, correctAnswer: '12', type: 'control', description: 'Control plate - visible to all' },
  { id: 2, correctAnswer: '8', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 3, correctAnswer: '6', type: 'protanopia', description: 'Protan deficiency screening' },
  { id: 4, correctAnswer: '45', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 5, correctAnswer: '5', type: 'deuteranopia', description: 'Deutan deficiency screening' },
  { id: 6, correctAnswer: '73', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 7, correctAnswer: '2', type: 'normal', description: 'Red-green deficiency screening' },
  { id: 8, correctAnswer: '16', type: 'control', description: 'Control plate - visible to all' },
]

export default function ColorVisionTestPage() {
  const [currentPlate, setCurrentPlate] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [instructions, setInstructions] = useState(true)
  
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, router])

  const startTest = () => {
    setInstructions(false)
  }

  const handleSubmit = () => {
    const plate = testPlates[currentPlate]
    const isCorrect = userInput.trim() === plate.correctAnswer
    
    const newResponses = [...responses, {
      plateId: plate.id,
      correctAnswer: plate.correctAnswer,
      userAnswer: userInput.trim(),
      correct: isCorrect,
      type: plate.type
    }]
    setResponses(newResponses)
    setUserInput('')

    if (currentPlate < testPlates.length - 1) {
      setCurrentPlate(currentPlate + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const handleCannotSee = () => {
    const plate = testPlates[currentPlate]
    
    const newResponses = [...responses, {
      plateId: plate.id,
      correctAnswer: plate.correctAnswer,
      userAnswer: 'CANNOT_SEE',
      correct: false,
      type: plate.type
    }]
    setResponses(newResponses)
    setUserInput('')

    if (currentPlate < testPlates.length - 1) {
      setCurrentPlate(currentPlate + 1)
    } else {
      finishTest(newResponses)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    // Analyze results
    const controlCorrect = finalResponses.filter(r => r.type === 'control' && r.correct).length
    const controlTotal = finalResponses.filter(r => r.type === 'control').length
    const normalCorrect = finalResponses.filter(r => r.type === 'normal' && r.correct).length
    const normalTotal = finalResponses.filter(r => r.type === 'normal').length
    const totalCorrect = finalResponses.filter(r => r.correct).length
    
    // Determine screening result
    let screeningResult = 'Normal color vision'
    let recommendations = 'Your color vision appears normal based on this screening.'
    
    if (controlCorrect < controlTotal) {
      screeningResult = 'Test inconclusive'
      recommendations = 'Control plates were not read correctly. This may indicate difficulty with the test format rather than color vision deficiency. Please consult an eye care professional.'
    } else if (normalCorrect === 0) {
      screeningResult = 'Possible red-green color vision deficiency detected'
      recommendations = 'This screening suggests you may have difficulty distinguishing red and green colors. Please consult an eye care professional for comprehensive testing.'
    } else if (normalCorrect < normalTotal / 2) {
      screeningResult = 'Possible color vision deficiency detected'
      recommendations = 'This screening suggests you may have some difficulty with color discrimination. Please consult an eye care professional for comprehensive testing.'
    }

    const testResult = {
      screeningResult,
      recommendations,
      platesCorrect: totalCorrect,
      platesTotal: finalResponses.length,
      controlPlatesCorrect: controlCorrect,
      normalPlatesCorrect: normalCorrect,
      responses: finalResponses
    }

    setResult(testResult)

    // Save to Supabase
    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            user_email: user.email,
            test_type: 'Color Vision',
            test_name: 'Pseudoisochromatic Plate Test',
            test_data: testResult,
            score: totalCorrect,
            test_date: new Date().toISOString(),
          })

        if (error) {
          console.error('Error saving test result:', error)
        }
      } catch (error) {
        console.error('Error saving test result:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  if (instructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎨</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Color Vision Screening</h1>
              <p className="text-gray-600">Test your ability to distinguish colors</p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                <p className="text-sm text-blue-800 mb-2">
                  This is a <strong>screening test</strong>, not a diagnostic tool. It uses generated 
                  pseudoisochromatic plates similar to Ishihara plates.
                </p>
                <p className="text-sm text-blue-800">
                  Results should be confirmed by an eye care professional using standardized clinical tests.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li>Ensure you're in good lighting conditions</li>
                  <li>Remove any tinted glasses (clear glasses are fine)</li>
                  <li>Look at each plate and identify the number you see</li>
                  <li>Type the number(s) you see, or click "Cannot See" if you cannot identify a number</li>
                  <li>You'll see 8 plates in total</li>
                  <li>Take your time with each plate</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">Test Environment</h3>
                <p className="text-sm text-yellow-800">
                  For best results, take this test on a device with good color accuracy. 
                  Results may vary on different screens or in poor lighting.
                </p>
              </div>

              <button
                onClick={startTest}
                className="w-full bg-purple-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors text-lg"
              >
                Begin Test
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Screening Complete!</h2>
              <p className="text-gray-600">{saving ? 'Saving results...' : 'Results saved'}</p>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2 text-center">Screening Result</p>
                <p className="text-2xl font-bold text-purple-600 text-center">{result.screeningResult}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Plates Correct</p>
                  <p className="text-3xl font-bold text-gray-900">{result.platesCorrect}/{result.platesTotal}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Control Plates</p>
                  <p className="text-3xl font-bold text-gray-900">{result.controlPlatesCorrect}/2</p>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-2">Recommendations</h3>
                <p className="text-sm text-purple-800">{result.recommendations}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> This is a screening result, not a medical diagnosis. 
                  Color vision deficiency can only be definitively diagnosed by a qualified eye care 
                  professional using standardized clinical tests. If you have concerns, please consult 
                  an optometrist or ophthalmologist.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                View Dashboard
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const plate = testPlates[currentPlate]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-semibold mb-4">
              Plate {currentPlate + 1} of {testPlates.length}
            </div>
            <h3 className="text-xl text-gray-600 mb-2">What number do you see?</h3>
          </div>

          <div className="flex justify-center mb-8">
            <ColorPlateVisualization 
              plateId={plate.id}
              number={plate.correctAnswer}
              type={plate.type}
            />
          </div>
          
          <div className="space-y-4 max-w-lg mx-auto">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter the number you see"
              className="w-full px-4 py-3 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && userInput && handleSubmit()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={!userInput}
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
              <button
                onClick={handleCannotSee}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cannot See
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Press Enter to submit
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{responses.length} / {testPlates.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(responses.length / testPlates.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * ColorPlateVisualization Component
 * Generates pseudoisochromatic plates using SVG
 * These are NOT copyrighted Ishihara plates - they are original generated plates
 */
interface ColorPlateVisualizationProps {
  plateId: number
  number: string
  type: 'normal' | 'protanopia' | 'deuteranopia' | 'control'
}

function ColorPlateVisualization({ plateId, number, type }: ColorPlateVisualizationProps) {
  const size = 400
  const circleRadius = 8
  const seed = plateId * 1000

  // Generate deterministic random number based on seed
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index) * 10000
    return x - Math.floor(x)
  }

  // Color palettes for different deficiency types
  const getColorPalette = () => {
    switch (type) {
      case 'control':
        // High contrast - visible to everyone
        return {
          numberColors: ['#FF0000', '#D40000', '#FF2020'],
          backgroundColors: ['#00AA00', '#00CC00', '#00DD00', '#009900']
        }
      case 'protanopia':
        // Red deficiency screening
        return {
          numberColors: ['#CC6600', '#DD7700', '#EE8800'],
          backgroundColors: ['#88AA00', '#99BB00', '#77AA22', '#668811']
        }
      case 'deuteranopia':
        // Green deficiency screening
        return {
          numberColors: ['#DD6644', '#CC5533', '#EE7755'],
          backgroundColors: ['#88AA66', '#99BB77', '#77AA55', '#6699AA']
        }
      case 'normal':
      default:
        // General red-green screening
        return {
          numberColors: ['#DD5500', '#CC4400', '#EE6600'],
          backgroundColors: ['#88BB44', '#99CC55', '#77AA33', '#669922']
        }
    }
  }

  const palette = getColorPalette()

  // Generate circles for the plate
  const circles: JSX.Element[] = []
  const numCircles = 400
  
  // Define the number path (simplified digit paths)
  const isPartOfNumber = (x: number, y: number) => {
    const centerX = size / 2
    const centerY = size / 2
    const relX = (x - centerX) / 30
    const relY = (y - centerY) / 30

    // Simple number patterns
    if (number === '12') {
      // "1"
      if (relX >= -3 && relX <= -1 && relY >= -2.5 && relY <= 2.5) return true
      // "2"
      if (relX >= 0.5 && relX <= 3 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
    } else if (number === '8') {
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if ((Math.abs(relX) >= 1.5 && Math.abs(relX) <= 2.5) && 
          Math.abs(relY) <= 2.5) return true
    } else if (number === '6') {
      if ((Math.abs(relX) >= 1.5 && Math.abs(relX) <= 2.5) && relY <= 2.5) return true
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
    } else if (number === '45') {
      // "4"
      if (relX >= -3.5 && relX <= -2 && relY >= -2.5 && relY <= 0) return true
      if (relX >= -3.5 && relX <= -1 && relY >= -0.5 && relY <= 0.5) return true
      if (relX >= -2.5 && relX <= -1.5 && relY >= -2.5 && relY <= 2.5) return true
      // "5"
      if (relX >= 0.5 && relX <= 3 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= 0.5 && relX <= 1.5 && relY >= -2.5 && relY <= 0) return true
      if (relX >= 2 && relX <= 3 && relY >= 0 && relY <= 2.5) return true
    } else if (number === '5') {
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= -2 && relX <= -1 && relY >= -2.5 && relY <= 0) return true
      if (relX >= 1 && relX <= 2 && relY >= 0 && relY <= 2.5) return true
    } else if (number === '73') {
      // "7"
      if (relX >= -3.5 && relX <= -1 && relY >= -2.5 && relY <= -1.5) return true
      if (relX >= -2.5 && relX <= -1.5 && relY >= -2.5 && relY <= 2.5) return true
      // "3"
      if (relX >= 0.5 && relX <= 3 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= 2 && relX <= 3 && Math.abs(relY) <= 2.5) return true
    } else if (number === '2') {
      if (Math.abs(relX) <= 2 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
      if (relX >= 1 && relX <= 2 && relY >= -2.5 && relY <= 0) return true
      if (relX >= -2 && relX <= -1 && relY >= 0 && relY <= 2.5) return true
    } else if (number === '16') {
      // "1"
      if (relX >= -3 && relX <= -1 && relY >= -2.5 && relY <= 2.5) return true
      // "6"
      if ((Math.abs(relX - 1.5) >= 1 && Math.abs(relX - 1.5) <= 2) && relY <= 2.5) return true
      if (Math.abs(relX - 1.5) <= 1.5 && 
          ((relY >= -2.5 && relY <= -1.5) || 
           (relY >= -0.5 && relY <= 0.5) || 
           (relY >= 1.5 && relY <= 2.5))) return true
    }

    return false
  }

  for (let i = 0; i < numCircles; i++) {
    const angle = seededRandom(i * 2) * Math.PI * 2
    const radius = Math.sqrt(seededRandom(i * 2 + 1)) * (size * 0.45)
    const cx = size / 2 + Math.cos(angle) * radius
    const cy = size / 2 + Math.sin(angle) * radius
    
    const inNumber = isPartOfNumber(cx, cy)
    const colors = inNumber ? palette.numberColors : palette.backgroundColors
    const color = colors[Math.floor(seededRandom(i * 3) * colors.length)]
    const r = circleRadius * (0.7 + seededRandom(i * 4) * 0.6)
    
    circles.push(
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        opacity={0.8 + seededRandom(i * 5) * 0.2}
      />
    )
  }

  return (
    <div className="relative">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-full shadow-lg">
        <circle cx={size/2} cy={size/2} r={size/2} fill="#F5F5DC" />
        {circles}
      </svg>
      <div className="mt-4 text-center text-sm text-gray-500">
        Generated pseudoisochromatic plate (not copyrighted Ishihara)
      </div>
    </div>
  )
}
