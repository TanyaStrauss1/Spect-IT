/**
 * Unit Tests for Validation Functions
 */

import {
  validateRefractiveInput,
  validateRefractiveOutput,
  validateCalibrationInput,
  validateCalibrationOutput,
} from '../validation';

describe('Validation Functions', () => {
  describe('validateRefractiveInput', () => {
    it('should validate correct input', () => {
      const features = new Array(16).fill(0.5);
      const result = validateRefractiveInput(features, 16, { min: -10, max: 10 });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject wrong length', () => {
      const features = new Array(10).fill(0.5);
      const result = validateRefractiveInput(features, 16);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Input length mismatch');
    });

    it('should warn on out-of-range values', () => {
      const features = new Array(16).fill(15); // Above max
      const result = validateRefractiveInput(features, 16, { min: -10, max: 10 });
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should reject NaN values', () => {
      const features = new Array(16).fill(0.5);
      features[0] = NaN;
      const result = validateRefractiveInput(features, 16);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Input contains NaN values');
    });

    it('should reject Infinity values', () => {
      const features = new Array(16).fill(0.5);
      features[0] = Infinity;
      const result = validateRefractiveInput(features, 16);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Input contains Infinity values');
    });
  });

  describe('validateRefractiveOutput', () => {
    it('should validate correct output', () => {
      const result = validateRefractiveOutput(-2.0, -1.5, 90, 0.95);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid axis', () => {
      const result = validateRefractiveOutput(0, 0, 200, 1.0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Axis out of valid range');
    });

    it('should reject invalid confidence', () => {
      const result = validateRefractiveOutput(0, 0, 90, 1.5);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Confidence out of valid range');
    });

    it('should warn on low confidence', () => {
      const result = validateRefractiveOutput(0, 0, 90, 0.5);
      expect(result.valid).toBe(true);
      expect(result.warnings).toContain('Low confidence');
    });

    it('should warn on out-of-typical-range values', () => {
      const result = validateRefractiveOutput(15, 0, 90, 1.0);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('validateCalibrationInput', () => {
    it('should validate correct input', () => {
      const features = new Array(8).fill(2.0);
      const result = validateCalibrationInput(features, 8, { min: 0, max: 5 });
      expect(result.valid).toBe(true);
    });
  });

  describe('validateCalibrationOutput', () => {
    it('should validate correct output', () => {
      const result = validateCalibrationOutput(2.0, 0.95);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid distance', () => {
      const result = validateCalibrationOutput(10, 1.0);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Distance out of valid range');
    });

    it('should warn on unusual distance', () => {
      const result = validateCalibrationOutput(0.1, 1.0);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
});

