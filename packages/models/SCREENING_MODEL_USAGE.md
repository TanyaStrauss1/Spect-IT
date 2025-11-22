# ScreeningModel Usage Guide

## Overview

`ScreeningModel` provides a structured, type-safe interface for vision screening predictions with clear input/output contracts.

## Basic Usage

```typescript
import { ScreeningModel, type ScreeningInput } from '@spect-it/models';

// Initialize model
const model = new ScreeningModel("/models/screening/model.json");

// Load model
await model.load();

// Prepare structured input
const input: ScreeningInput = {
  depthFeatures: [2.0, 0.9, 1, 0],
  eyeGeometryFeatures: [4.5, 4.5, 64.0, 7.8, 7.8, 0.0],
  visualTestFeatures: [1.0, 0.9, 0.0, 0.0],
  deviceMetaFeatures: [2.0, 19.2, 10.8, 1.0],
};

// Run prediction
const result = await model.predict(input);

console.log(result.sphere);      // -2.5 D
console.log(result.cylinder);    // -1.25 D
console.log(result.axis);        // 90°
console.log(result.confidence);  // 0.95
console.log(result.qualityFlags); // []
```

## React Hook Usage

```typescript
import { useScreeningModel } from '@/hooks/useScreeningModel';

function MyComponent() {
  const { isLoading, error, predict } = useScreeningModel({
    modelUrl: "/models/screening/model.json",
    modelVersion: "1.0.0",
    backend: "webgl",
  });

  const handlePredict = async () => {
    const input: ScreeningInput = {
      depthFeatures: [2.0, 0.9, 1, 0],
      eyeGeometryFeatures: [4.5, 4.5, 64.0, 7.8, 7.8, 0.0],
      visualTestFeatures: [1.0, 0.9, 0.0, 0.0],
      deviceMetaFeatures: [2.0, 19.2, 10.8, 1.0],
    };

    const result = await predict(input);
    console.log(result);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <button onClick={handlePredict}>Run Screening</button>;
}
```

## Input Structure

### `ScreeningInput`

```typescript
type ScreeningInput = {
  // Depth features from LiDAR/camera (normalized)
  depthFeatures: number[];        // [distance, confidence, lidar_flag, truedepth_flag]
  
  // Eye geometry from landmarks
  eyeGeometryFeatures: number[];  // [left_pupil_diameter, right_pupil_diameter, ipd, 
                                   //  left_corneal_curvature, right_corneal_curvature, alignment]
  
  // Visual test results (normalized 0-1)
  visualTestFeatures: number[];   // [acuity_score, contrast_score, color_deficiency, astigmatism]
  
  // Device metadata
  deviceMetaFeatures: number[];   // [pixel_ratio, screen_width, screen_height, calibration_quality]
};
```

## Output Structure

### `ScreeningOutput`

```typescript
type ScreeningOutput = {
  sphere: number;         // Diopters (-12 to +12)
  cylinder: number;      // Diopters (-6 to +6)
  axis: number;          // Degrees (0-180)
  confidence: number;    // 0-1
  qualityFlags: string[]; // Quality warnings
  rawOutput?: number[];  // Raw model output for debugging
  metadata?: {           // Prediction metadata
    modelVersion: string;
    backend: string;
    runtime: number;
  };
};
```

## Quality Flags

The model automatically generates quality flags:

- `LOW_CONFIDENCE` - Confidence < 0.5
- `OUT_OF_TYPICAL_RANGE_SPHERE` - |sphere| > 10
- `OUT_OF_TYPICAL_RANGE_CYLINDER` - |cylinder| > 4
- `INVALID_AXIS` - Axis outside [0, 180]
- `LOW_FEATURE_VARIANCE` - Input features too uniform
- `UNSTABLE_DISTANCE` - Distance outside typical range
- `LOW_CONTRAST` - Visual test score < 0.3
- `VALIDATION_ERROR:*` - Output validation errors
- `WARNING:*` - Output validation warnings

## Integration with CV Modules

```typescript
import { LiDARDetector, EyeLandmarkDetector, PupilGeometryExtractor } from '@spect-it/cv';
import { ScreeningModel, type ScreeningInput } from '@spect-it/models';

async function extractFeatures(): Promise<ScreeningInput> {
  // 1. Extract depth features
  const lidar = new LiDARDetector();
  await lidar.initialize();
  const distance = await lidar.getCurrentDistance();
  const depthFeatures = [
    distance.distance,
    distance.confidence,
    distance.deviceType === 'lidar' ? 1 : 0,
    distance.deviceType === 'truedepth' ? 1 : 0,
  ];
  lidar.stop();

  // 2. Extract eye geometry
  const eyeDetector = new EyeLandmarkDetector();
  await eyeDetector.initialize();
  // ... extract landmarks and geometry
  const eyeGeometryFeatures = [/* ... */];

  // 3. Get visual test results (from Supabase or state)
  const visualTestFeatures = [/* ... */];

  // 4. Get device metadata
  const deviceMetaFeatures = [
    window.devicePixelRatio || 2.0,
    window.screen.width / 100,
    window.screen.height / 100,
    1.0, // calibration quality
  ];

  return {
    depthFeatures,
    eyeGeometryFeatures,
    visualTestFeatures,
    deviceMetaFeatures,
  };
}

// Use in prediction
const model = new ScreeningModel("/models/screening/model.json");
await model.load();

const input = await extractFeatures();
const result = await model.predict(input);
```

## Error Handling

```typescript
try {
  const result = await model.predict(input);
  // Handle result
} catch (error) {
  if (error.message.includes('validation failed')) {
    // Input validation error
    console.error('Invalid input:', error);
  } else if (error.message.includes('not loaded')) {
    // Model not loaded
    console.error('Model not ready:', error);
  } else {
    // Other errors
    console.error('Prediction error:', error);
  }
}
```

## Best Practices

1. **Load model early**: Load during app initialization
2. **Validate input**: Ensure all feature arrays are non-empty
3. **Check quality flags**: Review flags before using results
4. **Handle errors**: Always wrap predictions in try/catch
5. **Dispose when done**: Call `model.dispose()` when component unmounts

## Model File Structure

```
public/
  models/
    screening/
      model.json          # TensorFlow.js model
      weights/            # Model weights (if separate)
        *.bin
```

## Performance

- **Load time**: ~500ms (first time)
- **Warmup**: ~100ms (automatic)
- **Prediction**: ~10-50ms (depending on backend)
- **Memory**: ~2MB per model

## Backend Selection

- **webgl** (default): Fastest, GPU acceleration
- **wasm**: More predictable numerics, good for validation
- **cpu**: Most predictable, slowest

