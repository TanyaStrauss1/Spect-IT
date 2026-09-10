/**
 * Clinical Color Vision Screening Test Page
 * 
 * Confusion-line pseudoisochromatic method
 * NOT using copyrighted Ishihara plates - these are confusion-line based screening plates
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'
import {
  createColorVisionTest,
  type ColorPlate,
  type PlateResponse,
} from '@spect-it/cv'

export default function ColorVisionTestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [test] = useState(() => createColorVisionTest())
  const [currentPlateIndex, setCurrentPlateIndex] = useState(-1) // -1 = instructions
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<PlateResponse[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const plates = test.getPlates()
  const currentPlate = plates[currentPlateIndex]

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
    }
  }, [user, router])

  const startTest = () => {
    setCurrentPlateIndex(0)
  }

  const handleSubmit = () => {
    if (!currentPlate || !userInput.trim()) return

    const plateResponse = test.scorePlate(currentPlate, userInput.trim())
    const updatedResponses = [...responses, plateResponse]
    setResponses(updatedResponses)
    setUserInput('')

    if (currentPlateIndex < plates.length - 1) {
      setCurrentPlateIndex(currentPlateIndex + 1)
    } else {
      finishTest(updatedResponses)
    }
  }

  const finishTest = async (finalResponses: PlateResponse[]) => {
    const testResult = test.createResult(finalResponses)
    setResult(testResult)

    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            test_type: 'Color Vision (Clinical)',
            test_data: testResult,
            results: {
              classification: testResult.classification,
              protanScore: testResult.protanScore,
              deutanScore: testResult.deutanScore,
              methodology: testResult.methodology,
            },
          })

        if (error) console.error('Error saving test result:', error)
      } catch (error) {
        console.error('Error saving test result:', error)
      } finally {
        setSaving(false)
      }
    }
  }

  // Instructions
  if (currentPlateIndex === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Color Vision Screening</h1>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-700">
                This test uses confusion-line pseudoisochromatic plates to screen for color vision deficiencies.
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Display Limitations</h3>
                <p className="text-sm text-yellow-800 mb-2">
                  This test depends on accurate color reproduction by your screen. Please ensure:
                </p>
                <ul className="text-sm text-yellow-800 list-disc list-inside space-y-1">
                  {test.getDisplayChecklist().map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                  <li>You will see {plates.length} colored plates</li>
                  <li>Each plate contains a number</li>
                  <li>Type the number you see</li>
                  <li>If you can't see a number, type "0" or "X"</li>
                  <li>Take your time with each plate</li>
                </ul>
              </div>
            </div>

            <button
              onClick={startTest}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-colors"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results
  if (result) {
    const interpretation = test.getInterpretation(result.classification)
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {result.classification === 'NORMAL' ? '✓' : '⚠️'}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
              <p className="text-gray-600">{saving ? 'Saving results...' : 'Results saved'}</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Classification</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  {result.classification.replace('_', ' ')}
                </p>
                <p className="text-sm text-gray-700">{interpretation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Protan Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(result.protanScore * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Red-deficient</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm mb-1">Deutan Score</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(result.deutanScore * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Green-deficient</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Screening Result:</strong> {result.displayWarning}
                </p>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
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

  // Test in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold mb-4">
              Plate {currentPlateIndex + 1} of {plates.length}
            </div>
            <h3 className="text-xl text-gray-600 mb-2">
              What number do you see?
            </h3>
            <p className="text-sm text-gray-500">
              {currentPlate?.description}
            </p>
          </div>

          {/* Simulated Plate */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-64 h-64 rounded-full flex items-center justify-center text-8xl font-bold shadow-lg"
              style={{ 
                backgroundColor: currentPlate?.backgroundColors[0] || '#e0e0e0',
                color: currentPlate?.figureColor || '#666',
              }}
            >
              {currentPlate?.number}
            </div>
          </div>

          {/* Input */}
          <div className="space-y-4 max-w-lg mx-auto">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type the number (or X if you can't see one)"
              className="w-full px-4 py-3 text-xl text-center border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
              onKeyPress={(e) => e.key === 'Enter' && userInput && handleSubmit()}
              autoFocus
            />
            <button
              onClick={handleSubmit}
              disabled={!userInput.trim()}
              className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              Submit Answer
            </button>
          </div>

          {/* Progress */}
          <div className="mt-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{responses.length} / {plates.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(responses.length / plates.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
