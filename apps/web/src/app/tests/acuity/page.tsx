/**
 * Visual Acuity Test Page
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { LiDARDetector, DistanceCalibrator, EyeLandmarkDetector } from '@spect-it/cv'
import { AcuityScorer } from '@spect-it/models'
import { Button, Card, CardContent } from '@spect-it/ui'

export default function AcuityTestPage() {
  const [distance, setDistance] = useState<number | null>(null)
  const [isCalibrated, setIsCalibrated] = useState(false)
  const [currentLine, setCurrentLine] = useState(1)
  const [userInput, setUserInput] = useState('')
  const [responses, setResponses] = useState<any[]>([])
  const [result, setResult] = useState<any>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const lidarRef = useRef<LiDARDetector | null>(null)
  const calibratorRef = useRef<DistanceCalibrator | null>(null)
  const scorerRef = useRef<AcuityScorer>(new AcuityScorer())

  useEffect(() => {
    initializeTest()
    return () => {
      lidarRef.current?.stop()
    }
  }, [])

  const initializeTest = async () => {
    // Initialize LiDAR
    const lidar = new LiDARDetector({
      minDistance: 0.5,
      maxDistance: 5.0,
      updateRate: 30
    })
    
    await lidar.initialize()
    lidarRef.current = lidar

    // Initialize calibrator
    const calibrator = new DistanceCalibrator()
    calibrator.setTargetDistance(2.0, 0.1) // 2m target, 10cm tolerance
    calibratorRef.current = calibrator

    // Start distance measurement
    lidar.start((reading) => {
      const calibration = calibrator.calibrate(reading, null)
      setDistance(reading.distance)
      setIsCalibrated(calibration.isStable)
    })

    // Initialize camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }

  const handleSubmit = () => {
    const correctLetters = scorerRef.current.generateLineLetters(currentLine, 'snellen')
    const isCorrect = scorerRef.current.validateResponse(userInput, correctLetters)

    setResponses([...responses, {
      line: currentLine,
      letters: correctLetters,
      userInput,
      correct: isCorrect
    }])

    if (isCorrect && currentLine < 11) {
      setCurrentLine(currentLine + 1)
      setUserInput('')
    } else {
      finishTest()
    }
  }

  const finishTest = () => {
    const testData = {
      distance: distance || 2.0,
      responses,
      chartType: 'snellen' as const
    }

    const result = scorerRef.current.calculate(testData)
    setResult(result)

    // Save to Supabase
    // TODO: Implement
  }

  if (result) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Test Complete!</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600">Snellen Acuity</p>
                <p className="text-4xl font-bold text-[#667eea]">{result.snellen}</p>
              </div>
              <div>
                <p className="text-gray-600">Decimal Acuity</p>
                <p className="text-2xl font-semibold">{result.decimal}</p>
              </div>
              <div>
                <p className="text-gray-600">LogMAR</p>
                <p className="text-2xl font-semibold">{result.logMAR}</p>
              </div>
            </div>
            <div className="mt-6">
              <Button onClick={() => window.location.href = '/'}>
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Distance Calibration */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Distance Calibration</h2>
            {distance && (
              <div className="space-y-2">
                <p>Current Distance: <span className="font-bold">{distance.toFixed(2)}m</span></p>
                <p>Target Distance: <span className="font-bold">2.0m</span></p>
                {isCalibrated ? (
                  <p className="text-green-600 font-semibold">✓ Calibrated and stable</p>
                ) : (
                  <p className="text-yellow-600">Adjust your distance to 2.0m</p>
                )}
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full max-w-md mt-4 rounded-lg"
              style={{ transform: 'scaleX(-1)' }}
            />
          </CardContent>
        </Card>

        {/* Test Display */}
        {isCalibrated && (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Line {currentLine}</h3>
              <div className="text-6xl font-bold mb-8" style={{ 
                fontSize: `${120 - (currentLine * 8)}px` 
              }}>
                {scorerRef.current.generateLineLetters(currentLine, 'snellen').join(' ')}
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                  placeholder="Enter letters you see"
                  className="w-full px-4 py-3 text-2xl text-center border-2 border-gray-300 rounded-lg focus:border-[#667eea] focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <Button onClick={handleSubmit} className="w-full" size="lg">
                  Check Answer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

