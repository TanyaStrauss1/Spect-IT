/**
 * React Native Screen Calibration Component
 * 
 * Calibrates screen size and viewing distance using credit card sizing
 * Based on @spect-it/cv screen-calibrator.ts
 */

import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { ScreenCalibrator, type CalibrationData } from '@spect-it/cv'

export interface CalibrationScreenProps {
  onComplete: (calibration: CalibrationData) => void
  onSkip?: () => void
}

const CREDIT_CARD_WIDTH_MM = 85.6 // ISO/IEC 7810 standard

export function CalibrationScreen({ onComplete, onSkip }: CalibrationScreenProps) {
  const [step, setStep] = useState<'intro' | 'cardSize' | 'distance'>('intro')
  const [cardWidthPx, setCardWidthPx] = useState<string>('')
  const [distanceCm, setDistanceCm] = useState<string>('')
  
  const handleCardSizeSubmit = () => {
    const widthPx = parseInt(cardWidthPx, 10)
    if (widthPx > 0 && widthPx < 1000) {
      setStep('distance')
    }
  }
  
  const handleDistanceSubmit = () => {
    const widthPx = parseInt(cardWidthPx, 10)
    const distCm = parseFloat(distanceCm)
    
    if (widthPx > 0 && distCm > 0) {
      const calibrator = new ScreenCalibrator()
      const pxPerMm = widthPx / CREDIT_CARD_WIDTH_MM
      calibrator.saveCalibration(pxPerMm, distCm)
      const calibration = calibrator.getCalibration()
      if (calibration) {
        onComplete(calibration)
      }
    }
  }
  
  if (step === 'intro') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.emoji}>📏</Text>
          <Text style={styles.title}>Screen Calibration</Text>
          <Text style={styles.subtitle}>For accurate test results</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Calibration ensures letters appear at the correct size for your screen and viewing distance.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>You'll need:</Text>
            <Text style={styles.text}>• A credit card or ID card</Text>
            <Text style={styles.text}>• A ruler or tape measure</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => setStep('cardSize')}
          >
            <Text style={styles.primaryButtonText}>Start Calibration</Text>
          </TouchableOpacity>
          
          {onSkip && (
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={onSkip}
            >
              <Text style={styles.secondaryButtonText}>Skip (Use Defaults)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }
  
  if (step === 'cardSize') {
    const screenWidth = Dimensions.get('window').width
    const cardDisplayWidth = Math.min(screenWidth * 0.7, 300)
    
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Step 1: Screen Size</Text>
          <Text style={styles.subtitle}>Measure the card on your screen</Text>
          
          <View style={styles.instructionBox}>
            <Text style={styles.instructionText}>
              1. Place a credit card against the white rectangle below
            </Text>
            <Text style={styles.instructionText}>
              2. Adjust the number until the card matches the rectangle width
            </Text>
            <Text style={styles.instructionText}>
              3. The card should be 85.6mm (3.375 inches) wide
            </Text>
          </View>
          
          <View style={styles.cardPreview}>
            <View 
              style={[
                styles.cardRect, 
                { width: parseFloat(cardWidthPx) || cardDisplayWidth }
              ]} 
            />
            <Text style={styles.cardLabel}>Credit Card Width</Text>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card width on screen (pixels):</Text>
            <TextInput
              style={styles.input}
              value={cardWidthPx}
              onChangeText={setCardWidthPx}
              placeholder="Enter width in pixels"
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>
              Typical values: 200-400 pixels
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.primaryButton, !cardWidthPx && styles.buttonDisabled]} 
            onPress={handleCardSizeSubmit}
            disabled={!cardWidthPx}
          >
            <Text style={styles.primaryButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Step 2: Viewing Distance</Text>
        <Text style={styles.subtitle}>Measure how far you sit from the screen</Text>
        
        <View style={styles.instructionBox}>
          <Text style={styles.instructionText}>
            1. Sit at your normal testing distance
          </Text>
          <Text style={styles.instructionText}>
            2. Measure from your eyes to the screen
          </Text>
          <Text style={styles.instructionText}>
            3. Enter the distance in centimeters
          </Text>
        </View>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            <Text style={styles.bold}>Recommended:</Text> 50-60 cm (20-24 inches) for mobile testing
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Viewing distance (cm):</Text>
          <TextInput
            style={styles.input}
            value={distanceCm}
            onChangeText={setDistanceCm}
            placeholder="Enter distance in cm"
            keyboardType="decimal-pad"
          />
          <Text style={styles.hint}>
            Example: 60 cm = 23.6 inches
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.primaryButton, !distanceCm && styles.buttonDisabled]} 
          onPress={handleDistanceSubmit}
          disabled={!distanceCm}
        >
          <Text style={styles.primaryButtonText}>Complete Calibration</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => setStep('cardSize')}
        >
          <Text style={styles.secondaryButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2FF',
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 20,
  },
  instructionBox: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 13,
    color: '#374151',
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  cardPreview: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  cardRect: {
    height: 54,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#4F46E5',
    borderRadius: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
})
