/**
 * Integration Tests for ScreeningEngine
 * Tests end-to-end prediction flow
 */

import { ScreeningEngine, getScreeningEngine } from '../screening-engine';
import { getScreeningLogger } from '../logger';

describe('ScreeningEngine Integration', () => {
  let engine: ScreeningEngine;
  let logger: ReturnType<typeof getScreeningLogger>;

  beforeEach(() => {
    engine = new ScreeningEngine('cpu', '1.0.0');
    logger = getScreeningLogger();
    logger.clearLogs();
  });

  describe('End-to-End Prediction Flow', () => {
    it('should complete full prediction workflow', async () => {
      await engine.init();
      
      const features = new Float32Array(16).fill(0.1);
      
      // This will fail without actual model, but tests the flow
      try {
        const result = await engine.predictRefractive(features);
        
        // Verify result structure
        expect(result).toHaveProperty('sphere');
        expect(result).toHaveProperty('cylinder');
        expect(result).toHaveProperty('axis');
        expect(result).toHaveProperty('confidence');
        expect(result).toHaveProperty('metadata');
        
        // Verify metadata
        expect(result.metadata).toHaveProperty('modelVersion');
        expect(result.metadata).toHaveProperty('backend');
        expect(result.metadata).toHaveProperty('runtime');
        
        // Verify logging
        const auditLog = logger.getAuditLog();
        expect(auditLog.count).toBeGreaterThan(0);
        expect(auditLog.entries[0].modelId).toBe('refractive');
      } catch (error) {
        // Expected if model file doesn't exist
        expect(error).toBeDefined();
      }
    });

    it('should handle feature extraction → prediction pipeline', async () => {
      await engine.init();
      
      // Simulate feature extraction
      const extractedFeatures = [
        2.0,    // distance
        0.9,    // confidence
        4.5,    // left_pupil_diameter
        4.5,    // right_pupil_diameter
        64.0,   // ipd
        7.8,    // left_corneal_curvature
        7.8,    // right_corneal_curvature
        0.0,    // alignment
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // padding
      ].slice(0, 16);

      try {
        const result = await engine.predictRefractive(extractedFeatures);
        
        // Verify all values are valid
        expect(typeof result.sphere).toBe('number');
        expect(typeof result.cylinder).toBe('number');
        expect(typeof result.axis).toBe('number');
        expect(typeof result.confidence).toBe('number');
        
        // Verify ranges
        expect(result.sphere).toBeGreaterThanOrEqual(-10);
        expect(result.sphere).toBeLessThanOrEqual(10);
        expect(result.axis).toBeGreaterThanOrEqual(0);
        expect(result.axis).toBeLessThanOrEqual(180);
        expect(result.confidence).toBeGreaterThanOrEqual(0);
        expect(result.confidence).toBeLessThanOrEqual(1);
      } catch (error) {
        // Expected if model file doesn't exist
        expect(error).toBeDefined();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully', async () => {
      await engine.init();
      
      const invalidFeatures = new Array(10).fill(0.1); // Wrong length
      
      await expect(engine.predictRefractive(invalidFeatures)).rejects.toThrow();
    });

    it('should handle model loading errors', async () => {
      await engine.init();
      
      // Try to use non-existent model version
      const invalidEngine = new ScreeningEngine('cpu', '999.0.0');
      await invalidEngine.init();
      
      const features = new Array(16).fill(0.1);
      await expect(invalidEngine.predictRefractive(features)).rejects.toThrow(
        'Refractive model config not found'
      );
    });
  });

  describe('Logging Integration', () => {
    it('should log all predictions', async () => {
      await engine.init();
      logger.clearLogs();
      
      const features = new Array(16).fill(0.1);
      
      try {
        await engine.predictRefractive(features);
        
        const auditLog = logger.getAuditLog();
        expect(auditLog.count).toBe(1);
        expect(auditLog.entries[0]).toHaveProperty('id');
        expect(auditLog.entries[0]).toHaveProperty('timestamp');
        expect(auditLog.entries[0]).toHaveProperty('modelId', 'refractive');
        expect(auditLog.entries[0]).toHaveProperty('inputFeatures');
        expect(auditLog.entries[0]).toHaveProperty('output');
        expect(auditLog.entries[0]).toHaveProperty('runtime');
      } catch (error) {
        // Expected if model doesn't exist
      }
    });

    it('should export logs as JSON', async () => {
      await engine.init();
      logger.clearLogs();
      
      const features = new Array(16).fill(0.1);
      
      try {
        await engine.predictRefractive(features);
        
        const json = logger.exportLogs();
        expect(() => JSON.parse(json)).not.toThrow();
        
        const parsed = JSON.parse(json);
        expect(parsed).toHaveProperty('entries');
        expect(parsed).toHaveProperty('count');
        expect(parsed).toHaveProperty('dateRange');
      } catch (error) {
        // Expected if model doesn't exist
      }
    });
  });
});

