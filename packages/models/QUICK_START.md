# ScreeningModel Quick Start

## Basic Usage

```typescript
import { ScreeningModel, type ScreeningInput } from '@spect-it/models';

// Initialize and load model
const model = new ScreeningModel("/models/screening/model.json");
await model.load();

// Prepare input
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
```

## React Hook Usage

```typescript
import { useScreeningModel, type ScreeningInput } from '@/hooks/useScreeningModel';

function MyComponent() {
  const { isLoading, error, predict } = useScreeningModel({
    modelUrl: "/models/screening/model.json",
  });

  const handleRunScreening = async () => {
    const input: ScreeningInput = {
      depthFeatures: depthVector,
      eyeGeometryFeatures: eyeGeomFeatures,
      visualTestFeatures: visualScores,
      deviceMetaFeatures: deviceFeatures,
    };

    const result = await predict(input);
    console.log(result);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <button onClick={handleRunScreening}>Run Screening</button>;
}
```

## Input Feature Extraction

### Depth Features
```typescript
import { LiDARDetector } from '@spect-it/cv';

const lidar = new LiDARDetector();
await lidar.initialize();
const distance = await lidar.getCurrentDistance();

const depthFeatures = [
  distance.distance,           // meters
  distance.confidence,         // 0-1
  distance.deviceType === 'lidar' ? 1 : 0,
  distance.deviceType === 'truedepth' ? 1 : 0,
];
```

### Eye Geometry Features
```typescript
import { EyeLandmarkDetector, PupilGeometryExtractor } from '@spect-it/cv';

const eyeDetector = new EyeLandmarkDetector();
await eyeDetector.initialize();
// ... setup video and detect landmarks
const landmarks = await eyeDetector.detect();

const extractor = new PupilGeometryExtractor();
const geometry = extractor.extract(landmarks);

const eyeGeomFeatures = [
  geometry.left.diameter,
  geometry.right.diameter,
  geometry.combined.averageIPD,
  geometry.left.cornealCurvature,
  geometry.right.cornealCurvature,
  geometry.combined.alignment,
];
```

### Visual Test Features
```typescript
// From your test results (stored in Supabase or state)
const visualScores = [
  acuityResult.decimal,        // 0-1 (normalized)
  contrastResult.score,        // 0-1 (normalized)
  colorResult.deficiency ? 1 : 0,  // 0 = normal, 1 = deficient
  astigmatismResult.power > 0 ? 1 : 0,  // 0 = no, 1 = yes
];
```

### Device Metadata Features
```typescript
const deviceFeatures = [
  window.devicePixelRatio || 2.0,
  window.screen.width / 100,   // normalized
  window.screen.height / 100,  // normalized
  1.0,  // calibration quality (0-1)
];
```

## Complete Example

See `apps/web/src/components/ScreeningExample.tsx` for a complete working example.

## Error Handling

```typescript
try {
  const result = await predict(input);
  // Use result
} catch (error) {
  if (error.message.includes('validation failed')) {
    // Input validation error
  } else if (error.message.includes('not loaded')) {
    // Model not ready
  } else {
    // Other errors
  }
}
```

## Output Interpretation

```typescript
const result = await predict(input);

// Check quality flags
if (result.qualityFlags.length > 0) {
  console.warn('Quality flags:', result.qualityFlags);
  
  if (result.qualityFlags.includes('LOW_CONFIDENCE')) {
    // Consider retaking test
  }
  
  if (result.qualityFlags.includes('UNSTABLE_DISTANCE')) {
    // Distance calibration issue
  }
}

// Use results
if (result.confidence > 0.7) {
  // High confidence - use results
  console.log(`Prescription: ${result.sphere}D / ${result.cylinder}D @ ${result.axis}°`);
} else {
  // Low confidence - recommend professional exam
  console.warn('Low confidence - professional exam recommended');
}
```

