# 👓 Virtual Try-On Improvement - Early Eye Detection

## 🎯 Problem
The virtual try-on feature needs to detect and find the user's eyes **earlier** in the process, before applying frames.

## ✅ Solution
Implement early eye detection that:
1. Detects eyes immediately when camera starts
2. Shows visual feedback when eyes are found
3. Only enables frame overlay after eyes are detected
4. Provides guidance if eyes aren't detected

---

## 💻 Implementation Code

### HTML Structure

```html
<div class="virtual-tryon-container">
  <div id="camera-container" class="camera-container">
    <video id="video" autoplay playsinline></video>
    <canvas id="canvas" style="display: none;"></canvas>
    
    <!-- Eye Detection Status -->
    <div id="eye-detection-status" class="eye-detection-status">
      <div class="detection-message">
        <span id="detection-text">Position your face in front of the camera...</span>
        <div class="detection-indicator">
          <div class="eye-indicator left-eye" id="left-eye-indicator">
            <span class="eye-icon">👁️</span>
            <span class="eye-status">Detecting...</span>
          </div>
          <div class="eye-indicator right-eye" id="right-eye-indicator">
            <span class="eye-icon">👁️</span>
            <span class="eye-status">Detecting...</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Frame Overlay (only shown after eyes detected) -->
    <div id="frame-overlay" class="frame-overlay" style="display: none;">
      <img id="frame-image" src="" alt="Eyeglass Frame">
    </div>
    
    <!-- Instructions -->
    <div class="tryon-instructions">
      <p id="instructions-text">
        Position your face in the center. Look straight at the camera.
        We'll detect your eyes automatically.
      </p>
    </div>
  </div>
  
  <!-- Frame Selection (disabled until eyes detected) -->
  <div class="frame-selection">
    <h3>Select Frame</h3>
    <div id="frame-gallery" class="frame-gallery">
      <!-- Frames will be loaded here -->
    </div>
    <p id="frame-selection-note" class="note">
      ⚠️ Please wait for eye detection before selecting a frame.
    </p>
  </div>
</div>
```

---

## 🔍 JavaScript - Early Eye Detection

### Using MediaPipe Face Mesh (Recommended)

