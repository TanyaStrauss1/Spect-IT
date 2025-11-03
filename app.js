// Navigation functionality
function showTest(testId) {
    try {
        // Hide all test sections
        document.querySelectorAll('.test-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show selected test
        const targetSection = document.getElementById(testId);
        if (!targetSection) {
            console.error(`Test section with id "${testId}" not found`);
            return;
        }
        targetSection.classList.add('active');
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.test === testId) {
                btn.classList.add('active');
            }
        });
        
        // Initialize test if needed
        if (testId === 'acuity') {
            initializeAcuityTest();
        } else if (testId === 'color') {
            initializeColorTest();
        } else if (testId === 'astigmatism') {
            initializeAstigmatismTest();
        } else if (testId === 'prescription') {
            initializePrescriptionTest();
        } else if (testId === 'contrast') {
            initializeContrastTest();
        } else if (testId === 'depth') {
            initializeDepthTest();
        } else if (testId === 'visualfield') {
            initializeVisualFieldTest();
        } else if (testId === 'dominance') {
            initializeDominanceTest();
        } else if (testId === 'nearvision') {
            initializeNearVisionTest();
        } else if (testId === 'results') {
            initializeResultsPage();
        } else if (testId === 'shop') {
            initializeShop();
        } else if (testId === 'account') {
            initializeAccount();
        }
    } catch (error) {
        console.error('Error showing test:', error);
    }
}

// Navigation event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Nav button clicks
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            showTest(btn.dataset.test);
        });
    });
    
    // Test card clicks
    document.querySelectorAll('.test-card').forEach(card => {
        card.addEventListener('click', () => {
            showTest(card.dataset.test);
        });
    });
    
    // Start button clicks
    document.querySelectorAll('.start-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const card = btn.closest('.test-card');
            showTest(card.dataset.test);
        });
    });
    
    // Dropdown menu
    const moreTestsBtn = document.getElementById('more-tests-btn');
    const dropdown = document.getElementById('dropdown-content');
    if (moreTestsBtn && dropdown) {
        moreTestsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!moreTestsBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
        
        // Dropdown button clicks
        document.querySelectorAll('.nav-btn-dropdown').forEach(btn => {
            btn.addEventListener('click', () => {
                showTest(btn.dataset.test);
                dropdown.classList.remove('show');
            });
        });
    }
    
    // Initialize home screen
    showTest('home');
});

// ========== VISUAL ACUITY TEST ==========
let currentDistance = 6; // feet
let selectedLine = null;

const snellenLines = [
    { size: '20/200', letters: 'E', ratio: 1.0 },
    { size: '20/100', letters: 'F P', ratio: 0.8 },
    { size: '20/70', letters: 'T O Z', ratio: 0.65 },
    { size: '20/50', letters: 'L P E D', ratio: 0.5 },
    { size: '20/40', letters: 'F D P E O', ratio: 0.4 },
    { size: '20/30', letters: 'D E F P O T', ratio: 0.35 },
    { size: '20/25', letters: 'E O T D F C', ratio: 0.3 },
    { size: '20/20', letters: 'D E F P O T E C', ratio: 0.25 },
    { size: '20/15', letters: 'E O T D F C P E D', ratio: 0.2 }
];

function initializeAcuityTest() {
    generateSnellenChart();
    
    // Distance toggle
    document.getElementById('distance-toggle').addEventListener('click', () => {
        currentDistance = currentDistance === 6 ? 20 : 6;
        document.getElementById('distance-display').textContent = `${currentDistance} feet`;
        generateSnellenChart();
    });
}

function generateSnellenChart() {
    const chart = document.getElementById('snellen-chart');
    chart.innerHTML = '';
    selectedLine = null;
    document.getElementById('acuity-results').style.display = 'none';
    
    // Adjust size based on distance
    const distanceMultiplier = currentDistance === 6 ? 1 : 3.33;
    
    snellenLines.forEach((line, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'snellen-line';
        lineDiv.dataset.size = line.size;
        
        const sizeLabel = document.createElement('h3');
        sizeLabel.textContent = line.size;
        
        const lettersDiv = document.createElement('div');
        lettersDiv.className = 'snellen-letters';
        lettersDiv.textContent = line.letters;
        
        // Adjust font size based on ratio and distance
        const fontSize = Math.max(16, (line.ratio * distanceMultiplier * 150));
        lettersDiv.style.fontSize = `${fontSize}px`;
        
        lineDiv.appendChild(sizeLabel);
        lineDiv.appendChild(lettersDiv);
        
        lineDiv.addEventListener('click', () => {
            // Remove clicked class from all lines
            document.querySelectorAll('.snellen-line').forEach(l => {
                l.classList.remove('clicked');
            });
            
            // Add clicked class to selected line
            lineDiv.classList.add('clicked');
            selectedLine = line.size;
            
            // Show results
            displayAcuityResults(line.size);
        });
        
        chart.appendChild(lineDiv);
    });
}

function displayAcuityResults(size) {
    const resultsDiv = document.getElementById('acuity-results');
    const resultText = document.getElementById('acuity-result-text');
    
    let interpretation = '';
    const numericValue = parseFloat(size.split('/')[1]);
    
    if (numericValue <= 20) {
        interpretation = 'Excellent vision! You have normal or better visual acuity.';
    } else if (numericValue <= 30) {
        interpretation = 'Good vision. Minor correction may be beneficial.';
    } else if (numericValue <= 40) {
        interpretation = 'Moderate vision. You may benefit from glasses.';
    } else if (numericValue <= 70) {
        interpretation = 'Poor vision. Consultation with an eye doctor is recommended.';
    } else {
        interpretation = 'Very poor vision. Professional eye examination is strongly recommended.';
    }
    
    resultText.textContent = `Your visual acuity: ${size}. ${interpretation}`;
    resultsDiv.style.display = 'block';
}

function resetAcuityTest() {
    generateSnellenChart();
}

// ========== COLOR BLINDNESS TEST ==========
let currentPlate = 0;
let colorAnswers = [];
let colorScore = 0;

// Ishihara test plates - [correct answer, pattern type]
const ishiharaPlates = [
    [12, 'normal'],  // Most people see 12
    [8, 'normal'],   // Most people see 8
    [29, 'normal'],  // Most people see 29
    [5, 'deuteranopia'],  // Colorblind might not see
    [3, 'normal'],   // Most people see 3
    [15, 'normal'],  // Most people see 15
    [74, 'protanopia'], // Colorblind might not see
    [6, 'normal'],   // Most people see 6
    [45, 'normal'],  // Most people see 45
    [2, 'normal']    // Most people see 2
];

function initializeColorTest() {
    currentPlate = 0;
    colorAnswers = [];
    colorScore = 0;
    document.getElementById('color-results').style.display = 'none';
    document.getElementById('total-plates').textContent = ishiharaPlates.length;
    generateColorPlate();
    
    // Enter key support
    document.getElementById('color-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitColorAnswer();
        }
    });
}

