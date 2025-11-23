// LiDAR Distance Measurement System for Visual Acuity Tests
// Provides accurate distance tracking and validation

class LiDARDistanceTracker {
    constructor() {
        this.isLiDARAvailable = false;
        this.currentDistance = null;
        this.initialDistance = null;
        this.distanceTolerance = 0.1; // 10% tolerance
        this.targetDistance = 6.0; // meters (standard clinical distance for Snellen chart)
        this.distanceHistory = [];
        this.isTracking = false;
        this.onDistanceChange = null;
        this.onDistanceValid = null;
        this.onDistanceInvalid = null;
        
        // Check for LiDAR availability
        this.checkLiDARAvailability();
    }
    
    checkLiDARAvailability() {
        // Check if device has LiDAR/TrueDepth (iOS devices)
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Check for depth sensing capability
            navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'user',
                    advanced: [{ depth: true }]
                } 
            }).then(stream => {
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities();
                if (capabilities.depth || capabilities.focusMode) {
                    this.isLiDARAvailable = true;
                }
                stream.getTracks().forEach(t => t.stop());
            }).catch(() => {
                this.isLiDARAvailable = false;
            });
        }
        
        // Also check for ARKit/WebXR (iOS Safari)
        if (window.DeviceOrientationEvent && 'requestPermission' in DeviceOrientationEvent) {
            // Likely iOS device - may have LiDAR
            this.isLiDARAvailable = true;
        }
    }
    
    async initializeDistanceMeasurement() {
        if (!this.isLiDARAvailable) {
            return this.fallbackDistanceMeasurement();
        }
        
        try {
            // Request camera access with depth
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            
            const video = document.createElement('video');
            video.srcObject = stream;
            video.autoplay = true;
            video.playsInline = true;
            
            await new Promise(resolve => {
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            });
            
            // Start distance tracking
            this.startTracking(video, stream);
            
            return {
                video: video,
                stream: stream,
                method: 'lidar'
            };
        } catch (error) {
            console.warn('LiDAR not available, using fallback:', error);
            return this.fallbackDistanceMeasurement();
        }
    }
    
    startTracking(video, stream) {
        this.isTracking = true;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const trackFrame = () => {
            if (!this.isTracking) return;
            
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // Estimate distance using face detection
            // In a real implementation, this would use ARKit depth data
            this.estimateDistanceFromFace(canvas, video).then(distance => {
                if (distance) {
                    this.updateDistance(distance);
                }
            });
            
            requestAnimationFrame(trackFrame);
        };
        
        trackFrame();
    }
    
    async estimateDistanceFromFace(canvas, video) {
        // Use face detection to estimate distance
        // This is a simplified version - real LiDAR would provide actual depth
        
        try {
            // Try to use MediaPipe or similar for face detection
            if (window.faceLandmarksDetection) {
                const model = await faceLandmarksDetection.load(
                    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
                );
                
                const faces = await model.estimateFaces({
                    input: video,
                    flipHorizontal: false
                });
                
                if (faces && faces.length > 0) {
                    const face = faces[0];
                    const landmarks = face.keypoints || face.landmarks;
                    
                    // Calculate face size to estimate distance
                    // Standard face width: ~140mm
                    const faceWidth = this.calculateFaceWidth(landmarks);
                    const standardFaceWidth = 140; // mm
                    
                    // Estimate distance using similar triangles
                    // This is approximate - real LiDAR would give exact depth
                    const estimatedDistance = (standardFaceWidth / faceWidth) * 0.5; // meters
                    
                    return estimatedDistance;
                }
            }
        } catch (error) {
            console.warn('Face detection failed:', error);
        }
        
        return null;
    }
    
    calculateFaceWidth(landmarks) {
        // Find leftmost and rightmost face points
        let minX = Infinity;
        let maxX = -Infinity;
        
        landmarks.forEach(point => {
            if (point.x < minX) minX = point.x;
            if (point.x > maxX) maxX = point.x;
        });
        
        return maxX - minX;
    }
    
    updateDistance(newDistance) {
        const previousDistance = this.currentDistance;
        this.currentDistance = newDistance;
        this.distanceHistory.push({
            distance: newDistance,
            timestamp: Date.now()
        });
        
        // Keep only last 30 measurements (1 second at 30fps)
        if (this.distanceHistory.length > 30) {
            this.distanceHistory.shift();
        }
        
        // Check if distance is valid
        const isValid = this.isDistanceValid(newDistance);
        
        if (this.onDistanceChange) {
            this.onDistanceChange(newDistance, isValid);
        }
        
        if (isValid && this.onDistanceValid) {
            this.onDistanceValid(newDistance);
        }
        
        if (!isValid && this.onDistanceInvalid) {
            this.onDistanceInvalid(newDistance, this.getDistanceStatus(newDistance));
        }
    }
    
    isDistanceValid(distance) {
        if (!this.initialDistance) return false;
        
        const minDistance = this.initialDistance * (1 - this.distanceTolerance);
        const maxDistance = this.initialDistance * (1 + this.distanceTolerance);
        
        return distance >= minDistance && distance <= maxDistance;
    }
    
    getDistanceStatus(distance) {
        if (!this.initialDistance) return 'unknown';
        
        const minDistance = this.initialDistance * (1 - this.distanceTolerance);
        const maxDistance = this.initialDistance * (1 + this.distanceTolerance);
        
        if (distance < minDistance) return 'too_close';
        if (distance > maxDistance) return 'too_far';
        return 'correct';
    }
    
    lockInitialDistance() {
        if (this.currentDistance) {
            this.initialDistance = this.currentDistance;
            return true;
        }
        return false;
    }
    
    stopTracking() {
        this.isTracking = false;
    }
    
    fallbackDistanceMeasurement() {
        // Fallback: Manual distance confirmation
        return {
            method: 'manual',
            prompt: 'Please stand exactly 6 meters from your screen. Confirm when ready.'
        };
    }
    
    getAverageDistance() {
        if (this.distanceHistory.length === 0) return null;
        
        const recent = this.distanceHistory.slice(-10); // Last 10 measurements
        const sum = recent.reduce((acc, m) => acc + m.distance, 0);
        return sum / recent.length;
    }
    
    getDistanceStability() {
        if (this.distanceHistory.length < 5) return 0;
        
        const recent = this.distanceHistory.slice(-5);
        const distances = recent.map(m => m.distance);
        const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
        const variance = distances.reduce((acc, d) => acc + Math.pow(d - avg, 2), 0) / distances.length;
        const stdDev = Math.sqrt(variance);
        
        // Stability score: lower stdDev = more stable
        return Math.max(0, 1 - (stdDev / avg));
    }
}

// Global instance
window.lidarTracker = new LiDARDistanceTracker();