```javascript
// Virtual Try-On with Early Eye Detection
class VirtualTryOn {
  constructor() {
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.faceMesh = null;
    this.eyesDetected = false;
    this.eyePositions = { left: null, right: null };
    this.detectionInterval = null;
    this.frameOverlay = document.getElementById('frame-overlay');
    this.frameImage = document.getElementById('frame-image');
    
    this.init();
  }
  
  async init() {
    // Initialize MediaPipe Face Mesh
    await this.initFaceMesh();
    
    // Start camera
    await this.startCamera();
    
    // Start early eye detection
    this.startEyeDetection();
  }
  
  async initFaceMesh() {
    // Load MediaPipe Face Mesh
    const { FaceMesh } = await import('@mediapipe/face_mesh');
    const { Camera } = await import('@mediapipe/camera_utils');
    
    this.faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      }
    });
    
    this.faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    // Handle face mesh results
    this.faceMesh.onResults((results) => {
      this.handleFaceMeshResults(results);
    });
  }
  
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });
      
      this.video.srcObject = stream;
      this.video.play();
      
      // Set canvas size to match video
      this.video.addEventListener('loadedmetadata', () => {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      });
      
      // Update detection status
      this.updateDetectionStatus('Camera started. Detecting eyes...');
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.updateDetectionStatus('Camera access denied. Please allow camera access.');
    }
  }
  
  startEyeDetection() {
    // Start continuous eye detection
    this.detectionInterval = setInterval(() => {
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.detectEyes();
      }
    }, 100); // Check every 100ms for fast detection
  }
  
  detectEyes() {
    // Draw video frame to canvas
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    
    // Process with Face Mesh
    if (this.faceMesh) {
      this.faceMesh.send({ image: this.canvas });
    }
  }
  
  handleFaceMeshResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];
      
      // Eye landmark indices (MediaPipe Face Mesh)
      const LEFT_EYE_INDICES = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
      const RIGHT_EYE_INDICES = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
      
      // Calculate eye positions
      const leftEye = this.calculateEyeCenter(landmarks, LEFT_EYE_INDICES);
      const rightEye = this.calculateEyeCenter(landmarks, RIGHT_EYE_INDICES);
      
      if (leftEye && rightEye) {
        this.eyePositions.left = leftEye;
        this.eyePositions.right = rightEye;
        
        if (!this.eyesDetected) {
          this.onEyesDetected();
        }
        
        // Update eye positions for frame overlay
        this.updateFrameOverlay(leftEye, rightEye);
      }
    } else {
      // No face detected
      if (this.eyesDetected) {
        this.onEyesLost();
      }
    }
  }
  
  calculateEyeCenter(landmarks, eyeIndices) {
    let sumX = 0, sumY = 0;
    let count = 0;
    
    eyeIndices.forEach(index => {
      const landmark = landmarks[index];
      if (landmark) {
        sumX += landmark.x * this.canvas.width;
        sumY += landmark.y * this.canvas.height;
        count++;
      }
    });
    
    if (count > 0) {
      return {
        x: sumX / count,
        y: sumY / count
      };
    }
    
    return null;
  }
  
  onEyesDetected() {
    this.eyesDetected = true;
    
    // Update UI
    this.updateDetectionStatus('✅ Eyes detected! You can now select a frame.', 'success');
    this.updateEyeIndicators(true, true);
    
    // Enable frame selection
    this.enableFrameSelection();
    
    // Show frame overlay
    this.frameOverlay.style.display = 'block';
    
    // Hide detection message after a moment
    setTimeout(() => {
      document.getElementById('eye-detection-status').style.opacity = '0.3';
    }, 2000);
  }
  
  onEyesLost() {
    this.eyesDetected = false;
    this.updateDetectionStatus('Eyes not detected. Please position your face in front of the camera.', 'warning');
    this.updateEyeIndicators(false, false);
    this.disableFrameSelection();
    this.frameOverlay.style.display = 'none';
  }
  
  updateDetectionStatus(message, type = 'info') {
    const statusText = document.getElementById('detection-text');
    statusText.textContent = message;
    statusText.className = `detection-text ${type}`;
  }
  
  updateEyeIndicators(leftDetected, rightDetected) {
    const leftIndicator = document.getElementById('left-eye-indicator');
    const rightIndicator = document.getElementById('right-eye-indicator');
    
    if (leftDetected) {
      leftIndicator.classList.add('detected');
      leftIndicator.querySelector('.eye-status').textContent = 'Detected';
    } else {
      leftIndicator.classList.remove('detected');
      leftIndicator.querySelector('.eye-status').textContent = 'Detecting...';
    }
    
    if (rightDetected) {
      rightIndicator.classList.add('detected');
      rightIndicator.querySelector('.eye-status').textContent = 'Detected';
    } else {
      rightIndicator.classList.remove('detected');
      rightIndicator.querySelector('.eye-status').textContent = 'Detecting...';
    }
  }
  
  updateFrameOverlay(leftEye, rightEye) {
    if (!this.eyesDetected || !this.frameImage.src) return;
    
    // Calculate frame position and size based on eye positions
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + 
      Math.pow(rightEye.y - leftEye.y, 2)
    );
    
    const frameWidth = eyeDistance * 2.5; // Frame width based on eye distance
    const frameHeight = frameWidth * 0.4; // Aspect ratio for frames
    
    // Center between eyes
    const centerX = (leftEye.x + rightEye.x) / 2;
    const centerY = (leftEye.y + rightEye.y) / 2;
    
    // Position frame overlay
    this.frameOverlay.style.left = `${centerX - frameWidth / 2}px`;
    this.frameOverlay.style.top = `${centerY - frameHeight / 2}px`;
    this.frameOverlay.style.width = `${frameWidth}px`;
    this.frameOverlay.style.height = `${frameHeight}px`;
  }
  
  enableFrameSelection() {
    const frameGallery = document.getElementById('frame-gallery');
    const frameNote = document.getElementById('frame-selection-note');
    
    frameGallery.style.pointerEvents = 'auto';
    frameGallery.style.opacity = '1';
    frameNote.style.display = 'none';
  }
  
  disableFrameSelection() {
    const frameGallery = document.getElementById('frame-gallery');
    const frameNote = document.getElementById('frame-selection-note');
    
    frameGallery.style.pointerEvents = 'none';
    frameGallery.style.opacity = '0.5';
    frameNote.style.display = 'block';
  }
  
  selectFrame(frameImageUrl) {
    if (!this.eyesDetected) {
      alert('Please wait for eye detection before selecting a frame.');
      return;
    }
    
    this.frameImage.src = frameImageUrl;
    this.frameOverlay.style.display = 'block';
  }
  
  stop() {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    
    if (this.video.srcObject) {
      this.video.srcObject.getTracks().forEach(track => track.stop());
    }
  }
}

// Initialize when page loads
let virtualTryOn;

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.querySelector('[onclick*="Start Camera"]');
  if (startButton) {
    startButton.addEventListener('click', () => {
      virtualTryOn = new VirtualTryOn();
    });
  }
});
```

---

## 🎨 CSS Styling

