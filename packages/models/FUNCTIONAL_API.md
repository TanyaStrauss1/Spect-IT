# Functional Screening Model API

## Overview

Simpler, functional approach with automatic memory management using `tf.tidy()`.

## Basic Usage

```typescript
import {
  initScreeningBackend,
  loadScreeningModel,
  runScreening,
  type ScreeningInputs,
} from '@spect-it/models';

// Initialize backend (call once at app startup)
await initScreeningBackend("webgl");

// Load model (call once)
await loadScreeningModel("/models/screening/model.json");

// Run screening
const inputs: ScreeningInputs = {
  depthFeatures: [2.0, 0.9, 1, 0],
  geometryFeatures: [4.5, 4.5, 64.0, 7.8, 7.8, 0.0],
  visionTestFeatures: [1.0, 0.9, 0.0, 0.0],
};

const result = await runScreening(inputs);

console.log(result.sphere);      // -2.5 D
console.log(result.cylinder);    // -1.25 D
console.log(result.axis);        // 90°
console.log(result.confidence);  // 0.95
```

## React Hook Usage

```typescript
import { useScreeningFunctional, type ScreeningInputs } from '@/hooks/useScreeningFunctional';

function MyComponent() {
  const { isLoading, error, predict, status } = useScreeningFunctional({
    modelUrl: "/models/screening/model.json",
    backend: "webgl",
    autoLoad: true, // Auto-load on mount
  });

  const handleRun = async () => {
    const inputs: ScreeningInputs = {
      depthFeatures: [2.0, 0.9, 1, 0],
      geometryFeatures: [4.5, 4.5, 64.0, 7.8, 7.8, 0.0],
      visionTestFeatures: [1.0, 0.9, 0.0, 0.0],
    };

    const result = await predict(inputs);
    console.log(result);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Status: {status.loaded ? "✅" : "⏳"}</p>
      <p>Backend: {status.backend}</p>
      <button onClick={handleRun}>Run Screening</button>
    </div>
  );
}
```

## API Reference

### `initScreeningBackend(backend?: "webgl" | "wasm" | "cpu")`

Initialize TensorFlow.js backend with automatic fallback chain.

```typescript
// Try webgl first, fallback to wasm, then cpu
await initScreeningBackend("webgl");

// Try wasm first, fallback to webgl, then cpu
await initScreeningBackend("wasm");
```

### `loadScreeningModel(modelUrl: string)`

Load the screening model. Idempotent - safe to call multiple times.

```typescript
await loadScreeningModel("/models/screening/model.json");
```

### `runScreening(inputs: ScreeningInputs): Promise<ScreeningOutputs>`

Run screening prediction. Uses `tf.tidy()` for automatic memory management.

```typescript
const result = await runScreening({
  depthFeatures: [2.0, 0.9],
  geometryFeatures: [4.5, 64.0, 7.8],
  visionTestFeatures: [1.0, 0.9],
});
```

### `disposeScreeningModel()`

Dispose of the model (cleanup).

```typescript
disposeScreeningModel();
```

### `getScreeningModelStatus()`

Get current model status.

```typescript
const status = getScreeningModelStatus();
// { loaded: true, backend: "webgl", initialized: true }
```

## Input Structure

```typescript
type ScreeningInputs = {
  depthFeatures: number[];      // LiDAR/camera depth summary
  geometryFeatures: number[];   // Corneal curvature, asymmetry, etc.
  visionTestFeatures: number[]; // Acuity thresholds, contrast scores, etc.
};
```

## Output Structure

```typescript
type ScreeningOutputs = {
  sphere: number;      // Diopters (-12 to +12)
  cylinder: number;    // Diopters (-6 to +6)
  axis: number;        // Degrees (0-180)
  confidence: number;  // 0-1
};
```

## Backend Fallback

The functional API includes automatic backend fallback:

1. **WebGL** (default): Fastest, GPU acceleration
2. **WASM**: More predictable numerics
3. **CPU**: Most compatible, slowest

If your preferred backend fails, it automatically tries the others.

## Memory Management

All predictions use `tf.tidy()` which automatically disposes of intermediate tensors. No manual cleanup needed!

## Error Handling

```typescript
try {
  await initScreeningBackend("webgl");
  await loadScreeningModel("/models/screening/model.json");
  const result = await runScreening(inputs);
} catch (error) {
  if (error.message.includes("not loaded")) {
    // Model not loaded
  } else if (error.message.includes("Failed to init")) {
    // Backend initialization failed
  } else {
    // Other errors
  }
}
```

## Comparison: Functional vs Class-based

### Functional API (This)
- ✅ Simpler API
- ✅ Automatic memory management
- ✅ Backend fallback built-in
- ✅ Less boilerplate
- ✅ Shared model instance

### Class-based API (`ScreeningModel`)
- ✅ More control
- ✅ Quality flags
- ✅ Structured logging
- ✅ Model versioning
- ✅ Per-instance configuration

**Choose based on your needs:**
- Use **Functional API** for simplicity and quick integration
- Use **Class-based API** for advanced features and control