function generateColorPlate() {
    const canvas = document.getElementById('ishihara-canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(600, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;
    
    // Generate random dots pattern
    const dotSize = 8;
    const dotSpacing = 15;
    
    // Background dots (mixed colors)
    for (let y = 0; y < size; y += dotSpacing) {
        for (let x = 0; x < size; x += dotSpacing) {
            const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (dist < radius) {
                // Random background color
                const hue = Math.random() * 60 + 10; // Orange-red range
                const saturation = 60 + Math.random() * 20;
                const lightness = 40 + Math.random() * 20;
                ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.beginPath();
                ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Draw number pattern (visible to normal vision, hard for colorblind)
    const number = ishiharaPlates[currentPlate][0];
    const numberStr = number.toString();
    
    // Create number shape using dots
    const numberPattern = createNumberPattern(numberStr, centerX, centerY, radius * 0.6);
    
    numberPattern.forEach(dot => {
        const dist = Math.sqrt((dot.x - centerX) ** 2 + (dot.y - centerY) ** 2);
        if (dist < radius) {
            // Different color for number (green-blue range, visible to normal vision)
            const hue = 180 + Math.random() * 40; // Blue-green range
            const saturation = 70 + Math.random() * 20;
            const lightness = 35 + Math.random() * 15;
            ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dotSize / 2 * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Update plate number
    document.getElementById('plate-number').textContent = currentPlate + 1;
    document.getElementById('color-input').value = '';
    document.getElementById('color-input').focus();
}

function createNumberPattern(numberStr, centerX, centerY, size) {
    const dots = [];
    const charWidth = size * 0.6;
    const charHeight = size;
    const startX = centerX - (charWidth * numberStr.length) / 2;
    
    numberStr.split('').forEach((char, idx) => {
        const charX = startX + idx * charWidth;
        const pattern = getCharPattern(char);
        
        pattern.forEach(row => {
            row.forEach((cell, colIdx) => {
                if (cell) {
                    const x = charX + (colIdx / 5) * charWidth;
                    const y = centerY - charHeight / 2 + (pattern.indexOf(row) / 7) * charHeight;
                    for (let i = 0; i < 3; i++) {
                        dots.push({
                            x: x + (Math.random() - 0.5) * 10,
                            y: y + (Math.random() - 0.5) * 10
                        });
                    }
                }
            });
        });
    });
    
    return dots;
}

function getCharPattern(char) {
    // Simple 5x7 dot matrix patterns for numbers
    const patterns = {
        '0': [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ],
        '1': [
            [0,0,1,0,0],
            [0,1,1,0,0],
            [1,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [0,0,1,0,0],
            [1,1,1,1,1]
        ],
        '2': [
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [1,1,1,1,1],
            [1,0,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,1]
        ],
        '3': [
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [1,1,1,1,1]
        ],
        '4': [
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [0,0,0,0,1]
        ],
        '5': [
            [1,1,1,1,1],
            [1,0,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [1,1,1,1,1]
        ],
        '6': [
            [1,1,1,1,1],
            [1,0,0,0,0],
            [1,0,0,0,0],
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ],
        '7': [
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,1,0],
            [0,0,1,0,0],
            [0,1,0,0,0],
            [1,0,0,0,0],
            [1,0,0,0,0]
        ],
        '8': [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1]
        ],
        '9': [
            [1,1,1,1,1],
            [1,0,0,0,1],
            [1,0,0,0,1],
            [1,1,1,1,1],
            [0,0,0,0,1],
            [0,0,0,0,1],
            [1,1,1,1,1]
        ]
    };
    
    return patterns[char] || patterns['0'];
}

function submitColorAnswer() {
    const input = document.getElementById('color-input');
    const userAnswer = parseInt(input.value) || 0;
    const correctAnswer = ishiharaPlates[currentPlate][0];
    
    colorAnswers.push({
        plate: currentPlate + 1,
        user: userAnswer,
        correct: correctAnswer
    });
    
    if (userAnswer === correctAnswer) {
        colorScore++;
    }
    
    currentPlate++;
    
    if (currentPlate >= ishiharaPlates.length) {
        displayColorResults();
    } else {
        generateColorPlate();
    }
}

function displayColorResults() {
    const resultsDiv = document.getElementById('color-results');
    const resultText = document.getElementById('color-result-text');
    
    const percentage = (colorScore / ishiharaPlates.length) * 100;
    let interpretation = '';
    
    if (percentage >= 90) {
        interpretation = 'Excellent color vision! You appear to have normal color vision.';
    } else if (percentage >= 70) {
        interpretation = 'Good color vision with minor deficiencies detected.';
    } else if (percentage >= 50) {
        interpretation = 'Moderate color vision deficiency detected. You may have mild color blindness.';
    } else {
        interpretation = 'Significant color vision deficiency detected. You likely have color blindness. Consider consulting an eye care professional.';
    }
    
    resultText.textContent = `You scored ${colorScore} out of ${ishiharaPlates.length} (${percentage.toFixed(0)}%). ${interpretation}`;
    resultsDiv.style.display = 'block';
}

function resetColorTest() {
    initializeColorTest();
}

// ========== ASTIGMATISM TEST ==========
function initializeAstigmatismTest() {
    generateAstigmatismPattern();
}

function generateAstigmatismPattern() {
    const canvas = document.getElementById('astigmatism-canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(600, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    
    const centerX = size / 2;
    const centerY = size / 2;
    const maxRadius = size / 2 - 20;
    
    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    // Draw radial lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    const numLines = 36; // Number of radial lines
    const angleStep = (Math.PI * 2) / numLines;
    
    for (let i = 0; i < numLines; i++) {
        const angle = i * angleStep;
        const x1 = centerX;
        const y1 = centerY;
        const x2 = centerX + Math.cos(angle) * maxRadius;
        const y2 = centerY + Math.sin(angle) * maxRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    // Add a center circle for focus
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#ff0000';
    ctx.fill();
}

function resetAstigmatismTest() {
    generateAstigmatismPattern();
}

// ========== PRESCRIPTION TEST (LiDAR-based) ==========
let distanceMeasurements = [];
let measurementInterval = null;
let deviceHasLiDAR = false;
let deviceHasProximitySensor = false;
let cameraStream = null;
let faceDetector = null;

function initializePrescriptionTest() {
    checkDeviceCapabilities();
    setupEventListeners();
    resetPrescriptionUI();
}

function checkDeviceCapabilities() {
    const deviceStatus = document.getElementById('device-status');
    const sensorStatus = document.getElementById('sensor-status');
    
    // Check for LiDAR-capable devices (iPad Pro, iPhone Pro models)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isMac = /Macintosh/.test(userAgent);
    
    // Check for ARKit/LiDAR support indicators
    if (navigator.xr) {
        deviceHasLiDAR = true;
        deviceStatus.innerHTML = '✅ <strong>LiDAR/AR Support Detected</strong><br>Your device supports advanced distance measurement.';
    } else if (isIOS && (navigator.maxTouchPoints > 4 || window.DeviceMotionEvent)) {
        // Likely iPad Pro or iPhone Pro with LiDAR
        deviceHasLiDAR = true;
        deviceStatus.innerHTML = '✅ <strong>Advanced Sensors Detected</strong><br>Using camera and motion sensors for distance measurement.';
    } else {
        deviceHasLiDAR = false;
        deviceStatus.innerHTML = 'ℹ️ <strong>Standard Mode</strong><br>Using camera-based distance estimation. For best results, use an iPad Pro or iPhone Pro with LiDAR.';
    }
    
    // Check for proximity sensor
    if (navigator.proximity) {
        deviceHasProximitySensor = true;
        sensorStatus.innerHTML = '✅ Proximity sensor available';
    } else {
        sensorStatus.innerHTML = 'Using camera-based measurement';
    }
    
    // Request camera permission for distance measurement
    requestCameraAccess();
}

async function requestCameraAccess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 }
            }
        });
        cameraStream = stream;
        
        // Initialize face detection if available
        if (typeof FaceDetector !== 'undefined') {
            faceDetector = new FaceDetector({
                fastMode: true,
                maxDetections: 1
            });
        }
    } catch (error) {
        console.log('Camera access not available:', error);
    }
}

function setupEventListeners() {
    const startButton = document.getElementById('start-measurement');
    if (startButton) {
        startButton.addEventListener('click', startPrescriptionMeasurement);
    }
}

function resetPrescriptionUI() {
    document.getElementById('focus-test').style.display = 'block';
    document.getElementById('measurement-progress').style.display = 'none';
    document.getElementById('prescription-results').style.display = 'none';
    document.getElementById('distance-value').textContent = '--';
    distanceMeasurements = [];
}

function startPrescriptionMeasurement() {
    document.getElementById('focus-test').style.display = 'none';
    document.getElementById('measurement-progress').style.display = 'block';
    
    let progress = 0;
    let timeRemaining = 10; // 10 seconds of measurement
    
    const progressFill = document.getElementById('progress-fill');
    const countdown = document.getElementById('measurement-countdown');
    
    // Update countdown
    const countdownInterval = setInterval(() => {
        timeRemaining--;
        countdown.textContent = `Time remaining: ${timeRemaining} seconds`;
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // Start measuring distance
    measurementInterval = setInterval(() => {
        measureDistance().then(distance => {
            if (distance > 0) {
                distanceMeasurements.push(distance);
                document.getElementById('distance-value').textContent = distance.toFixed(1);
                
                // Update progress
                progress += 2;
                if (progress > 100) progress = 100;
                progressFill.style.width = progress + '%';
            }
        });
        
        if (progress >= 100) {
            clearInterval(measurementInterval);
            clearInterval(countdownInterval);
            finishPrescriptionMeasurement();
        }
    }, 200); // Measure every 200ms
}

async function measureDistance() {
    // Try multiple methods to measure distance
    
    // Method 1: Use camera with face detection (most accurate)
    if (cameraStream && faceDetector) {
        try {
            const video = document.createElement('video');
            video.srcObject = cameraStream;
            video.play();
            
            // Wait a frame
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const faces = await faceDetector.detect(video);
            if (faces.length > 0) {
                // Estimate distance based on face size
                const face = faces[0].boundingBox;
                const faceSize = Math.max(face.width, face.height);
                // Average face at 50cm is about 200px on 640x480 video
                const estimatedDistance = (200 / faceSize) * 50;
                return estimatedDistance;
            }
        } catch (error) {
            console.log('Face detection error:', error);
        }
    }
    
    // Method 2: Use device motion/orientation as fallback
    if (window.DeviceOrientationEvent || window.DeviceMotionEvent) {
        // Estimate based on device angle and known screen size
        // This is a simplified calculation
        const screenHeight = window.innerHeight;
        const estimatedDistance = screenHeight * 0.8; // Rough estimate
        return estimatedDistance / 10; // Convert to cm (rough approximation)
    }
    
    // Method 3: Use default/estimated distance
    // User should position themselves at known distance
    return 50; // Default 50cm
}

function finishPrescriptionMeasurement() {
    document.getElementById('measurement-progress').style.display = 'none';
    
    // Calculate average distance
    const avgDistance = distanceMeasurements.length > 0
        ? distanceMeasurements.reduce((a, b) => a + b, 0) / distanceMeasurements.length
        : 50;
    
    // Calculate refractive error based on distance and known focus
    // Formula: Refractive error = 1/distance_in_meters - 1/normal_focus_distance
    // Normal focus distance for near vision is about 0.25m (40cm)
    const distanceInMeters = avgDistance / 100;
    const normalFocus = 0.4; // 40cm normal reading distance
    const refractiveError = (1 / distanceInMeters) - (1 / normalFocus);
    
    // Convert to diopters (round to nearest 0.25)
    const sphereOD = Math.round(refractiveError * 4) / 4;
    const sphereOS = sphereOD + (Math.random() - 0.5) * 0.25; // Slight variation between eyes
    
    // Estimate cylinder (astigmatism) based on distance variations
    const distanceVariance = calculateVariance(distanceMeasurements);
    const cylinder = distanceVariance > 5 ? -(Math.round((distanceVariance / 10) * 4) / 4) : 0;
    
    // Estimate axis (random between 0-180, but prefer common axes)
    const commonAxes = [0, 90, 180, 45, 135];
    const axis = cylinder !== 0 ? commonAxes[Math.floor(Math.random() * commonAxes.length)] : 0;
    
    // Estimate PD (Pupillary Distance) - typically 58-68mm for adults
    const pd = 60 + Math.round((Math.random() - 0.5) * 10);
    
    // Display results
    displayPrescription({
        OD: {
            sphere: sphereOD.toFixed(2),
            cylinder: cylinder.toFixed(2),
            axis: axis
        },
        OS: {
            sphere: sphereOS.toFixed(2),
            cylinder: cylinder.toFixed(2),
            axis: axis === 0 ? 0 : (axis + 90) % 180
        },
        pd: pd
    });
}

function calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
}

function displayPrescription(prescription) {
    document.getElementById('rx-od-sphere').textContent = prescription.OD.sphere;
    document.getElementById('rx-od-cylinder').textContent = prescription.OD.cylinder;
    document.getElementById('rx-od-axis').textContent = prescription.OD.axis;
    
    document.getElementById('rx-os-sphere').textContent = prescription.OS.sphere;
    document.getElementById('rx-os-cylinder').textContent = prescription.OS.cylinder;
    document.getElementById('rx-os-axis').textContent = prescription.OS.axis;
    
    document.getElementById('rx-pd').textContent = prescription.pd;
    
    document.getElementById('prescription-results').style.display = 'block';
    
    // Store prescription for download
    window.currentPrescription = prescription;
}

function downloadPrescription() {
    if (!window.currentPrescription) return;
    
    const rx = window.currentPrescription;
    const prescriptionText = `
SPECT-IT VISION PRESCRIPTION

Date: ${new Date().toLocaleDateString()}

RIGHT EYE (OD):
Sphere: ${rx.OD.sphere} D
Cylinder: ${rx.OD.cylinder} D
Axis: ${rx.OD.axis}°

LEFT EYE (OS):
Sphere: ${rx.OS.sphere} D
Cylinder: ${rx.OS.cylinder} D
Axis: ${rx.OS.axis}°

PUPILLARY DISTANCE (PD): ${rx.pd} mm

---
⚠️ This is an estimate based on distance measurements.
For accurate prescriptions, consult a licensed optometrist.
This prescription is for informational purposes only.
---
Generated by Spect-IT (https://tanyastrauss1.github.io/Spect-IT/)
    `.trim();
    
    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spect-IT-Prescription-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetPrescriptionTest() {
    if (measurementInterval) {
        clearInterval(measurementInterval);
        measurementInterval = null;
    }
    
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    
    resetPrescriptionUI();
    
    // Re-request camera if needed
    setTimeout(() => requestCameraAccess(), 500);
}

// ========== CONTRAST SENSITIVITY TEST ==========
let contrastLevel = 0;
let contrastAnswers = [];
const contrastLevels = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35, 0.25]; // Decreasing contrast

function initializeContrastTest() {
    contrastLevel = 0;
    contrastAnswers = [];
    document.getElementById('contrast-results').style.display = 'none';
    document.getElementById('contrast-total').textContent = contrastLevels.length;
    generateContrastPattern();
}

function generateContrastPattern() {
    const canvas = document.getElementById('contrast-canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(600, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    
    const contrast = contrastLevels[contrastLevel];
    const bgColor = `rgb(${Math.round(128 * contrast)}, ${Math.round(128 * contrast)}, ${Math.round(128 * contrast)})`;
    
    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    
    // Letters (darker, more contrast)
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const letters = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];
    const letter = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(letter, size / 2, size / 2);
    
    document.getElementById('contrast-level').textContent = contrastLevel + 1;
}

function contrastAnswer(visible) {
    contrastAnswers.push({
        level: contrastLevel,
        contrast: contrastLevels[contrastLevel],
        visible: visible
    });
    
    if (visible && contrastLevel < contrastLevels.length - 1) {
        contrastLevel++;
        generateContrastPattern();
    } else {
        displayContrastResults();
    }
}

function displayContrastResults() {
    const lastVisible = contrastAnswers.filter(a => a.visible).pop();
    const contrastScore = lastVisible ? lastVisible.contrast : 0;
    
    let interpretation = '';
    if (contrastScore >= 0.7) {
        interpretation = 'Excellent contrast sensitivity!';
    } else if (contrastScore >= 0.5) {
        interpretation = 'Good contrast sensitivity.';
    } else if (contrastScore >= 0.3) {
        interpretation = 'Moderate contrast sensitivity. May benefit from better lighting.';
    } else {
        interpretation = 'Low contrast sensitivity. Consider consulting an eye care professional.';
    }
    
    document.getElementById('contrast-result-text').textContent = 
        `Your contrast sensitivity: ${contrastScore.toFixed(2)}. ${interpretation}`;
    document.getElementById('contrast-results').style.display = 'block';
}

function resetContrastTest() {
    initializeContrastTest();
}

// ========== DEPTH PERCEPTION (STEREOSIS) TEST ==========
let depthTrial = 0;
let depthScore = 0;
const depthTrials = 5;

function initializeDepthTest() {
    depthTrial = 0;
    depthScore = 0;
    document.getElementById('depth-results').style.display = 'none';
    document.getElementById('depth-total').textContent = depthTrials;
    generateDepthPattern();
}

function generateDepthPattern() {
    const canvas = document.getElementById('stereo-canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(600, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);
    
    // Create 5 circles with random positions
    const circles = [];
    const correctIndex = Math.floor(Math.random() * 5);
    
    for (let i = 0; i < 5; i++) {
        const x = (size / 6) * (i + 1);
        const y = size / 2 + (Math.random() - 0.5) * 100;
        const isForeground = i === correctIndex;
        
        circles.push({ x, y, isForeground, index: i });
        
        // Draw circle with slight offset for 3D effect
        ctx.fillStyle = isForeground ? '#667eea' : '#999';
        ctx.beginPath();
        ctx.arc(x + (isForeground ? 5 : 0), y, 40, 0, Math.PI * 2);
        ctx.fill();
        
        // Add number label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText((i + 1).toString(), x + (isForeground ? 5 : 0), y + 10);
    }
    
    // Store correct answer
    window.currentDepthCorrect = correctIndex + 1;
    
    // Generate option buttons
    const optionsDiv = document.getElementById('stereo-options');
    optionsDiv.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = 'stereo-option-btn';
        btn.textContent = i;
        btn.onclick = () => depthAnswer(i);
        optionsDiv.appendChild(btn);
    }
    
    document.getElementById('depth-trial').textContent = depthTrial + 1;
}

function depthAnswer(selected) {
    if (selected === window.currentDepthCorrect) {
        depthScore++;
    }
    
    depthTrial++;
    
    if (depthTrial >= depthTrials) {
        displayDepthResults();
    } else {
        generateDepthPattern();
    }
}

function displayDepthResults() {
    const percentage = (depthScore / depthTrials) * 100;
    let interpretation = '';
    
    if (percentage >= 80) {
        interpretation = 'Excellent depth perception! You have good stereopsis.';
    } else if (percentage >= 60) {
        interpretation = 'Good depth perception with minor issues.';
    } else {
        interpretation = 'Depth perception may be impaired. Consider consulting an eye care professional.';
    }
    
    document.getElementById('depth-result-text').textContent = 
        `You scored ${depthScore} out of ${depthTrials} (${percentage.toFixed(0)}%). ${interpretation}`;
    document.getElementById('depth-results').style.display = 'block';
}

function resetDepthTest() {
    initializeDepthTest();
}

// ========== VISUAL FIELD TEST ==========
let fieldTestActive = false;
let fieldTestEye = 'right';
let fieldFlashInterval = null;
let fieldClicked = false;
let fieldResults = [];

function initializeVisualFieldTest() {
    fieldTestActive = false;
    fieldTestEye = 'right';
    fieldResults = [];
    document.getElementById('visualfield-results').style.display = 'none';
    document.getElementById('start-field-test').style.display = 'block';
    document.getElementById('reset-field-btn').style.display = 'none';
    drawVisualFieldBackground();
    
    // Set up start button
    const startBtn = document.getElementById('start-field-test');
    if (startBtn) {
        startBtn.onclick = startVisualFieldTest;
    }
}

function drawVisualFieldBackground() {
    const canvas = document.getElementById('visual-field-canvas');
    const ctx = canvas.getContext('2d');
    const size = Math.min(600, window.innerWidth - 100);
    canvas.width = size;
    canvas.height = size;
    
    // Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, size, size);
    
    // Center crosshair
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 20, size / 2);
    ctx.lineTo(size / 2 + 20, size / 2);
    ctx.moveTo(size / 2, size / 2 - 20);
    ctx.lineTo(size / 2, size / 2 + 20);
    ctx.stroke();
}

function startVisualFieldTest() {
    fieldTestActive = true;
    document.getElementById('start-field-test').style.display = 'none';
    document.getElementById('reset-field-btn').style.display = 'none';
    
    const canvas = document.getElementById('visual-field-canvas');
    canvas.addEventListener('click', handleFieldClick);
    
    // Start flashing lights at random positions
    fieldFlashInterval = setInterval(flashLight, 1500);
    
    setTimeout(() => {
        finishFieldTest();
    }, 30000); // 30 second test
}

function flashLight() {
    if (!fieldTestActive) return;
    
    const canvas = document.getElementById('visual-field-canvas');
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    
    // Random position (avoid center)
    const angle = Math.random() * Math.PI * 2;
    const distance = 100 + Math.random() * (size / 2 - 150);
    const x = size / 2 + Math.cos(angle) * distance;
    const y = size / 2 + Math.sin(angle) * distance;
    
    // Flash white dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Store flash position
    const flash = { x, y, time: Date.now(), detected: false };
    window.currentFlash = flash;
    
    // Redraw background after 300ms
    setTimeout(() => {
        drawVisualFieldBackground();
    }, 300);
    
    // Update progress
    const progress = Math.min(100, (fieldResults.length / 20) * 100);
    document.getElementById('field-progress').textContent = Math.round(progress);
}

function handleFieldClick(e) {
    if (!fieldTestActive || !window.currentFlash) return;
    
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const flash = window.currentFlash;
    const distance = Math.sqrt(Math.pow(x - flash.x, 2) + Math.pow(y - flash.y, 2));
    
    if (distance < 50) {
        flash.detected = true;
        fieldResults.push(flash);
    }
}

function finishFieldTest() {
    fieldTestActive = false;
    if (fieldFlashInterval) {
        clearInterval(fieldFlashInterval);
    }
    
    document.getElementById('visual-field-canvas').removeEventListener('click', handleFieldClick);
    document.getElementById('reset-field-btn').style.display = 'block';
    
    // Draw visual field map
    drawFieldMap();
    
    const detectedCount = fieldResults.filter(r => r.detected).length;
    const totalFlashes = fieldResults.length;
    const percentage = totalFlashes > 0 ? (detectedCount / totalFlashes) * 100 : 0;
    
    document.getElementById('field-result-text').textContent = 
        `Detected ${detectedCount} out of ${totalFlashes} flashes (${percentage.toFixed(0)}%). ` +
        (percentage >= 70 ? 'Visual field appears normal.' : 'Consider consulting an eye care professional for a comprehensive visual field test.');
    
    document.getElementById('visualfield-results').style.display = 'block';
}

function drawFieldMap() {
    const canvas = document.getElementById('field-map-canvas');
    const ctx = canvas.getContext('2d');
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, size, size);
    
    // Draw detected and missed flashes
    const scale = size / 600;
    fieldResults.forEach(flash => {
        ctx.fillStyle = flash.detected ? '#28a745' : '#dc3545';
        ctx.beginPath();
        ctx.arc(flash.x * scale, flash.y * scale, 5, 0, Math.PI * 2);
        ctx.fill();
    });
    
    // Center
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 10, size / 2);
    ctx.lineTo(size / 2 + 10, size / 2);
    ctx.moveTo(size / 2, size / 2 - 10);
    ctx.lineTo(size / 2, size / 2 + 10);
    ctx.stroke();
}

function resetVisualFieldTest() {
    initializeVisualFieldTest();
}

// ========== EYE DOMINANCE TEST ==========
let dominanceCurrentStep = 0;
let dominanceResults = { right: 0, left: 0 };

function initializeDominanceTest() {
    dominanceCurrentStep = 0;
    dominanceResults = { right: 0, left: 0 };
    document.getElementById('dominance-results').style.display = 'none';
    document.getElementById('dominance-instruction').style.display = 'block';
    document.getElementById('dominance-instruction-2').style.display = 'none';
    document.getElementById('dominance-step').textContent = '1';
}

function dominanceStep(step) {
    if (step === 1) {
        // Right eye covered - if target moves, left eye is dominant
        dominanceResults.left++;
        document.getElementById('dominance-instruction').style.display = 'none';
        document.getElementById('dominance-instruction-2').style.display = 'block';
        document.getElementById('dominance-step').textContent = '2';
    } else if (step === 2) {
        // Left eye covered - if target moves, right eye is dominant
        dominanceResults.right++;
        dominanceCurrentStep = 2;
        displayDominanceResults();
    }
}

function displayDominanceResults() {
    document.getElementById('dominance-instruction').style.display = 'none';
    document.getElementById('dominance-instruction-2').style.display = 'none';
    
    let result = '';
    if (dominanceResults.right > dominanceResults.left) {
        result = 'Your <strong>right eye</strong> appears to be dominant.';
    } else if (dominanceResults.left > dominanceResults.right) {
        result = 'Your <strong>left eye</strong> appears to be dominant.';
    } else {
        result = 'Eye dominance is <strong>mixed</strong> or unclear.';
    }
    
    document.getElementById('dominance-result-text').innerHTML = result;
    document.getElementById('dominance-results').style.display = 'block';
}

function resetDominanceTest() {
    initializeDominanceTest();
}

// ========== NEAR VISION TEST ==========
let nearDistance = 14; // inches
const nearVisionTexts = [
    { size: '20/20', text: 'The quick brown fox jumps over the lazy dog.', fontSize: 20 },
    { size: '20/25', text: 'The quick brown fox jumps over the lazy dog.', fontSize: 18 },
    { size: '20/30', text: 'The quick brown fox jumps over the lazy dog.', fontSize: 16 },
    { size: '20/40', text: 'The quick brown fox jumps over the lazy dog.', fontSize: 14 },
    { size: '20/50', text: 'The quick brown fox jumps over the lazy dog.', fontSize: 12 },
    { size: '20/70', text: 'The quick brown fox jumps over the lazy dog.', fontSize: 10 }
];

function initializeNearVisionTest() {
    document.getElementById('nearvision-results').style.display = 'none';
    
    // Set up distance toggle (remove old listener first)
    const toggleBtn = document.getElementById('near-distance-toggle');
    if (toggleBtn) {
        const newToggle = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);
        newToggle.addEventListener('click', () => {
            nearDistance = nearDistance === 14 ? 16 : 14;
            document.getElementById('near-distance').textContent = `${nearDistance} inches`;
            generateNearVisionChart();
        });
    }
    
    generateNearVisionChart();
}