```css
.virtual-tryon-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.camera-container {
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
}

#video {
  width: 100%;
  height: auto;
  display: block;
}

.eye-detection-status {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px 20px;
  border-radius: 10px;
  z-index: 10;
  transition: opacity 0.3s;
}

.detection-message {
  text-align: center;
}

.detection-text {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
}

.detection-text.success {
  color: #4CAF50;
}

.detection-text.warning {
  color: #FF9800;
}

.detection-text.info {
  color: #2196F3;
}

.detection-indicator {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 10px;
}

.eye-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.eye-indicator.detected {
  background: rgba(76, 175, 80, 0.3);
  border: 2px solid #4CAF50;
}

.eye-icon {
  font-size: 24px;
}

.eye-status {
  font-size: 12px;
  color: #ccc;
}

.eye-indicator.detected .eye-status {
  color: #4CAF50;
  font-weight: bold;
}

.frame-overlay {
  position: absolute;
  pointer-events: none;
  z-index: 5;
  transition: all 0.1s;
}

.frame-overlay img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.9;
}

.tryon-instructions {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 12px;
  text-align: center;
  z-index: 10;
}

.frame-selection {
  margin-top: 30px;
}

.frame-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
  transition: opacity 0.3s;
}

.frame-gallery img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.frame-gallery img:hover {
  border-color: #667eea;
  transform: scale(1.05);
}

.frame-gallery:not([style*="pointer-events: auto"]) img {
  cursor: not-allowed;
  opacity: 0.5;
}

.note {
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 5px;
  color: #856404;
  font-size: 14px;
}
```

---

## 🔄 Alternative: Using TensorFlow.js (Lighter Weight)

```javascript
// Alternative using TensorFlow.js Face Landmarks
class VirtualTryOnTFJS {
  constructor() {
    this.model = null;
    this.video = document.getElementById('video');
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.eyesDetected = false;
    
    this.init();
  }
  
  async init() {
    // Load TensorFlow.js and Face Landmarks model
    await this.loadModel();
    await this.startCamera();
    this.startDetection();
  }
  
  async loadModel() {
    const tf = await import('@tensorflow/tfjs');
    const faceLandmarksDetection = await import('@tensorflow-models/face-landmarks-detection');
    
    this.model = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
      { maxFaces: 1 }
    );
  }
  
  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' }
    });
    this.video.srcObject = stream;
    this.video.play();
  }
  
  async startDetection() {
    setInterval(async () => {
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        await this.detectEyes();
      }
    }, 100);
  }
  
  async detectEyes() {
    const predictions = await this.model.estimateFaces({
      input: this.video,
      returnTensors: false,
      flipHorizontal: false,
      annotateLandmarks: true
    });
    
    if (predictions.length > 0) {
      const keypoints = predictions[0].scaledMesh;
      
      // Eye keypoints (MediaPipe Face Mesh indices)
      const leftEye = this.getEyeCenter(keypoints, [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]);
      const rightEye = this.getEyeCenter(keypoints, [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]);
      
      if (leftEye && rightEye && !this.eyesDetected) {
        this.onEyesDetected();
      }
      
      this.eyePositions = { left: leftEye, right: rightEye };
    } else {
      if (this.eyesDetected) {
        this.onEyesLost();
      }
    }
  }
  
  getEyeCenter(keypoints, indices) {
    let sumX = 0, sumY = 0;
    indices.forEach(i => {
      sumX += keypoints[i][0];
      sumY += keypoints[i][1];
    });
    return {
      x: sumX / indices.length,
      y: sumY / indices.length
    };
  }
  
  onEyesDetected() {
    this.eyesDetected = true;
    this.updateUI('Eyes detected!', 'success');
  }
  
  onEyesLost() {
    this.eyesDetected = false;
    this.updateUI('Eyes not detected', 'warning');
  }
  
  updateUI(message, type) {
    // Update UI elements
    const statusText = document.getElementById('detection-text');
    statusText.textContent = message;
    statusText.className = `detection-text ${type}`;
  }
}
```

---

## 📦 Required Dependencies

### Option 1: MediaPipe (Recommended)
```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"></script>
```

### Option 2: TensorFlow.js
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection"></script>
```

---

## ✅ Key Improvements

1. **Early Detection**: Eyes detected immediately when camera starts
2. **Visual Feedback**: Real-time indicators show when eyes are found
3. **Frame Selection Locked**: Can't select frames until eyes are detected
4. **Continuous Monitoring**: Eyes re-detected if face moves out of frame
5. **Better UX**: Clear instructions and status messages
6. **Performance**: Fast detection (100ms intervals)

---

## 🚀 Implementation Steps

1. Add HTML structure to your website
2. Include MediaPipe or TensorFlow.js libraries
3. Add JavaScript code for eye detection
4. Add CSS styling
5. Test on different devices and browsers
6. Optimize detection speed and accuracy

---

**Ready to implement early eye detection for virtual try-on!** 👓

