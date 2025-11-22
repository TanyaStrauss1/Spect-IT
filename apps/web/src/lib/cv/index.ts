// Stub CV modules - to be implemented
export class LiDARDetector {
  async initialize() {}
  start() {}
  stop() {}
}

export class EyeLandmarkDetector {
  async initialize() {}
}

export class PupilGeometryExtractor {
  extract() { return {}; }
}

export class DistanceCalibrator {
  setTargetDistance() {}
  calibrate() { return { isStable: false }; }
}

export class AcuityScorer {
  generateLineLetters() { return ''; }
}