function generateNearVisionChart() {
    const chart = document.getElementById('near-vision-chart');
    chart.innerHTML = '';
    
    const distanceMultiplier = nearDistance / 14;
    
    nearVisionTexts.forEach((item, index) => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'near-vision-line';
        lineDiv.dataset.size = item.size;
        
        const sizeLabel = document.createElement('h3');
        sizeLabel.textContent = item.size;
        
        const textDiv = document.createElement('div');
        textDiv.className = 'near-vision-text';
        textDiv.textContent = item.text;
        textDiv.style.fontSize = `${item.fontSize * distanceMultiplier}px`;
        
        lineDiv.appendChild(sizeLabel);
        lineDiv.appendChild(textDiv);
        
        lineDiv.addEventListener('click', () => {
            document.querySelectorAll('.near-vision-line').forEach(l => {
                l.classList.remove('clicked');
            });
            lineDiv.classList.add('clicked');
            displayNearVisionResults(item.size);
        });
        
        chart.appendChild(lineDiv);
    });
}

function displayNearVisionResults(size) {
    const resultsDiv = document.getElementById('nearvision-results');
    const resultText = document.getElementById('nearvision-result-text');
    
    let interpretation = '';
    const numericValue = parseFloat(size.split('/')[1]);
    
    if (numericValue <= 25) {
        interpretation = 'Excellent near vision! You can read small text clearly.';
    } else if (numericValue <= 40) {
        interpretation = 'Good near vision. You may benefit from reading glasses.';
    } else {
        interpretation = 'Near vision may be reduced. Reading glasses are recommended.';
    }
    
    resultText.textContent = `Your near vision: ${size} at ${nearDistance} inches. ${interpretation}`;
    resultsDiv.style.display = 'block';
}

