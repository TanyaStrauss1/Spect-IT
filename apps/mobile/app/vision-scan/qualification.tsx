/**
 * Device & Environment Qualification Screen with Live Camera
 */

import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { Camera, CameraType } from 'expo-camera'
import * as FaceDetector from 'expo-face-detector'
import { 
  DeviceQualifier, 
  type DeviceQualification, 
  type CapabilityMatrix,
  type DeviceCheckRecord,
  type PermissionStatus,
  type StorageInfo,
  getDeviceCheckRetryInstructions,
  canRetryDeviceCheck,
  formatDeviceCheckSummary,
  getDeviceTierInfo,
} from '@spect-it/cv'
import { useVisionScan } from '../../lib/vision-scan/vision-scan-context'
import { requestCameraPermission, type DetectedFace, detectFaceFlicker } from '../../lib/vision-scan/camera-utils'
import { ProgressStepper } from '../../components/vision-scan/ProgressStepper'
import { CameraRecovery } from '../../components/vision-scan/CameraRecovery'
import { AmbientLightGate } from '../../components/vision-scan/AmbientLightGate'
import * as FileSystem from 'expo-file-system'

export default function QualificationScreen() {
  const { setDeviceQualification, getCalibration } = useVisionScan()
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [cameraError, setCameraError] = useState<'permission-denied' | 'camera-unavailable' | 'camera-error' | null>(null)
  const [isQualifying, setIsQualifying] = useState(false)
  const [qualification, setQualification] = useState<DeviceQualification | null>(null)
  const [capabilityMatrix, setCapabilityMatrix] = useState<CapabilityMatrix | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [deviceCheck, setDeviceCheck] = useState<DeviceCheckRecord | null>(null)
  const cameraRef = useRef<Camera>(null)

  // Temporal smoothing state for face flicker detection
  const [faceDetectionHistory, setFaceDetectionHistory] = useState<boolean[]>([])
  const [timestampHistory, setTimestampHistory] = useState<number[]>([])
  const BUFFER_SIZE = 8

  useEffect(() => {
    setupCamera()
  }, [])

  const setupCamera = async () => {
    const granted = await requestCameraPermission()
    setHasPermission(granted)
    
    if (!granted) {
      setCameraError('permission-denied')
    } else {
      setCameraError(null)
      // Auto-start qualification after a short delay
      setTimeout(() => {
        runQualification()
      }, 1500)
    }
  }

  const handleFacesDetected = ({ faces }: { faces: any[] }) => {
    const now = Date.now()
    const detected = faces.length > 0
    
    // Update detection history for flicker detection
    const newDetectionHistory = [...faceDetectionHistory.slice(-BUFFER_SIZE + 1), detected]
    const newTimestampHistory = [...timestampHistory.slice(-BUFFER_SIZE + 1), now]
    setFaceDetectionHistory(newDetectionHistory)
    setTimestampHistory(newTimestampHistory)

    // Check for flicker - only set detected if not flickering
    const isFlickering = detectFaceFlicker(newDetectionHistory, newTimestampHistory)
    if (!isFlickering) {
      setFaceDetected(detected)
    } else {
      console.log('Qualification: Face flicker detected, maintaining previous state')
    }
  }

  const runQualification = async () => {
    setIsQualifying(true)

    const capability = await DeviceQualifier.assessCapabilities()
    
    // Perform device check
    const permissions: PermissionStatus = {
      camera: hasPermission || false,
      motion: true, // Assume motion granted for now
    }
    
    // Check storage
    let storage: StorageInfo = {
      available: true,
      availableMB: 100,
    }
    
    try {
      const diskInfo = await FileSystem.getFreeDiskStorageAsync()
      const availableMB = diskInfo / (1024 * 1024)
      storage = {
        available: true,
        availableMB,
      }
    } catch (err) {
      console.log('Could not check storage:', err)
    }
    
    // Check if calibration record exists
    const calibration = getCalibration()
    const calibrationRecordExists = calibration !== null && calibration.isValid
    
    // Perform device check
    const checkRecord = await DeviceQualifier.performDeviceCheck(
      capability,
      permissions,
      storage,
      calibrationRecordExists
    )
    setDeviceCheck(checkRecord)
    
    // If device check failed, show error
    if (!checkRecord.passed) {
      setIsQualifying(false)
      Alert.alert(
        'Device Check Failed',
        formatDeviceCheckSummary(checkRecord),
        [{ text: 'OK' }]
      )
      return
    }
    
    // Give time for face detection to stabilize
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const result = await DeviceQualifier.qualify(capability, undefined, checkRecord)

    // Adjust scores based on face detection
    if (!faceDetected) {
      result.distanceScore = Math.min(result.distanceScore, 40)
      result.warnings.push('Face not detected. Ensure your face is visible in the camera.')
    }
    
    // Get device tier info
    const tierInfo = getDeviceTierInfo(result.deviceTier)

    const matrix: CapabilityMatrix = {
      mode: result.useSensorBasedMeasurements ? 'full' : 'degraded',
      features: {
        depthMeasurement: result.capability.hasTrueDepth || result.capability.hasLiDAR 
          ? 'sensor' 
          : 'estimated',
        gazeTracking: result.capability.hasTrueDepth ? 'sensor' : 'estimated',
        headPose: result.capability.hasGyroscope ? 'sensor' : 'estimated',
        distanceMeasurement: result.capability.hasTrueDepth || result.capability.hasLiDAR 
          ? 'sensor' 
          : 'estimated',
      },
      accuracy: {
        alignment: result.useSensorBasedMeasurements ? 'high' : 'medium',
        motility: result.useSensorBasedMeasurements ? 'high' : 'medium',
        convergence: result.useSensorBasedMeasurements ? 'high' : 'low',
      },
      warnings: result.warnings,
    }

    setQualification(result)
    setCapabilityMatrix(matrix)
    setDeviceQualification(result)
    setIsQualifying(false)
  }

  const handleContinue = () => {
    if (qualification && qualification.overallQuality !== 'poor') {
      router.push('/vision-scan/calibration')
    }
  }

  const handleRetry = () => {
    setQualification(null)
    setCapabilityMatrix(null)
    setFaceDetected(false)
    runQualification()
  }

  const handleCameraRetry = async () => {
    setCameraError(null)
    // Re-request camera permission
    const granted = await requestCameraPermission()
    if (granted) {
      setHasPermission(true)
      // Resume qualification automatically
      setTimeout(() => {
        runQualification()
      }, 500)
    } else {
      setCameraError('permission-denied')
    }
  }

  const handleCameraCancel = () => {
    router.back()
  }

  const handleCameraError = () => {
    setCameraError('camera-error')
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false || cameraError) {
    return (
      <CameraRecovery
        error={cameraError || 'permission-denied'}
        onRetry={handleCameraRetry}
        onCancel={handleCameraCancel}
      />
    )
  }

  if (isQualifying || !qualification || !capabilityMatrix) {
    return (
      <View style={styles.container}>
        <ProgressStepper currentStep="qualification" />
        <View style={styles.cameraContainer}>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            type={CameraType.front}
            onFacesDetected={handleFacesDetected}
            onCameraReady={() => console.log('Camera ready')}
            onMountError={handleCameraError}
            faceDetectorSettings={{
              mode: FaceDetector.FaceDetectorMode.fast,
              detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
              runClassifications: FaceDetector.FaceDetectorClassifications.none,
            }}
          />
          <View style={styles.overlay}>
            <View style={styles.faceGuide} />
            {!faceDetected && (
              <View style={styles.coachingBadge} accessibilityRole="alert">
                <Text style={styles.coachingText} accessibilityLabel="Position your face in the oval">
                  👤 Position your face in the oval
                </Text>
              </View>
            )}
            {faceDetected && (
              <View style={styles.faceDetectedBadge} accessibilityLiveRegion="polite">
                <Text style={styles.faceDetectedText} accessibilityLabel="Face detected">
                  ✓ Face Detected
                </Text>
              </View>
            )}
            {qualification && (
              <AmbientLightGate 
                lightingScore={qualification.lightingScore} 
                isVisible={true}
              />
            )}
          </View>
        </View>
        <View style={styles.qualifyingOverlay}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.qualifyingText}>Qualifying device and environment...</Text>
          <Text style={styles.qualifyingSubtext}>Position your face in the frame</Text>
        </View>
      </View>
    )
  }

  const qualityColor = {
    excellent: '#10B981',
    good: '#3B82F6',
    acceptable: '#F59E0B',
    poor: '#EF4444',
  }[qualification.overallQuality]

  const canContinue = qualification.overallQuality !== 'poor'

  return (
    <View style={styles.container}>
      <ProgressStepper currentStep="qualification" />
      <View style={styles.content}>
        <Text style={styles.icon}>
          {canContinue ? '✓' : '⚠️'}
        </Text>
        <Text style={styles.title}>Device Qualification</Text>

        <View style={[styles.qualityCard, { borderColor: qualityColor }]}>
          <Text style={[styles.qualityLabel, { color: qualityColor }]}>
            {qualification.overallQuality.toUpperCase()}
          </Text>
          <Text style={styles.qualitySubtext}>Overall Quality</Text>
        </View>

        <View style={styles.scoresCard}>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Lighting</Text>
            <Text style={styles.scoreValue}>{qualification.lightingScore}/100</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Distance</Text>
            <Text style={styles.scoreValue}>{qualification.distanceScore}/100</Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>Stability</Text>
            <Text style={styles.scoreValue}>{qualification.stabilityScore}/100</Text>
          </View>
        </View>

        <View style={styles.capabilityCard}>
          <Text style={styles.capabilityTitle}>
            Device Tier: {qualification.deviceTier.charAt(0).toUpperCase() + qualification.deviceTier.slice(1)}
          </Text>
          <Text style={styles.capabilityNote}>
            Measurement Mode: {capabilityMatrix.mode === 'full' ? 'Full (sensor-based)' : 'Degraded (camera-only)'}
          </Text>
          <Text style={styles.capabilityNote}>
            {capabilityMatrix.mode === 'full'
              ? 'Using sensor-based measurements for highest accuracy.'
              : 'Using camera + face detection with estimated measurements. No TrueDepth/LiDAR detected.'}
          </Text>
          
          {deviceCheck && (
            <View style={styles.deviceCheckInfo}>
              <Text style={styles.deviceCheckTitle}>Device Check:</Text>
              <Text style={[styles.deviceCheckText, { color: deviceCheck.passed ? '#10B981' : '#EF4444' }]}>
                {formatDeviceCheckSummary(deviceCheck)}
              </Text>
            </View>
          )}
          
          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>Live Camera Status:</Text>
            <Text style={styles.feature}>
              Camera: ✓ Active
            </Text>
            <Text style={styles.feature}>
              Face Detection: {faceDetected ? '✓ Working' : '○ Not detected'}
            </Text>
            <Text style={styles.feature}>
              Depth: {capabilityMatrix.features.depthMeasurement === 'sensor' ? '✓ Sensor' : '○ Estimated'}
            </Text>
            <Text style={styles.feature}>
              Gaze: {capabilityMatrix.features.gazeTracking === 'sensor' ? '✓ Sensor' : '○ Estimated (face-based)'}
            </Text>
          </View>
        </View>

        {qualification.warnings.length > 0 && (
          <View style={styles.warningsCard}>
            <Text style={styles.warningsTitle}>Warnings</Text>
            {qualification.warnings.map((warning, index) => (
              <Text key={index} style={styles.warning}>
                • {warning}
              </Text>
            ))}
          </View>
        )}

        {canContinue ? (
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={handleContinue}
            accessibilityRole="button"
            accessibilityLabel="Continue to calibration"
            accessibilityHint="Proceed to next step"
          >
            <Text style={styles.continueButtonText}>Continue to Calibration</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.errorCard} accessibilityRole="alert">
              <Text style={styles.errorText}>
                Quality too low to proceed. Please improve lighting and environment, then retry.
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={handleRetry}
              accessibilityRole="button"
              accessibilityLabel="Retry qualification"
            >
              <Text style={styles.retryButtonText}>Retry Qualification</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel and go back"
        >
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: 250,
    height: 320,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 125,
    borderStyle: 'dashed',
  },
  faceDetectedBadge: {
    position: 'absolute',
    top: 40,
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  faceDetectedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  coachingBadge: {
    position: 'absolute',
    top: 40,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  coachingText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '600',
  },
  qualifyingOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(31, 41, 55, 0.95)',
    padding: 24,
    alignItems: 'center',
  },
  qualifyingText: {
    marginTop: 12,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  qualifyingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  qualityCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 3,
  },
  qualityLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  qualitySubtext: {
    fontSize: 14,
    color: '#6B7280',
  },
  scoresCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4F46E5',
  },
  capabilityCard: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  capabilityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  capabilityNote: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  featureList: {
    gap: 6,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  feature: {
    fontSize: 14,
    color: '#4B5563',
  },
  deviceCheckInfo: {
    marginTop: 12,
    marginBottom: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  deviceCheckTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  deviceCheckText: {
    fontSize: 13,
    fontWeight: '500',
  },
  warningsCard: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  warning: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  errorCard: {
    width: '100%',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#4F46E5',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  retryButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: 56,
    justifyContent: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
})
