/**
 * Spect-IT Computer Vision Package
 * 
 * Exports all CV modules:
 * - LiDAR depth detection
 * - Camera depth estimation
 * - Eye landmark detection
 * - Pupil/corneal geometry
 * - Distance calibration
 */

export { LiDARDetector, type LiDARConfig, type DepthReading } from './lidar/lidar-detector'
export { CameraDepthEstimator } from './depth/camera-depth-estimator'
export { EyeLandmarkDetector } from './eye/eye-landmark-detector'
export { PupilGeometryExtractor } from './eye/pupil-geometry-extractor'
export { DistanceCalibrator } from './calibration/distance-calibrator'