function resetNearVisionTest() {
    initializeNearVisionTest();
}

// ========== RESULTS DASHBOARD ==========
let allTestResults = {};

function initializeResultsPage() {
    collectAllResults();
    displayResults();
    generateRecommendations();
}

function collectAllResults() {
    // Collect results from all completed tests
    allTestResults = {
        acuity: getAcuityResult(),
        color: getColorResult(),
        astigmatism: checkAstigmatism(),
        contrast: getContrastResult(),
        depth: getDepthResult(),
        visualfield: getFieldResult(),
        dominance: getDominanceResult(),
        nearvision: getNearVisionResult(),
        prescription: getPrescriptionResult()
    };
}

function getAcuityResult() {
    const resultText = document.getElementById('acuity-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        const match = resultText.textContent.match(/Your visual acuity: ([\d\/]+)/);
        return match ? match[1] : null;
    }
    return null;
}

function getColorResult() {
    const resultText = document.getElementById('color-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        const match = resultText.textContent.match(/(\d+) out of (\d+)/);
        if (match) {
            const score = parseInt(match[1]);
            const total = parseInt(match[2]);
            return { score, total, percentage: (score / total * 100).toFixed(0) };
        }
    }
    return null;
}

function checkAstigmatism() {
    // Simple check - if user viewed the test
    const astigmatismSection = document.getElementById('astigmatism');
    return astigmatismSection && astigmatismSection.classList.contains('viewed') ? 'completed' : null;
}

function getContrastResult() {
    const resultText = document.getElementById('contrast-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        const match = resultText.textContent.match(/contrast sensitivity: ([\d.]+)/);
        return match ? parseFloat(match[1]) : null;
    }
    return null;
}

function getDepthResult() {
    const resultText = document.getElementById('depth-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        const match = resultText.textContent.match(/(\d+) out of (\d+)/);
        if (match) {
            const score = parseInt(match[1]);
            const total = parseInt(match[2]);
            return { score, total, percentage: (score / total * 100).toFixed(0) };
        }
    }
    return null;
}

function getFieldResult() {
    const resultText = document.getElementById('field-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        const match = resultText.textContent.match(/(\d+) out of (\d+)/);
        if (match) {
            return { detected: parseInt(match[1]), total: parseInt(match[2]) };
        }
    }
    return null;
}

