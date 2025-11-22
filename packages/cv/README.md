# @spect-it/cv

Computer Vision utilities for Spect-IT vision testing platform.

## Features

- **LiDAR Depth Detection** - Native depth sensor access (Mac + iOS)
- **Camera Depth Estimation** - Fallback depth measurement
- **Eye Landmark Detection** - MediaPipe Face Mesh integration
- **Pupil Geometry Extraction** - Pupil size and corneal measurements
- **Distance Calibration** - Accurate test distance measurement

## Usage

```typescript
import { LiDARDetector } from '@spect-it/cv'

const detector = new LiDARDetector({
  minDistance: 0.3,
  maxDistance: 5.0,
  updateRate: 30,
  smoothing: true
})

await detector.initialize()

detector.start((reading) => {
  console.log(`Distance: ${reading.distance}m (${reading.confidence})`)
})
```

## Device Support

- **LiDAR**: iPad Pro, iPhone Pro (12 Pro and later)
- **TrueDepth**: Face ID devices (iPhone X and later)
- **Camera Fallback**: All devices with front-facing camera

