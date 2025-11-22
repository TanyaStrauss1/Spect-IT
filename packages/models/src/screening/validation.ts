/**
 * Input/Output Validation Utilities
 * Sanity checks for medical-grade validation
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate input features for refractive model
 */
export function validateRefractiveInput(
  features: number[] | Float32Array,
  expectedLength: number = 16,
  range?: { min: number; max: number }
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type check
  if (!(features instanceof Array) && !(features instanceof Float32Array)) {
    errors.push('Input must be number[] or Float32Array');
    return { valid: false, errors, warnings };
  }

  // Length check
  if (features.length !== expectedLength) {
    errors.push(
      `Input length mismatch: expected ${expectedLength}, got ${features.length}`
    );
  }

  // Range check
  if (range) {
    const values = Array.from(features);
    const min = Math.min(...values);
    const max = Math.max(...values);

    if (min < range.min) {
      warnings.push(
        `Input values below minimum ${range.min}: found ${min}`
      );
    }
    if (max > range.max) {
      warnings.push(
        `Input values above maximum ${range.max}: found ${max}`
      );
    }
  }

  // NaN/Infinity check
  const values = Array.from(features);
  const hasNaN = values.some(v => isNaN(v));
  const hasInfinity = values.some(v => !isFinite(v));

  if (hasNaN) {
    errors.push('Input contains NaN values');
  }
  if (hasInfinity) {
    errors.push('Input contains Infinity values');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate output from refractive model
 */
export function validateRefractiveOutput(
  sphere: number,
  cylinder: number,
  axis: number,
  confidence: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Sphere validation
  if (isNaN(sphere) || !isFinite(sphere)) {
    errors.push('Sphere value is NaN or Infinity');
  } else if (sphere < -10 || sphere > 10) {
    warnings.push(`Sphere out of typical range [-10, 10]: ${sphere}`);
  }

  // Cylinder validation
  if (isNaN(cylinder) || !isFinite(cylinder)) {
    errors.push('Cylinder value is NaN or Infinity');
  } else if (cylinder < -4 || cylinder > 4) {
    warnings.push(`Cylinder out of typical range [-4, 4]: ${cylinder}`);
  }

  // Axis validation
  if (isNaN(axis) || !isFinite(axis)) {
    errors.push('Axis value is NaN or Infinity');
  } else if (axis < 0 || axis > 180) {
    errors.push(`Axis out of valid range [0, 180]: ${axis}`);
  }

  // Confidence validation
  if (isNaN(confidence) || !isFinite(confidence)) {
    errors.push('Confidence value is NaN or Infinity');
  } else if (confidence < 0 || confidence > 1) {
    errors.push(`Confidence out of valid range [0, 1]: ${confidence}`);
  } else if (confidence < 0.7) {
    warnings.push(`Low confidence: ${confidence}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate calibration input
 */
export function validateCalibrationInput(
  features: number[] | Float32Array,
  expectedLength: number = 8,
  range?: { min: number; max: number }
): ValidationResult {
  return validateRefractiveInput(features, expectedLength, range);
}

/**
 * Validate calibration output
 */
export function validateCalibrationOutput(
  distanceMeters: number,
  confidence: number
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Distance validation
  if (isNaN(distanceMeters) || !isFinite(distanceMeters)) {
    errors.push('Distance value is NaN or Infinity');
  } else if (distanceMeters < 0 || distanceMeters > 5) {
    errors.push(`Distance out of valid range [0, 5]: ${distanceMeters}`);
  } else if (distanceMeters < 0.3 || distanceMeters > 3.0) {
    warnings.push(`Distance outside typical test range [0.3, 3.0]: ${distanceMeters}`);
  }

  // Confidence validation
  if (isNaN(confidence) || !isFinite(confidence)) {
    errors.push('Confidence value is NaN or Infinity');
  } else if (confidence < 0 || confidence > 1) {
    errors.push(`Confidence out of valid range [0, 1]: ${confidence}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

