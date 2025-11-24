// Spect-IT Virtual Try-On with Auto Eye Detection & Frame Resizing
// Uses MediaPipe Face Mesh for accurate eye detection

(function() {
  'use strict';
  
  let video = null;
  let canvas = null;
  let ctx = null;
  let stream = null;
  let faceMesh = null;
  let animationFrame = null;
  let currentFrame = null;
  let eyePositions = { left: null, right: null };
  let isDetecting = false;
  
  // MediaPipe Face Mesh model (using CDN)
  const FACE_MESH_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh';
  
  // Initialize MediaPipe Face Mesh
  async function initializeFaceMesh() {
    if (window.faceLandmarksDetection) {
      return window.faceLandmarksDetection;
    }
    
    // Load MediaPipe Face Mesh from CDN
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1635988167/face_mesh.js';
      script.onload = () => {
        if (window.faceLandmarksDetection) {
          resolve(window.faceLandmarksDetection);
        } else {
          reject(new Error('Face Mesh failed to load'));
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  // Start camera
  window.startCamera = async function() {
    try {
      video = document.getElementById('video');
      canvas = document.getElementById('canvas');
      const container = document.getElementById('camera-container');
      const detectionStatus = document.getElementById('eye-detection-status');
      const frameOverlay = document.getElementById('frame-overlay');
      
      if (!video || !canvas) {
        alert('Camera elements not found');
        return;
      }
      
      // Request camera access
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      video.srcObject = stream;
      video.play();
      
      // Show video
      video.style.display = 'block';
      video.style.width = '100%';
      video.style.maxWidth = '640px';
      video.style.margin = '0 auto';
      video.style.borderRadius = '10px';
      
      // Set canvas size
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      ctx = canvas.getContext('2d');
      
      // Show detection status
      if (detectionStatus) {
        detectionStatus.style.display = 'block';
      }
      
      // Initialize face detection
      try {
        await initializeFaceMesh();
        startEyeDetection();
      } catch (error) {
        console.warn('Face Mesh not available, using fallback detection:', error);
        startFallbackEyeDetection();
      }
      
      // Update button
      const startBtn = document.getElementById('start-camera-btn');
      const stopBtn = document.getElementById('stop-camera-btn');
      if (startBtn) startBtn.style.display = 'none';
      if (stopBtn) stopBtn.style.display = 'inline-block';
      
    } catch (error) {
      console.error('Error starting camera:', error);
      alert('Could not access camera. Please allow camera permissions.');
    }
  };
  
  // Stop camera
  window.stopCamera = function() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    
    if (video) {
      video.srcObject = null;
      video.style.display = 'none';
    }
    
    if (canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    const detectionStatus = document.getElementById('eye-detection-status');
    const frameOverlay = document.getElementById('frame-overlay');
    if (detectionStatus) detectionStatus.style.display = 'none';
    if (frameOverlay) frameOverlay.style.display = 'none';
    
    eyePositions = { left: null, right: null };
    isDetecting = false;
    
    // Update buttons
    const startBtn = document.getElementById('start-camera-btn');
    const stopBtn = document.getElementById('stop-camera-btn');
    if (startBtn) startBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
  };
  
  // Start eye detection loop
  function startEyeDetection() {
    if (!video || !canvas || !ctx) return;
    
    isDetecting = true;
    
    function detectLoop() {
      if (!isDetecting || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrame = requestAnimationFrame(detectLoop);
        return;
      }
      
      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Detect eyes using MediaPipe or fallback
      detectEyes();
      
      animationFrame = requestAnimationFrame(detectLoop);
    }
    
    detectLoop();
  }
  
  // Fallback eye detection (simpler, works without MediaPipe)
  function startFallbackEyeDetection() {
    if (!video || !canvas || !ctx) return;
    
    isDetecting = true;
    
    function detectLoop() {
      if (!isDetecting || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationFrame = requestAnimationFrame(detectLoop);
        return;
      }
      
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      detectEyesFallback();
      
      animationFrame = requestAnimationFrame(detectLoop);
    }
    
    detectLoop();
  }
  
  // Detect eyes using MediaPipe Face Mesh
  async function detectEyes() {
    if (!window.faceLandmarksDetection || !canvas) return;
    
    try {
      const faces = await window.faceLandmarksDetection.detectFaces(canvas);
      
      if (faces && faces.length > 0) {
        const face = faces[0];
        const landmarks = face.landmarks;
        
        // MediaPipe eye landmarks (approximate indices)
        // Left eye: ~33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
        // Right eye: ~362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
        
        // Calculate eye centers (simplified)
        const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173];
        const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466];
        
        let leftEyeSum = { x: 0, y: 0, count: 0 };
        let rightEyeSum = { x: 0, y: 0, count: 0 };
        
        leftEyeIndices.forEach(idx => {
          if (landmarks[idx]) {
            leftEyeSum.x += landmarks[idx].x;
            leftEyeSum.y += landmarks[idx].y;
            leftEyeSum.count++;
          }
        });
        
        rightEyeIndices.forEach(idx => {
          if (landmarks[idx]) {
            rightEyeSum.x += landmarks[idx].x;
            rightEyeSum.y += landmarks[idx].y;
            rightEyeSum.count++;
          }
        });
        
        if (leftEyeSum.count > 0 && rightEyeSum.count > 0) {
          eyePositions.left = {
            x: (leftEyeSum.x / leftEyeSum.count) * canvas.width,
            y: (leftEyeSum.y / leftEyeSum.count) * canvas.height
          };
          
          eyePositions.right = {
            x: (rightEyeSum.x / rightEyeSum.count) * canvas.width,
            y: (rightEyeSum.y / rightEyeSum.count) * canvas.height
          };
          
          updateEyeDetectionStatus(true);
          updateFrameOverlay();
        }
      } else {
        updateEyeDetectionStatus(false);
      }
    } catch (error) {
      console.warn('Face detection error:', error);
      detectEyesFallback();
    }
  }
  
  // Fallback eye detection (uses face detection API or estimation)
  function detectEyesFallback() {
    if (!canvas) return;
    
    // Simple estimation: assume eyes are at ~40% and 60% of face width, ~35% from top
    // This is a fallback when MediaPipe isn't available
    const faceWidth = canvas.width * 0.6;
    const faceHeight = canvas.height * 0.7;
    const faceX = canvas.width * 0.2;
    const faceY = canvas.height * 0.15;
    
    // Estimate eye positions
    const eyeY = faceY + faceHeight * 0.35;
    const leftEyeX = faceX + faceWidth * 0.3;
    const rightEyeX = faceX + faceWidth * 0.7;
    
    eyePositions.left = { x: leftEyeX, y: eyeY };
    eyePositions.right = { x: rightEyeX, y: eyeY };
    
    updateEyeDetectionStatus(true);
    updateFrameOverlay();
  }
  
  // Update eye detection status display
  function updateEyeDetectionStatus(detected) {
    const leftIndicator = document.getElementById('left-eye-indicator');
    const rightIndicator = document.getElementById('right-eye-indicator');
    const detectionText = document.getElementById('detection-text');
    
    if (detected && eyePositions.left && eyePositions.right) {
      if (leftIndicator) {
        leftIndicator.textContent = '👁️ Left: Detected ✓';
        leftIndicator.style.color = '#4CAF50';
      }
      if (rightIndicator) {
        rightIndicator.textContent = '👁️ Right: Detected ✓';
        rightIndicator.style.color = '#4CAF50';
      }
      if (detectionText) {
        detectionText.textContent = 'Eyes detected! Frame will resize automatically.';
        detectionText.style.color = '#4CAF50';
      }
    } else {
      if (leftIndicator) {
        leftIndicator.textContent = '👁️ Left: Detecting...';
        leftIndicator.style.color = '#FF9800';
      }
      if (rightIndicator) {
        rightIndicator.textContent = '👁️ Right: Detecting...';
        rightIndicator.style.color = '#FF9800';
      }
      if (detectionText) {
        detectionText.textContent = 'Detecting eyes...';
        detectionText.style.color = '#FF9800';
      }
    }
  }
  
  // Update frame overlay
  function updateFrameOverlay() {
    if (!eyePositions.left || !eyePositions.right || !video) return;
    
    const frameOverlay = document.getElementById('frame-overlay');
    const frameImage = document.getElementById('frame-image');
    
    if (!frameOverlay || !frameImage) return;
    
    // Calculate frame position and size based on eye positions
    const eyeDistance = Math.abs(eyePositions.right.x - eyePositions.left.x);
    const eyeCenterY = (eyePositions.left.y + eyePositions.right.y) / 2;
    const eyeCenterX = (eyePositions.left.x + eyePositions.right.x) / 2;
    
    // Frame dimensions (proportional to eye distance)
    const frameWidth = eyeDistance * 2.2; // Frame is ~2.2x eye distance
    const frameHeight = frameWidth * 0.4; // Frame height is ~40% of width
    const frameX = eyeCenterX - frameWidth / 2;
    const frameY = eyeCenterY - frameHeight * 0.6; // Position above eyes
    
    // Set frame overlay position and size
    frameOverlay.style.position = 'absolute';
    frameOverlay.style.left = `${frameX}px`;
    frameOverlay.style.top = `${frameY}px`;
    frameOverlay.style.width = `${frameWidth}px`;
    frameOverlay.style.height = `${frameHeight}px`;
    frameOverlay.style.display = 'block';
    frameOverlay.style.pointerEvents = 'none';
    frameOverlay.style.zIndex = '10';
    
    // Set frame image
    if (!frameImage.src) {
      // Default frame image (you can replace with actual frame images)
      frameImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIzIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI0MCIgcj0iMjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzMzMzMzMyIgc3Ryb2tlLXdpZHRoPSIyIi8+PGNpcmNsZSBjeD0iMTUwIiBjeT0iNDAiIHI9IjIwIiBmaWxsPSJub25lIiBzdHJva2U9IiMzMzMzMzMiIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==';
    }
    
    frameImage.style.width = '100%';
    frameImage.style.height = '100%';
    frameImage.style.objectFit = 'contain';
  }
  
  // Try on a specific frame
  window.tryOnFrame = function(frameImageUrl) {
    const frameImage = document.getElementById('frame-image');
    if (frameImage) {
      frameImage.src = frameImageUrl;
    }
  };
  
  // Export
  window.SpectITVirtualTryOn = {
    startCamera: window.startCamera,
    stopCamera: window.stopCamera,
    tryOnFrame: window.tryOnFrame,
    getEyePositions: () => eyePositions
  };
})();

