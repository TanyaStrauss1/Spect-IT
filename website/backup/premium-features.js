/**
 * SPECT-IT PREMIUM FEATURES
 * Most Advanced Eye Testing App - Professional Grade
 */

// Advanced AI-Powered Eye Tracking
class AdvancedEyeTracker {
    constructor() {
        this.faceMesh = null;
        this.eyeLandmarks = null;
        this.pupilSize = { left: 0, right: 0 };
        this.gazeDirection = { x: 0, y: 0 };
        this.blinkRate = 0;
        this.fixationPoints = [];
        this.initialize();
    }

    async initialize() {
        try {
            // Load MediaPipe Face Mesh for advanced tracking
            if (typeof faceLandmarksDetection !== 'undefined') {
                this.faceMesh = await faceLandmarksDetection.load(
                    faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                    { maxFaces: 1 }
                );
            }
        } catch (error) {
            console.warn('Advanced eye tracking initialization:', error);
        }
    }

    async trackEyes(videoElement) {
        if (!this.faceMesh || !videoElement) return null;

        try {
            const faces = await this.faceMesh.estimateFaces({
                input: videoElement,
                returnTensors: false,
                flipHorizontal: false,
                staticImageMode: false
            });

            if (faces.length > 0) {
                const face = faces[0];
                this.processEyeData(face);
                return this.getEyeMetrics();
            }
        } catch (error) {
            console.error('Eye tracking error:', error);
        }
        return null;
    }

    processEyeData(face) {
        // Extract eye landmarks (MediaPipe provides 468 face landmarks)
        const landmarks = face.keypoints;
        
        // Left eye landmarks (indices 33-46)
        const leftEye = landmarks.slice(33, 46);
        // Right eye landmarks (indices 263-276)
        const rightEye = landmarks.slice(263, 276);

        // Calculate pupil size
        this.pupilSize.left = this.calculatePupilSize(leftEye);
        this.pupilSize.right = this.calculatePupilSize(rightEye);

        // Calculate gaze direction
        this.gazeDirection = this.calculateGaze(leftEye, rightEye);

        // Detect blinks
        this.detectBlink(leftEye, rightEye);

        // Track fixation points
        this.trackFixation();
    }

    calculatePupilSize(eyeLandmarks) {
        // Calculate eye width and height
        const width = Math.abs(eyeLandmarks[0].x - eyeLandmarks[3].x);
        const height = Math.abs(eyeLandmarks[1].y - eyeLandmarks[4].y);
        return (width + height) / 2;
    }

    calculateGaze(leftEye, rightEye) {
        // Calculate center of each eye
        const leftCenter = this.getEyeCenter(leftEye);
        const rightCenter = this.getEyeCenter(rightEye);
        
        // Calculate gaze direction based on eye centers
        return {
            x: (leftCenter.x + rightCenter.x) / 2,
            y: (leftCenter.y + rightCenter.y) / 2
        };
    }

    getEyeCenter(eyeLandmarks) {
        const x = eyeLandmarks.reduce((sum, p) => sum + p.x, 0) / eyeLandmarks.length;
        const y = eyeLandmarks.reduce((sum, p) => sum + p.y, 0) / eyeLandmarks.length;
        return { x, y };
    }

    detectBlink(leftEye, rightEye) {
        const leftHeight = Math.abs(leftEye[1].y - leftEye[4].y);
        const rightHeight = Math.abs(rightEye[1].y - rightEye[4].y);
        
        // Blink detected if eye height is very small
        if (leftHeight < 0.02 || rightHeight < 0.02) {
            this.blinkRate++;
        }
    }

    trackFixation() {
        this.fixationPoints.push({
            x: this.gazeDirection.x,
            y: this.gazeDirection.y,
            timestamp: Date.now()
        });
        
        // Keep only last 60 points (1 second at 60fps)
        if (this.fixationPoints.length > 60) {
            this.fixationPoints.shift();
        }
    }

    getEyeMetrics() {
        return {
            pupilSize: { ...this.pupilSize },
            gazeDirection: { ...this.gazeDirection },
            blinkRate: this.blinkRate,
            fixationStability: this.calculateFixationStability(),
            eyeAlignment: this.calculateEyeAlignment()
        };
    }

    calculateFixationStability() {
        if (this.fixationPoints.length < 10) return 0;
        
        const variance = this.calculateVariance(this.fixationPoints);
        // Lower variance = more stable fixation
        return Math.max(0, 100 - (variance * 1000));
    }

