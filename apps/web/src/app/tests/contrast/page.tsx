/**
 * Contrast Sensitivity Test Page
 * Uses graded contrast letters (Pelli-Robson style)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { supabase } from '@/lib/supabase'

// Contrast levels from high to low (1.0 = black, 0.05 = very light gray)
const contrastLevels = [
  { level: 1, contrast: 1.0, name: '100%' },
  { level: 2, contrast: 0.75, name: '75%' },
  { level: 3, contrast: 0.50, name: '50%' },
  { level: 4, contrast: 0.35, name: '35%' },
  { level: 5, contrast: 0.25, name: '25%' },
  { level: 6, contrast: 0.15, name: '15%' },
  { level: 7, contrast: 0.10, name: '10%' },
  { level: 8, contrast: 0.05, name: '5%' },
]

const letters = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z']

export default function ContrastTestPage() {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro')
  const [currentLevel, setCurrentLevel] = useState(0)
  const [targetLetter, setTargetLetter] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin')
      return
    }
  }, [user, router])

  useEffect(() => {
    if (step === 'test') {
      generateNewLetter()
    }
  }, [step, currentLevel])

  const generateNewLetter = () => {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)]
    setTargetLetter(randomLetter)
  }

  const handleLetterSelect = (selectedLetter: string) => {
    const isCorrect = selectedLetter === targetLetter
    const newResponse = {
      level: currentLevel + 1,
      contrast: contrastLevels[currentLevel].contrast,
      targetLetter,
      selectedLetter,
      correct: isCorrect
    }

    const newResponses = [...responses, newResponse]
    setResponses(newResponses)

    if (!isCorrect || currentLevel >= contrastLevels.length - 1) {
      finishTest(newResponses)
    } else {
      setCurrentLevel(currentLevel + 1)
    }
  }

  const finishTest = async (finalResponses: any[]) => {
    // Find the lowest contrast level successfully identified
    const correctResponses = finalResponses.filter(r => r.correct)
    const lowestContrastLevel = correctResponses.length > 0 
      ? Math.max(...correctResponses.map(r => r.level))
      : 0

    const lowestContrast = correctResponses.length > 0
      ? Math.min(...correctResponses.map(r => r.contrast))
      : 1.0

    // Calculate score and assessment
    let assessment = ''
    if (lowestContrastLevel >= 7) {
      assessment = 'Excellent contrast sensitivity'
    } else if (lowestContrastLevel >= 5) {
      assessment = 'Good contrast sensitivity'
    } else if (lowestContrastLevel >= 3) {
      assessment = 'Fair contrast sensitivity'
    } else {
      assessment = 'Reduced contrast sensitivity - consult an eye care professional'
    }

    const testResult = {
      lowestContrastLevel,
      lowestContrast,
      assessment,
      correctCount: correctResponses.length,
      totalCount: finalResponses.length,
      responses: finalResponses
    }

    setResult(testResult)
    setStep('result')

    // Save to Supabase
    if (user) {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('test_results')
          .insert({
            user_id: user.id,
            user_email: user.email,
            test_type: 'Contrast Sensitivity',
            test_name: 'Graded Contrast Letters',
            test_data: testResult,
            score: lowestContrastLevel,
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

  const getLetterColor = (contrast: number) => {
    const grayValue = Math.round(255 * (1 - contrast))
    return `rgb(${grayValue}, ${grayValue}, ${grayValue})`
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🌓</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Contrast Sensitivity Test</h1>
              <p className="text-gray-600">Graded Contrast Letter Recognition</p>
            </div>

            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">What is this test?</h3>
                <p>
                  This test measures your ability to distinguish letters with decreasing contrast 
                  against the background. Good contrast sensitivity is important for activities 
                  like driving at night or in fog.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>A letter will appear in the center of the screen</li>
                  <li>The contrast will decrease progressively with each level</li>
                  <li>Identify the letter by clicking on the correct option below</li>
                  <li>The test ends when you make an incorrect identification</li>
                  <li>Try to read as many levels as possible</li>
                </ol>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> Take the test in good, even lighting. 
                  Adjust your screen brightness to a comfortable level before starting.
                  Sit about 2 feet (60cm) from your screen.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Screening Notice:</strong> This is a screening tool, not a diagnostic test. 
                  Results do not constitute a medical diagnosis. Please consult an eye care professional 
                  for a comprehensive eye examination.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('test')}
              className="w-full mt-8 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-lg"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'test') {
    const currentContrast = contrastLevels[currentLevel]
    const letterColor = getLetterColor(currentContrast.contrast)

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-block bg-indigo-100 text-indigo-600 px-4 py-2 rounded-full font-semibold mb-4">
                Level {currentLevel + 1} of {contrastLevels.length} - Contrast: {currentContrast.name}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Identify the letter
              </h2>
              <p className="text-gray-600">
                Click on the letter you see
              </p>
            </div>

            {/* Letter Display */}
            <div 
              className="bg-white border-4 border-gray-200 rounded-lg mb-8 flex items-center justify-center"
              style={{ height: '300px' }}
            >
              <div 
                className="font-bold select-none"
                style={{ 
                  fontSize: '120px',
                  color: letterColor,
                  fontFamily: 'monospace'
                }}
              >
                {targetLetter}
              </div>
            </div>

            {/* Letter Options */}
            <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto mb-6">
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => handleLetterSelect(letter)}
                  className="py-4 px-6 bg-gray-100 hover:bg-indigo-100 rounded-lg font-bold text-2xl text-gray-800 hover:text-indigo-600 transition-colors"
                >
                  {letter}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{responses.length} correct</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentLevel + 1) / contrastLevels.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results view
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            <p className="text-gray-600">Your results have been {saving ? 'saving...' : 'saved'}</p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 text-center">
              <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">Assessment</p>
              <p className="text-2xl font-bold text-indigo-600">{result.assessment}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Lowest Contrast Level</p>
                <p className="text-3xl font-semibold text-gray-900">{result.lowestContrastLevel}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(result.lowestContrast * 100)}% contrast
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 text-sm mb-1">Correct Identifications</p>
                <p className="text-3xl font-semibold text-gray-900">
                  {result.correctCount}/{result.totalCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round((result.correctCount / result.totalCount) * 100)}% accuracy
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a screening result, not a medical diagnosis. 
                Contrast sensitivity can be affected by various factors including lighting, 
                screen quality, and eye conditions. Please consult an eye care professional 
                for a comprehensive evaluation.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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