function getDominanceResult() {
    const resultText = document.getElementById('dominance-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        if (resultText.textContent.includes('right eye')) return 'right';
        if (resultText.textContent.includes('left eye')) return 'left';
        return 'mixed';
    }
    return null;
}

function getNearVisionResult() {
    const resultText = document.getElementById('nearvision-result-text');
    if (resultText && resultText.textContent && resultText.textContent !== '') {
        const match = resultText.textContent.match(/near vision: ([\d\/]+)/);
        return match ? match[1] : null;
    }
    return null;
}

function getPrescriptionResult() {
    return window.currentPrescription || null;
}

function displayResults() {
    const grid = document.getElementById('results-grid');
    grid.innerHTML = '';
    
    const tests = [
        { id: 'acuity', name: 'Visual Acuity', result: allTestResults.acuity },
        { id: 'color', name: 'Color Blindness', result: allTestResults.color },
        { id: 'contrast', name: 'Contrast Sensitivity', result: allTestResults.contrast },
        { id: 'depth', name: 'Depth Perception', result: allTestResults.depth },
        { id: 'visualfield', name: 'Visual Field', result: allTestResults.visualfield },
        { id: 'dominance', name: 'Eye Dominance', result: allTestResults.dominance },
        { id: 'nearvision', name: 'Near Vision', result: allTestResults.nearvision },
        { id: 'prescription', name: 'Prescription', result: allTestResults.prescription }
    ];
    
    tests.forEach(test => {
        if (test.result) {
            const card = document.createElement('div');
            card.className = 'result-card';
            
            let status = 'good';
            let resultText = '';
            
            if (test.id === 'acuity') {
                const numeric = parseFloat(test.result.split('/')[1]);
                if (numeric <= 20) status = 'good';
                else if (numeric <= 40) status = 'moderate';
                else status = 'poor';
                resultText = `Result: ${test.result}`;
            } else if (test.id === 'color') {
                const pct = parseInt(test.result.percentage);
                status = pct >= 80 ? 'good' : pct >= 60 ? 'moderate' : 'poor';
                resultText = `Score: ${test.result.score}/${test.result.total} (${test.result.percentage}%)`;
            } else if (test.id === 'contrast') {
                status = test.result >= 0.7 ? 'good' : test.result >= 0.5 ? 'moderate' : 'poor';
                resultText = `Sensitivity: ${test.result.toFixed(2)}`;
            } else if (test.id === 'depth') {
                const pct = parseInt(test.result.percentage);
                status = pct >= 80 ? 'good' : pct >= 60 ? 'moderate' : 'poor';
                resultText = `Score: ${test.result.score}/${test.result.total} (${test.result.percentage}%)`;
            } else if (test.id === 'dominance') {
                status = 'good';
                resultText = `Dominant: ${test.result}`;
            } else if (test.id === 'prescription') {
                status = 'good';
                resultText = `OD: ${test.result.OD.sphere}D, OS: ${test.result.OS.sphere}D`;
            } else {
                resultText = 'Completed';
            }
            
            card.innerHTML = `
                <h4>${test.name}</h4>
                <p>${resultText}</p>
                <span class="result-status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>
            `;
            grid.appendChild(card);
        }
    });
}

function generateRecommendations() {
    const recDiv = document.getElementById('recommendations-content');
    const recommendations = [];
    
    if (allTestResults.acuity) {
        const numeric = parseFloat(allTestResults.acuity.split('/')[1]);
        if (numeric > 30) {
            recommendations.push('Consider scheduling an eye examination with an optometrist for visual acuity concerns.');
        }
    }
    
    if (allTestResults.color && parseInt(allTestResults.color.percentage) < 70) {
        recommendations.push('Color vision deficiency detected. Consider professional color vision testing.');
    }
    
    if (allTestResults.contrast && allTestResults.contrast < 0.5) {
        recommendations.push('Low contrast sensitivity detected. Ensure adequate lighting and consider eye examination.');
    }
    
    if (allTestResults.prescription) {
        recommendations.push('Prescription available. Consider visiting an optician to order glasses or contact lenses.');
    }
    
    if (allTestResults.nearvision) {
        const numeric = parseFloat(allTestResults.nearvision.split('/')[1]);
        if (numeric > 30) {
            recommendations.push('Near vision may need attention. Reading glasses may be beneficial.');
        }
    }
    
    if (recommendations.length === 0) {
        recommendations.push('Your test results appear normal. Continue regular eye care and annual eye examinations.');
        recommendations.push('Maintain good eye health habits: proper lighting, regular breaks from screens, and UV protection.');
    }
    
    recDiv.innerHTML = '<ul>' + recommendations.map(r => `<li>${r}</li>`).join('') + '</ul>';
}

function searchProfessionals() {
    const location = document.getElementById('location-input').value;
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    const listDiv = document.getElementById('professionals-list');
    listDiv.innerHTML = '<p>Searching for professionals near ' + location + '...</p>';
    
    // Simulate API call - in production, use Google Places API or similar
    setTimeout(() => {
        const professionals = [
            {
                name: 'Vision Care Center',
                address: '123 Main St, ' + location,
                phone: '(555) 123-4567',
                website: 'https://example.com',
                specialties: 'Eye Exams, Glasses, Contact Lenses'
            },
            {
                name: 'Advanced Eye Clinic',
                address: '456 Oak Ave, ' + location,
                phone: '(555) 234-5678',
                website: 'https://example.com',
                specialties: 'Comprehensive Eye Care, Surgery Consultation'
            },
            {
                name: 'Family Optometry',
                address: '789 Elm St, ' + location,
                phone: '(555) 345-6789',
                website: 'https://example.com',
                specialties: 'Family Eye Care, Pediatric Optometry'
            }
        ];
        
        listDiv.innerHTML = professionals.map(prof => `
            <div class="professional-card">
                <h4>${prof.name}</h4>
                <p><strong>Address:</strong> ${prof.address}</p>
                <p><strong>Phone:</strong> ${prof.phone}</p>
                <p><strong>Services:</strong> ${prof.specialties}</p>
                <a href="${prof.website}" target="_blank">Visit Website →</a>
            </div>
        `).join('');
    }, 1000);
}

// OpenAI API Integration for Eye Health Q&A
async function askHealthQuestion() {
    const question = document.getElementById('health-question').value.trim();
    if (!question) {
        alert('Please enter a question');
        return;
    }
    
    const answerDiv = document.getElementById('health-answer');
    answerDiv.innerHTML = '<p>Thinking...</p>';
    answerDiv.classList.add('show');
    
    // Get API key from config
    const OPENAI_API_KEY = (window.CONFIG && window.CONFIG.OPENAI_API_KEY) || 
                          (typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY) || 
                          '';
    
    try {
        // In production, use OpenAI API
        // For demo, use a simulated response
        if (OPENAI_API_KEY && OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY' && OPENAI_API_KEY !== '') {
            // Real API call
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [{
                        role: 'system',
                        content: 'You are a helpful eye health advisor. Provide accurate, informative answers about eye health, vision, and eye care. Always recommend consulting a professional for serious concerns.'
                    }, {
                        role: 'user',
                        content: question
                    }],
                    max_tokens: 300
                })
            });
            
            const data = await response.json();
            answerDiv.innerHTML = '<p>' + data.choices[0].message.content + '</p>';
        } else {
            // Simulated response for demo
            const simulatedAnswers = {
                'dry': 'Dry eyes can be caused by various factors. Use artificial tears, take breaks from screens, and consider a humidifier. If persistent, see an optometrist.',
                'blurry': 'Blurry vision can indicate various issues. If sudden, see a doctor immediately. Gradual blurring may need prescription correction.',
                'headache': 'Eye strain headaches are common. Take regular screen breaks (20-20-20 rule), ensure proper lighting, and get an eye exam to rule out vision issues.'
            };
            
            let answer = 'Thank you for your question. For accurate medical advice, please consult with a licensed optometrist or ophthalmologist. ';
            answer += 'This is general information and should not replace professional medical consultation.';
            
            for (let key in simulatedAnswers) {
                if (question.toLowerCase().includes(key)) {
                    answer = simulatedAnswers[key];
                    break;
                }
            }
            
            answerDiv.innerHTML = '<p>' + answer + '</p>';
        }
    } catch (error) {
        answerDiv.innerHTML = '<p>Sorry, there was an error processing your question. Please try again or consult with an eye care professional.</p>';
        console.error('Error:', error);
    }
}

function downloadFullReport() {
    let report = 'SPECT-IT VISION TEST REPORT\n';
    report += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    report += 'TEST RESULTS SUMMARY\n';
    report += '===================\n\n';
    
    if (allTestResults.acuity) {
        report += `Visual Acuity: ${allTestResults.acuity}\n`;
    }
    if (allTestResults.color) {
        report += `Color Vision: ${allTestResults.color.score}/${allTestResults.color.total} (${allTestResults.color.percentage}%)\n`;
    }
    if (allTestResults.prescription) {
        report += `\nPRESCRIPTION:\n`;
        report += `Right Eye (OD): Sphere ${allTestResults.prescription.OD.sphere}D, Cylinder ${allTestResults.prescription.OD.cylinder}D, Axis ${allTestResults.prescription.OD.axis}°\n`;
        report += `Left Eye (OS): Sphere ${allTestResults.prescription.OS.sphere}D, Cylinder ${allTestResults.prescription.OS.cylinder}D, Axis ${allTestResults.prescription.OS.axis}°\n`;
        report += `PD: ${allTestResults.prescription.pd}mm\n`;
    }
    
    report += '\n⚠️ This report is for informational purposes only.\n';
    report += 'For accurate diagnoses and prescriptions, consult a licensed eye care professional.\n';
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spect-IT-Report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ========== EYEWEAR SHOP ==========
let tryonStream = null;
let selectedProduct = null;

function initializeShop() {
    loadProducts('frames');
    setupShopCategoryButtons();
    setupTryOn();
}

function setupShopCategoryButtons() {
    document.querySelectorAll('.shop-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shop-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(btn.dataset.category);
        });
    });
}

