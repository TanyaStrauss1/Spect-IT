/**
 * Device & Environment Qualification Screen
 */

import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { DeviceQualifier, type DeviceQualification, type CapabilityMatrix } from '@spect-it/cv'

export default function QualificationScreen() {
  const [qualification, setQualification] = useState<DeviceQualification | null>(null)
  const [capabilityMatrix, setCapabilityMatrix] = useState<CapabilityMatrix | null>(null)
  const [isQualifying, setIsQualifying] = useState(true)

  useEffect(() => {
    runQualification()
  }, [])

  const runQualification = async () => {
    setIsQualifying(true)

    const capability = await DeviceQualifier.assessCapabilities()
    const result = await DeviceQualifier.qualify(capability)

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
    setIsQualifying(false)
  }

  const handleContinue = () => {
    if (qualification && qualification.overallQuality !== 'poor') {
      router.push('/vision-scan/calibration')
    }
  }

  const handleRetry = () => {
    runQualification()
  }

  if (isQualifying || !qualification || !capabilityMatrix) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Qualifying device and environment...</Text>
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
            Measurement Mode: {capabilityMatrix.mode === 'full' ? 'Full' : 'Degraded'}
          </Text>
          <Text style={styles.capabilityNote}>
            {capabilityMatrix.mode === 'full'
              ? 'Using sensor-based measurements for highest accuracy.'
              : 'Using estimated measurements. Results are screening-level only.'}
          </Text>
          
          <View style={styles.featureList}>
            <Text style={styles.featureTitle}>Sensor Status:</Text>
            <Text style={styles.feature}>
              Depth: {capabilityMatrix.features.depthMeasurement === 'sensor' ? '✓ Sensor' : '○ Estimated'}
            </Text>
            <Text style={styles.feature}>
              Gaze: {capabilityMatrix.features.gazeTracking === 'sensor' ? '✓ Sensor' : '○ Estimated'}
            </Text>
            <Text style={styles.feature}>
              Head Pose: {capabilityMatrix.features.headPose === 'sensor' ? '✓ Sensor' : '○ Estimated'}
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
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Calibration</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>
                Quality too low to proceed. Please improve lighting and environment, then retry.
              </Text>
            </View>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Retry Qualification</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
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
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
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
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
})
