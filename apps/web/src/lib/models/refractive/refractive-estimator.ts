/**
 * ML-based Refractive Estimation
 * Predicts prescription (Sphere, Cylinder, Axis) from test data
 */

import * as tf from '@tensorflow/tfjs'

export interface RefractiveEstimate {
  /** Sphere power in diopters */
  sphere: number
  /** Cylinder power in diopters */
  cylinder: number
  /** Axis in degrees (0-180) */
  axis: number
  /** Confidence score (0-1) */
  confidence: number
}

export class RefractiveEstimator {
  private model: tf.LayersModel | null = null
  private isLoaded: boolean = false

  /**
   * Load pre-trained model
   */
  async loadModel(): Promise<boolean> {
    try {
      // Load model from URL or local path
      // This would be a trained TensorFlow.js model
      // For now, placeholder
      
      // Example: this.model = await tf.loadLayersModel('/models/refractive-model.json')
      
      this.isLoaded = true
      return true
    } catch (error) {
      console.error('Failed to load refractive model:', error)
      return false
    }
  }

  /**
   * Estimate prescription from test results
   */
  async estimate(testData: {
    visualAcuity: number
    astigmatism?: { power: number; axis: number }
    contrastSensitivity?: number
    eyeGeometry?: {
      ipd: number
      cornealCurvature: number
    }
  }): Promise<RefractiveEstimate> {
    if (!this.isLoaded) {
      await this.loadModel()
    }

    // Prepare input features
    const features = this.prepareFeatures(testData)

    if (this.model) {
      // Use ML model for prediction
      const prediction = this.model.predict(features) as tf.Tensor
      const values = await prediction.data()
      
      return {
        sphere: values[0],
        cylinder: values[1],
        axis: values[2] * 180, // Normalize to 0-180
        confidence: values[3]
      }
    } else {
      // Fallback: Rule-based estimation
      return this.ruleBasedEstimate(testData)
    }
  }

  /**
   * Prepare input features for model
   */
  private prepareFeatures(testData: any): tf.Tensor {
    const features = [
      testData.visualAcuity || 1.0,
      testData.astigmatism?.power || 0,
      testData.astigmatism?.axis || 0,
      testData.contrastSensitivity || 1.0,
      testData.eyeGeometry?.ipd || 64,
      testData.eyeGeometry?.cornealCurvature || 7.8
    ]

    return tf.tensor2d([features])
  }

  /**
   * Rule-based fallback estimation
   */
  private ruleBasedEstimate(testData: any): RefractiveEstimate {
    const acuity = testData.visualAcuity || 1.0
    
    // Simple rule: worse acuity = more correction needed
    const sphere = (1.0 - acuity) * -2.0 // Negative for myopia
    
    const cylinder = testData.astigmatism?.power || 0
    const axis = testData.astigmatism?.axis || 0

    // Confidence based on data completeness
    let confidence = 0.5
    if (testData.astigmatism) confidence += 0.2
    if (testData.contrastSensitivity) confidence += 0.2
    if (testData.eyeGeometry) confidence += 0.1

    return {
      sphere: Math.max(-6.0, Math.min(6.0, sphere)),
      cylinder: Math.max(-4.0, Math.min(4.0, cylinder)),
      axis: Math.max(0, Math.min(180, axis)),
      confidence: Math.min(1.0, confidence)
    }
  }
}