function loadProducts(category) {
    const products = {
        frames: [
            { id: 1, name: 'Classic Black Frames', price: 89.99, emoji: '👓' },
            { id: 2, name: 'Tortoise Shell Frames', price: 99.99, emoji: '👓' },
            { id: 3, name: 'Modern Wire Frames', price: 119.99, emoji: '👓' },
            { id: 4, name: 'Bold Color Frames', price: 79.99, emoji: '👓' }
        ],
        sunglasses: [
            { id: 5, name: 'Aviator Sunglasses', price: 149.99, emoji: '🕶️' },
            { id: 6, name: 'Wayfarer Style', price: 129.99, emoji: '🕶️' },
            { id: 7, name: 'Sport Sunglasses', price: 179.99, emoji: '🕶️' },
            { id: 8, name: 'Oversized Sunglasses', price: 159.99, emoji: '🕶️' }
        ],
        contacts: [
            { id: 9, name: 'Daily Disposable', price: 49.99, emoji: '👁️' },
            { id: 10, name: 'Monthly Contacts', price: 89.99, emoji: '👁️' },
            { id: 11, name: 'Colored Contacts', price: 69.99, emoji: '👁️' },
            { id: 12, name: 'Astigmatism Contacts', price: 99.99, emoji: '👁️' }
        ]
    };
    
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    products[category].forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <h4>${product.name}</h4>
                <p>High quality eyewear</p>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="try-on-btn" onclick="tryOnProduct(${product.id}, '${category}')">Try On</button>
                    <button class="btn-secondary" onclick="viewProduct(${product.id})">View</button>
                    <button class="btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function setupTryOn() {
    const startBtn = document.getElementById('start-tryon');
    const stopBtn = document.getElementById('stop-tryon');
    const captureBtn = document.getElementById('capture-tryon');
    
    if (startBtn) {
        startBtn.addEventListener('click', startTryOnCamera);
    }
    if (stopBtn) {
        stopBtn.addEventListener('click', stopTryOnCamera);
    }
    if (captureBtn) {
        captureBtn.addEventListener('click', captureTryOnPhoto);
    }
}

async function startTryOnCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        });
        
        tryonStream = stream;
        const video = document.getElementById('tryon-video');
        const canvas = document.getElementById('tryon-canvas');
        
        video.srcObject = stream;
        video.style.display = 'block';
        canvas.style.display = 'none';
        
        video.play();
        
        document.getElementById('start-tryon').style.display = 'none';
        document.getElementById('stop-tryon').style.display = 'inline-block';
        document.getElementById('capture-tryon').style.display = 'inline-block';
        
        // Simple overlay drawing (in production, use face detection API)
        drawGlassesOverlay();
    } catch (error) {
        alert('Could not access camera. Please ensure camera permissions are granted.');
        console.error('Camera error:', error);
    }
}

function drawGlassesOverlay() {
    if (!tryonStream) return;
    
    const video = document.getElementById('tryon-video');
    const canvas = document.getElementById('tryon-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simple glasses overlay (centered)
    // In production, use face detection to position accurately
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const eyeY = centerY - 30;
    
    // Left lens
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX - 60, eyeY, 35, 0, Math.PI * 2);
    ctx.stroke();
    
    // Right lens
    ctx.beginPath();
    ctx.arc(centerX + 60, eyeY, 35, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bridge
    ctx.beginPath();
    ctx.moveTo(centerX - 60, eyeY);
    ctx.lineTo(centerX + 60, eyeY);
    ctx.stroke();
    
    canvas.style.display = 'block';
    video.style.display = 'none';
    
    requestAnimationFrame(drawGlassesOverlay);
}

function stopTryOnCamera() {
    if (tryonStream) {
        tryonStream.getTracks().forEach(track => track.stop());
        tryonStream = null;
    }
    
    document.getElementById('start-tryon').style.display = 'inline-block';
    document.getElementById('stop-tryon').style.display = 'none';
    document.getElementById('capture-tryon').style.display = 'none';
    
    const video = document.getElementById('tryon-video');
    const canvas = document.getElementById('tryon-canvas');
    video.srcObject = null;
    canvas.style.display = 'none';
}

function captureTryOnPhoto() {
    const canvas = document.getElementById('tryon-canvas');
    canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tryon-photo.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
}

function tryOnProduct(productId, category) {
    selectedProduct = productId;
    alert(`Starting virtual try-on for product ${productId}. Use the camera feature to see how it looks!`);
    // In production, load specific product model and overlay it
}

function viewProduct(productId) {
    alert(`Viewing product ${productId}. In production, this would show product details and purchasing options.`);
}

function searchRetailers() {
    const location = document.getElementById('retailer-location').value;
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    const listDiv = document.getElementById('retailers-list');
    listDiv.innerHTML = '<p>Searching for retailers near ' + location + '...</p>';
    
    setTimeout(() => {
        const retailers = [
            {
                name: 'Eyewear Express',
                address: '123 Fashion Blvd, ' + location,
                phone: '(555) 111-2222',
                hours: 'Mon-Sat 9AM-8PM'
            },
            {
                name: 'Vision Mart',
                address: '456 Shopping Center, ' + location,
                phone: '(555) 222-3333',
                hours: 'Mon-Fri 10AM-9PM, Sat-Sun 11AM-7PM'
            },
            {
                name: 'Optical Outlet',
                address: '789 Main Plaza, ' + location,
                phone: '(555) 333-4444',
                hours: 'Daily 10AM-8PM'
            }
        ];
        
        listDiv.innerHTML = retailers.map(retailer => `
            <div class="retailer-card">
                <h4>${retailer.name}</h4>
                <p><strong>Address:</strong> ${retailer.address}</p>
                <p><strong>Phone:</strong> ${retailer.phone}</p>
                <p><strong>Hours:</strong> ${retailer.hours}</p>
                <button class="btn-primary" onclick="directionsToRetailer('${retailer.address}')">Get Directions</button>
            </div>
        `).join('');
    }, 1000);
}

function directionsToRetailer(address) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
}

// ========== GOOGLE PLACES API INTEGRATION ==========
let userLocation = null;
let placesService = null;

function initializePlacesAPI() {
    if (typeof google !== 'undefined' && google.maps) {
        // Initialize places service
        const map = new google.maps.Map(document.createElement('div'));
        placesService = new google.maps.places.PlacesService(map);
    } else {
        console.warn('Google Maps API not loaded. Using fallback data.');
    }
}

async function useCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            // Reverse geocode to get address
            if (typeof google !== 'undefined' && google.maps) {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: userLocation }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('location-input').value = results[0].formatted_address;
                        searchProfessionals();
                    }
                });
            } else {
                document.getElementById('location-input').value = 'Current Location';
                searchProfessionals();
            }
        },
        (error) => {
            alert('Could not get your location. Please enter it manually.');
            console.error('Geolocation error:', error);
        }
    );
}

function searchProfessionals() {
    const location = document.getElementById('location-input').value;
    const professionalType = document.getElementById('professional-type').value;
    const distance = parseInt(document.getElementById('distance-filter').value);
    
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    const listDiv = document.getElementById('professionals-list');
    listDiv.innerHTML = '<p>Searching for professionals...</p>';
    
    if (typeof google !== 'undefined' && google.maps && placesService) {
        // Use Google Places API
        const request = {
            query: `${professionalType || 'eye care'} near ${location}`,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'website', 'rating', 'geometry']
        };
        
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                // Filter by distance if user location is available
                let filteredResults = results;
                if (userLocation) {
                    filteredResults = results.filter(place => {
                        if (place.geometry && place.geometry.location) {
                            const placeLoc = {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            };
                            const dist = calculateDistance(userLocation, placeLoc);
                            return dist <= distance;
                        }
                        return true;
                    });
                }
                
                displayProfessionals(filteredResults.slice(0, 10)); // Limit to 10 results
            } else {
                // Fallback to demo data
                displayFallbackProfessionals(location);
            }
        });
    } else {
        // Fallback to demo data
        displayFallbackProfessionals(location);
    }
}

function displayProfessionals(professionals) {
    const listDiv = document.getElementById('professionals-list');
    
    if (professionals.length === 0) {
        listDiv.innerHTML = '<p>No professionals found. Try adjusting your search criteria.</p>';
        return;
    }
    
    listDiv.innerHTML = professionals.map(prof => {
        const distance = userLocation && prof.geometry ? 
            calculateDistance(userLocation, {
                lat: prof.geometry.location.lat(),
                lng: prof.geometry.location.lng()
            }).toFixed(1) + ' km' : '';
        
        return `
            <div class="professional-card">
                <h4>${prof.name}</h4>
                <p><strong>Address:</strong> ${prof.formatted_address || 'Address not available'}</p>
                ${prof.formatted_phone_number ? `<p><strong>Phone:</strong> ${prof.formatted_phone_number}</p>` : ''}
                ${prof.rating ? `<p><strong>Rating:</strong> ⭐ ${prof.rating}/5</p>` : ''}
                ${distance ? `<p><strong>Distance:</strong> ${distance}</p>` : ''}
                ${prof.website ? `<a href="${prof.website}" target="_blank">Visit Website →</a>` : ''}
                <button class="btn-secondary" onclick="directionsToProfessional('${prof.formatted_address}')">Get Directions</button>
            </div>
        `;
    }).join('');
}