    calculateVariance(points) {
        const meanX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
        const meanY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
        
        const variance = points.reduce((sum, p) => {
            const dx = p.x - meanX;
            const dy = p.y - meanY;
            return sum + (dx * dx + dy * dy);
        }, 0) / points.length;
        
        return variance;
    }

    calculateEyeAlignment() {
        // Calculate inter-pupillary distance and alignment
        const leftPupil = this.pupilSize.left;
        const rightPupil = this.pupilSize.right;
        const alignment = Math.abs(leftPupil - rightPupil) / Math.max(leftPupil, rightPupil);
        return (1 - alignment) * 100; // Percentage alignment
    }
}

// Advanced Prescription Measurement with 3D Face Mapping
class AdvancedPrescriptionMeasurement {
    constructor() {
        this.faceMesh = null;
        this.measurements = {
            ipd: 0, // Inter-pupillary distance
            pd: { distance: 0, near: 0 }, // Pupillary distance
            faceWidth: 0,
            faceHeight: 0,
            noseBridge: 0,
            templeWidth: 0
        };
    }

    async measurePrescription(videoElement, distance) {
        if (!this.faceMesh) {
            await this.initialize();
        }

        try {
            const faces = await this.faceMesh.estimateFaces({
                input: videoElement,
                returnTensors: false,
                flipHorizontal: false,
                staticImageMode: false
            });

            if (faces.length > 0) {
                const face = faces[0];
                this.calculate3DMeasurements(face, distance);
                return this.generatePrescription();
            }
        } catch (error) {
            console.error('Prescription measurement error:', error);
        }
        return null;
    }

    async initialize() {
        if (typeof faceLandmarksDetection !== 'undefined') {
            this.faceMesh = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { maxFaces: 1 }
            );
        }
    }

    calculate3DMeasurements(face, distance) {
        const landmarks = face.keypoints;
        
        // Get key facial points
        const leftPupil = landmarks[468]; // Left eye center (approximate)
        const rightPupil = landmarks[473]; // Right eye center (approximate)
        const noseTip = landmarks[4];
        const leftTemple = landmarks[234];
        const rightTemple = landmarks[454];
        const chin = landmarks[175];

        // Calculate IPD (Inter-pupillary distance) in mm
        const pixelIPD = Math.sqrt(
            Math.pow(rightPupil.x - leftPupil.x, 2) +
            Math.pow(rightPupil.y - leftPupil.y, 2)
        );
        
        // Convert to real-world measurement using distance
        // Formula: real_size = (pixel_size * distance) / focal_length
        // Approximate focal length for typical phone camera: 3.5mm
        const focalLength = 3.5; // mm
        this.measurements.ipd = (pixelIPD * distance) / focalLength;

        // Calculate face measurements
        this.measurements.faceWidth = Math.abs(rightTemple.x - leftTemple.x) * distance / focalLength;
        this.measurements.faceHeight = Math.abs(chin.y - landmarks[10].y) * distance / focalLength;
        this.measurements.noseBridge = Math.abs(noseTip.x - landmarks[168].x) * distance / focalLength;
        this.measurements.templeWidth = this.measurements.faceWidth;

        // PD measurements (distance and near)
        this.measurements.pd.distance = this.measurements.ipd;
        this.measurements.pd.near = this.measurements.ipd - 3; // Typically 3mm less for near vision
    }

    generatePrescription() {
        return {
            ipd: Math.round(this.measurements.ipd * 10) / 10,
            pd: {
                distance: Math.round(this.measurements.pd.distance * 10) / 10,
                near: Math.round(this.measurements.pd.near * 10) / 10
            },
            faceMeasurements: {
                width: Math.round(this.measurements.faceWidth * 10) / 10,
                height: Math.round(this.measurements.faceHeight * 10) / 10,
                noseBridge: Math.round(this.measurements.noseBridge * 10) / 10,
                templeWidth: Math.round(this.measurements.templeWidth * 10) / 10
            },
            frameRecommendations: this.recommendFrames()
        };
    }

    recommendFrames() {
        const width = this.measurements.faceWidth;
        const pd = this.measurements.pd.distance;
        
        let recommendations = {
            frameWidth: 'Medium',
            bridgeWidth: 'Standard',
            templeLength: 'Standard'
        };

        // Frame width recommendations
        if (width < 120) recommendations.frameWidth = 'Narrow';
        else if (width > 140) recommendations.frameWidth = 'Wide';

        // Bridge width recommendations
        if (this.measurements.noseBridge < 15) recommendations.bridgeWidth = 'Narrow';
        else if (this.measurements.noseBridge > 20) recommendations.bridgeWidth = 'Wide';

        return recommendations;
    }
}

