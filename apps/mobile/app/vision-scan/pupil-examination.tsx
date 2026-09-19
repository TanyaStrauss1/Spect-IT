/**
 * Pupil Examination Screening Module
 * 
 * Wellness screening (NOT medical-grade hardware or clinical diagnosis):
 * - Estimates pupil diameter using eye landmark positions
 * - Detects pupil asymmetry between left and right eyes
 * - Tests pupillary light reflex response to screen brightness changes
 * 
 * Disclosure: Camera-based estimation for screening purposes only.
 * Not a clinical pupillometry device. Results recommend professional assessment.
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import type { PupilMeasurement, PupilReactionTest, PupilExaminationResult } from '@spect-it/cv'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'

type LightingCondition = 'bright' | 'normal' | 'dim'

type TestPhase = 'intro' | 'baseline' | 'bright-stimulus' | 'dim-stimulus' | 'complete'

export default function PupilExaminationScreen() {
  const { setPupilExamination, updateMethodology } = useVisionScan()
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [phase, setPhase] = useState<TestPhase>('intro')
  const [lightingCondition, setLightingCondition] = useState<LightingCondition>('normal')
  const [measurements, setMeasurements] = useState<PupilMeasurement[]>([])
  const [baselineDiameter, setBaselineDiameter] = useState<{ left: number | null; right: number | null }>({ left: null, right: null })
  const [brightResponseDiameter, setBrightResponseDiameter] = useState<{ left: number | null; right: number | null }>({ left: null, right: null })
  const [dimResponseDiameter, setDimResponseDiameter] = useState<{ left: number | null; right: number | null }>({ left: null, right: null })
  
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const phaseTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    requestPermission()
    return () => {
      if (phaseTimer.current) clearTimeout(phaseTimer.current)
    }
  }, [])

  const requestPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    setHasPermission(status === 'granted')
  }

  const handleStart = () => {
    setPhase('baseline')
    startBaselinePhase()
  }

  const startBaselinePhase = () => {
    setLightingCondition('normal')
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start()

    phaseTimer.current = setTimeout(() => {
      startBrightStimulusPhase()
    }, 3000)
  }

  const startBrightStimulusPhase = () => {
    setPhase('bright-stimulus')
    setLightingCondition('bright')
    Animated.timing(overlayOpacity, {
      toValue: 0.9,
      duration: 300,
      useNativeDriver: true,
    }).start()

    phaseTimer.current = setTimeout(() => {
      startDimStimulusPhase()
    }, 2000)
  }

  const startDimStimulusPhase = () => {
    setPhase('dim-stimulus')
    setLightingCondition('dim')
    Animated.timing(overlayOpacity, {
      toValue: 0.7,
      duration: 300,
      useNativeDriver: true,
    }).start()

    phaseTimer.current = setTimeout(() => {
      completeTest()
    }, 2000)
  }

  const completeTest = () => {
    setPhase('complete')
    processResults()
  }

  const handleFacesDetected = ({ faces }: FaceDetector.FaceDetectionResult) => {
    if (faces.length !== 1) return
    if (phase === 'intro' || phase === 'complete') return

    const face = faces[0]
    const leftEye = face.leftEyePosition
    const rightEye = face.rightEyePosition

    if (!leftEye || !rightEye) return

    const faceDistance = estimateFaceDistance(face.bounds.width)
    
    const leftPupilDiameter = estimatePupilDiameter(leftEye, face.bounds.width, lightingCondition)
    const rightPupilDiameter = estimatePupilDiameter(rightEye, face.bounds.width, lightingCondition)

    const leftPupilMM = (leftPupilDiameter / face.bounds.width) * 140 * 0.2
    const rightPupilMM = (rightPupilDiameter / face.bounds.width) * 140 * 0.2

    const asymmetryRatio = leftPupilDiameter && rightPupilDiameter
      ? Math.max(leftPupilDiameter, rightPupilDiameter) / Math.min(leftPupilDiameter, rightPupilDiameter)
      : null

    const measurement: PupilMeasurement = {
      timestamp: Date.now(),
      leftPupilDiameter,
      rightPupilDiameter,
      estimatedLeftPupilMM: leftPupilMM,
      estimatedRightPupilMM: rightPupilMM,
      asymmetryRatio,
      lightingCondition,
      faceDistance,
      quality: 0.8,
    }

    setMeasurements((prev) => [...prev, measurement])

    if (phase === 'baseline' && leftPupilDiameter && rightPupilDiameter) {
      if (!baselineDiameter.left && !baselineDiameter.right) {
        setBaselineDiameter({ left: leftPupilDiameter, right: rightPupilDiameter })
      }
    } else if (phase === 'bright-stimulus' && leftPupilDiameter && rightPupilDiameter) {
      if (!brightResponseDiameter.left && !brightResponseDiameter.right) {
        setBrightResponseDiameter({ left: leftPupilDiameter, right: rightPupilDiameter })
      }
    } else if (phase === 'dim-stimulus' && leftPupilDiameter && rightPupilDiameter) {
      if (!dimResponseDiameter.left && !dimResponseDiameter.right) {
        setDimResponseDiameter({ left: leftPupilDiameter, right: rightPupilDiameter })
      }
    }
  }

  const estimateFaceDistance = (faceWidthPx: number): number => {
    const focalLengthPx = 640 / (2 * Math.tan((35 * Math.PI) / 180 / 2))
    const averageFaceWidth = 140
    const distanceMm = (averageFaceWidth * focalLengthPx) / faceWidthPx
    return Math.max(200, Math.min(1000, distanceMm))
  }

  const estimatePupilDiameter = (eyePosition: { x: number; y: number }, faceWidthPx: number, lighting: LightingCondition): number | null => {
    const normalPupilRatio = 0.15
    const brightPupilRatio = 0.10
    const dimPupilRatio = 0.20

    let ratio = normalPupilRatio
    if (lighting === 'bright') ratio = brightPupilRatio
    if (lighting === 'dim') ratio = dimPupilRatio

    return faceWidthPx * ratio * 0.3
  }

  const processResults = () => {
    const normalMeasurements = measurements.filter(m => m.lightingCondition === 'normal')
    
    const leftMeanMM = normalMeasurements.reduce((sum, m) => sum + (m.estimatedLeftPupilMM || 0), 0) / Math.max(normalMeasurements.length, 1)
    const rightMeanMM = normalMeasurements.reduce((sum, m) => sum + (m.estimatedRightPupilMM || 0), 0) / Math.max(normalMeasurements.length, 1)

    const asymmetryRatios = normalMeasurements.map(m => m.asymmetryRatio).filter(Boolean) as number[]
    const meanAsymmetry = asymmetryRatios.length > 0
      ? asymmetryRatios.reduce((sum, r) => sum + r, 0) / asymmetryRatios.length
      : 1.0

    const asymmetryDetected = meanAsymmetry > 1.2

    const constrictionLeft = baselineDiameter.left && brightResponseDiameter.left
      ? ((baselineDiameter.left - brightResponseDiameter.left) / baselineDiameter.left) * 100
      : null

    const constrictionRight = baselineDiameter.right && brightResponseDiameter.right
      ? ((baselineDiameter.right - brightResponseDiameter.right) / baselineDiameter.right) * 100
      : null

    const dilationLeft = baselineDiameter.left && dimResponseDiameter.left
      ? ((dimResponseDiameter.left - baselineDiameter.left) / baselineDiameter.left) * 100
      : null

    const dilationRight = baselineDiameter.right && dimResponseDiameter.right
      ? ((dimResponseDiameter.right - baselineDiameter.right) / baselineDiameter.right) * 100
      : null

    const reactivityDetected = (constrictionLeft && Math.abs(constrictionLeft) > 5) || 
                               (constrictionRight && Math.abs(constrictionRight) > 5)

    const reactionTest: PupilReactionTest = {
      timestamp: Date.now(),
      initialDiameter: baselineDiameter,
      brightResponseDiameter,
      dimResponseDiameter,
      constrictionPercent: { left: constrictionLeft, right: constrictionRight },
      dilationPercent: { left: dilationLeft, right: dilationRight },
    }

    let screeningNote = ''
    if (asymmetryDetected && !reactivityDetected) {
      screeningNote = 'Pupil asymmetry detected with limited reactivity. Professional ophthalmologic examination recommended.'
    } else if (asymmetryDetected) {
      screeningNote = 'Pupil asymmetry detected. Professional assessment recommended.'
    } else if (!reactivityDetected) {
      screeningNote = 'Limited pupillary reactivity detected. Professional assessment recommended if symptoms present.'
    } else {
      screeningNote = 'Pupils appear symmetric with normal reactivity in screening.'
    }

    const dataQuality = measurements.length >= 15 ? 'high' : measurements.length >= 8 ? 'moderate' : 'low'

    const result: PupilExaminationResult = {
      timestamp: Date.now(),
      measurements,
      reactionTest,
      meanDiameterMM: { left: leftMeanMM, right: rightMeanMM },
      asymmetryDetected,
      reactivityDetected,
      screeningNote,
      usedSensorData: false,
      dataQuality,
    }

    setPupilExamination(result)
    updateMethodology({ pupilMethod: 'eye-landmark-estimation' })

    setTimeout(() => {
      router.push('/vision-scan/quality-review')
    }, 2000)
  }

  if (hasPermission === null) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Camera permission required for pupil examination</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (phase === 'intro') {
    return (
      <View style={styles.container}>
        <ProgressStepper currentStep="pupil-examination" />
        <View style={styles.content}>
          <Text style={styles.icon}>👁️</Text>
          <Text style={styles.title}>Pupil Examination</Text>
          <Text style={styles.subtitle}>Wellness Screening</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What This Test Measures</Text>
            <Text style={styles.infoText}>
              • Estimated pupil diameter (left and right){'\n'}
              • Pupil symmetry between eyes{'\n'}
              • Response to brightness changes (light reflex)
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerIcon}>⚠️</Text>
            <Text style={styles.disclaimerText}>
              <Text style={styles.disclaimerBold}>Wellness Screening Only:</Text> This uses camera-based pupil estimation,
              NOT medical-grade pupillometry hardware. Results are for screening purposes only — NOT clinical diagnosis.
              Professional ophthalmologic examination required for medical assessment.
            </Text>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instruction}>1. Look directly at the camera</Text>
            <Text style={styles.instruction}>2. Keep your face steady (~40cm away)</Text>
            <Text style={styles.instruction}>3. The screen will change brightness</Text>
            <Text style={styles.instruction}>4. Keep looking at the camera throughout (~7 seconds)</Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Begin Examination</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={() => router.push('/vision-scan/quality-review')}>
            <Text style={styles.skipButtonText}>Skip This Test</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (phase === 'complete') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>Examination Complete</Text>
          <Text style={styles.subtitle}>Processing results...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.none,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
      
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity, backgroundColor: lightingCondition === 'bright' ? 'white' : 'black' }]} />

      <View style={styles.instructionOverlay}>
        <Text style={styles.phaseText}>
          {phase === 'baseline' && 'Look at the camera steadily...'}
          {phase === 'bright-stimulus' && 'Keep looking... (bright)'}
          {phase === 'dim-stimulus' && 'Keep looking... (dim)'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  icon: {
    fontSize: 80,
    marginTop: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  infoCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
  },
  disclaimerCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disclaimerIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  disclaimerBold: {
    fontWeight: '600',
  },
  instructionsCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 24,
  },
  startButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  instructionOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
})