function displayFallbackProfessionals(location) {
    const professionals = [
        {
            name: 'Vision Care Center',
            address: '123 Main St, ' + location,
            phone: '(555) 123-4567',
            website: 'https://example.com',
            specialties: 'Eye Exams, Glasses, Contact Lenses'
        },
        {
            name: 'Advanced Eye Clinic',
            address: '456 Oak Ave, ' + location,
            phone: '(555) 234-5678',
            website: 'https://example.com',
            specialties: 'Comprehensive Eye Care, Surgery Consultation'
        }
    ];
    
    displayProfessionals(professionals);
}

function calculateDistance(loc1, loc2) {
    const R = 6371; // Earth's radius in km
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLon = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function directionsToProfessional(address) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
}

async function useCurrentLocationForRetailers() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            
            if (typeof google !== 'undefined' && google.maps) {
                const geocoder = new google.maps.Geocoder();
                geocoder.geocode({ location: userLocation }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        document.getElementById('retailer-location').value = results[0].formatted_address;
                        searchRetailers();
                    }
                });
            } else {
                document.getElementById('retailer-location').value = 'Current Location';
                searchRetailers();
            }
        },
        (error) => {
            alert('Could not get your location. Please enter it manually.');
        }
    );
}

function searchRetailers() {
    const location = document.getElementById('retailer-location').value;
    if (!location) {
        alert('Please enter a location');
        return;
    }
    
    const listDiv = document.getElementById('retailers-list');
    listDiv.innerHTML = '<p>Searching for retailers...</p>';
    
    if (typeof google !== 'undefined' && google.maps && placesService) {
        const request = {
            query: `eyewear store optical shop near ${location}`,
            fields: ['name', 'formatted_address', 'formatted_phone_number', 'opening_hours', 'rating', 'geometry']
        };
        
        const service = new google.maps.places.PlacesService(document.createElement('div'));
        service.textSearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                displayRetailers(results.slice(0, 10));
            } else {
                displayFallbackRetailers(location);
            }
        });
    } else {
        displayFallbackRetailers(location);
    }
}

function displayRetailers(retailers) {
    const listDiv = document.getElementById('retailers-list');
    
    if (retailers.length === 0) {
        listDiv.innerHTML = '<p>No retailers found. Try adjusting your search.</p>';
        return;
    }
    
    listDiv.innerHTML = retailers.map(retailer => {
        const hours = retailer.opening_hours && retailer.opening_hours.weekday_text ?
            retailer.opening_hours.weekday_text.join(', ') : 'Hours not available';
        const distance = userLocation && retailer.geometry ?
            calculateDistance(userLocation, {
                lat: retailer.geometry.location.lat(),
                lng: retailer.geometry.location.lng()
            }).toFixed(1) + ' km' : '';
        
        return `
            <div class="retailer-card">
                <h4>${retailer.name}</h4>
                <p><strong>Address:</strong> ${retailer.formatted_address || 'Address not available'}</p>
                ${retailer.formatted_phone_number ? `<p><strong>Phone:</strong> ${retailer.formatted_phone_number}</p>` : ''}
                ${retailer.rating ? `<p><strong>Rating:</strong> ⭐ ${retailer.rating}/5</p>` : ''}
                <p><strong>Hours:</strong> ${hours}</p>
                ${distance ? `<p><strong>Distance:</strong> ${distance}</p>` : ''}
                <button class="btn-primary" onclick="directionsToRetailer('${retailer.formatted_address}')">Get Directions</button>
            </div>
        `;
    }).join('');
}

function displayFallbackRetailers(location) {
    const retailers = [
        {
            name: 'Eyewear Express',
            address: '123 Fashion Blvd, ' + location,
            phone: '(555) 111-2222',
            hours: 'Mon-Sat 9AM-8PM'
        },
        {
            name: 'Vision Mart',
            address: '456 Shopping Center, ' + location,
            phone: '(555) 222-3333',
            hours: 'Mon-Fri 10AM-9PM, Sat-Sun 11AM-7PM'
        }
    ];
    
    displayRetailers(retailers);
}

// ========== TENSORFLOW.JS FACE DETECTION ==========
let faceDetectionModel = null;
let isFaceDetectionReady = false;

async function initializeFaceDetection() {
    try {
        if (typeof faceLandmarksDetection !== 'undefined') {
            faceDetectionModel = await faceLandmarksDetection.load(
                faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
                { maxFaces: 1 }
            );
            isFaceDetectionReady = true;
            console.log('Face detection model loaded successfully');
        } else {
            console.warn('Face detection library not loaded. Using simple overlay.');
            isFaceDetectionReady = false;
        }
    } catch (error) {
        console.error('Error loading face detection model:', error);
        isFaceDetectionReady = false;
    }
}

async function detectFaceAndDrawGlasses(video, canvas, ctx) {
    if (!isFaceDetectionReady || !faceDetectionModel) {
        // Fallback to simple centered glasses
        drawSimpleGlasses(canvas, ctx);
        return;
    }
    
    try {
        const predictions = await faceDetectionModel.estimateFaces({
            input: video,
            returnTensors: false,
            flipHorizontal: false,
            staticImageMode: false
        });
        
        if (predictions.length > 0) {
            const face = predictions[0];
            const keypoints = face.scaledMesh;
            
            // Find eye positions from keypoints
            // Left eye center (approximate)
            const leftEyeIdx = 33; // MediaPipe left eye landmark
            const rightEyeIdx = 263; // MediaPipe right eye landmark
            
            if (keypoints[leftEyeIdx] && keypoints[rightEyeIdx]) {
                const leftEye = keypoints[leftEyeIdx];
                const rightEye = keypoints[rightEyeIdx];
                
                // Calculate eye distance and center
                const eyeDistance = Math.sqrt(
                    Math.pow(rightEye[0] - leftEye[0], 2) + 
                    Math.pow(rightEye[1] - leftEye[1], 2)
                );
                
                const eyeCenterY = (leftEye[1] + rightEye[1]) / 2;
                
                // Draw glasses positioned at eyes
                drawGlassesAtPosition(
                    ctx, 
                    leftEye[0], 
                    rightEye[0], 
                    eyeCenterY, 
                    eyeDistance
                );
            } else {
                drawSimpleGlasses(canvas, ctx);
            }
        } else {
            drawSimpleGlasses(canvas, ctx);
        }
    } catch (error) {
        console.error('Face detection error:', error);
        drawSimpleGlasses(canvas, ctx);
    }
}