// Premium Test Analytics
class PremiumTestAnalytics {
    constructor() {
        this.testHistory = [];
        this.trends = {};
    }

    analyzeTestResults(results) {
        this.testHistory.push({
            ...results,
            timestamp: Date.now(),
            date: new Date().toISOString()
        });

        this.calculateTrends();
        return this.generateInsights();
    }

    calculateTrends() {
        if (this.testHistory.length < 2) return;

        const recent = this.testHistory.slice(-10); // Last 10 tests
        
        this.trends = {
            visualAcuity: this.calculateTrend(recent, 'visualAcuity'),
            colorVision: this.calculateTrend(recent, 'colorVision'),
            astigmatism: this.calculateTrend(recent, 'astigmatism'),
            prescription: this.calculatePrescriptionTrend(recent)
        };
    }

    calculateTrend(tests, metric) {
        const values = tests.map(t => t[metric]?.score || 0);
        if (values.length < 2) return { direction: 'stable', change: 0 };

        const first = values[0];
        const last = values[values.length - 1];
        const change = last - first;
        const percentChange = (change / first) * 100;

        return {
            direction: change > 0 ? 'improving' : change < 0 ? 'declining' : 'stable',
            change: Math.round(percentChange * 10) / 10,
            values: values
        };
    }

    calculatePrescriptionTrend(tests) {
        const prescriptions = tests
            .filter(t => t.prescription)
            .map(t => ({
                sphere: t.prescription.sphere || 0,
                cylinder: t.prescription.cylinder || 0,
                axis: t.prescription.axis || 0
            }));

        if (prescriptions.length < 2) return null;

        const first = prescriptions[0];
        const last = prescriptions[prescriptions.length - 1];

        return {
            sphereChange: last.sphere - first.sphere,
            cylinderChange: last.cylinder - first.cylinder,
            axisChange: Math.abs(last.axis - first.axis)
        };
    }

    generateInsights() {
        const insights = {
            overallHealth: this.calculateOverallHealth(),
            recommendations: this.generateRecommendations(),
            riskFactors: this.identifyRiskFactors(),
            trends: this.trends
        };

        return insights;
    }

    calculateOverallHealth() {
        if (this.testHistory.length === 0) return null;

        const latest = this.testHistory[this.testHistory.length - 1];
        let score = 100;

        // Deduct points for issues
        if (latest.visualAcuity?.score < 20/20) score -= 20;
        if (latest.colorVision?.deficiency) score -= 15;
        if (latest.astigmatism?.present) score -= 10;
        if (latest.contrastSensitivity?.score < 80) score -= 10;

        return {
            score: Math.max(0, score),
            level: score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : 'Needs Attention'
        };
    }

    generateRecommendations() {
        const recommendations = [];
        const latest = this.testHistory[this.testHistory.length - 1];

        if (!latest) return recommendations;

        if (latest.visualAcuity?.score < 20/20) {
            recommendations.push({
                type: 'vision_correction',
                priority: 'high',
                message: 'Consider vision correction options. Schedule an eye exam with a professional.'
            });
        }

        if (latest.colorVision?.deficiency) {
            recommendations.push({
                type: 'color_vision',
                priority: 'medium',
                message: 'Color vision deficiency detected. Consult with an optometrist for specialized testing.'
            });
        }

        if (this.trends.visualAcuity?.direction === 'declining') {
            recommendations.push({
                type: 'monitoring',
                priority: 'high',
                message: 'Your vision appears to be declining. Regular monitoring recommended.'
            });
        }

        return recommendations;
    }

    identifyRiskFactors() {
        const riskFactors = [];
        const latest = this.testHistory[this.testHistory.length - 1];

        if (!latest) return riskFactors;

        // Age-related risk
        const age = this.estimateAge();
        if (age > 40) {
            riskFactors.push({
                type: 'age_related',
                severity: age > 60 ? 'high' : 'medium',
                message: 'Age-related vision changes may occur. Regular comprehensive eye exams recommended.'
            });
        }

        // Prescription changes
        if (this.trends.prescription?.sphereChange > 0.5) {
            riskFactors.push({
                type: 'prescription_change',
                severity: 'medium',
                message: 'Significant prescription change detected. Update your corrective lenses.'
            });
        }

        return riskFactors;
    }

    estimateAge() {
        // This would typically come from user profile
        // For now, return a default
        return 30;
    }
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.AdvancedEyeTracker = AdvancedEyeTracker;
    window.AdvancedPrescriptionMeasurement = AdvancedPrescriptionMeasurement;
    window.PremiumTestAnalytics = PremiumTestAnalytics;
}