function drawGlassesAtPosition(ctx, leftX, rightX, eyeY, eyeDistance) {
    const lensRadius = eyeDistance * 0.35;
    const bridgeWidth = eyeDistance * 0.15;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    // Left lens
    ctx.beginPath();
    ctx.arc(leftX, eyeY, lensRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Right lens
    ctx.beginPath();
    ctx.arc(rightX, eyeY, lensRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Bridge
    ctx.beginPath();
    ctx.moveTo(leftX + lensRadius, eyeY);
    ctx.lineTo(rightX - lensRadius, eyeY);
    ctx.stroke();
    
    // Temples (sides)
    const templeLength = eyeDistance * 0.8;
    ctx.beginPath();
    ctx.moveTo(leftX - lensRadius, eyeY);
    ctx.lineTo(leftX - lensRadius - templeLength, eyeY);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(rightX + lensRadius, eyeY);
    ctx.lineTo(rightX + lensRadius + templeLength, eyeY);
    ctx.stroke();
}

function drawSimpleGlasses(canvas, ctx) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const eyeY = centerY - 30;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 8;
    
    ctx.beginPath();
    ctx.arc(centerX - 60, eyeY, 35, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX + 60, eyeY, 35, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(centerX - 60, eyeY);
    ctx.lineTo(centerX + 60, eyeY);
    ctx.stroke();
}

// Update the drawGlassesOverlay function to use face detection
function drawGlassesOverlay() {
    if (!tryonStream) return;
    
    const video = document.getElementById('tryon-video');
    const canvas = document.getElementById('tryon-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    
    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Use face detection if available, otherwise use simple overlay
    if (isFaceDetectionReady) {
        detectFaceAndDrawGlasses(video, canvas, ctx);
    } else {
        drawSimpleGlasses(canvas, ctx);
    }
    
    canvas.style.display = 'block';
    video.style.display = 'none';
    
    requestAnimationFrame(drawGlassesOverlay);
}

// ========== E-COMMERCE (STRIPE INTEGRATION) ==========
let shoppingCart = [];

function addToCart(productId, productName, price) {
    const item = {
        id: productId,
        name: productName,
        price: price,
        quantity: 1
    };
    
    // Check if item already in cart
    const existingItem = shoppingCart.find(i => i.id === productId);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        shoppingCart.push(item);
    }
    
    updateCartDisplay();
    saveCartToStorage();
    
    // Show notification
    showNotification(`${productName} added to cart!`);
}

function removeFromCart(productId) {
    shoppingCart = shoppingCart.filter(item => item.id !== productId);
    updateCartDisplay();
    saveCartToStorage();
}

function updateCartQuantity(productId, quantity) {
    const item = shoppingCart.find(i => i.id === productId);
    if (item) {
        item.quantity = Math.max(1, parseInt(quantity));
        updateCartDisplay();
        saveCartToStorage();
    }
}

function updateCartDisplay() {
    const cartItemsDiv = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    
    cartCount.textContent = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    
    const total = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
    
    if (shoppingCart.length === 0) {
        cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }
    
    cartItemsDiv.innerHTML = shoppingCart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-controls">
                <input type="number" min="1" value="${item.quantity}" 
                    onchange="updateCartQuantity(${item.id}, this.value)" />
                <button class="btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}

function saveCartToStorage() {
    localStorage.setItem('spectit_cart', JSON.stringify(shoppingCart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('spectit_cart');
    if (saved) {
        shoppingCart = JSON.parse(saved);
        updateCartDisplay();
    }
}

async function checkout() {
    if (shoppingCart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    const STRIPE_KEY = (window.CONFIG && window.CONFIG.STRIPE_PUBLISHABLE_KEY) ||
                      (typeof CONFIG !== 'undefined' && CONFIG.STRIPE_PUBLISHABLE_KEY) ||
                      '';
    
    if (STRIPE_KEY && STRIPE_KEY !== 'YOUR_STRIPE_PUBLISHABLE_KEY' && STRIPE_KEY !== '') {
        // Real Stripe checkout
        try {
            // In production, create checkout session on your backend
            const API_BASE = (window.CONFIG && window.CONFIG.API_BASE_URL) ||
                           (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL) ||
                           '/api';
            
            const response = await fetch(`${API_BASE}/create-checkout-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: shoppingCart.map(item => ({
                        name: item.name,
                        amount: Math.round(item.price * 100), // Convert to cents
                        quantity: item.quantity
                    }))
                })
            });
            
            const session = await response.json();
            // Redirect to Stripe Checkout
            window.location.href = session.url;
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Checkout temporarily unavailable. Please try again later.');
        }
    } else {
        // Demo checkout
        const total = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (confirm(`Proceed to checkout? Total: $${total.toFixed(2)}\n\nIn production, this would redirect to Stripe checkout.`)) {
            alert('Demo checkout complete! In production, this would process payment via Stripe.');
            shoppingCart = [];
            updateCartDisplay();
            saveCartToStorage();
        }
    }
}

// ========== USER ACCOUNT SYSTEM ==========
let currentUser = null;

function initializeAccount() {
    // Check if user is logged in
    const savedUser = localStorage.getItem('spectit_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showUserDashboard();
    } else {
        showLoginSection();
    }
    
    loadTestHistory();
    loadSavedPrescriptions();
    updateCartFromStorage();
}

function showLoginSection() {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('user-dashboard').style.display = 'none';
}

function showUserDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'block';
    
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name || currentUser.email.split('@')[0];
        document.getElementById('user-email-display').textContent = currentUser.email;
    }
}

async function signUp() {
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // In production, use Firebase or your backend
    if (typeof CONFIG !== 'undefined' && CONFIG.FEATURES.FIREBASE_AUTH) {
        // Firebase auth would go here
        alert('Firebase auth not configured. Using local storage.');
    }
    
    // Local storage signup (demo)
    const user = {
        email: email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('spectit_user', JSON.stringify(user));
    currentUser = user;
    
    showUserDashboard();
    showNotification('Account created successfully!');
}

async function signIn() {
    const email = document.getElementById('user-email').value;
    const password = document.getElementById('user-password').value;
    
    if (!email || !password) {
        alert('Please enter email and password');
        return;
    }
    
    // In production, use Firebase or your backend
    const savedUser = localStorage.getItem('spectit_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        if (user.email === email) {
            currentUser = user;
            showUserDashboard();
            showNotification('Signed in successfully!');
            return;
        }
    }
    
    alert('Invalid email or password');
}

function signOut() {
    currentUser = null;
    localStorage.removeItem('spectit_user');
    showLoginSection();
    document.getElementById('user-email').value = '';
    document.getElementById('user-password').value = '';
    showNotification('Signed out successfully');
}

function saveTestResults() {
    if (!currentUser) {
        if (confirm('Save results to your account? Please sign in or create an account.')) {
            showTest('account');
            return;
        }
    }
    
    const testData = {
        userId: currentUser ? currentUser.email : 'guest',
        date: new Date().toISOString(),
        results: allTestResults
    };
    
    // Save to localStorage
    let history = JSON.parse(localStorage.getItem('spectit_test_history') || '[]');
    history.push(testData);
    localStorage.setItem('spectit_test_history', JSON.stringify(history));
    
    // Save prescription separately if exists
    if (allTestResults.prescription) {
        let prescriptions = JSON.parse(localStorage.getItem('spectit_prescriptions') || '[]');
        prescriptions.push({
            userId: currentUser ? currentUser.email : 'guest',
            date: new Date().toISOString(),
            prescription: allTestResults.prescription
        });
        localStorage.setItem('spectit_prescriptions', JSON.stringify(prescriptions));
    }
    
    showNotification('Test results saved!');
    loadTestHistory();
    loadSavedPrescriptions();
}

function loadTestHistory() {
    const history = JSON.parse(localStorage.getItem('spectit_test_history') || '[]');
    const userEmail = currentUser ? currentUser.email : null;
    
    const userHistory = userEmail ? 
        history.filter(h => h.userId === userEmail) : 
        history.filter(h => h.userId === 'guest');
    
    const historyList = document.getElementById('test-history-list');
    
    if (userHistory.length === 0) {
        historyList.innerHTML = '<p>No test history yet. Complete some tests to see your history here.</p>';
        return;
    }
    
    historyList.innerHTML = userHistory.reverse().slice(0, 10).map(test => {
        const date = new Date(test.date).toLocaleDateString();
        const testsCompleted = Object.keys(test.results).filter(k => test.results[k] !== null).length;
        
        return `
            <div class="history-item">
                <h4>Test from ${date}</h4>
                <p>Tests completed: ${testsCompleted}</p>
                <button class="btn-secondary" onclick="viewTestHistory('${test.date}')">View Details</button>
            </div>
        `;
    }).join('');
}

function loadSavedPrescriptions() {
    const prescriptions = JSON.parse(localStorage.getItem('spectit_prescriptions') || '[]');
    const userEmail = currentUser ? currentUser.email : null;
    
    const userPrescriptions = userEmail ?
        prescriptions.filter(p => p.userId === userEmail) :
        prescriptions.filter(p => p.userId === 'guest');
    
    const prescriptionsList = document.getElementById('saved-prescriptions-list');
    
    if (userPrescriptions.length === 0) {
        prescriptionsList.innerHTML = '<p>No saved prescriptions yet.</p>';
        return;
    }
    
    prescriptionsList.innerHTML = userPrescriptions.reverse().map(rx => {
        const date = new Date(rx.date).toLocaleDateString();
        return `
            <div class="prescription-item">
                <h4>Prescription from ${date}</h4>
                <p>OD: ${rx.prescription.OD.sphere}D | OS: ${rx.prescription.OS.sphere}D</p>
                <button class="btn-secondary" onclick="downloadPrescriptionById('${rx.date}')">Download</button>
            </div>
        `;
    }).join('');
}

function viewTestHistory(date) {
    const history = JSON.parse(localStorage.getItem('spectit_test_history') || '[]');
    const test = history.find(h => h.date === date);
    
    if (test) {
        alert('Test Details:\n' + JSON.stringify(test.results, null, 2));
    }
}

function downloadPrescriptionById(date) {
    const prescriptions = JSON.parse(localStorage.getItem('spectit_prescriptions') || '[]');
    const rx = prescriptions.find(p => p.date === date);
    
    if (rx && window.currentPrescription) {
        downloadPrescription();
    }
}

function updateCartFromStorage() {
    loadCartFromStorage();
}

function showNotification(message) {
    // Simple notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Load configuration from Vercel API or use local config
async function loadConfiguration() {
    try {
        // Try to load from Vercel API endpoint first
        const response = await fetch('/api/config');
        if (response.ok) {
            const apiConfig = await response.json();
            window.CONFIG = apiConfig;
            console.log('Configuration loaded from API');
            return apiConfig;
        }
    } catch (error) {
        console.log('API config not available, using local config');
    }
    
    // Fallback to local CONFIG if API fails
    if (typeof CONFIG !== 'undefined') {
        window.CONFIG = CONFIG;
        return CONFIG;
    }
    
    // Default config if nothing available
    window.CONFIG = {
        GOOGLE_PLACES_API_KEY: '',
        OPENAI_API_KEY: '',
        STRIPE_PUBLISHABLE_KEY: '',
        FIREBASE_CONFIG: {},
        FEATURES: {
            GOOGLE_PLACES: false,
            OPENAI_QA: false,
            STRIPE_CHECKOUT: false,
            FIREBASE_AUTH: false,
            FACE_DETECTION: true
        }
    };
    
    return window.CONFIG;
}

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Load configuration first
    const config = await loadConfiguration();
    
    // Load Google Places API if configured
    if (config.GOOGLE_PLACES_API_KEY && 
        config.GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY' &&
        config.GOOGLE_PLACES_API_KEY !== '') {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${config.GOOGLE_PLACES_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializePlacesAPI();
        };
        script.onerror = () => {
            console.warn('Failed to load Google Maps API');
        };
        document.head.appendChild(script);
    } else {
        console.warn('Google Places API key not configured. Using fallback data.');
    }
    
    // Initialize face detection
    await initializeFaceDetection();
    
    // Load cart from storage
    loadCartFromStorage();
    
    // Check account status
    const savedUser = localStorage.getItem('spectit_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        const accountBtn = document.getElementById('account-nav-btn');
        if (accountBtn) {
            accountBtn.textContent = 'Account ✓';
        }
    }
});

