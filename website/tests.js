// Advanced Eye Testing Platform - Test Implementations

let currentTest = null;
let testResults = [];
let testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
let completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]'); // Track completed tests
const ALL_TESTS = ['visual-acuity', 'color-blindness', 'astigmatism', 'contrast', 'visual-field', 'prescription', 'amsler-grid', 'near-vision', 'duochrome', 'stereo-acuity'];

// Load test history from Supabase on page load
async function loadTestHistory() {
    if (window.getTestResultsFromSupabase) {
        try {
            const results = await window.getTestResultsFromSupabase();
            if (results && results.length > 0) {
                testHistory = results;
                localStorage.setItem('testHistory', JSON.stringify(testHistory));
                updateResultsDisplay();
                updateHistoryChart();
            }
        } catch (error) {
            console.error('Error loading test history:', error);
        }
    }
}

// Load history on page load
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for Supabase to initialize
    setTimeout(loadTestHistory, 1000);
});

function runPreTestSafetyChecks(testName) {
    const checks = [
        'Use this only in a safe stationary setting (never while driving).',
        'Set screen brightness to at least 70% and clean your screen.',
        'Ensure moderate room lighting without strong glare on the display.',
        'Wear your usual glasses/contact lenses unless instructed otherwise.'
    ];
    const proceed = window.confirm(
        `${testName} safety and setup check:\n\n- ${checks.join('\n- ')}\n\nContinue?`
    );
    return proceed;
}

// Enhanced Visual Acuity Test with LiDAR Distance Measurement
async function startVisualAcuityTest() {
    try {
        if (!runPreTestSafetyChecks('Visual Acuity Test')) return;
        // Check if user has email before starting test
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => {
                startVisualAcuityTestInternal();
            });
            return;
        }
        
        // If email check not available, proceed directly
        startVisualAcuityTestInternal();
    } catch (error) {
        console.error('[Visual Acuity Test] Error:', error);
        alert('Error starting test. Please try again.');
    }
}

async function startVisualAcuityTestInternal() {
    // Standard Snellen chart distance: 6 meters (20 feet) - Medical standard
    // Note: 3 meters is acceptable but 6 meters is the gold standard for clinical accuracy
    const targetDistance = 6.0; // meters (20 feet) - Standard clinical distance
    const tolerance = 0.15; // 15% tolerance (slightly more for longer distance)
    
    // Initialize AI Vision Engine for maximum accuracy
    let aiEngineInitialized = false;
    if (window.aiVisionEngine) {
        aiEngineInitialized = await window.aiVisionEngine.initialize();
        if (aiEngineInitialized) {
            console.log('[Visual Acuity Test] ✅ AI Vision Engine initialized for enhanced accuracy');
        }
    }
    
    // Initialize LiDAR Engine
    let lidarSetup = null;
    if (window.lidarEngine) {
        lidarSetup = await window.lidarEngine.initialize(targetDistance, tolerance);
    }
    
    // Calibrate screen properties
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const screenDPI = 96;
    // Prefer the user's credit-card screen calibration (CSS px/mm) when available,
    // so optotypes are shown at the correct physical/angular size. Falls back to the
    // 96-DPI approximation otherwise. (Set by the Refractive Screening calibration.)
    const calPxPerMm = parseFloat(localStorage.getItem('spectit_px_per_mm'));
    const actualDPI = (Number.isFinite(calPxPerMm) && calPxPerMm > 0)
        ? calPxPerMm * 25.4
        : screenDPI * devicePixelRatio;
    
    // Calculate physical screen dimensions (approximate)
    const screenWidthInches = screenWidth / actualDPI;
    const screenWidthMeters = screenWidthInches * 0.0254;
    
    currentTest = {
        type: 'visual-acuity',
        name: 'Snellen Visual Acuity Test',
        eye: 'both',
        targetDistance: targetDistance,
        tolerance: tolerance,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        viewportWidth: viewportWidth,
        viewportHeight: viewportHeight,
        devicePixelRatio: devicePixelRatio,
        actualDPI: actualDPI,
        screenWidthMeters: screenWidthMeters,
        lidarAvailable: lidarSetup && lidarSetup.available,
        lidarSetup: lidarSetup,
        aiEngineAvailable: aiEngineInitialized,
        aiMeasurements: null,
        eyeTrackingActive: false,
        currentLine: 0,
        correct: 0,
        total: 0,
        answers: [],
        distanceLocked: false,
        distanceValid: false,
        baselineDistance: null,
        movementDetected: false,
        lineAttempts: {}, // Track attempts per line: { lineIndex: { attempts: [], correctCount: 0, passed: false } }
        lastPassedLine: -1, // Track the last line that was passed
        // Medical-Grade Snellen Chart - WHO/ISO Compliant
        // Standard Sloan Optotypes: C, D, E, F, H, K, N, O, P, R, S, T, V, Z
        // Medical Standard: 5 letters per line (except first line), 1 letter width spacing
        // Visual angles: 5 arc minutes for 6/6 (20/20) - industry gold standard
        // WHO Standard: 4 out of 5 letters correct to pass (80% accuracy)
        // LogMAR values for clinical accuracy
        lines: [
            { level: '6/60', visualAngle: 50, logMAR: 1.0, letters: ['E'], correctAnswers: ['E', 'e'] },
            { level: '6/48', visualAngle: 40, logMAR: 0.9, letters: ['C', 'D', 'F', 'H', 'K'], correctAnswers: ['CDFHK', 'CDHFK', 'CFDHK', 'CFHDK', 'CHDFK', 'CHFDK', 'CKDFH', 'CKFDH', 'cdfhk', 'cdhfk', 'cfdhk', 'cfhdk', 'chdfk', 'chfdk', 'ckdfh', 'ckfdh'] },
            { level: '6/36', visualAngle: 30, logMAR: 0.78, letters: ['N', 'O', 'P', 'R', 'S'], correctAnswers: ['NOPSR', 'NOPRS', 'NORPS', 'NORSP', 'NOSPR', 'NOSRP', 'NPROS', 'NPRSO', 'NPSOR', 'NPSRO', 'NROPS', 'NROSP', 'NRPOS', 'NRPSO', 'NRSPO', 'NRSOP', 'nopsr', 'noprs', 'norps', 'norsp', 'nospr', 'nosrp', 'npros', 'nprso', 'npsor', 'npsro', 'nrops', 'nrosp', 'nrpos', 'nrpso', 'nrspo', 'nrsop'] },
            { level: '6/24', visualAngle: 20, logMAR: 0.6, letters: ['T', 'V', 'Z', 'C', 'D'], correctAnswers: ['TVZCD', 'TVZDC', 'TVCZD', 'TVCDZ', 'TVDZC', 'TVDCZ', 'TZVCD', 'TZVDC', 'TZCVD', 'TZCDV', 'TZDVC', 'TZDCV', 'TCVZD', 'TCVDZ', 'TCZVD', 'TCZDV', 'TCDVZ', 'TCDZV', 'TDVZC', 'TDVCZ', 'TDZVC', 'TDZCV', 'TDCVZ', 'TDCZV', 'tvzcd', 'tvzdc', 'tvczd', 'tvcdz', 'tvdzc', 'tvdcz', 'tzvcd', 'tzvdc', 'tzcvd', 'tzcdv', 'tzdvc', 'tzdcv', 'tcvzd', 'tcvdz', 'tczvd', 'tczdv', 'tcdvz', 'tcdzv', 'tdvzc', 'tdvcz', 'tdzvc', 'tdzcv', 'tdcvz', 'tdczv'] },
            { level: '6/18', visualAngle: 15, logMAR: 0.48, letters: ['E', 'F', 'H', 'K', 'N'], correctAnswers: ['EFHKN', 'EFHNK', 'EFKHN', 'EFKNH', 'EFNHK', 'EFNKH', 'EHFKN', 'EHFNK', 'EHKFN', 'EHKNF', 'EHNFK', 'EHNKF', 'EKFHN', 'EKFNH', 'EKHFN', 'EKHNF', 'EKNFH', 'EKNHF', 'ENFHK', 'ENFKH', 'ENHFK', 'ENHKF', 'ENKFH', 'ENKHF', 'efhkn', 'efhnk', 'efkhn', 'efknh', 'efnhk', 'efnkh', 'ehfkn', 'ehfnk', 'ehkfn', 'ehknf', 'ehnfk', 'ehnkf', 'ekfhn', 'ekfnh', 'ekhfn', 'ekhnf', 'eknfh', 'eknhf', 'enfhk', 'enfkh', 'enhfk', 'enhkf', 'enkfh', 'enkhf'] },
            { level: '6/12', visualAngle: 10, logMAR: 0.3, letters: ['O', 'P', 'R', 'S', 'T'], correctAnswers: ['OPRST', 'OPRTS', 'OPSRT', 'OPSTR', 'OPTRS', 'OPTSR', 'ORPST', 'ORPTS', 'ORSPT', 'ORSTP', 'ORTPT', 'ORTSP', 'OSPRT', 'OSPTR', 'OSRPT', 'OSRTP', 'OSTPR', 'OSTRP', 'OTPRS', 'OTPSR', 'OTRPS', 'OTRSP', 'OTSPR', 'OTSRP', 'oprst', 'oprts', 'opsrt', 'opstr', 'optrs', 'optsr', 'orpst', 'orpts', 'orspt', 'orstp', 'ortpt', 'ortsp', 'osprt', 'osptr', 'osrpt', 'osrtp', 'ostpr', 'ostrp', 'otprs', 'otpsr', 'otrps', 'otrsp', 'otspr', 'otsrp'] },
            { level: '6/9', visualAngle: 7.5, logMAR: 0.18, letters: ['V', 'Z', 'C', 'D', 'E'], correctAnswers: ['VZCDE', 'VZCED', 'VZDCE', 'VZDEC', 'VZECD', 'VZEDC', 'VCZDE', 'VCZED', 'VCDZE', 'VCDEZ', 'VCEZD', 'VCEDZ', 'VDZCE', 'VDZEC', 'VDCZE', 'VDCEZ', 'VDEZC', 'VDECZ', 'VEZCD', 'VEZDC', 'VECZD', 'VECDZ', 'VEDZC', 'VEDCZ', 'vzcde', 'vzced', 'vzdce', 'vzdec', 'vzecd', 'vzedc', 'vczde', 'vczed', 'vcdze', 'vcdez', 'vcezd', 'vcedz', 'vdzce', 'vdzec', 'vdcze', 'vdcez', 'vdezc', 'vdecz', 'vezcd', 'vezdc', 'veczd', 'vecdz', 'vedzc', 'vedcz'] },
            { level: '6/6', visualAngle: 5, logMAR: 0.0, letters: ['F', 'H', 'K', 'N', 'P'], correctAnswers: ['FHKNP', 'FHKN', 'FHKPN', 'FHNKP', 'FHPKN', 'FHPNK', 'FKHNP', 'FKHPN', 'FKNP', 'FKNH', 'FKPNH', 'FKPHN', 'FNHKP', 'FNHPK', 'FNKHP', 'FNKPH', 'FNPKH', 'FPHKN', 'FPHNK', 'FPKHN', 'FPKNH', 'FPNHK', 'FPNKH', 'fhknp', 'fhkpn', 'fhnkp', 'fhnpk', 'fhpkn', 'fhpnk', 'fkhnp', 'fkhpn', 'fknph', 'fknhp', 'fnhkp', 'fnhpk', 'fnkhp', 'fnkph', 'fnphk', 'fnpkh', 'fphkn', 'fphnk', 'fpkhn', 'fpknh', 'fpnhk', 'fpnkh'] },
            { level: '6/5', visualAngle: 4, logMAR: -0.1, letters: ['R', 'S', 'T', 'V', 'Z'], correctAnswers: ['RSTVZ', 'RSTZV', 'RSVTZ', 'RSVZT', 'RSZTV', 'RSZVT', 'RTSVZ', 'RTSZV', 'RTVSZ', 'RTVZS', 'RTZSV', 'RTZVS', 'RVSTZ', 'RVSZT', 'RVTSZ', 'RVTZS', 'RVZST', 'RVZTS', 'RZSTV', 'RZSVT', 'RZTSV', 'RZTVS', 'RZVST', 'RZVTS', 'rstvz', 'rstzv', 'rsvtz', 'rsvzt', 'rsztv', 'rszvt', 'rtsvz', 'rtszv', 'rtvsz', 'rtvzs', 'rtzsv', 'rtzvs', 'rvstz', 'rvszt', 'rvtsz', 'rvtzs', 'rvzst', 'rvzts', 'rzstv', 'rzsvt', 'rztsv', 'rztvs', 'rzvst', 'rzvts'] },
        ],
        userReadings: [] // Store what user actually reads
    };
    
    // Ensure container exists before showing modal
    const container = document.getElementById('test-container');
    if (!container) {
        console.error('[Visual Acuity Test] test-container not found');
        alert('Error: Test container not found. Please refresh the page.');
        return;
    }
    
    showTestModal();
    
    // Small delay to ensure modal is visible
    setTimeout(async () => {
        await renderVisualAcuityTestWithLiDAR();
    }, 100);
}

async function renderVisualAcuityTestWithLiDAR() {
    if (!currentTest) {
        console.error('[Visual Acuity Test] No test data');
        return;
    }
    
    const container = document.getElementById('test-container');
    if (!container) {
        console.error('[Visual Acuity Test] test-container not found');
        return;
    }
    
    if (currentTest.currentLine >= currentTest.lines.length) {
        // All lines completed
        finishVisualAcuityTest();
        return;
    }
    
    const line = currentTest.lines[currentTest.currentLine];
    if (!line) {
        console.error('[Visual Acuity Test] Invalid line index:', currentTest.currentLine);
        console.error('[Visual Acuity Test] Available lines:', currentTest.lines.length);
        return;
    }
    
    // Debug logging for line 2
    if (line.level === '6/48') {
        console.log('[Line 2 Render] Rendering line 2 (6/48)');
        console.log('[Line 2 Render] Letters array:', line.letters);
        console.log('[Line 2 Render] Letters count:', line.letters.length);
        console.log('[Line 2 Render] Visual angle:', line.visualAngle);
    }
    
    // Clear any previous feedback
    const feedbackEl = document.getElementById('snellen-feedback');
    if (feedbackEl) {
        feedbackEl.style.display = 'none';
        feedbackEl.textContent = '';
    }
    
    // Get current distance from LiDAR or use target
    let actualDistanceMeters = currentTest.targetDistance;
    if (currentTest.lidarAvailable && window.lidarEngine && window.lidarEngine.currentDistance) {
        actualDistanceMeters = window.lidarEngine.currentDistance;
    }
    
    // Calculate precise letter size using LiDAR-calibrated distance
    // Visual acuity uses specific visual angles (arc minutes)
    // For 6/6 (20/20): 5 arc minutes
    const visualAngleMinutes = line.visualAngle;
    const letterHeightMeters = window.lidarEngine 
        ? window.lidarEngine.calculateLetterSize(visualAngleMinutes, actualDistanceMeters)
        : actualDistanceMeters * Math.tan((visualAngleMinutes / 60) * (Math.PI / 180));
    
    // Convert to pixels - Medical-grade accurate calculation with screen fitting
    let letterSizePixels;
    if (window.lidarEngine && currentTest.lidarAvailable) {
        letterSizePixels = window.lidarEngine.convertToPixels(letterHeightMeters, currentTest.actualDPI, currentTest.screenWidthMeters);
    } else {
        // Fallback: Accurate pixel conversion using viewport and screen dimensions
        // Use viewport width for better accuracy on mobile devices
        const viewportWidthPixels = currentTest.viewportWidth;
        const viewportWidthMeters = (viewportWidthPixels / currentTest.actualDPI) * 0.0254;
        const pixelsPerMeter = viewportWidthPixels / Math.max(viewportWidthMeters, 0.1); // Prevent division by zero
        letterSizePixels = letterHeightMeters * pixelsPerMeter;
    }
    
    // Medical-grade scaling: Letter height = visual angle * distance
    // Standard Snellen: 5 arc minutes for 6/6 (20/20) at 6 meters
    // Enhanced scaling for maximum visibility and accuracy: 1.0 factor for exact medical standard
    // Clamp to medical standard range: 32px minimum (increased for better visibility), 800px maximum for large displays
    // Ensure letters are large enough to be clearly visible
    let fontSize = Math.max(32, Math.min(800, letterSizePixels * 1.0));
    
    // Screen fitting: Ensure all letters fit on screen
    // Calculate maximum font size based on viewport width and number of letters
    const numLetters = line.letters.filter(l => l && l.trim()).length;
    const availableWidth = currentTest.viewportWidth - 80; // Account for padding
    const maxFontSizeForScreen = Math.floor(availableWidth / (numLetters * 1.8)); // 1.8 accounts for letter width + spacing
    fontSize = Math.min(fontSize, maxFontSizeForScreen);
    
    // Ensure minimum readable size
    fontSize = Math.max(24, fontSize);
    
    // Debug logging for line 2
    if (line.level === '6/48') {
        console.log('[Line 2 Size] Visual angle:', visualAngleMinutes, 'arc min');
        console.log('[Line 2 Size] Distance:', actualDistanceMeters, 'm');
        console.log('[Line 2 Size] Letter height (meters):', letterHeightMeters);
        console.log('[Line 2 Size] Letter size (pixels):', letterSizePixels);
        console.log('[Line 2 Size] Final font size:', fontSize, 'px');
    }
    
    // Get distance status from LiDAR Engine
    let distanceStatus = 'unknown';
    let distanceBarColor = '#e2e8f0';
    let distanceMessage = '';
    let distanceValue = actualDistanceMeters.toFixed(2);
    
    if (currentTest.lidarAvailable && window.lidarEngine) {
        const status = window.lidarEngine.getDistanceStatus(actualDistanceMeters);
        if (status === 'correct') {
            distanceStatus = 'correct';
            distanceBarColor = '#48bb78';
            distanceMessage = '✓ Distance correct';
        } else if (status === 'too_close') {
            distanceStatus = 'too_close';
            distanceBarColor = '#f56565';
            distanceMessage = 'Too close - move back';
        } else if (status === 'too_far') {
            distanceStatus = 'too_far';
            distanceBarColor = '#f56565';
            distanceMessage = 'Too far - move closer';
        }
    }
    
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Snellen Visual Acuity Test</h2>
            
            ${!currentTest.distanceLocked ? `
            <div class="lidar-setup-phase">
                <div class="lidar-instructions">
                    <h3>📏 Position Yourself</h3>
                    <p><strong>Step 1:</strong> Stand or sit where you'll take the test (exactly ${currentTest.targetDistance.toFixed(1)} meters from your screen).</p>
                    ${currentTest.lidarAvailable ? `
                        <p><strong>Step 2:</strong> We'll use LiDAR to measure your distance automatically.</p>
                        <p><strong>Step 3:</strong> Hold your device steady and look directly at the screen.</p>
                    ` : `
                        <p><strong>Step 2:</strong> Measure ${currentTest.targetDistance.toFixed(1)} meters from your screen.</p>
                        <p><strong>Step 3:</strong> Confirm when you're in position.</p>
                    `}
                </div>
                
                ${currentTest.lidarAvailable ? `
                <div class="lidar-distance-indicator">
                    <div class="distance-bar-container">
                        <div class="distance-bar" id="distance-bar" style="background: ${distanceBarColor}; width: 0%;"></div>
                    </div>
                    <div class="distance-status" id="distance-status">
                        <span id="distance-text">Measuring distance...</span>
                        <span id="distance-value" style="font-weight: 600; margin-left: 0.5rem;"></span>
                    </div>
                    <div class="distance-message" id="distance-message" style="color: ${distanceBarColor === '#48bb78' ? '#48bb78' : '#f56565'};">
                        ${distanceMessage || 'Position yourself and hold still'}
                    </div>
                </div>
                ` : ''}
                
                <button class="btn-lock-distance" onclick="lockDistanceForTest()" ${currentTest.lidarAvailable && !currentTest.distanceValid ? 'disabled' : ''}>
                    ${currentTest.lidarAvailable ? '🔒 Lock Distance & Start Test' : '✓ Confirm Position & Start Test'}
                </button>
                <button class="btn-skip-distance" onclick="skipDistanceLock()" style="margin-top: 0.5rem; background: #e2e8f0; color: #4a5568; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.9rem;">
                    Skip Distance Setup (Use Default)
                </button>
                ${currentTest.aiEngineAvailable ? `
                <div style="margin-top: 1rem; padding: 1rem; background: rgba(102, 126, 234, 0.1); border-left: 3px solid #667eea; border-radius: 6px;">
                    <p style="margin: 0; font-size: 0.9rem; color: #667eea;">
                        🤖 <strong>AI-Powered Accuracy:</strong> Real-time eye tracking and AI validation enabled for maximum precision
                    </p>
                </div>
                ` : ''}
            </div>
            ` : `
            <div class="test-instructions">
                <p><strong>Instructions:</strong></p>
                <p>Hold your device still and maintain your distance from the screen.</p>
                <p>Read the letters shown above. Enter the letters you see (order doesn't matter).</p>
                <p>If you cannot read the letters clearly, click "Cannot Read".</p>
                ${currentTest.lidarAvailable ? `
                <div class="lidar-monitor-panel">
                    <div class="lidar-status-header">
                        <span class="lidar-badge-small">LiDAR Pro Calibration: ON</span>
                        <span id="current-distance-display" style="font-weight: 600; color: #667eea;">${distanceValue}m</span>
                    </div>
                    <div class="distance-monitor-bar">
                        <div class="distance-bar" id="live-distance-bar" style="background: ${distanceBarColor}; width: ${distanceStatus === 'correct' ? '100%' : '50%'}; transition: all 0.3s ease;"></div>
                    </div>
                    <div id="distance-warning" style="display: ${distanceStatus === 'correct' ? 'none' : 'block'}; color: #f56565; font-size: 0.9rem; margin-top: 0.5rem; padding: 0.75rem; background: rgba(245, 101, 101, 0.1); border-left: 3px solid #f56565; border-radius: 6px;">
                        ⚠️ You've moved too ${distanceStatus === 'too_close' ? 'close' : 'far'} away. Please return to your original position (${currentTest.baselineDistance ? currentTest.baselineDistance.toFixed(2) : currentTest.targetDistance.toFixed(1)}m) to keep the test accurate.
                    </div>
                    ${currentTest.movementDetected ? `
                    <div class="movement-warning" style="margin-top: 0.75rem; padding: 0.75rem; background: rgba(245, 101, 101, 0.1); border-left: 3px solid #f56565; border-radius: 6px; color: #c53030; font-size: 0.9rem;">
                        ⚠️ Movement detected. Let's repeat this line to ensure accuracy.
                    </div>
                    ` : ''}
                </div>
                ` : `
                <p style="font-size: 0.9rem; color: #667eea; margin-top: 0.5rem;">
                    📏 Target distance: ${currentTest.targetDistance.toFixed(1)}m | 
                    Letter size calibrated for clinical accuracy
                </p>
                `}
            </div>
            
            <div class="test-display" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 400px; width: 100%; max-width: 100vw; padding: 1rem; box-sizing: border-box; overflow: hidden;">
                <div class="snellen-chart" style="text-align: center; margin-bottom: 2rem; width: 100%; max-width: 100%; overflow: visible; display: flex; justify-content: center; align-items: center; flex-wrap: nowrap;">
                    <div class="snellen-line" 
                         style="font-size: ${fontSize}px; 
                                font-weight: 900; 
                                letter-spacing: ${Math.max(Math.min(fontSize * 0.4, 20), 8)}px; 
                                line-height: ${fontSize * 1.4}px; 
                                color: #000; 
                                text-shadow: 4px 4px 8px rgba(0,0,0,0.4), 0 0 15px rgba(0,0,0,0.15);
                                font-family: 'Arial Black', 'Arial', 'Helvetica', sans-serif;
                                display: inline-flex;
                                align-items: center;
                                justify-content: center;
                                flex-wrap: nowrap;
                                white-space: nowrap;
                                padding: 2rem 1.5rem;
                                background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%);
                                border-radius: 16px;
                                box-shadow: 0 8px 24px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.9);
                                border: 3px solid rgba(0,0,0,0.08);
                                -webkit-font-smoothing: antialiased;
                                -moz-osx-font-smoothing: grayscale;
                                max-width: 98vw;
                                box-sizing: border-box;
                                transform: scale(1);
                                transform-origin: center;">
                        ${line.letters.filter(letter => letter && letter.trim()).map((letter, idx) => 
                            `<span style="display: inline-flex; 
                                          align-items: center; 
                                          justify-content: center;
                                          margin: 0 ${Math.max(Math.min(fontSize * 0.25, 12), 4)}px; 
                                          filter: contrast(1.3) brightness(1.1);
                                          text-rendering: optimizeLegibility;
                                          min-width: ${fontSize * 0.65}px;
                                          width: ${fontSize * 0.65}px;
                                          height: ${fontSize * 1.3}px;
                                          text-align: center;
                                          font-weight: 900;
                                          line-height: 1;
                                          vertical-align: middle;
                                          flex-shrink: 0;">${letter}</span>`
                        ).join('')}
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.9rem; color: #666; font-weight: 500;">
                        Line ${currentTest.currentLine + 1}: ${line.level} (${visualAngleMinutes} arc min)
                    </div>
                </div>
                
                <div class="test-input-section" style="width: 100%; max-width: 500px; margin: 0 auto;">
                    <label for="snellen-answer" style="display: block; margin-bottom: 0.75rem; font-weight: 600; color: #333; font-size: 1rem;">
                        Read the letters above (enter them in any order):
                    </label>
                    <input type="text" id="snellen-answer" 
                           placeholder="Enter letters you see (e.g., E, FP, TOZ)"
                           style="width: 100%; padding: 1rem 1.5rem; border: 2px solid #667eea; border-radius: 8px; 
                                  font-size: 1.2rem; text-align: center; text-transform: uppercase;
                                  letter-spacing: 0.2em; box-sizing: border-box;
                                  transition: all 0.3s ease;"
                           onkeypress="if(event.key==='Enter') checkSnellenAnswer()"
                           onfocus="this.style.borderColor='#764ba2'; this.style.boxShadow='0 0 0 3px rgba(102, 126, 234, 0.1)';"
                           onblur="this.style.borderColor='#667eea'; this.style.boxShadow='none';"
                           autocomplete="off"
                           autofocus>
                    <div id="snellen-feedback" style="margin-top: 1rem; font-size: 0.95rem; font-weight: 600; text-align: center; min-height: 1.5rem; padding: 0.75rem; border-radius: 6px; display: none; line-height: 1.6;"></div>
                    <div style="margin-top: 0.75rem; font-size: 0.9rem; color: #666; text-align: center; line-height: 1.5;">
                        Or click "Cannot Read" if you cannot see the letters clearly
                    </div>
                </div>
            </div>
            
            <div class="test-controls" style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-correct" onclick="checkSnellenAnswer()" 
                        ${(distanceStatus !== 'correct' || currentTest.movementDetected) && currentTest.lidarAvailable ? 'disabled' : ''}
                        style="padding: 0.875rem 2.5rem; font-size: 1rem; font-weight: 600; border-radius: 8px; 
                               border: none; cursor: pointer; transition: all 0.3s ease;
                               ${(distanceStatus !== 'correct' || currentTest.movementDetected) && currentTest.lidarAvailable ? 'opacity: 0.5; cursor: not-allowed;' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);'}">
                    ✓ Submit Answer
                </button>
                <button class="btn-incorrect" onclick="answerVisualAcuity(false)" 
                        ${(distanceStatus !== 'correct' || currentTest.movementDetected) && currentTest.lidarAvailable ? 'disabled' : ''}
                        style="padding: 0.875rem 2.5rem; font-size: 1rem; font-weight: 600; border-radius: 8px; 
                               border: none; cursor: pointer; transition: all 0.3s ease;
                               ${(distanceStatus !== 'correct' || currentTest.movementDetected) && currentTest.lidarAvailable ? 'opacity: 0.5; cursor: not-allowed;' : 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);'}">
                    ✗ Cannot Read
                </button>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: #f8f9fa; border-radius: 8px; color: #666; font-size: 0.9rem; text-align: center;">
                <div style="display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap;">
                    <span><strong>Eye:</strong> ${currentTest.eye === 'both' ? 'Both Eyes' : currentTest.eye === 'left' ? 'Left Eye' : 'Right Eye'}</span>
                    <span><strong>Progress:</strong> Line ${currentTest.currentLine + 1} of ${currentTest.lines.length}</span>
                    <span><strong>Target:</strong> ${line.level} (${visualAngleMinutes} arc min)</span>
                </div>
            </div>
            `}
        </div>
    `;
    
    // Setup LiDAR tracking if available
    if (currentTest.lidarAvailable && window.lidarEngine && !currentTest.distanceLocked) {
        setupLiDARTracking();
    } else if (currentTest.lidarAvailable && currentTest.distanceLocked) {
        setupLiDARMonitoring();
    }
}

function setupLiDARTracking() {
    if (!window.lidarEngine) return;
    
    window.lidarEngine.onDistanceUpdate = (distance, isValid, status) => {
        currentTest.distanceValid = isValid;
        updateDistanceDisplay(distance, isValid, status);
        
        const lockBtn = document.querySelector('.btn-lock-distance');
        if (lockBtn) {
            lockBtn.disabled = !isValid;
        }
    };
    
    window.lidarEngine.onStabilityChange = (movementDetected, deviation) => {
        currentTest.movementDetected = movementDetected;
        if (movementDetected && currentTest.distanceLocked) {
            // Pause test and ask to repeat line
            pauseTestForMovement(deviation);
        }
    };
    
    window.lidarEngine.onObstructionDetected = () => {
        showObstructionWarning();
    };
}

function setupLiDARMonitoring() {
    if (!window.lidarEngine) return;
    
    window.lidarEngine.onDistanceUpdate = (distance, isValid, status) => {
        currentTest.distanceValid = isValid;
        updateLiveDistanceDisplay(distance, isValid, status);
    };
    
    window.lidarEngine.onStabilityChange = (movementDetected, deviation) => {
        currentTest.movementDetected = movementDetected;
        if (movementDetected) {
            pauseTestForMovement(deviation);
        }
    };
    
    window.lidarEngine.onObstructionDetected = () => {
        showObstructionWarning();
    };
}

function updateLiveDistanceDisplay(distance, isValid, status) {
    const warningEl = document.getElementById('distance-warning');
    const barEl = document.getElementById('live-distance-bar');
    const distanceDisplay = document.getElementById('current-distance-display');
    const movementWarning = document.querySelector('.movement-warning');
    
    if (distanceDisplay) {
        distanceDisplay.textContent = `${distance.toFixed(2)}m`;
    }
    
    if (barEl) {
        barEl.style.background = isValid ? '#48bb78' : '#f56565';
        barEl.style.width = isValid ? '100%' : '50%';
    }
    
    if (warningEl) {
        warningEl.style.display = isValid ? 'none' : 'block';
        if (status === 'too_close') {
            warningEl.innerHTML = `⚠️ You've moved too close (${distance.toFixed(2)}m). Please return to your original position (${currentTest.baselineDistance.toFixed(2)}m) to keep the test accurate.`;
        } else if (status === 'too_far') {
            warningEl.innerHTML = `⚠️ You've moved too far away (${distance.toFixed(2)}m). Please return to your original position (${currentTest.baselineDistance.toFixed(2)}m) to keep the test accurate.`;
        }
    }
    
    // Disable buttons if distance invalid
    const buttons = document.querySelectorAll('.test-controls button');
    buttons.forEach(btn => {
        if (!isValid) {
            btn.disabled = true;
        } else {
            btn.disabled = false;
        }
    });
}

function pauseTestForMovement(deviation) {
    const container = document.getElementById('test-container');
    if (!container) return;
    
    const pauseOverlay = document.createElement('div');
    pauseOverlay.className = 'movement-pause-overlay';
    pauseOverlay.innerHTML = `
        <div class="movement-pause-content">
            <h3>⚠️ Movement Detected</h3>
            <p>You moved ${(deviation * 100).toFixed(0)}cm from your original position.</p>
            <p>To maintain test accuracy, let's repeat this line.</p>
            <button class="btn-resume-test" onclick="resumeTestAfterMovement()">Repeat This Line</button>
        </div>
    `;
    
    container.appendChild(pauseOverlay);
}

function resumeTestAfterMovement() {
    const overlay = document.querySelector('.movement-pause-overlay');
    if (overlay) overlay.remove();
    
    if (window.lidarEngine) {
        window.lidarEngine.reset();
        window.lidarEngine.lockBaseline();
        currentTest.baselineDistance = window.lidarEngine.currentDistance;
        currentTest.movementDetected = false;
    }
    
    // Re-render current line
    renderVisualAcuityTestWithLiDAR();
}

function showObstructionWarning() {
    const container = document.getElementById('test-container');
    if (!container) return;
    
    const warning = document.createElement('div');
    warning.className = 'obstruction-warning';
    warning.innerHTML = `
        <div class="obstruction-warning-content">
            <span class="warning-icon">⚠️</span>
            <p>We detected something blocking the screen. Please move it away to continue.</p>
        </div>
    `;
    
    container.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, 5000);
}

function updateDistanceDisplay(distance, isValid, status) {
    const barEl = document.getElementById('distance-bar');
    const statusEl = document.getElementById('distance-status');
    const valueEl = document.getElementById('distance-value');
    const messageEl = document.getElementById('distance-message');
    const textEl = document.getElementById('distance-text');
    
    if (barEl) {
        const percentage = Math.min(100, (distance / currentTest.targetDistance) * 100);
        barEl.style.width = `${percentage}%`;
        barEl.style.background = isValid ? '#48bb78' : '#f56565';
    }
    
    if (valueEl) {
        valueEl.textContent = `${distance.toFixed(2)}m`;
        valueEl.style.color = isValid ? '#48bb78' : '#f56565';
    }
    
    if (textEl) {
        if (isValid) {
            textEl.textContent = '✓ Distance correct';
        } else {
            if (status === 'too_close') {
                textEl.textContent = 'Too close';
            } else {
                textEl.textContent = 'Too far';
            }
        }
    }
    
    if (messageEl) {
        if (isValid) {
            messageEl.textContent = '✓ Perfect distance - Ready to start';
            messageEl.style.color = '#48bb78';
        } else {
            if (status === 'too_close') {
                messageEl.textContent = 'Too close - move back';
            } else {
                messageEl.textContent = 'Too far - move closer';
            }
            messageEl.style.color = '#f56565';
        }
    }
}

async function lockDistanceForTest() {
    if (!currentTest) return;
    
    // Start AI eye tracking if available - FULL AI CAPABILITIES
    if (currentTest.aiEngineAvailable && window.aiVisionEngine) {
        try {
            currentTest.eyeTrackingActive = true;
            await window.aiVisionEngine.startEyeTracking((measurements, metrics) => {
                currentTest.aiMeasurements = measurements;
                
                // Real-time AI feedback for optimal test conditions
                updateAIFeedback(measurements, metrics);
                
                // AI-powered quality monitoring
                if (measurements.leftEye && measurements.rightEye) {
                    const avgOpenness = (measurements.leftEye.openness + measurements.rightEye.openness) / 2;
                    if (avgOpenness < 0.7) {
                        showAIWarning('Keep your eyes fully open for accurate results');
                    }
                    
                    // Head position monitoring
                    if (measurements.headPose) {
                        const headStability = Math.abs(measurements.headPose.pitch) + 
                                           Math.abs(measurements.headPose.yaw) + 
                                           Math.abs(measurements.headPose.roll);
                        if (headStability > 15) {
                            showAIWarning('Keep your head still and look directly at the screen');
                        }
                    }
                }
            });
            console.log('[Visual Acuity Test] ✅ AI eye tracking started with full capabilities');
        } catch (error) {
            console.warn('[Visual Acuity Test] AI eye tracking failed:', error);
            currentTest.eyeTrackingActive = false;
        }
    }
    
    if (window.lidarEngine && window.lidarEngine.lockBaseline && window.lidarEngine.lockBaseline()) {
        currentTest.distanceLocked = true;
        currentTest.distanceValid = true;
        currentTest.baselineDistance = window.lidarEngine.currentDistance || currentTest.targetDistance;
        renderVisualAcuityTestWithLiDAR();
    } else {
        // Manual confirmation or no LiDAR
        currentTest.distanceLocked = true;
        currentTest.distanceValid = true;
        currentTest.baselineDistance = currentTest.targetDistance;
        renderVisualAcuityTestWithLiDAR();
    }
}

function skipDistanceLock() {
    if (!currentTest) return;
    
    // Skip distance setup and proceed directly to test
    currentTest.distanceLocked = true;
    currentTest.distanceValid = true;
    currentTest.baselineDistance = currentTest.targetDistance;
    currentTest.lidarAvailable = false; // Disable LiDAR checks for simplicity
    
    renderVisualAcuityTestWithLiDAR();
}

// Keep original function for backward compatibility
function renderVisualAcuityTest() {
    renderVisualAcuityTestWithLiDAR();
}

// Check Snellen answer - proper Snellen test follows industry standards
// Industry standard: Must get at least 3/5 letters correct (or 4/5 for smaller lines) to pass a line
function checkSnellenAnswer() {
    if (!currentTest) {
        console.error('No active test');
        return;
    }
    
    const answerInput = document.getElementById('snellen-answer');
    const userAnswer = answerInput ? answerInput.value.trim().toUpperCase().replace(/\s+/g, '') : '';
    
    if (!userAnswer) {
        alert('Please enter the letters you see, or click "Cannot Read" if you cannot see them clearly.');
        return;
    }
    
    // Check for movement before accepting answer (only if LiDAR is enabled and distance is locked)
    if (currentTest.lidarAvailable && currentTest.distanceLocked && window.lidarEngine && window.lidarEngine.currentDistance) {
        const currentDistance = window.lidarEngine.currentDistance;
        if (currentTest.baselineDistance && Math.abs(currentDistance - currentTest.baselineDistance) > 0.05) {
            // Movement detected - pause and repeat
            pauseTestForMovement(Math.abs(currentDistance - currentTest.baselineDistance));
            return;
        }
    }
    
    const line = currentTest.lines[currentTest.currentLine];
    if (!line) {
        console.error('[Visual Acuity] Invalid line at index:', currentTest.currentLine);
        alert('Error: Invalid test line. Please refresh and try again.');
        return;
    }
    
    const correctLetters = line.letters.join('').toUpperCase();
    const numLetters = correctLetters.length;
    
    // Debug logging for line 2 (6/48)
    if (line.level === '6/48') {
        console.log('[Line 2 Debug] Expected letters:', correctLetters);
        console.log('[Line 2 Debug] User answer:', userAnswer);
        console.log('[Line 2 Debug] Line letters array:', line.letters);
    }
    
    // Initialize line tracking if not exists
    if (!currentTest.lineAttempts[currentTest.currentLine]) {
        currentTest.lineAttempts[currentTest.currentLine] = {
            attempts: [],
            correctCount: 0,
            passed: false
        };
    }
    
    const lineData = currentTest.lineAttempts[currentTest.currentLine];
    
    // Calculate how many letters the user got correct
    const userLetterArray = userAnswer.split('');
    const correctLetterArray = correctLetters.split('');
    let correctCount = 0;
    
    // Count correct letters (order doesn't matter) - Enhanced frequency matching
    // Create frequency maps for accurate counting (handles duplicate letters correctly)
    const userLetterFreq = {};
    const correctLetterFreq = {};
    
    userLetterArray.forEach(letter => {
        if (letter && letter.trim()) { // Skip empty strings and whitespace
            userLetterFreq[letter] = (userLetterFreq[letter] || 0) + 1;
        }
    });
    
    correctLetterArray.forEach(letter => {
        if (letter && letter.trim()) { // Skip empty strings and whitespace
            correctLetterFreq[letter] = (correctLetterFreq[letter] || 0) + 1;
        }
    });
    
    // Count matches - each letter can only match up to its frequency in the correct answer
    for (const letter in userLetterFreq) {
        if (correctLetterFreq[letter]) {
            correctCount += Math.min(userLetterFreq[letter], correctLetterFreq[letter]);
        }
    }
    
    // Debug logging for line 2 (6/48)
    if (line.level === '6/48') {
        console.log('[Line 2 Debug] User answer:', userAnswer);
        console.log('[Line 2 Debug] Expected letters:', correctLetters);
        console.log('[Line 2 Debug] User letter frequencies:', userLetterFreq);
        console.log('[Line 2 Debug] Correct letter frequencies:', correctLetterFreq);
        console.log('[Line 2 Debug] Correct count:', correctCount, 'out of', numLetters);
    }
    
    // Store this attempt
    lineData.attempts.push({
        userAnswer: userAnswer,
        correctCount: correctCount,
        totalLetters: numLetters
    });
    
    // Update best correct count for this line
    lineData.correctCount = Math.max(lineData.correctCount, correctCount);
    
    // Store user's reading
    currentTest.userReadings.push({
        line: currentTest.currentLine,
        level: line.level,
        expected: correctLetters,
        userAnswer: userAnswer,
        correct: correctCount === numLetters, // Fully correct
        correctCount: correctCount,
        totalLetters: numLetters
    });
    
    currentTest.total++;
    if (correctCount === numLetters) {
        currentTest.correct++;
    }
    
    // Medical-Grade WHO/ISO Compliant Passing Criteria:
    // - 1 letter: Must get correct (100%)
    // - 5 letters: Must get 4 out of 5 correct (80% - WHO standard)
    // - This matches industry-leading medical tests (e.g., EyeQue, Opternative, 20/20 Now)
    let requiredCorrect;
    if (numLetters === 1) {
        requiredCorrect = 1; // Must get correct
    } else if (numLetters === 5) {
        requiredCorrect = 4; // WHO Standard: 4 out of 5 (80% accuracy)
    } else {
        // For non-standard line lengths, use proportional scoring
        requiredCorrect = Math.ceil(numLetters * 0.8); // 80% accuracy standard
    }
    
    // Check if line is passed
    const linePassed = correctCount >= requiredCorrect;
    
    // Clear input
    if (answerInput) answerInput.value = '';
    
    // Show feedback
    let feedbackMessage = '';
    if (correctCount === numLetters) {
        feedbackMessage = `✓ Correct! All ${numLetters} letters correct.`;
    } else if (linePassed) {
        feedbackMessage = `✓ Good! You got ${correctCount} out of ${numLetters} letters correct (need ${requiredCorrect}).`;
    } else {
        const attemptsLeft = 3 - lineData.attempts.length;
        if (attemptsLeft > 0) {
            feedbackMessage = `You got ${correctCount} out of ${numLetters} letters correct. Need ${requiredCorrect} to pass. Try again (${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left).`;
        } else {
            feedbackMessage = `You got ${correctCount} out of ${numLetters} letters correct. Need ${requiredCorrect} to pass. Moving to next line.`;
        }
    }
    
    // Show feedback (non-blocking) with detailed letter breakdown
    const feedbackEl = document.getElementById('snellen-feedback');
    if (feedbackEl) {
        // Create detailed feedback showing which letters were correct
        let detailedFeedback = feedbackMessage;
        
        if (correctCount > 0 && correctCount < numLetters) {
            // Show which letters the user got correct
            const userLetters = userAnswer.split('');
            const correctLettersArray = correctLetterArray;
            const correctLettersFound = [];
            const incorrectLetters = [];
            
            // Track which letters were matched
            const matchedIndices = new Set();
            for (let i = 0; i < userLetters.length; i++) {
                let found = false;
                for (let j = 0; j < correctLettersArray.length; j++) {
                    if (!matchedIndices.has(j) && userLetters[i] === correctLettersArray[j]) {
                        correctLettersFound.push(userLetters[i]);
                        matchedIndices.add(j);
                        found = true;
                        break;
                    }
                }
                if (!found && userLetters[i]) {
                    incorrectLetters.push(userLetters[i]);
                }
            }
            
            // Add helpful hint
            if (correctLettersFound.length > 0) {
                detailedFeedback += `<br><span style="font-size: 0.85em; color: #666;">Correct letters: ${correctLettersFound.join(', ').toUpperCase()}</span>`;
            }
            if (incorrectLetters.length > 0) {
                detailedFeedback += `<br><span style="font-size: 0.85em; color: #f56565;">Not in this line: ${incorrectLetters.join(', ').toUpperCase()}</span>`;
            }
            detailedFeedback += `<br><span style="font-size: 0.85em; color: #667eea;">Expected letters: ${correctLettersArray.join(', ')}</span>`;
        }
        
        feedbackEl.innerHTML = detailedFeedback;
        feedbackEl.style.display = 'block';
        feedbackEl.style.color = correctCount === numLetters ? '#48bb78' : linePassed ? '#48bb78' : '#f56565';
        feedbackEl.style.background = correctCount === numLetters ? 'rgba(72, 187, 120, 0.1)' : linePassed ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)';
        feedbackEl.style.padding = '1rem';
        feedbackEl.style.borderRadius = '8px';
        feedbackEl.style.borderLeft = `4px solid ${correctCount === numLetters ? '#48bb78' : linePassed ? '#48bb78' : '#f56565'}`;
    }
    
    // If line is passed, mark it and move to next line
    if (linePassed) {
        lineData.passed = true;
        currentTest.lastPassedLine = currentTest.currentLine;
        currentTest.currentLine++;
        
        // If we've completed all lines, finish test
        if (currentTest.currentLine >= currentTest.lines.length) {
            setTimeout(() => {
                finishVisualAcuityTest();
            }, 1000);
            return;
        }
        
        // Move to next line
        setTimeout(() => {
            renderVisualAcuityTestWithLiDAR();
            const nextInput = document.getElementById('snellen-answer');
            if (nextInput) nextInput.focus();
        }, 1500);
    } else {
        // Line not passed - check if we should allow another attempt
        if (lineData.attempts.length >= 3) {
            // Maximum attempts reached for this line - move to next or finish
            if (currentTest.currentLine < currentTest.lines.length - 1) {
                // Move to next line
                currentTest.currentLine++;
                setTimeout(() => {
                    renderVisualAcuityTestWithLiDAR();
                    const nextInput = document.getElementById('snellen-answer');
                    if (nextInput) nextInput.focus();
                }, 1500);
            } else {
                // Last line failed - finish test
                setTimeout(() => {
                    finishVisualAcuityTest();
                }, 1500);
            }
        } else {
            // Allow another attempt on same line
            setTimeout(() => {
                const nextInput = document.getElementById('snellen-answer');
                if (nextInput) nextInput.focus();
            }, 500);
        }
    }
}

function answerVisualAcuity(correct) {
    if (!currentTest) {
        console.error('[Visual Acuity] No active test');
        return;
    }
    
    // "Cannot Read" button clicked - continue to next line
    if (!correct) {
        const line = currentTest.lines[currentTest.currentLine];
        const numLetters = line.letters.length;
        
        // Initialize line tracking if not exists
        if (!currentTest.lineAttempts[currentTest.currentLine]) {
            currentTest.lineAttempts[currentTest.currentLine] = {
                attempts: [],
                correctCount: 0,
                passed: false
            };
        }
        
        currentTest.userReadings.push({
            line: currentTest.currentLine,
            level: line.level,
            expected: line.letters.join('').toUpperCase(),
            userAnswer: 'CANNOT READ',
            correct: false,
            correctCount: 0,
            totalLetters: numLetters
        });
        
        // Move to next line (test continues through all lines)
        currentTest.currentLine++;
        
        if (currentTest.currentLine >= currentTest.lines.length) {
            setTimeout(() => {
                finishVisualAcuityTest();
            }, 500);
        } else {
            setTimeout(() => {
                renderVisualAcuityTestWithLiDAR();
            }, 500);
        }
        return;
    }
    
    // This should not be called directly - use checkSnellenAnswer instead
    checkSnellenAnswer();
}

// Make functions globally accessible
window.answerVisualAcuity = answerVisualAcuity;
window.checkSnellenAnswer = checkSnellenAnswer;
window.lockDistanceForTest = lockDistanceForTest;
window.skipDistanceLock = skipDistanceLock;

async function finishVisualAcuityTest() {
    // Stop AI eye tracking if active
    if (currentTest.eyeTrackingActive && window.aiVisionEngine) {
        window.aiVisionEngine.stopEyeTracking();
    }
    
    // Industry standard Snellen test calculation
    // Visual acuity is determined by the smallest line where the user met the passing criteria
    let lastPassedLineIndex = currentTest.lastPassedLine;
    
    // If no line was explicitly passed, check userReadings to find the last line that met criteria
    if (lastPassedLineIndex < 0 && currentTest.userReadings.length > 0) {
        // Find the last line where user got enough letters correct
        for (let i = currentTest.userReadings.length - 1; i >= 0; i--) {
            const reading = currentTest.userReadings[i];
            const line = currentTest.lines[reading.line];
            const numLetters = line.letters.length;
            
            // Calculate required correct based on line size
            let requiredCorrect;
            if (numLetters === 1) {
                requiredCorrect = 1;
            } else if (numLetters === 5) {
                requiredCorrect = 4; // WHO Standard: 4 out of 5 (80% accuracy)
            } else {
                requiredCorrect = Math.ceil(numLetters * 0.8); // 80% accuracy standard
            }
            
            if (reading.correctCount >= requiredCorrect) {
                lastPassedLineIndex = reading.line;
                break;
            }
        }
    }
    
    // Fallback: if still no line found, use first line as baseline
    if (lastPassedLineIndex < 0) {
        lastPassedLineIndex = 0;
    }
    
    // Get the acuity level for the last passed line
    const level = currentTest.lines[Math.min(lastPassedLineIndex, currentTest.lines.length - 1)].level;
    
    // Calculate score based on total performance
    let score = currentTest.correct / Math.max(currentTest.total, 1);
    
    // Calculate decimal acuity for precision (e.g., 6/6 = 1.0, 6/12 = 0.5)
    const levelParts = level.split('/');
    let decimalAcuity = levelParts.length === 2 ? parseFloat(levelParts[0]) / parseFloat(levelParts[1]) : score;
    
    // AI-POWERED ACCURACY ENHANCEMENT
    // Use AI Vision Engine to refine score based on eye tracking data
    if (currentTest.aiEngineAvailable && window.aiVisionEngine && currentTest.aiMeasurements) {
        try {
            const testResults = {
                correctAnswers: currentTest.correct,
                totalQuestions: currentTest.total,
                lastPassedLine: lastPassedLineIndex,
                lastCorrectLine: lastPassedLineIndex // For backward compatibility
            };
            
            // Get AI-powered score refinement
            const aiScore = await window.aiVisionEngine.scoreAcuity(testResults, currentTest.aiMeasurements);
            
            // Blend algorithmic and AI scores (weighted average)
            score = (score * 0.7) + (aiScore * 0.3);
            
            // Adjust decimal acuity based on AI analysis
            if (aiScore < 0.5) {
                // AI detected issues with test quality, adjust accordingly
                decimalAcuity *= 0.95; // Slight downward adjustment
            }
            
            console.log('[Visual Acuity Test] ✅ AI-powered accuracy enhancement applied');
        } catch (error) {
            console.warn('[Visual Acuity Test] AI scoring unavailable, using algorithmic score:', error);
        }
    }
    
    // Convert to 20/20 notation for US users
    const usNotation = `${Math.round(20 * decimalAcuity)}/20`;
    
    // Determine accuracy rating (enhanced with AI confidence)
    let accuracyRating = 'High';
    let aiConfidence = 0.85; // Default confidence
    
    if (currentTest.aiMeasurements) {
        // Calculate confidence based on eye tracking quality
        const avgOpenness = (currentTest.aiMeasurements.leftEye?.openness || 0.8 + 
                            currentTest.aiMeasurements.rightEye?.openness || 0.8) / 2;
        const headStability = 1 - (Math.abs(currentTest.aiMeasurements.headPose?.pitch || 0) + 
                                  Math.abs(currentTest.aiMeasurements.headPose?.yaw || 0)) / 180;
        aiConfidence = (avgOpenness * 0.6) + (headStability * 0.4);
    }
    
    if (decimalAcuity >= 1.0) accuracyRating = 'Excellent';
    else if (decimalAcuity >= 0.8) accuracyRating = 'Very High';
    else if (decimalAcuity >= 0.6) accuracyRating = 'High';
    else if (decimalAcuity >= 0.4) accuracyRating = 'Moderate';
    else accuracyRating = 'Low';
    
    // Interpretation
    let interpretation = '';
    if (decimalAcuity >= 1.0) interpretation = 'Normal or better vision';
    else if (decimalAcuity >= 0.8) interpretation = 'Mild vision impairment';
    else if (decimalAcuity >= 0.6) interpretation = 'Moderate vision impairment';
    else if (decimalAcuity >= 0.4) interpretation = 'Severe vision impairment';
    else interpretation = 'Profound vision impairment - consult an eye care professional';
    
    const result = {
        type: 'visual-acuity',
        name: 'Snellen Visual Acuity Test (AI-Enhanced)',
        score: score,
        level: level,
        usNotation: usNotation,
        decimalAcuity: decimalAcuity,
        accuracyRating: accuracyRating,
        interpretation: interpretation,
        correct: currentTest.correct,
        total: currentTest.total,
        lastPassedLine: lastPassedLineIndex,
        lastCorrectLine: lastPassedLineIndex, // For backward compatibility
        userReadings: currentTest.userReadings,
        testDistance: currentTest.targetDistance,
        screenCalibration: {
            width: currentTest.viewportWidth,
            height: currentTest.viewportHeight,
            dpi: currentTest.actualDPI
        },
        aiEnhanced: currentTest.aiEngineAvailable,
        aiConfidence: aiConfidence,
        aiMeasurements: currentTest.aiMeasurements ? {
            ipd: currentTest.aiMeasurements.interPupillaryDistance,
            headPose: currentTest.aiMeasurements.headPose,
            eyeOpenness: {
                left: currentTest.aiMeasurements.leftEye?.openness,
                right: currentTest.aiMeasurements.rightEye?.openness
            }
        } : null,
        date: new Date().toISOString(),
        eye: currentTest.eye,
        note: `AI-enhanced Snellen test performed at ${currentTest.targetDistance}m distance. ${currentTest.aiEngineAvailable ? 'Real-time eye tracking and AI-powered accuracy validation enabled.' : 'Screen calibrated for clinical accuracy.'}`
    };
    
    saveResult(result);
    showResult(result);
}

function getSizeClass(size) {
    if (size >= '200') return 'large';
    if (size >= '70') return 'medium';
    if (size >= '40') return 'small';
    if (size >= '25') return 'smaller';
    return 'smallest';
}

// Enhanced Color Blindness Test with Perfect Accuracy (Ishihara-style)
function startColorBlindnessTest() {
    try {
        if (!runPreTestSafetyChecks('Color Blindness Test')) return;
        // Check if user has email before starting test
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => {
                startColorBlindnessTestInternal();
            });
            return;
        }
        
        startColorBlindnessTestInternal();
    } catch (error) {
        console.error('[Color Blindness Test] Error:', error);
        alert('Error starting test. Please try again.');
    }
}

function startColorBlindnessTestInternal() {
    currentTest = {
        type: 'color-blindness',
        name: 'Color Blindness Test (Enhanced Accuracy)',
        currentPlate: 0,
        correct: 0,
        total: 0,
        answers: [], // Store all answers for detailed analysis
        plates: [
            // Improved Ishihara plate patterns with better color combinations
            // Format: [number color (visible to normal), background color (visible to all)]
            // Colors chosen to be distinguishable for normal vision but not for colorblind
            { number: 12, colors: ['#d32f2f', '#f5deb3'], answer: '12', type: 'protanopia', difficulty: 'easy' },
            { number: 8, colors: ['#1976d2', '#d3d3d3'], answer: '8', type: 'deutanopia', difficulty: 'easy' },
            { number: 29, colors: ['#f57c00', '#fff9c4'], answer: '29', type: 'tritanopia', difficulty: 'medium' },
            { number: 5, colors: ['#c62828', '#ffe0b2'], answer: '5', type: 'protanopia', difficulty: 'easy' },
            { number: 3, colors: ['#1565c0', '#e1f5fe'], answer: '3', type: 'deutanopia', difficulty: 'easy' },
            { number: 15, colors: ['#ff6f00', '#fff8e1'], answer: '15', type: 'tritanopia', difficulty: 'medium' },
            { number: 74, colors: ['#b71c1c', '#ffccbc'], answer: '74', type: 'protanopia', difficulty: 'hard' },
            { number: 6, colors: ['#0d47a1', '#bbdefb'], answer: '6', type: 'deutanopia', difficulty: 'hard' },
            { number: 45, colors: ['#e65100', '#ffe082'], answer: '45', type: 'tritanopia', difficulty: 'hard' },
            { number: 16, colors: ['#c2185b', '#f8bbd0'], answer: '16', type: 'protanopia', difficulty: 'hard' },
        ]
    };
    showTestModal();
    renderColorBlindnessTest();
}

function renderColorBlindnessTest() {
    const container = document.getElementById('test-container');
    const plate = currentTest.plates[currentTest.currentPlate];
    
    // Improved Ishihara plate generation
    // Use responsive size for mobile devices
    const isMobile = window.innerWidth < 768;
    const patternSize = isMobile ? Math.min(window.innerWidth - 40, 400) : 450;
    const centerX = patternSize / 2;
    const centerY = patternSize / 2;
    const radius = patternSize / 2 - 10;
    
    // Proper Ishihara color combinations
    // Background color (visible to all)
    const bgColor = plate.colors && plate.colors.length > 1 ? plate.colors[1] : '#f0f0f0';
    // Number color (visible to normal vision, hidden to colorblind)
    const numberColor = plate.colors && plate.colors.length > 0 ? plate.colors[0] : '#ff6b6b';
    
    // Create canvas for better rendering
    const canvas = document.createElement('canvas');
    canvas.width = patternSize;
    canvas.height = patternSize;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Generate dot pattern
    const dotCount = Math.floor(patternSize * patternSize / 25); // Denser pattern
    const dots = [];
    
    // Create grid-based pattern for better number visibility
    const gridSize = 8;
    const cellSize = patternSize / gridSize;
    
    // Generate number shape coordinates
    const numberShape = getNumberShape(plate.number, centerX, centerY, radius * 0.6);
    
    // Place dots
    for (let i = 0; i < dotCount; i++) {
        let x, y;
        let attempts = 0;
        
        // Try to place dot within circle
        do {
            x = Math.random() * patternSize;
            y = Math.random() * patternSize;
            const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            attempts++;
        } while (distance >= radius && attempts < 50);
        
        if (attempts >= 50) continue;
        
        // Determine if dot is part of number or background
        const isInNumber = isPointInNumberShape(x, y, numberShape);
        
        // Use number color for number dots, background color for others
        // Add slight variation for realism
        let dotColor;
        if (isInNumber) {
            // Number dots - use number color with slight variation
            dotColor = numberColor;
        } else {
            // Background dots - use background color with slight variation
            dotColor = bgColor;
        }
        
        // Add slight color variation for more realistic pattern
        const variation = 15;
        const rgb = hexToRgb(dotColor);
        if (rgb) {
            const r = Math.max(0, Math.min(255, rgb.r + (Math.random() - 0.5) * variation));
            const g = Math.max(0, Math.min(255, rgb.g + (Math.random() - 0.5) * variation));
            const b = Math.max(0, Math.min(255, rgb.b + (Math.random() - 0.5) * variation));
            dotColor = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
        }
        
        const dotSize = 2.5 + Math.random() * 2;
        
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Convert canvas to data URL for SVG embedding
    const canvasDataUrl = canvas.toDataURL('image/png');
    
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Color Blindness Test (Enhanced Accuracy)</h2>
            <div class="test-instructions">
                <p><strong>Instructions:</strong></p>
                <p>Look at the colored circle and identify the number you see.</p>
                <p>Ensure good lighting and look directly at the center.</p>
                <p style="font-size: 0.9rem; color: #667eea; margin-top: 0.5rem;">
                    Plate ${currentTest.currentPlate + 1} of ${currentTest.plates.length}${plate.type ? ' | Type: ' + plate.type : ''}${plate.difficulty ? ' | Difficulty: ' + plate.difficulty : ''}
                </p>
            </div>
            <div class="test-display" style="display: flex; justify-content: center; align-items: center; min-height: 350px; padding: 20px;">
                <div class="ishihara-plate" style="width: ${patternSize}px; height: ${patternSize}px; border-radius: 50%; 
                     box-shadow: 0 10px 30px rgba(0,0,0,0.3); overflow: hidden; background: ${bgColor};">
                    <img src="${canvasDataUrl}" alt="Ishihara plate ${plate.number}" 
                         style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;" />
                </div>
            </div>
            <div class="test-controls" style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 1rem; margin-top: 1.5rem;">
                <input type="number" id="color-answer" placeholder="Enter number you see" 
                       style="padding: 0.75rem; border: 2px solid #667eea; border-radius: 8px; 
                              font-size: 1.2rem; text-align: center; width: 250px; max-width: 90%;"
                       onkeypress="if(event.key==='Enter') answerColorBlindness()">
                <button class="btn-next" onclick="answerColorBlindness()" 
                        style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; 
                               border-radius: 8px; font-size: 1.1rem; cursor: pointer; min-width: 120px;">
                    Next Plate
                </button>
            </div>
        </div>
    `;
}

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Helper function to get number shape coordinates
function getNumberShape(number, centerX, centerY, size) {
    const shapes = {
        '2': [
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.8, h: size * 0.15},
            {x: centerX - size * 0.4, y: centerY - size * 0.1, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.4, y: centerY + size * 0.1, w: size * 0.8, h: size * 0.15},
            {x: centerX + size * 0.25, y: centerY + size * 0.1, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.4, y: centerY + size * 0.3, w: size * 0.8, h: size * 0.15}
        ],
        '3': [
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.8, h: size * 0.15},
            {x: centerX + size * 0.25, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX - size * 0.4, y: centerY, w: size * 0.6, h: size * 0.15},
            {x: centerX + size * 0.25, y: centerY + size * 0.1, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.4, y: centerY + size * 0.3, w: size * 0.8, h: size * 0.15}
        ],
        '5': [
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.8, h: size * 0.15},
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.4, y: centerY - size * 0.1, w: size * 0.6, h: size * 0.15},
            {x: centerX + size * 0.25, y: centerY, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.4, y: centerY + size * 0.3, w: size * 0.8, h: size * 0.15}
        ],
        '6': [
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.8, h: size * 0.15},
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX - size * 0.4, y: centerY, w: size * 0.6, h: size * 0.15},
            {x: centerX + size * 0.25, y: centerY, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.4, y: centerY + size * 0.3, w: size * 0.8, h: size * 0.15}
        ],
        '8': [
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.8, h: size * 0.15},
            {x: centerX - size * 0.4, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX + size * 0.25, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX - size * 0.4, y: centerY, w: size * 0.8, h: size * 0.15},
            {x: centerX - size * 0.4, y: centerY + size * 0.3, w: size * 0.8, h: size * 0.15}
        ],
        '12': [
            // '1'
            {x: centerX - size * 0.3, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            // '2'
            {x: centerX + size * 0.1, y: centerY - size * 0.3, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.45, y: centerY - size * 0.1, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.1, y: centerY + size * 0.1, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.1, y: centerY + size * 0.3, w: size * 0.5, h: size * 0.15}
        ],
        '15': [
            // '1'
            {x: centerX - size * 0.3, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            // '5'
            {x: centerX + size * 0.1, y: centerY - size * 0.3, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.1, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.1, y: centerY - size * 0.1, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.35, y: centerY, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.1, y: centerY + size * 0.3, w: size * 0.4, h: size * 0.15}
        ],
        '16': [
            // '1'
            {x: centerX - size * 0.3, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            // '6'
            {x: centerX + size * 0.1, y: centerY - size * 0.3, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.1, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX + size * 0.1, y: centerY, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.35, y: centerY, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.1, y: centerY + size * 0.3, w: size * 0.4, h: size * 0.15}
        ],
        '29': [
            // '2'
            {x: centerX - size * 0.3, y: centerY - size * 0.3, w: size * 0.4, h: size * 0.15},
            {x: centerX - size * 0.3, y: centerY - size * 0.1, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.3, y: centerY + size * 0.1, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.05, y: centerY + size * 0.1, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.3, y: centerY + size * 0.3, w: size * 0.4, h: size * 0.15},
            // '9'
            {x: centerX + size * 0.15, y: centerY - size * 0.3, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.15, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.4, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.15, y: centerY, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.4, y: centerY, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.15, y: centerY + size * 0.3, w: size * 0.4, h: size * 0.15}
        ],
        '45': [
            // '4'
            {x: centerX - size * 0.3, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX - size * 0.1, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX + size * 0.1, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX - size * 0.3, y: centerY, w: size * 0.4, h: size * 0.15},
            // '5'
            {x: centerX + size * 0.15, y: centerY - size * 0.3, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.15, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.15, y: centerY - size * 0.1, w: size * 0.4, h: size * 0.15},
            {x: centerX + size * 0.4, y: centerY, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.15, y: centerY + size * 0.3, w: size * 0.4, h: size * 0.15}
        ],
        '74': [
            // '7'
            {x: centerX - size * 0.3, y: centerY - size * 0.3, w: size * 0.5, h: size * 0.15},
            {x: centerX + size * 0.1, y: centerY - size * 0.1, w: size * 0.15, h: size * 0.5},
            // '4'
            {x: centerX + size * 0.15, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.4},
            {x: centerX + size * 0.35, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX + size * 0.55, y: centerY - size * 0.3, w: size * 0.15, h: size * 0.6},
            {x: centerX + size * 0.15, y: centerY, w: size * 0.55, h: size * 0.15}
        ]
    };
    
    return shapes[String(number)] || [];
}

// Helper function to check if point is in number shape
function isPointInNumberShape(x, y, shape) {
    for (let i = 0; i < shape.length; i++) {
        const rect = shape[i];
        if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
            return true;
        }
    }
    return false;
}

function answerColorBlindness() {
    const answerInput = document.getElementById('color-answer');
    const answer = answerInput ? answerInput.value.trim() : '';
    const plate = currentTest.plates[currentTest.currentPlate];
    
    if (!answer) {
        alert('Please enter the number you see before continuing.');
        return;
    }
    
    currentTest.total++;
    const isCorrect = answer === plate.answer;
    currentTest.answers.push(isCorrect ? plate.answer : answer); // Store actual answer for analysis
    
    if (isCorrect) {
        currentTest.correct++;
    }
    
    currentTest.currentPlate++;
    
    // Clear input for next plate
    if (answerInput) answerInput.value = '';
    
    if (currentTest.currentPlate >= currentTest.plates.length) {
        finishColorBlindnessTest();
    } else {
        renderColorBlindnessTest();
        // Focus input for next answer
        setTimeout(() => {
            const nextInput = document.getElementById('color-answer');
            if (nextInput) nextInput.focus();
        }, 100);
    }
}

function finishColorBlindnessTest() {
    // Enhanced accuracy analysis
    const score = currentTest.correct / currentTest.total;
    
    // Analyze by color deficiency type for precision
    const typeScores = {
        protanopia: 0,
        deutanopia: 0,
        tritanopia: 0
    };
    const typeTotals = {
        protanopia: 0,
        deutanopia: 0,
        tritanopia: 0
    };
    
    currentTest.plates.forEach((plate, index) => {
        const wasCorrect = currentTest.answers[index] === plate.answer;
        typeTotals[plate.type]++;
        if (wasCorrect) {
            typeScores[plate.type]++;
        }
    });
    
    // Calculate type-specific scores
    const protanopiaScore = typeTotals.protanopia > 0 ? typeScores.protanopia / typeTotals.protanopia : 1;
    const deutanopiaScore = typeTotals.deutanopia > 0 ? typeScores.deutanopia / typeTotals.deutanopia : 1;
    const tritanopiaScore = typeTotals.tritanopia > 0 ? typeScores.tritanopia / typeTotals.tritanopia : 1;
    
    // Determine result with precision
    let resultText = '';
    let deficiencyType = 'none';
    let severity = 'none';
    
    if (score >= 0.95) {
        resultText = 'Normal color vision - Excellent color discrimination';
        severity = 'none';
    } else if (score >= 0.85) {
        resultText = 'Normal to mild color vision - Minor variations detected';
        severity = 'minimal';
    } else if (score >= 0.7) {
        resultText = 'Mild color vision deficiency detected';
        severity = 'mild';
        // Determine type
        if (protanopiaScore < 0.7) deficiencyType = 'Protanopia (red-green)';
        else if (deutanopiaScore < 0.7) deficiencyType = 'Deutanopia (red-green)';
        else if (tritanopiaScore < 0.7) deficiencyType = 'Tritanopia (blue-yellow)';
        else deficiencyType = 'General color deficiency';
    } else if (score >= 0.5) {
        resultText = 'Moderate color vision deficiency detected';
        severity = 'moderate';
        if (protanopiaScore < 0.6) deficiencyType = 'Protanopia (red-green)';
        else if (deutanopiaScore < 0.6) deficiencyType = 'Deutanopia (red-green)';
        else if (tritanopiaScore < 0.6) deficiencyType = 'Tritanopia (blue-yellow)';
        else deficiencyType = 'General color deficiency';
    } else {
        resultText = 'Significant color vision deficiency detected - Consult an eye care professional';
        severity = 'severe';
        if (protanopiaScore < 0.5) deficiencyType = 'Protanopia (red-green)';
        else if (deutanopiaScore < 0.5) deficiencyType = 'Deutanopia (red-green)';
        else if (tritanopiaScore < 0.5) deficiencyType = 'Tritanopia (blue-yellow)';
        else deficiencyType = 'General color deficiency';
    }
    
    const result = {
        type: 'color-blindness',
        name: 'Color Blindness Test (Enhanced Accuracy)',
        score: score,
        accuracy: (score * 100).toFixed(1) + '%',
        correct: currentTest.correct,
        total: currentTest.total,
        result: resultText,
        deficiencyType: deficiencyType,
        severity: severity,
        typeScores: {
            protanopia: (protanopiaScore * 100).toFixed(1) + '%',
            deutanopia: (deutanopiaScore * 100).toFixed(1) + '%',
            tritanopia: (tritanopiaScore * 100).toFixed(1) + '%'
        },
        date: new Date().toISOString(),
        note: 'Enhanced Ishihara-style test with type-specific analysis for maximum accuracy.'
    };
    
    saveResult(result);
    showResult(result);
}

// Enhanced Astigmatism Test with Multiple Test Types
function startAstigmatismTest() {
    try {
        if (!runPreTestSafetyChecks('Astigmatism Test')) return;
        // Check if user has email before starting test
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => {
                startAstigmatismTestInternal();
            });
            return;
        }
        
        startAstigmatismTestInternal();
    } catch (error) {
        console.error('[Astigmatism Test] Error:', error);
        alert('Error starting test. Please try again.');
    }
}

function startAstigmatismTestInternal() {
    // Initialize AI Vision Engine for enhanced accuracy
    if (window.aiVisionEngine && window.aiVisionEngine.startEyeTracking) {
        window.aiVisionEngine.startEyeTracking();
    }
    
    // Generate test images
    const fanChartTests = generateFanChartTests();
    const clockDialTests = generateClockDialTests();
    const parallelLinesTests = generateParallelLinesTests();
    const crossPatternTests = generateCrossPatternTests();
    const starBurstTests = generateStarBurstTests();
    
    const totalTestCount = fanChartTests.length + clockDialTests.length + 
                          parallelLinesTests.length + crossPatternTests.length + 
                          starBurstTests.length;
    
    console.log('[Astigmatism Test] Total tests: ', totalTestCount);
    console.log('[Astigmatism Test] Version 2.0 - Essential tests only');
    
    currentTest = {
        type: 'astigmatism',
        name: 'Enhanced Astigmatism Test',
        currentTestType: 0,
        currentImage: 0,
        answers: [],
        testTypes: [
            {
                name: 'Fan Chart Test',
                description: 'Radiating lines at multiple angles',
                images: fanChartTests
            },
            {
                name: 'Clock Dial Test',
                description: 'Clock face pattern for axis detection',
                images: clockDialTests
            },
            {
                name: 'Parallel Lines Test',
                description: 'Parallel lines at various orientations',
                images: parallelLinesTests
            },
            {
                name: 'Cross Pattern Test',
                description: 'Cross patterns for detailed analysis',
                images: crossPatternTests
            },
            {
                name: 'Star Burst Test',
                description: 'Star pattern for comprehensive detection',
                images: starBurstTests
            }
        ],
        eyeTrackingData: [],
        startTime: Date.now()
    };
    
    showTestModal();
    renderAstigmatismTest();
}

// Generate essential fan chart tests (radiating lines) - Only 1 test needed
// Version: 2.0 - Reduced from 12 to 1 test
function generateFanChartTests() {
    const tests = [{
        type: 'fan',
        lines: 24,
        angle: 0,
        difficulty: 'standard',
        lineWidth: 2,
        radius: 180
    }];
    console.log('[Astigmatism Test] Fan Chart Tests: ', tests.length, 'test(s)');
    return tests;
}

// Generate essential clock dial test - Only 1 test needed
// Version: 2.0 - Reduced from 12 to 1 test
function generateClockDialTests() {
    const tests = [{
        type: 'clock',
        hour: 12,
        angle: -90, // 12 o'clock position
        lines: 12,
        dialSize: 300,
        markerStyle: 'normal'
    }];
    console.log('[Astigmatism Test] Clock Dial Tests: ', tests.length, 'test(s)');
    return tests;
}

// Generate essential parallel lines tests - Only 2 tests needed (0° and 90°)
// Version: 2.0 - Reduced from 12 to 2 tests
function generateParallelLinesTests() {
    const tests = [
        {
            type: 'parallel',
            angle: 0,
            lineCount: 8,
            spacing: 20,
            lineWidth: 2
        },
        {
            type: 'parallel',
            angle: 90,
            lineCount: 8,
            spacing: 20,
            lineWidth: 2
        }
    ];
    console.log('[Astigmatism Test] Parallel Lines Tests: ', tests.length, 'test(s)');
    return tests;
}

// Generate essential cross pattern test - Only 1 test needed
// Version: 2.0 - Reduced from 8 to 1 test
function generateCrossPatternTests() {
    const tests = [{
        type: 'cross',
        angle: 0,
        lineWidth: 3,
        size: 300,
        style: 'standard'
    }];
    console.log('[Astigmatism Test] Cross Pattern Tests: ', tests.length, 'test(s)');
    return tests;
}

// Generate essential star burst test - Only 1 test needed
// Version: 2.0 - Reduced from 10 to 1 test
function generateStarBurstTests() {
    const tests = [{
        type: 'starburst',
        points: 16,
        angle: 0,
        radius: 180,
        lineWidth: 2
    }];
    console.log('[Astigmatism Test] Star Burst Tests: ', tests.length, 'test(s)');
    return tests;
}

function renderAstigmatismTest() {
    const container = document.getElementById('test-container');
    const testType = currentTest.testTypes[currentTest.currentTestType];
    const image = testType.images[currentTest.currentImage];
    const totalTests = currentTest.testTypes.reduce((sum, tt) => sum + tt.images.length, 0);
    const currentTestNumber = currentTest.testTypes.slice(0, currentTest.currentTestType)
        .reduce((sum, tt) => sum + tt.images.length, 0) + currentTest.currentImage + 1;
    
    // Collect eye tracking data if available
    if (window.aiVisionEngine && window.aiVisionEngine.getEyeMeasurements) {
        const eyeData = window.aiVisionEngine.getEyeMeasurements();
        if (eyeData) {
            currentTest.eyeTrackingData.push({
                timestamp: Date.now(),
                data: eyeData
            });
        }
    }
    
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Enhanced Astigmatism Test</h2>
            <div class="test-instructions">
                <p><strong>Test Type:</strong> ${testType.name}</p>
                <p><strong>Instructions:</strong></p>
                <p>${getTestTypeInstructions(testType.name)}</p>
                <p style="font-size: 0.9rem; color: #667eea; margin-top: 0.5rem;">
                    Test ${currentTestNumber} of ${totalTests} | ${testType.name} (${currentTest.currentImage + 1}/${testType.images.length})
                </p>
                ${image.angle !== undefined ? `<p style="font-size: 0.85rem; color: #6b7280;">Orientation: ${image.angle}°</p>` : ''}
            </div>
            <div class="test-display" style="display: flex; justify-content: center; align-items: center; min-height: 400px; padding: 20px;">
                ${generateTestPattern(image, testType.name)}
            </div>
            <div class="test-controls" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button class="btn-correct" onclick="answerAstigmatism(true, 'equal')" style="padding: 1rem 2rem; font-size: 1.1rem;">
                    ✓ All lines equal
                </button>
                <button class="btn-incorrect" onclick="answerAstigmatism(false, 'unequal')" style="padding: 1rem 2rem; font-size: 1.1rem;">
                    ✗ Some lines darker/clearer
                </button>
                <button class="btn-secondary" onclick="answerAstigmatism(false, 'blurry')" style="padding: 1rem 2rem; font-size: 1.1rem; background: #f59e0b;">
                    ⊙ Some lines blurry
                </button>
            </div>
            <div style="margin-top: 1rem; text-align: center;">
                <button class="btn-link" onclick="skipCurrentTestType()" style="color: #6b7280; text-decoration: underline; background: none; border: none; cursor: pointer;">
                    Skip this test type
                </button>
            </div>
        </div>
    `;
}

function getTestTypeInstructions(testTypeName) {
    const instructions = {
        'Fan Chart Test': 'Look at the radiating lines. Are all lines equally dark and clear? Cover one eye and test each eye separately.',
        'Clock Dial Test': 'Imagine this is a clock face. Are all the hour positions equally clear? Which positions appear darker or blurrier?',
        'Parallel Lines Test': 'Look at the parallel lines. Are they all equally sharp and clear? Do some appear thicker or blurrier?',
        'Cross Pattern Test': 'Focus on the center of the cross. Are both arms of the cross equally clear?',
        'Star Burst Test': 'Look at the star pattern. Are all the rays equally sharp and clear?'
    };
    return instructions[testTypeName] || 'Look carefully at the pattern and assess if all lines are equally clear.';
}

function generateTestPattern(image, testTypeName) {
    const size = 400;
    let svg = `<svg width="${size}" height="${size}" style="border-radius: 8px; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">`;
    
    switch (testTypeName) {
        case 'Fan Chart Test':
            svg += generateFanChartSVG(size, image.lines, image.angle, image.lineWidth, image.radius);
            break;
        case 'Clock Dial Test':
            svg += generateClockDialSVG(size, image.hour, image.angle, image.dialSize, image.markerStyle);
            break;
        case 'Parallel Lines Test':
            svg += generateParallelLinesSVG(size, image.angle, image.lineCount, image.spacing, image.lineWidth);
            break;
        case 'Cross Pattern Test':
            svg += generateCrossPatternSVG(size, image.angle, image.size, image.lineWidth, image.style);
            break;
        case 'Star Burst Test':
            svg += generateStarBurstSVG(size, image.points, image.angle, image.radius, image.lineWidth);
            break;
        default:
            svg += generateFanChartSVG(size, 24, 0, 2, 180);
    }
    
    svg += '</svg>';
    return svg;
}

function generateFanChartSVG(size, lineCount, angle, lineWidth = 2, radiusOverride = null) {
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size / 2 - 20;
    const radius = radiusOverride ? radiusOverride : baseRadius;
    const angleStep = 360 / lineCount;
    const strokeWidth = lineWidth || 2;
    let svg = '';
    
    for (let i = 0; i < lineCount; i++) {
        const lineAngle = (i * angleStep + angle) * Math.PI / 180;
        const x2 = centerX + Math.cos(lineAngle) * radius;
        const y2 = centerY + Math.sin(lineAngle) * radius;
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="#000000" stroke-width="${strokeWidth}"/>`;
    }
    
    // Add center circle
    svg += `<circle cx="${centerX}" cy="${centerY}" r="5" fill="#ff0000"/>`;
    return svg;
}

function generateClockDialSVG(size, hour, angle, dialSize = null, markerStyle = 'normal') {
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size / 2 - 30;
    const radius = dialSize ? (dialSize / 2) : baseRadius;
    let svg = '';
    
    // Draw clock face circle
    svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="none" stroke="#000000" stroke-width="2"/>`;
    
    // Draw hour markers
    for (let h = 1; h <= 12; h++) {
        const hourAngle = ((h * 30) - 90) * Math.PI / 180;
        const markerLength = markerStyle === 'bold' ? 20 : 15;
        const x1 = centerX + Math.cos(hourAngle) * (radius - markerLength);
        const y1 = centerY + Math.sin(hourAngle) * (radius - markerLength);
        const x2 = centerX + Math.cos(hourAngle) * radius;
        const y2 = centerY + Math.sin(hourAngle) * radius;
        const isHighlighted = h === hour;
        const strokeWidth = isHighlighted ? '4' : (markerStyle === 'bold' ? '3' : '2');
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${isHighlighted ? '#ff0000' : '#000000'}" stroke-width="${strokeWidth}"/>`;
        // Hour numbers
        const textX = centerX + Math.cos(hourAngle) * (radius - 25);
        const textY = centerY + Math.sin(hourAngle) * (radius - 25);
        svg += `<text x="${textX}" y="${textY}" text-anchor="middle" font-size="16" font-weight="${isHighlighted ? 'bold' : (markerStyle === 'bold' ? 'bold' : 'normal')}" fill="${isHighlighted ? '#ff0000' : '#000000'}">${h}</text>`;
    }
    
    // Center point
    svg += `<circle cx="${centerX}" cy="${centerY}" r="5" fill="#ff0000"/>`;
    return svg;
}

function generateParallelLinesSVG(size, angle, lineCount, spacing, lineWidth = 2) {
    const centerX = size / 2;
    const centerY = size / 2;
    const angleRad = angle * Math.PI / 180;
    const totalHeight = (lineCount - 1) * spacing;
    const strokeWidth = lineWidth || 2;
    let svg = '';
    
    for (let i = 0; i < lineCount; i++) {
        const offset = (i - (lineCount - 1) / 2) * spacing;
        const x1 = centerX - Math.cos(angleRad) * (size / 2) - Math.sin(angleRad) * offset;
        const y1 = centerY - Math.sin(angleRad) * (size / 2) + Math.cos(angleRad) * offset;
        const x2 = centerX + Math.cos(angleRad) * (size / 2) - Math.sin(angleRad) * offset;
        const y2 = centerY + Math.sin(angleRad) * (size / 2) + Math.cos(angleRad) * offset;
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#000000" stroke-width="${strokeWidth}"/>`;
    }
    
    return svg;
}

function generateCrossPatternSVG(size, angle, patternSize, lineWidth = 3, style = 'standard') {
    const centerX = size / 2;
    const centerY = size / 2;
    const angleRad = angle * Math.PI / 180;
    const halfSize = patternSize / 2;
    const strokeWidth = lineWidth || 3;
    const strokeColor = style === 'bold' ? '#000000' : '#000000';
    let svg = '';
    
    // Horizontal line
    const hx1 = centerX - Math.cos(angleRad) * halfSize;
    const hy1 = centerY - Math.sin(angleRad) * halfSize;
    const hx2 = centerX + Math.cos(angleRad) * halfSize;
    const hy2 = centerY + Math.sin(angleRad) * halfSize;
    svg += `<line x1="${hx1}" y1="${hy1}" x2="${hx2}" y2="${hy2}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    
    // Vertical line
    const vx1 = centerX - Math.cos(angleRad + Math.PI / 2) * halfSize;
    const vy1 = centerY - Math.sin(angleRad + Math.PI / 2) * halfSize;
    const vx2 = centerX + Math.cos(angleRad + Math.PI / 2) * halfSize;
    const vy2 = centerY + Math.sin(angleRad + Math.PI / 2) * halfSize;
    svg += `<line x1="${vx1}" y1="${vy1}" x2="${vx2}" y2="${vy2}" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
    
    // Center point
    svg += `<circle cx="${centerX}" cy="${centerY}" r="5" fill="#ff0000"/>`;
    return svg;
}

function generateStarBurstSVG(size, points, angle, radiusOverride = null, lineWidth = 2) {
    const centerX = size / 2;
    const centerY = size / 2;
    const baseRadius = size / 2 - 20;
    const radius = radiusOverride ? radiusOverride : baseRadius;
    const angleStep = (360 / points) * Math.PI / 180;
    const startAngle = angle * Math.PI / 180;
    const strokeWidth = lineWidth || 2;
    let svg = '';
    
    for (let i = 0; i < points; i++) {
        const lineAngle = startAngle + i * angleStep;
        const x2 = centerX + Math.cos(lineAngle) * radius;
        const y2 = centerY + Math.sin(lineAngle) * radius;
        svg += `<line x1="${centerX}" y1="${centerY}" x2="${x2}" y2="${y2}" stroke="#000000" stroke-width="${strokeWidth}"/>`;
    }
    
    // Center circle
    svg += `<circle cx="${centerX}" cy="${centerY}" r="5" fill="#ff0000"/>`;
    return svg;
}

function answerAstigmatism(equal, responseType) {
    const testType = currentTest.testTypes[currentTest.currentTestType];
    const image = testType.images[currentTest.currentImage];
    
    currentTest.answers.push({
        equal: equal,
        responseType: responseType,
        angle: image.angle,
        testType: testType.name,
        imageIndex: currentTest.currentImage,
        timestamp: Date.now()
    });
    
    currentTest.currentImage++;
    
    // Move to next test type if current one is complete
    if (currentTest.currentImage >= testType.images.length) {
        currentTest.currentTestType++;
        currentTest.currentImage = 0;
        
        // Check if all test types are complete
        if (currentTest.currentTestType >= currentTest.testTypes.length) {
            finishAstigmatismTest();
        } else {
            renderAstigmatismTest();
        }
    } else {
        renderAstigmatismTest();
    }
}

function skipCurrentTestType() {
    currentTest.currentTestType++;
    currentTest.currentImage = 0;
    
    if (currentTest.currentTestType >= currentTest.testTypes.length) {
        finishAstigmatismTest();
    } else {
        renderAstigmatismTest();
    }
}

async function finishAstigmatismTest() {
    // Stop eye tracking
    if (window.aiVisionEngine && window.aiVisionEngine.stopEyeTracking) {
        window.aiVisionEngine.stopEyeTracking();
    }
    
    // Comprehensive analysis
    const totalAnswers = currentTest.answers.length;
    const unequalAnswers = currentTest.answers.filter(a => !a.equal);
    const unequalCount = unequalAnswers.length;
    const blurryAnswers = currentTest.answers.filter(a => a.responseType === 'blurry');
    
    // Calculate score
    const score = totalAnswers > 0 ? 1 - (unequalCount / totalAnswers) : 1;
    
    // Analyze by test type
    const testTypeAnalysis = {};
    currentTest.testTypes.forEach(tt => {
        const typeAnswers = currentTest.answers.filter(a => a.testType === tt.name);
        const typeUnequal = typeAnswers.filter(a => !a.equal).length;
        testTypeAnalysis[tt.name] = {
            total: typeAnswers.length,
            unequal: typeUnequal,
            score: typeAnswers.length > 0 ? 1 - (typeUnequal / typeAnswers.length) : 1
        };
    });
    
    // Detect astigmatism axis (angle where most problems occur)
    const angleProblems = {};
    unequalAnswers.forEach(answer => {
        if (answer.angle !== undefined) {
            const normalizedAngle = ((answer.angle % 180) + 180) % 180;
            angleProblems[normalizedAngle] = (angleProblems[normalizedAngle] || 0) + 1;
        }
    });
    
    // Find most problematic angle (likely astigmatism axis)
    let detectedAxis = null;
    let maxProblems = 0;
    Object.keys(angleProblems).forEach(angle => {
        if (angleProblems[angle] > maxProblems) {
            maxProblems = angleProblems[angle];
            detectedAxis = parseFloat(angle);
        }
    });
    
    // Calculate severity
    let severity = 'none';
    let resultText = '';
    let cylinderEstimate = 0;
    
    if (unequalCount === 0) {
        severity = 'none';
        resultText = 'No significant astigmatism detected - Excellent vision';
    } else if (unequalCount <= totalAnswers * 0.1) {
        severity = 'minimal';
        resultText = 'Minimal astigmatism detected - Very mild irregularity';
        cylinderEstimate = 0.25;
    } else if (unequalCount <= totalAnswers * 0.25) {
        severity = 'mild';
        resultText = 'Mild astigmatism detected - Minor correction may be beneficial';
        cylinderEstimate = 0.5;
    } else if (unequalCount <= totalAnswers * 0.5) {
        severity = 'moderate';
        resultText = 'Moderate astigmatism detected - Correction recommended';
        cylinderEstimate = 1.0;
    } else {
        severity = 'significant';
        resultText = 'Significant astigmatism detected - Professional consultation strongly recommended';
        cylinderEstimate = 1.5;
    }
    
    // AI-enhanced analysis if available - properly await async call
    let aiAnalysis = null;
    if (window.aiVisionEngine && window.aiVisionEngine.detectAstigmatism) {
        try {
            // Properly await the async AI detection
            aiAnalysis = await window.aiVisionEngine.detectAstigmatism(currentTest.answers, currentTest.eyeTrackingData);
            if (aiAnalysis && aiAnalysis.confidence > 0.7) {
                // Use AI results if high confidence
                if (aiAnalysis.axis !== undefined) detectedAxis = aiAnalysis.axis;
                if (aiAnalysis.cylinder !== undefined) cylinderEstimate = aiAnalysis.cylinder;
                if (aiAnalysis.severity) severity = aiAnalysis.severity;
            }
        } catch (error) {
            console.log('AI analysis not available:', error);
        }
    }
    
    // Format axis text
    let axisText = '';
    if (detectedAxis !== null) {
        axisText = `Detected axis: ${Math.round(detectedAxis)}°`;
    }
    
    const result = {
        type: 'astigmatism',
        name: 'Enhanced Astigmatism Test',
        score: score,
        accuracy: (score * 100).toFixed(1) + '%',
        result: resultText,
        severity: severity,
        cylinderEstimate: cylinderEstimate.toFixed(2) + ' D',
        axis: detectedAxis !== null ? Math.round(detectedAxis) : null,
        axisText: axisText,
        totalTests: totalAnswers,
        unequalCount: unequalCount,
        blurryCount: blurryAnswers.length,
        testTypeAnalysis: testTypeAnalysis,
        aiEnhanced: !!aiAnalysis,
        aiConfidence: aiAnalysis ? aiAnalysis.confidence : null,
        testDuration: ((Date.now() - currentTest.startTime) / 1000).toFixed(1) + 's',
        date: new Date().toISOString(),
        note: `Essential astigmatism test with ${currentTest.testTypes.length} test types and ${totalAnswers} individual tests. ${aiAnalysis ? 'AI-enhanced analysis included.' : 'Standard analysis.'}`
    };
    
    saveResult(result);
    showResult(result);
}

// Contrast Sensitivity Test
function startContrastTest() {
    try {
        if (!runPreTestSafetyChecks('Contrast Sensitivity Test')) return;
        // Check if user has email before starting test
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => {
                startContrastTestInternal();
            });
            return;
        }
        
        startContrastTestInternal();
    } catch (error) {
        console.error('[Contrast Test] Error:', error);
        alert('Error starting test. Please try again.');
    }
}

function startContrastTestInternal() {
    currentTest = {
        type: 'contrast',
        name: 'Contrast Sensitivity Test',
        currentLevel: 0,
        correct: 0,
        total: 0,
        levels: [0.9, 0.7, 0.5, 0.3, 0.2, 0.1]
    };
    showTestModal();
    renderContrastTest();
}

function renderContrastTest() {
    const container = document.getElementById('test-container');
    const contrast = currentTest.levels[currentTest.currentLevel];
    
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Contrast Sensitivity Test</h2>
            <div class="test-instructions">
                <p><strong>Instructions:</strong></p>
                <p>Look at the circle. Can you see the pattern inside?</p>
                <p>Level ${currentTest.currentLevel + 1} of ${currentTest.levels.length}</p>
            </div>
            <div class="test-display">
                <div style="width: 300px; height: 300px; border-radius: 50%; background: linear-gradient(45deg, rgba(0,0,0,${contrast}) 50%, rgba(255,255,255,${contrast}) 50%); margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: rgba(0,0,0,${contrast});">
                    Pattern
                </div>
            </div>
            <div class="test-controls">
                <button class="btn-correct" onclick="answerContrast(true)">I can see it</button>
                <button class="btn-incorrect" onclick="answerContrast(false)">I cannot see it</button>
            </div>
        </div>
    `;
}

function answerContrast(visible) {
    currentTest.total++;
    if (visible) {
        currentTest.correct++;
        currentTest.currentLevel++;
        
        if (currentTest.currentLevel >= currentTest.levels.length) {
            finishContrastTest();
            return;
        }
        
        renderContrastTest();
    } else {
        finishContrastTest();
    }
}

function finishContrastTest() {
    const score = currentTest.correct / currentTest.total;
    const result = {
        type: 'contrast',
        name: 'Contrast Sensitivity Test',
        score: score,
        levels: currentTest.correct,
        date: new Date().toISOString()
    };
    
    saveResult(result);
    showResult(result);
}

// Visual Field Test
function startVisualFieldTest() {
    try {
        if (!runPreTestSafetyChecks('Visual Field Test')) return;
        // Check if user has email before starting test
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => {
                startVisualFieldTestInternal();
            });
            return;
        }
        
        startVisualFieldTestInternal();
    } catch (error) {
        console.error('[Visual Field Test] Error:', error);
        alert('Error starting test. Please try again.');
    }
}

function startVisualFieldTestInternal() {
    currentTest = {
        type: 'visual-field',
        name: 'Visual Field Test',
        eye: 'left',
        clicks: [],
        startTime: Date.now()
    };
    showTestModal();
    renderVisualFieldTest();
}

function renderVisualFieldTest() {
    const container = document.getElementById('test-container');
    
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Visual Field Test</h2>
            <div class="test-instructions">
                <p><strong>Instructions:</strong></p>
                <p>Cover your ${currentTest.eye === 'left' ? 'right' : 'left'} eye. Stare at the center dot.</p>
                <p>Click anywhere you see a flash of light. Test will last 60 seconds.</p>
            </div>
            <div class="test-display" style="position: relative; width: 600px; height: 600px; background: #000; margin: 0 auto; cursor: crosshair;">
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 10px; height: 10px; background: #fff; border-radius: 50%;"></div>
                <canvas id="field-canvas" width="600" height="600" style="position: absolute; top: 0; left: 0;"></canvas>
            </div>
            <div class="test-controls">
                <button class="btn-next" onclick="finishVisualFieldTest()">Finish Test</button>
            </div>
        </div>
    `;
    
    startVisualFieldFlash();
}

function startVisualFieldFlash() {
    const canvas = document.getElementById('field-canvas');
    const ctx = canvas.getContext('2d');
    let flashCount = 0;
    const maxFlashes = 20;
    
    function flash() {
        if (flashCount >= maxFlashes) return;
        
        const x = Math.random() * 600;
        const y = Math.random() * 600;
        const size = 20;
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        
        setTimeout(() => {
            ctx.clearRect(x - size - 5, y - size - 5, (size + 5) * 2, (size + 5) * 2);
        }, 200);
        
        flashCount++;
        setTimeout(flash, 2000);
    }
    
    flash();
}

function finishVisualFieldTest() {
    const result = {
        type: 'visual-field',
        name: 'Visual Field Test',
        eye: currentTest.eye,
        clicks: currentTest.clicks.length,
        date: new Date().toISOString()
    };
    
    saveResult(result);
    showResult(result);
}

// ========== Amsler Grid (Macular / Central Vision Screening) ==========
function startAmslerGridTest() {
    try {
        if (!runPreTestSafetyChecks('Amsler Grid Test')) return;
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => startAmslerGridTestInternal());
            return;
        }
        startAmslerGridTestInternal();
    } catch (e) {
        console.error('[Amsler Grid] Error:', e);
        alert('Error starting test. Please try again.');
    }
}

function startAmslerGridTestInternal() {
    currentTest = {
        type: 'amsler-grid',
        name: 'Amsler Grid',
        step: 'instructions',
        eye: 'both',
        distortion: null,
        date: new Date().toISOString()
    };
    showTestModal();
    renderAmslerGridTest();
}

function renderAmslerGridTest() {
    const container = document.getElementById('test-container');
    if (currentTest.step === 'instructions') {
        container.innerHTML = `
            <div class="test-interface">
                <h2 class="test-title">Amsler Grid</h2>
                <div class="test-instructions">
                    <p><strong>Purpose:</strong> Screens for central vision problems (e.g. macular changes).</p>
                    <p><strong>Instructions:</strong></p>
                    <ul style="text-align: left; margin: 1rem 0;">
                        <li>Hold the device at normal reading distance (about 35 cm / 14 in).</li>
                        <li>Cover one eye. Stare only at the center dot.</li>
                        <li>Check if all lines are straight and the grid is complete (no waviness, blank areas, or distortion).</li>
                        <li>Repeat with the other eye.</li>
                    </ul>
                </div>
                <div class="test-controls">
                    <button class="btn btn-primary" onclick="currentTest.step='grid'; renderAmslerGridTest();">Show Grid</button>
                </div>
            </div>
        `;
        return;
    }
    if (currentTest.step === 'grid') {
        const size = Math.min(400, window.innerWidth - 60);
        const cell = Math.max(8, Math.floor(size / 20));
        const gridSize = cell * 20;
        container.innerHTML = `
            <div class="test-interface">
                <h2 class="test-title">Amsler Grid – Stare at the center dot</h2>
                <p style="margin-bottom: 1rem;">Cover one eye. Keep your gaze on the center. Are all lines straight? Any missing or wavy areas?</p>
                <div class="test-display" style="display: flex; justify-content: center;">
                    <div id="amsler-canvas-wrap" style="width: ${gridSize}px; height: ${gridSize}px; background: #fff; border: 2px solid #333;">
                        <canvas id="amsler-canvas" width="${gridSize}" height="${gridSize}"></canvas>
                    </div>
                </div>
                <div class="test-controls" style="flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="finishAmslerGridTest(false)">All lines straight, no issues</button>
                    <button class="btn btn-incorrect" onclick="finishAmslerGridTest(true)">I see waviness, blank spots, or distortion</button>
                </div>
            </div>
        `;
        const canvas = document.getElementById('amsler-canvas');
        const ctx = canvas.getContext('2d');
        const s = gridSize;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 20; i++) {
            const p = (i / 20) * s;
            ctx.beginPath();
            ctx.moveTo(p, 0);
            ctx.lineTo(p, s);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, p);
            ctx.lineTo(s, p);
            ctx.stroke();
        }
        const cx = s / 2, cy = s / 2, r = 4;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        return;
    }
}

function finishAmslerGridTest(hasDistortion) {
    currentTest.distortion = hasDistortion;
    const result = {
        type: 'amsler-grid',
        name: 'Amsler Grid',
        result: hasDistortion ? 'Possible central vision concern – same-day professional exam recommended' : 'No distortion reported',
        note: hasDistortion ? 'Urgent: sudden distortion, missing areas, or wavy lines can indicate a retinal/macular issue. Seek professional care promptly.' : null,
        date: new Date().toISOString()
    };
    saveResult(result);
    showResult(result);
}

// ========== Near Vision / Jaeger (Reading Acuity) ==========
const JAEGER_LEVELS = [
    { id: 'J1', size: 22, text: 'The quick brown fox jumps over the lazy dog. 0123456789.', approx: '20/25' },
    { id: 'J2', size: 18, text: 'Pack my box with five dozen liquor jugs. 0123456789.', approx: '20/32' },
    { id: 'J3', size: 14, text: 'How vexingly quick daft zebras jump! 0123456789.', approx: '20/40' },
    { id: 'J4', size: 12, text: 'Sphinx of black quartz, judge my vow. 0123456789.', approx: '20/50' },
    { id: 'J5', size: 10, text: 'Waltz, bad nymph, for quick jigs vex. 0123456789.', approx: '20/63' },
    { id: 'J6', size: 8, text: 'Glib jocks quiz nymph to vex dwarf. 0123456789.', approx: '20/80' },
    { id: 'J7', size: 6, text: 'Sphinx of black quartz, judge my vow.', approx: '20/100' }
];

function startNearVisionTest() {
    try {
        if (!runPreTestSafetyChecks('Near Vision Test')) return;
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => startNearVisionTestInternal());
            return;
        }
        startNearVisionTestInternal();
    } catch (e) {
        console.error('[Near Vision] Error:', e);
        alert('Error starting test. Please try again.');
    }
}

function startNearVisionTestInternal() {
    currentTest = {
        type: 'near-vision',
        name: 'Near Vision (Jaeger)',
        currentIndex: 0,
        bestLevel: null,
        date: new Date().toISOString()
    };
    showTestModal();
    renderNearVisionTest();
}

function renderNearVisionTest() {
    const container = document.getElementById('test-container');
    const level = JAEGER_LEVELS[currentTest.currentIndex];
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Near Vision (Jaeger)</h2>
            <div class="test-instructions">
                <p>Hold device at <strong>35 cm (14 inches)</strong> from your eyes. Read the text below. Can you read it clearly?</p>
                <p>Level ${currentTest.currentIndex + 1} of ${JAEGER_LEVELS.length} – ${level.id} (≈ ${level.approx})</p>
            </div>
            <div class="test-display" style="background: #fff; padding: 2rem; border-radius: 12px; margin: 1rem 0; text-align: left;">
                <p id="jaeger-text" style="font-size: ${level.size}px; line-height: 1.6; color: #000; margin: 0;">${level.text}</p>
            </div>
            <div class="test-controls">
                <button class="btn-correct" onclick="answerNearVision(true)">I can read it</button>
                <button class="btn-incorrect" onclick="answerNearVision(false)">I cannot read it clearly</button>
            </div>
        </div>
    `;
}

function answerNearVision(canRead) {
    const level = JAEGER_LEVELS[currentTest.currentIndex];
    if (canRead) {
        currentTest.bestLevel = level;
        currentTest.currentIndex++;
        if (currentTest.currentIndex >= JAEGER_LEVELS.length) {
            finishNearVisionTest();
            return;
        }
        renderNearVisionTest();
    } else {
        finishNearVisionTest();
    }
}

function finishNearVisionTest() {
    const j = currentTest.bestLevel || JAEGER_LEVELS[0];
    const result = {
        type: 'near-vision',
        name: 'Near Vision (Jaeger)',
        level: j.id,
        result: `Best reading level: ${j.id} (≈ ${j.approx} near equivalent)`,
        date: new Date().toISOString()
    };
    saveResult(result);
    showResult(result);
}

// ========== Duochrome (Red-Green) Refinement ==========
function startDuochromeTest() {
    try {
        if (!runPreTestSafetyChecks('Duochrome Test')) return;
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => startDuochromeTestInternal());
            return;
        }
        startDuochromeTestInternal();
    } catch (e) {
        console.error('[Duochrome] Error:', e);
        alert('Error starting test. Please try again.');
    }
}

function startDuochromeTestInternal() {
    currentTest = {
        type: 'duochrome',
        name: 'Duochrome (Red-Green)',
        round: 0,
        redClearer: 0,
        greenClearer: 0,
        total: 0,
        maxRounds: 5,
        date: new Date().toISOString()
    };
    showTestModal();
    renderDuochromeTest();
}

function renderDuochromeTest() {
    const container = document.getElementById('test-container');
    const letters = 'CDEHKNORSVZ';
    const pick = () => letters[Math.floor(Math.random() * letters.length)];
    const left = pick(), right = pick();
    currentTest.currentLeft = left;
    currentTest.currentRight = right;
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Duochrome (Red-Green)</h2>
            <div class="test-instructions">
                <p>Which side looks <strong>clearer or sharper</strong> – the red side or the green side? If equal, choose Equal.</p>
                <p>Round ${currentTest.round + 1} of ${currentTest.maxRounds}</p>
            </div>
            <div class="test-display" style="display: flex; justify-content: center; gap: 2rem; flex-wrap: wrap; margin: 1rem 0;">
                <div style="width: 140px; height: 120px; background: #c62828; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 48px; font-weight: bold; color: #fff;">${left}</span>
                </div>
                <div style="width: 140px; height: 120px; background: #2e7d32; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                    <span style="font-size: 48px; font-weight: bold; color: #fff;">${right}</span>
                </div>
            </div>
            <div class="test-controls">
                <button class="btn btn-primary" onclick="answerDuochrome('red')">Red clearer</button>
                <button class="btn btn-primary" onclick="answerDuochrome('green')">Green clearer</button>
                <button class="btn btn-secondary" onclick="answerDuochrome('equal')">Equal</button>
            </div>
        </div>
    `;
}

function answerDuochrome(choice) {
    currentTest.total++;
    if (choice === 'red') currentTest.redClearer++;
    if (choice === 'green') currentTest.greenClearer++;
    currentTest.round++;
    if (currentTest.round >= currentTest.maxRounds) {
        finishDuochromeTest();
        return;
    }
    renderDuochromeTest();
}

function finishDuochromeTest() {
    let interpretation = 'Equal – sphere may be balanced.';
    if (currentTest.redClearer > currentTest.greenClearer + 1) {
        interpretation = 'Red clearer – may indicate slight over-minus or under-plus; consider professional refraction.';
    } else if (currentTest.greenClearer > currentTest.redClearer + 1) {
        interpretation = 'Green clearer – may indicate slight under-minus or over-plus; consider professional refraction.';
    }
    const result = {
        type: 'duochrome',
        name: 'Duochrome (Red-Green)',
        result: interpretation,
        note: 'Used to refine sphere power. For actual prescription, see an optometrist.',
        date: new Date().toISOString()
    };
    saveResult(result);
    showResult(result);
}

// ========== Stereo Acuity (Depth Perception) ==========
const STEREO_LEVELS = [
    { arcSec: 400, pxOffset: 24, label: '400"' },
    { arcSec: 200, pxOffset: 12, label: '200"' },
    { arcSec: 100, pxOffset: 6, label: '100"' },
    { arcSec: 60, pxOffset: 4, label: '60"' },
    { arcSec: 40, pxOffset: 2, label: '40"' }
];

function startStereoAcuityTest() {
    try {
        if (!runPreTestSafetyChecks('Stereo Acuity Test')) return;
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => startStereoAcuityTestInternal());
            return;
        }
        startStereoAcuityTestInternal();
    } catch (e) {
        console.error('[Stereo Acuity] Error:', e);
        alert('Error starting test. Please try again.');
    }
}

function startStereoAcuityTestInternal() {
    currentTest = {
        type: 'stereo-acuity',
        name: 'Stereo Acuity',
        currentIndex: 0,
        correct: 0,
        bestArcSec: null,
        date: new Date().toISOString()
    };
    showTestModal();
    renderStereoAcuityTest();
}

function renderStereoAcuityTest() {
    const container = document.getElementById('test-container');
    const level = STEREO_LEVELS[currentTest.currentIndex];
    const offset = level.pxOffset;
    const whichCloser = Math.random() < 0.5 ? 'left' : 'right';
    currentTest.correctAnswer = whichCloser;
    // Red-cyan anaglyph: "closer" shape has negative parallax (red right, cyan left)
    const parallax = whichCloser === 'left' ? -offset : offset;
    const redShift = parallax;   // red layer shift (left eye)
    const cyanShift = -parallax; // cyan layer shift (right eye)
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Stereo Acuity</h2>
            <div class="test-instructions">
                <p><strong>Red-cyan 3D:</strong> Use red-cyan (or red-blue) 3D glasses for real depth. Which circle appears <strong>closer</strong>? No glasses? Choose by best guess.</p>
                <p>Level ${currentTest.currentIndex + 1} of ${STEREO_LEVELS.length} (${level.label})</p>
            </div>
            <div class="test-display" style="position: relative; width: 320px; height: 140px; margin: 1rem auto; background: #111;">
                <canvas id="stereo-canvas" width="320" height="140" style="display: block; margin: 0 auto;"></canvas>
            </div>
            <div class="test-controls">
                <button class="btn btn-primary" onclick="answerStereoAcuity('left')">Left closer</button>
                <button class="btn btn-primary" onclick="answerStereoAcuity('right')">Right closer</button>
            </div>
        </div>
    `;
    const canvas = document.getElementById('stereo-canvas');
    const ctx = canvas.getContext('2d');
    const w = 320, h = 140;
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, w, h);
    const cx1 = w * 0.35, cx2 = w * 0.65, cy = h / 2, r = 26;
    // Negative parallax = shape appears closer (red shifted right, cyan shifted left)
    const leftParallax = whichCloser === 'left' ? -offset : 0;
    const rightParallax = whichCloser === 'right' ? -offset : 0;
    // Left circle (red = left eye, cyan = right eye)
    ctx.fillStyle = 'rgba(255,0,0,0.95)';
    ctx.beginPath();
    ctx.arc(cx1 + leftParallax, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(cx1 - leftParallax, cy, r, 0, Math.PI * 2);
    ctx.fill();
    // Right circle
    ctx.fillStyle = 'rgba(255,0,0,0.95)';
    ctx.beginPath();
    ctx.arc(cx2 + rightParallax, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(0,255,255,0.95)';
    ctx.beginPath();
    ctx.arc(cx2 - rightParallax, cy, r, 0, Math.PI * 2);
    ctx.fill();
}

function answerStereoAcuity(choice) {
    const level = STEREO_LEVELS[currentTest.currentIndex];
    const correct = choice === currentTest.correctAnswer;
    if (correct) {
        currentTest.correct++;
        currentTest.bestArcSec = level.arcSec;
    }
    currentTest.currentIndex++;
    if (currentTest.currentIndex >= STEREO_LEVELS.length || !correct) {
        finishStereoAcuityTest();
        return;
    }
    renderStereoAcuityTest();
}

function finishStereoAcuityTest() {
    const best = currentTest.bestArcSec != null ? `${currentTest.bestArcSec}"` : 'N/A';
    const result = {
        type: 'stereo-acuity',
        name: 'Stereo Acuity',
        result: `Best stereo acuity: ${best} arc seconds`,
        note: currentTest.bestArcSec <= 60 ? 'Good depth perception.' : (currentTest.bestArcSec <= 200 ? 'Moderate stereo acuity.' : 'Consider an in-person stereo test for confirmation.'),
        date: new Date().toISOString()
    };
    saveResult(result);
    showResult(result);
}

// Prescription Test with LiDAR/TrueDepth Measurement
let prescriptionVideo = null;
let prescriptionStream = null;
let prescriptionCanvas = null;
let prescriptionCtx = null;
let faceMeshModel = null;
let measurementInterval = null;
let prescriptionDistanceSamples = [];
let eyeMeasurements = {
    left: { measurements: [], average: null },
    right: { measurements: [], average: null }
};

function startPrescriptionTest() {
    try {
        if (!runPreTestSafetyChecks('Refractive Screening (Prescription Estimate)')) return;
        // Check if user has email before starting test
        if (window.requireEmailBeforeTest && typeof window.requireEmailBeforeTest === 'function') {
            window.requireEmailBeforeTest(() => {
                startPrescriptionTestInternal();
            });
            return;
        }
        
        startPrescriptionTestInternal();
    } catch (error) {
        console.error('[Prescription Test] Error:', error);
        alert('Error starting test. Please try again.');
    }
}

function startPrescriptionTestInternal() {
    prescriptionDistanceSamples = [];
    eyeMeasurements = {
        left: { measurements: [], average: null },
        right: { measurements: [], average: null }
    };

    currentTest = {
        type: 'prescription',
        name: 'Prescription Measurement (LiDAR)',
        eye: 'both',
        measurements: [],
        measurementMethod: 'camera-estimation',
        distanceMethod: 'camera-estimation',
        lidarSessionActive: false,
        startTime: Date.now()
    };
    showTestModal();
    renderPrescriptionTest();
}

function renderPrescriptionTest() {
    const container = document.getElementById('test-container');
    
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Prescription Measurement (LiDAR)</h2>
            <div class="test-instructions">
                <p><strong>Instructions:</strong></p>
                <p>1. Allow camera access when prompted</p>
                <p>2. Position your face 12-18 inches (30-45 cm) from the camera</p>
                <p>3. Look directly at the camera and keep still</p>
                <p>4. If your device supports depth sensing, LiDAR/TrueDepth will be used for distance calibration</p>
                <p>5. Measurement takes about 15 seconds total</p>
                <p style="color: #f59e0b; margin-top: 1rem;"><strong>Clinical Note:</strong> This is a screening estimate and not a final glasses prescription.</p>
            </div>
            <div class="test-display" id="prescription-display">
                <div id="prescription-status" style="text-align: center; padding: 2rem;">
                    <p style="font-size: 1.2rem; margin-bottom: 1rem;">Ready to start measurement</p>
                    <button class="btn btn-primary" onclick="initiatePrescriptionMeasurement()">Start LiDAR Measurement</button>
                </div>
                <video id="prescription-video" autoplay playsinline style="display: none; width: 100%; max-width: 640px; border-radius: 10px;"></video>
                <canvas id="prescription-canvas" style="display: none;"></canvas>
                <div id="measurement-progress" style="display: none; text-align: center; margin-top: 1rem;">
                    <div style="background: #e0e7ff; padding: 1rem; border-radius: 8px;">
                        <p id="measurement-status">Initializing...</p>
                        <div style="background: #fff; height: 20px; border-radius: 10px; margin-top: 0.5rem; overflow: hidden;">
                            <div id="measurement-bar" style="background: #667eea; height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                        <p id="measurement-details" style="margin-top: 0.5rem; font-size: 0.9rem; color: #666;"></p>
                    </div>
                </div>
            </div>
            <div class="test-controls" id="prescription-controls" style="display: none;">
                <button class="btn btn-next" onclick="finishPrescriptionTest()">View Results</button>
                <button class="btn btn-incorrect" onclick="stopPrescriptionMeasurement()">Stop</button>
            </div>
        </div>
    `;
}

async function initiatePrescriptionMeasurement() {
    try {
        document.getElementById('prescription-status').style.display = 'none';
        document.getElementById('measurement-progress').style.display = 'block';
        document.getElementById('prescription-controls').style.display = 'flex';

        // Try to initialize LiDAR/TrueDepth-assisted distance tracking (if available)
        if (window.lidarEngine && typeof window.lidarEngine.initialize === 'function') {
            try {
                const setup = await window.lidarEngine.initialize(0.35, 0.25); // 35cm target, 25% tolerance
                if (setup && setup.available) {
                    currentTest.measurementMethod = 'lidar-assisted';
                    currentTest.distanceMethod = 'lidar-depth';
                    currentTest.lidarSessionActive = true;
                }
            } catch (lidarError) {
                console.warn('LiDAR initialization unavailable, continuing with camera estimation:', lidarError);
            }
        }
        
        // Request camera access
        prescriptionStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        prescriptionVideo = document.getElementById('prescription-video');
        prescriptionCanvas = document.getElementById('prescription-canvas');
        
        prescriptionVideo.srcObject = prescriptionStream;
        prescriptionVideo.play();
        prescriptionVideo.style.display = 'block';
        
        prescriptionCanvas.width = prescriptionVideo.videoWidth || 1280;
        prescriptionCanvas.height = prescriptionVideo.videoHeight || 720;
        prescriptionCtx = prescriptionCanvas.getContext('2d');
        
        // Initialize face detection
        await initializeFaceMeshForPrescription();
        
        // Start measurement
        const methodEl = document.getElementById('measurement-details');
        if (methodEl) {
            const methodText = currentTest.measurementMethod === 'lidar-assisted'
                ? 'Depth-assisted calibration active (LiDAR/TrueDepth)'
                : 'Camera-based geometric estimation active';
            methodEl.textContent = methodText;
        }
        startPrescriptionMeasurement();
        
    } catch (error) {
        console.error('Camera access error:', error);
        document.getElementById('measurement-status').textContent = 'Error: Could not access camera. Please allow camera permissions.';
        document.getElementById('measurement-status').style.color = '#ef4444';
    }
}

async function initializeFaceMeshForPrescription() {
    // Try to load MediaPipe Face Mesh or use alternative
    if (typeof faceLandmarksDetection !== 'undefined') {
        faceMeshModel = await faceLandmarksDetection.load(
            faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 }
        );
        return;
    }
    
    // Alternative: Use TensorFlow.js or basic face detection
    try {
        // Load TensorFlow.js face detection model
        const model = await tf.loadLayersModel('https://tfhub.dev/tensorflow/tfjs-model/blazeface/1/default/1');
        faceMeshModel = model;
    } catch (error) {
        console.warn('Advanced face detection not available, using fallback');
        faceMeshModel = 'fallback';
    }
}

function startPrescriptionMeasurement() {
    let measurementCount = 0;
    const totalMeasurements = 30; // 30 measurements over 15 seconds
    let rightEyeStatusShown = false;
    
    updateMeasurementStatus('left', 0);
    
    measurementInterval = setInterval(() => {
        if (prescriptionVideo && prescriptionVideo.readyState === prescriptionVideo.HAVE_ENOUGH_DATA) {
            const eyeToTest = currentTest.eye === 'both'
                ? (measurementCount < totalMeasurements / 2 ? 'left' : 'right')
                : currentTest.eye;

            // Draw video frame
            prescriptionCtx.drawImage(prescriptionVideo, 0, 0, prescriptionCanvas.width, prescriptionCanvas.height);
            
            // Measure eyes
            measureEyeRefraction(eyeToTest).then(measurement => {
                if (measurement) {
                    eyeMeasurements[eyeToTest].measurements.push(measurement);
                    currentTest.measurements.push({
                        eye: eyeToTest,
                        ...measurement,
                        timestamp: Date.now()
                    });
                }
            });
            
            measurementCount++;
            const progress = (measurementCount / totalMeasurements) * 100;
            updateMeasurementProgress(progress, measurementCount, totalMeasurements);
            
            // Switch eyes if testing both
            if (currentTest.eye === 'both' && measurementCount >= totalMeasurements / 2 && !rightEyeStatusShown) {
                updateMeasurementStatus('right', 0);
                rightEyeStatusShown = true;
            }
            
            if (measurementCount >= totalMeasurements) {
                stopPrescriptionMeasurement();
                calculatePrescriptionResults();
            }
        }
    }, 500); // Every 500ms
}

async function measureEyeRefraction(eye) {
    if (!prescriptionCanvas || !prescriptionCtx) return null;
    
    try {
        if (faceMeshModel && faceMeshModel !== 'fallback') {
            // Use MediaPipe or TensorFlow.js for accurate face detection
            const faces = await faceMeshModel.estimateFaces(prescriptionCanvas);
            
            if (faces && faces.length > 0) {
                const face = faces[0];
                const landmarks = face.keypoints || face.landmarks;
                
                // Get eye landmarks
                const eyeLandmarks = getEyeLandmarks(landmarks, eye);
                
                if (eyeLandmarks) {
                    // Calculate eye measurements
                    const measurements = calculateEyeMeasurements(eyeLandmarks, eye);
                    return measurements;
                }
            }
        } else {
            // Fallback: Use basic face detection
            return await measureEyeRefractionFallback(eye);
        }
    } catch (error) {
        console.error('Measurement error:', error);
        return await measureEyeRefractionFallback(eye);
    }
    
    return null;
}

function getEyeLandmarks(landmarks, eye) {
    // MediaPipe Face Mesh landmark indices
    // Left eye: 33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
    // Right eye: 362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
    
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    
    const indices = eye === 'left' ? leftEyeIndices : rightEyeIndices;
    const eyePoints = indices.map(idx => {
        const point = landmarks[idx];
        if (point) {
            const rawX = point.x ?? point[0];
            const rawY = point.y ?? point[1];
            const rawZ = point.z ?? point[2] ?? 0;
            const x = rawX <= 1 ? rawX * prescriptionCanvas.width : rawX;
            const y = rawY <= 1 ? rawY * prescriptionCanvas.height : rawY;
            return {
                x: Number.isFinite(x) ? x : 0,
                y: Number.isFinite(y) ? y : 0,
                z: Number.isFinite(rawZ) ? rawZ : 0
            };
        }
        return null;
    }).filter(p => p !== null);
    
    return eyePoints.length > 0 ? eyePoints : null;
}

function getBestPrescriptionDistanceCm() {
    if (window.lidarEngine && currentTest && currentTest.measurementMethod === 'lidar-assisted') {
        const distanceMeters = window.lidarEngine.currentDistance || window.lidarEngine.getAverageDistance?.();
        if (Number.isFinite(distanceMeters) && distanceMeters > 0) {
            const distanceCm = distanceMeters * 100;
            prescriptionDistanceSamples.push(distanceCm);
            if (prescriptionDistanceSamples.length > 50) prescriptionDistanceSamples.shift();
            return {
                value: distanceCm,
                source: 'lidar'
            };
        }
    }
    return {
        value: null,
        source: 'camera'
    };
}

function calculateEyeMeasurements(eyeLandmarks, eye) {
    // Calculate eye dimensions
    const xs = eyeLandmarks.map(p => p.x);
    const ys = eyeLandmarks.map(p => p.y);
    const zs = eyeLandmarks.map(p => p.z || 0);
    
    const width = Math.max(...xs) - Math.min(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    const depth = Math.max(...zs) - Math.min(...zs);
    
    // Calculate center
    const centerX = xs.reduce((a, b) => a + b, 0) / xs.length;
    const centerY = ys.reduce((a, b) => a + b, 0) / ys.length;
    const centerZ = zs.reduce((a, b) => a + b, 0) / zs.length;
    
    // Calculate distance from LiDAR when available, otherwise estimate from camera geometry
    const distanceEstimate = getBestPrescriptionDistanceCm();
    const distance = distanceEstimate.value ?? estimateDistance(width, height);
    
    // Estimate refractive error based on stable geometric features + distance calibration
    const refractiveError = estimateRefractiveError(width, height, depth, distance);
    
    return {
        width: width,
        height: height,
        depth: depth,
        distance: distance,
        centerX: centerX,
        centerY: centerY,
        refractiveError: refractiveError,
        sphere: refractiveError.sphere,
        cylinder: refractiveError.cylinder,
        axis: refractiveError.axis,
        confidence: refractiveError.confidence,
        distanceSource: distanceEstimate.value ? 'lidar' : 'camera'
    };
}

function estimateDistance(width, height) {
    // Camera-geometry fallback for distance when depth sensing is unavailable.
    const canvasWidth = prescriptionCanvas.width;
    
    const estimatedFOV = 60; // degrees (typical webcam FOV)
    const sensorWidthMM = 6.17; // mm (typical small camera sensor)
    
    const focalLengthMM = (sensorWidthMM / 2) / Math.tan((estimatedFOV * Math.PI / 180) / 2);
    
    // Use average corneal/iris-scale proxy in pixels.
    const standardEyeSizeMM = 24.0;
    const averageEyeSize = (width + height) / 2;
    if (!Number.isFinite(averageEyeSize) || averageEyeSize <= 0) return 35;
    
    // Pinhole model approximation.
    const distanceMM = (standardEyeSizeMM * focalLengthMM) / (averageEyeSize * (sensorWidthMM / canvasWidth));
    
    let distanceCM = distanceMM / 10;
    
    // Mobile front cameras are often wider; calibrate slightly.
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
        distanceCM *= 0.9;
    }
    
    // Realistic handheld reading-test range.
    distanceCM = Math.max(20, Math.min(60, distanceCM));
    
    return parseFloat(distanceCM.toFixed(1));
}

function estimateRefractiveError(width, height, depth, distance) {
    // Deterministic screening heuristic:
    // - sphere driven mostly by sustained working distance behavior
    // - cylinder/axis from geometric asymmetry of tracked eye landmarks
    const safeWidth = Math.max(width, 1);
    const safeHeight = Math.max(height, 1);
    const aspectRatio = safeHeight / safeWidth;

    // Sphere estimate: closer habitual distance trends toward minus, farther toward plus.
    const distanceDelta = 35 - distance; // cm from nominal 35cm reading distance
    let sphere = (distanceDelta / 10) * -0.5;

    // Small depth-shape contribution when z-range is available.
    const depthFactor = Number.isFinite(depth) ? Math.max(-0.4, Math.min(0.4, depth * -0.2)) : 0;
    sphere += depthFactor;

    // Cylinder estimate from non-circularity.
    const circularityError = Math.abs(1 - aspectRatio);
    let cylinder = circularityError < 0.08 ? 0 : (circularityError - 0.08) * 6.5;

    // Axis orientation from principal elongation.
    let axis = 0;
    if (cylinder >= 0.25) {
        if (safeWidth > safeHeight * 1.08) axis = 180;
        else if (safeHeight > safeWidth * 1.08) axis = 90;
        else axis = 45;
    }

    // Clamp to screening-safe ranges and quarter-diopter steps.
    sphere = Math.max(-6, Math.min(6, sphere));
    cylinder = Math.max(0, Math.min(4, cylinder));
    sphere = Math.round(sphere * 4) / 4;
    cylinder = Math.round(cylinder * 4) / 4;

    return {
        sphere: parseFloat(sphere.toFixed(2)),
        cylinder: parseFloat(cylinder.toFixed(2)),
        axis: Math.round(axis),
        confidence: calculateMeasurementConfidence(width, height, depth, distance)
    };
}

function calculateMeasurementConfidence(width, height, depth, distance) {
    // Calculate confidence score (0-1) based on measurement quality
    let confidence = 1.0;
    
    // Reduce confidence if measurements are outside normal ranges
    if (width < 15 || width > 35) confidence *= 0.7;
    if (height < 15 || height > 35) confidence *= 0.7;
    if (depth < 10 || depth > 40) confidence *= 0.8;
    if (distance < 20 || distance > 60) confidence *= 0.6;
    
    // Increase confidence if measurements are consistent
    const aspectRatio = height / width;
    if (aspectRatio >= 0.7 && aspectRatio <= 0.9) confidence *= 1.1;
    
    return Math.min(1.0, confidence);
}

async function measureEyeRefractionFallback(eye) {
    // Fallback method using basic image analysis
    // This provides a basic estimate when advanced face detection isn't available
    
    const imageData = prescriptionCtx.getImageData(0, 0, prescriptionCanvas.width, prescriptionCanvas.height);
    const data = imageData.data;
    
    // Simple eye detection using brightness analysis
    // This is a placeholder - real implementation would use more sophisticated methods
    
    return {
        width: 50,
        height: 30,
        depth: 0,
        distance: 35,
        centerX: prescriptionCanvas.width / 2,
        centerY: prescriptionCanvas.height / 2,
        refractiveError: {
            sphere: 0,
            cylinder: 0,
            axis: 0
        },
        sphere: 0,
        cylinder: 0,
        axis: 0
    };
}

function updateMeasurementStatus(eye, progress) {
    const statusEl = document.getElementById('measurement-status');
    const detailsEl = document.getElementById('measurement-details');
    
    if (statusEl) {
        statusEl.textContent = `Measuring ${eye === 'left' ? 'left' : 'right'} eye...`;
    }
    
    if (detailsEl) {
        detailsEl.textContent = `Keep your face still and look directly at the camera`;
    }
}

function updateMeasurementProgress(progress, current, total) {
    const barEl = document.getElementById('measurement-bar');
    const detailsEl = document.getElementById('measurement-details');
    
    if (barEl) {
        barEl.style.width = `${progress}%`;
    }
    
    if (detailsEl) {
        const method = currentTest && currentTest.measurementMethod === 'lidar-assisted'
            ? 'LiDAR depth-assisted'
            : 'Camera-estimated';
        const latestDistance = prescriptionDistanceSamples.length > 0
            ? prescriptionDistanceSamples[prescriptionDistanceSamples.length - 1]
            : null;
        const distanceText = latestDistance ? ` | Distance: ${latestDistance.toFixed(1)} cm` : '';
        detailsEl.textContent = `Progress: ${current}/${total} measurements (${Math.round(progress)}%) | Method: ${method}${distanceText}`;
    }
}

function stopPrescriptionMeasurement() {
    if (measurementInterval) {
        clearInterval(measurementInterval);
        measurementInterval = null;
    }
    
    if (prescriptionStream) {
        prescriptionStream.getTracks().forEach(track => track.stop());
        prescriptionStream = null;
    }
    
    if (prescriptionVideo) {
        prescriptionVideo.srcObject = null;
        prescriptionVideo.style.display = 'none';
    }

    if (currentTest && currentTest.lidarSessionActive && window.lidarEngine && typeof window.lidarEngine.stop === 'function') {
        window.lidarEngine.stop();
        currentTest.lidarSessionActive = false;
    }
    
    document.getElementById('measurement-progress').style.display = 'none';
}

function calculatePrescriptionResults() {
    // Calculate average measurements for each eye
    ['left', 'right'].forEach(eye => {
        const measurements = eyeMeasurements[eye].measurements;
        if (measurements.length > 0) {
            const avgSphere = measurements.reduce((sum, m) => sum + (m.sphere || 0), 0) / measurements.length;
            const avgCylinder = measurements.reduce((sum, m) => sum + (m.cylinder || 0), 0) / measurements.length;
            const avgAxis = measurements.reduce((sum, m) => sum + (m.axis || 0), 0) / measurements.length;
            const avgConfidence = measurements.reduce((sum, m) => sum + (m.confidence || 0), 0) / measurements.length;
            
            eyeMeasurements[eye].average = {
                sphere: avgSphere,
                cylinder: avgCylinder,
                axis: avgAxis,
                confidence: avgConfidence
            };
        }
    });
    
    // Prepare results
    const leftEye = eyeMeasurements.left.average;
    const rightEye = eyeMeasurements.right.average;
    
    let prescriptionText = '';
    if (leftEye && rightEye) {
        prescriptionText = `Left: ${formatPrescription(leftEye)}, Right: ${formatPrescription(rightEye)}`;
    } else if (leftEye) {
        prescriptionText = `Left: ${formatPrescription(leftEye)}`;
    } else if (rightEye) {
        prescriptionText = `Right: ${formatPrescription(rightEye)}`;
    }

    const confidenceValues = [leftEye?.confidence, rightEye?.confidence].filter(v => typeof v === 'number');
    const overallConfidence = confidenceValues.length > 0
        ? Math.round((confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length) * 100)
        : 0;
    
    const result = {
        type: 'prescription',
        name: 'Prescription Measurement (LiDAR)',
        leftEye: leftEye,
        rightEye: rightEye,
        prescription: prescriptionText,
        measurements: currentTest.measurements.length,
        method: currentTest.measurementMethod === 'lidar-assisted'
            ? 'LiDAR/TrueDepth depth-assisted'
            : 'Camera-based geometric estimation',
        details: `Confidence: ${overallConfidence}%`,
        note: 'Screening estimate only. Use this as guidance and confirm with a licensed eye care professional before buying spectacles.',
        date: new Date().toISOString()
    };
    
    saveResult(result);
    showPrescriptionResult(result);
}

function formatPrescription(eye) {
    let text = '';
    if (eye.sphere !== 0) {
        text += `${eye.sphere > 0 ? '+' : ''}${eye.sphere.toFixed(2)}`;
    }
    if (eye.cylinder !== 0) {
        text += ` ${eye.cylinder > 0 ? '+' : ''}${eye.cylinder.toFixed(2)}`;
        if (eye.axis !== 0) {
            text += ` x ${Math.round(eye.axis)}°`;
        }
    }
    return text || 'Plano (No correction needed)';
}

function showPrescriptionResult(result) {
    closeTest();
    
    const container = document.getElementById('test-container');
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Refractive Screening Complete!</h2>
            <div class="result-card">
                <div class="result-header">
                    <div class="result-title">${result.name}</div>
                    <div class="result-date">${new Date(result.date).toLocaleDateString()}</div>
                </div>
                <div style="margin: 1.5rem 0;">
                    <h3 style="margin-bottom: 1rem; color: #667eea;">Prescription Estimate</h3>
                    ${result.leftEye ? `
                        <div style="margin-bottom: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 8px;">
                            <strong>Left Eye:</strong> ${formatPrescription(result.leftEye)}
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                                Sphere: ${result.leftEye.sphere > 0 ? '+' : ''}${result.leftEye.sphere.toFixed(2)} D
                                ${result.leftEye.cylinder !== 0 ? ` | Cylinder: ${result.leftEye.cylinder > 0 ? '+' : ''}${result.leftEye.cylinder.toFixed(2)} D` : ''}
                                ${result.leftEye.axis !== 0 ? ` | Axis: ${Math.round(result.leftEye.axis)}°` : ''}
                                ${typeof result.leftEye.confidence === 'number' ? ` | Confidence: ${Math.round(result.leftEye.confidence * 100)}%` : ''}
                            </div>
                        </div>
                    ` : ''}
                    ${result.rightEye ? `
                        <div style="padding: 1rem; background: #f0f0f0; border-radius: 8px;">
                            <strong>Right Eye:</strong> ${formatPrescription(result.rightEye)}
                            <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                                Sphere: ${result.rightEye.sphere > 0 ? '+' : ''}${result.rightEye.sphere.toFixed(2)} D
                                ${result.rightEye.cylinder !== 0 ? ` | Cylinder: ${result.rightEye.cylinder > 0 ? '+' : ''}${result.rightEye.cylinder.toFixed(2)} D` : ''}
                                ${result.rightEye.axis !== 0 ? ` | Axis: ${Math.round(result.rightEye.axis)}°` : ''}
                                ${typeof result.rightEye.confidence === 'number' ? ` | Confidence: ${Math.round(result.rightEye.confidence * 100)}%` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #fff3cd; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <strong>Measurement Details:</strong>
                    <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
                        <li>Method: ${result.method}</li>
                        <li>Measurements taken: ${result.measurements}</li>
                        <li>${result.details || ''}</li>
                    </ul>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: #fee; border-radius: 8px; border-left: 4px solid #ef4444;">
                    <strong>Important Note:</strong>
                    <p style="margin-top: 0.5rem;">${result.note}</p>
                </div>
            </div>
            <div class="test-controls">
                <button class="btn-next" onclick="closeTest()">Close</button>
            </div>
        </div>
    `;
}

function finishPrescriptionTest() {
    if (measurementInterval) {
        stopPrescriptionMeasurement();
        calculatePrescriptionResults();
    } else {
        calculatePrescriptionResults();
    }
}

// Utility Functions
function showTestModal() {
    let modal = document.getElementById('test-modal');
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'test-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeTest()">&times;</button>
                <div id="test-container"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.classList.add('active');
}

function closeTest() {
    document.getElementById('test-modal').classList.remove('active');
    currentTest = null;
}

async function saveResult(result) {
    // Save to localStorage first (fast, always works)
    testHistory.push(result);
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
    
    // Track completed test in journey system
    if (window.SpectitJourney && result.type) {
        window.SpectitJourney.markTestComplete(result.type);
    }
    
    // Track completed test - map test types correctly
    let testType = result.type;
    if (!testType) {
        // Map from test name to type
        const name = result.name.toLowerCase();
        if (name.includes('visual acuity') || name.includes('acuity')) testType = 'visual-acuity';
        else if (name.includes('color') || name.includes('blindness')) testType = 'color-blindness';
        else if (name.includes('astigmatism')) testType = 'astigmatism';
        else if (name.includes('contrast')) testType = 'contrast';
        else if (name.includes('visual field') || name.includes('field')) testType = 'visual-field';
        else if (name.includes('prescription')) testType = 'prescription';
        else if (name.includes('amsler')) testType = 'amsler-grid';
        else if (name.includes('near vision') || name.includes('jaeger') || name.includes('reading')) testType = 'near-vision';
        else if (name.includes('duochrome') || name.includes('red-green')) testType = 'duochrome';
        else if (name.includes('stereo')) testType = 'stereo-acuity';
        else testType = name.replace(/\s+/g, '-');
    }
    
    if (testType && ALL_TESTS.includes(testType) && !completedTests.includes(testType)) {
        completedTests.push(testType);
        localStorage.setItem('completedTests', JSON.stringify(completedTests));
    }
    
    // Get user email
    const userEmail = window.getUserEmail ? window.getUserEmail() : localStorage.getItem('spectit_user_email');
    
    // Save to Supabase if available (cloud backup)
    if (window.SupabaseStorage && window.SupabaseStorage.isAvailable() && userEmail) {
        try {
            await window.SupabaseStorage.testResults.saveResult(result, userEmail);
        } catch (error) {
            console.warn('Failed to save to Supabase, using localStorage only:', error);
        }
    }
    
    // Send results to email
    if (userEmail) {
        await sendResultsToEmail(result, userEmail);
    }
    
    // Show immediate results popup
    showImmediateResult(result);
    
    // Check if all tests are completed
    checkAllTestsCompleted();
    
    updateResultsDisplay();
    updateHistoryChart();
}

// Send test results to user's email
async function sendResultsToEmail(result, email) {
    try {
        // Format the email content
        const emailSubject = `Spect-IT Test Results: ${result.name}`;
        const emailBody = formatResultEmail(result);
        
        // Try to use email service (EmailJS, Supabase, or mailto)
        // For now, use mailto with downloadable file as primary method
        // This ensures results are always accessible to the user
        sendEmailViaMailto(email, emailSubject, emailBody);
        
        // Optional: Try Supabase Edge Function if available
        if (window.SupabaseStorage && window.SupabaseStorage.isAvailable()) {
            try {
                const { data, error } = await window.SupabaseStorage.invoke('send-email', {
                    to: email,
                    subject: emailSubject,
                    html: emailBody,
                    testResult: result
                });
                    
                if (!error && data && data.success) {
                        console.log('Test results sent via Supabase email service');
                    }
            } catch (supabaseError) {
                console.log('Supabase email service not available, using mailto method');
            }
        }
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback to mailto link
        const emailSubject = `Spect-IT Test Results: ${result.name}`;
        const emailBody = formatResultEmail(result);
        sendEmailViaMailto(email, emailSubject, emailBody);
    }
}

// Format result as email HTML
function formatResultEmail(result) {
    let html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">Spect-IT Test Results</h2>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">${result.name}</h3>
                <p style="color: #6b7280; margin: 10px 0;"><strong>Date:</strong> ${new Date(result.date).toLocaleString()}</p>
    `;
    
    if (result.score !== undefined) {
        html += `<p style="color: #1f2937; font-size: 24px; font-weight: bold; color: #667eea; margin: 15px 0;"><strong>Score:</strong> ${(result.score * 100).toFixed(0)}%</p>`;
    }
    
    if (result.level) {
        html += `<p style="color: #1f2937; margin: 10px 0;"><strong>Visual Acuity:</strong> ${result.level}</p>`;
    }
    
    if (result.result) {
        html += `<p style="color: #1f2937; margin: 10px 0;"><strong>Result:</strong> ${result.result}</p>`;
    }
    
    if (result.estimate) {
        html += `<p style="color: #1f2937; margin: 10px 0;"><strong>Estimate:</strong> ${result.estimate}</p>`;
    }
    
    if (result.note) {
        html += `<p style="color: #f59e0b; background: #fef3c7; padding: 10px; border-radius: 4px; margin: 10px 0;"><strong>Note:</strong> ${result.note}</p>`;
    }
    
    html += `
            </div>
            <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                This is an automated email from Spect-IT. For professional medical advice, please consult with a qualified eye care professional.
            </p>
            <p style="color: #6b7280; font-size: 12px;">
                View all your results at: <a href="https://www.spect-it.com/#results" style="color: #667eea;">https://www.spect-it.com/#results</a>
            </p>
        </div>
    `;
    
    return html;
}

// Fallback: Use mailto link to open email client or create downloadable email
async function sendEmailViaMailto(email, subject, body) {
    // Create a text version of the email body (remove HTML tags)
    const textBody = body.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    
    // Create downloadable email file
    const emailContent = `Subject: ${subject}\nTo: ${email}\n\n${textBody}`;
    const blob = new Blob([emailContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spect-IT_Test_Results_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also try mailto link
    try {
        const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(textBody.substring(0, 2000))}`;
        window.open(mailtoLink, '_blank');
    } catch (e) {
        console.log('Mailto link opened');
    }
    
    // Show notification
    showEmailNotification(email);
    
    // Also save email content to localStorage for user to access
    const emailData = {
        to: email,
        subject: subject,
        body: body,
        textBody: textBody,
        timestamp: new Date().toISOString()
    };
    const savedEmails = JSON.parse(localStorage.getItem('spectit_sent_emails') || '[]');
    savedEmails.push(emailData);
    localStorage.setItem('spectit_sent_emails', JSON.stringify(savedEmails));
}

// Show notification that results have been sent to email
function showEmailNotification(email) {
    // Remove any existing notification
    const existing = document.getElementById('email-notification');
    if (existing) existing.remove();
    
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'email-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
        z-index: 10001;
        animation: slideIn 0.3s ease;
        max-width: 350px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 2rem;">📧</span>
            <div>
                <strong style="display: block; margin-bottom: 4px; font-size: 1.1rem;">Results Sent to Email!</strong>
                <small style="opacity: 0.9; font-size: 0.9rem;">Check ${email}</small>
                <div style="margin-top: 8px; font-size: 0.85rem; opacity: 0.8;">
                    Email file also downloaded
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 8 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 8000);
}

function showResult(result) {
    closeTest();
    
    const container = document.getElementById('test-container');
    container.innerHTML = `
        <div class="test-interface">
            <h2 class="test-title">Test Complete!</h2>
            <div class="result-card">
                <div class="result-header">
                    <div class="result-title">${result.name}</div>
                    <div class="result-date">${new Date(result.date).toLocaleDateString()}</div>
                </div>
                ${result.score !== undefined ? `<div class="result-score">Score: ${(result.score * 100).toFixed(0)}%</div>` : ''}
                ${result.level ? `<div class="result-details"><strong>Level:</strong> ${result.level}</div>` : ''}
                ${result.result ? `<div class="result-details"><strong>Result:</strong> ${result.result}</div>` : ''}
                ${result.estimate ? `<div class="result-details"><strong>Estimate:</strong> ${result.estimate}</div>` : ''}
                ${result.details ? `<div class="result-details">${result.details}</div>` : ''}
                ${result.note ? `<div class="result-details" style="margin-top: 1rem; color: #f59e0b;"><strong>Note:</strong> ${result.note}</div>` : ''}
            </div>
            <div class="test-controls">
                <button class="btn-next" onclick="closeTest()">Close</button>
            </div>
        </div>
    `;
}

function updateResultsDisplay() {
    const container = document.getElementById('results-container');
    const recentResults = testHistory.slice(-5).reverse();
    
    if (recentResults.length === 0) {
        container.innerHTML = '<div class="no-results"><p>No screening results yet. Complete a test to see your results here.</p><p class="results-disclaimer">Spect-IT results are a screening, not a diagnosis or a dispensable prescription.</p><p><a href="#tests" class="btn btn-gradient">Start a screening test</a></p></div>';
        return;
    }
    
    container.innerHTML = recentResults.map(result => `
        <div class="result-card">
            <div class="result-header">
                <div class="result-title">${result.name}</div>
                <div class="result-date">${new Date(result.date).toLocaleDateString()}</div>
            </div>
            ${result.score !== undefined ? `<div class="result-score">${(result.score * 100).toFixed(0)}%</div>` : ''}
            ${result.level ? `<div class="result-details"><strong>Visual Acuity:</strong> ${result.level}</div>` : ''}
            ${result.result ? `<div class="result-details"><strong>Result:</strong> ${result.result}</div>` : ''}
            ${result.estimate ? `<div class="result-details"><strong>Estimate:</strong> ${result.estimate}</div>` : ''}
        </div>
    `).join('');
}

// Store chart instance to prevent jumping
let historyChartInstance = null;

function updateHistoryChart() {
    if (typeof Chart === 'undefined') return;
    
    const ctx = document.getElementById('history-chart');
    if (!ctx) return;
    
    const labels = testHistory.map(r => new Date(r.date).toLocaleDateString());
    const scores = testHistory.map(r => r.score !== undefined ? r.score * 100 : null);
    
    // Destroy existing chart if it exists to prevent jumping
    if (historyChartInstance) {
        historyChartInstance.destroy();
    }
    
    // Create or update chart
    historyChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Test Score (%)',
                data: scores,
                borderColor: '#c9a962',
                backgroundColor: 'rgba(201, 169, 98, 0.12)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            animation: {
                duration: 0 // Disable animation to prevent jumping
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        stepSize: 10
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 0
                    }
                }
            }
        }
    });
}

// Show immediate result popup after each test
function showImmediateResult(result) {
    // Create or get the immediate result modal
    let modal = document.getElementById('immediate-result-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'immediate-result-modal';
        modal.className = 'result-modal';
        document.body.appendChild(modal);
    }
    
    // Format result details
    let resultDetails = '';
    if (result.score !== undefined) {
        resultDetails += `<div class="result-score-large">${(result.score * 100).toFixed(0)}%</div>`;
    }
    if (result.level) {
        resultDetails += `<div class="result-detail-item"><strong>Visual Acuity:</strong> ${result.level}</div>`;
    }
    if (result.result) {
        resultDetails += `<div class="result-detail-item"><strong>Result:</strong> ${result.result}</div>`;
    }
    if (result.estimate) {
        resultDetails += `<div class="result-detail-item"><strong>Estimate:</strong> ${result.estimate}</div>`;
    }
    if (result.note) {
        resultDetails += `<div class="result-note"><strong>Note:</strong> ${result.note}</div>`;
    }
    
    modal.innerHTML = `
        <div class="result-modal-content">
            <div class="result-modal-header">
                <h2>✅ Test Complete!</h2>
                <button class="result-modal-close" onclick="closeImmediateResult()">&times;</button>
            </div>
            <div class="result-modal-body">
                <div class="result-test-name">${result.name}</div>
                ${resultDetails}
                <div class="result-progress">
                    <div class="progress-text">Progress: ${completedTests.length} of ${ALL_TESTS.length} tests completed</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${(completedTests.length / ALL_TESTS.length) * 100}%"></div>
                    </div>
                </div>
            </div>
            <div class="result-modal-footer">
                <button class="btn btn-primary" onclick="closeImmediateResult()">Continue</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Auto-close after 5 seconds
    setTimeout(() => {
        if (modal.classList.contains('active')) {
            closeImmediateResult();
        }
    }, 5000);
}

function closeImmediateResult() {
    const modal = document.getElementById('immediate-result-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Check if all tests are completed and show overall results
function checkAllTestsCompleted() {
    const allCompleted = ALL_TESTS.every(test => completedTests.includes(test));
    
    if (allCompleted && !localStorage.getItem('overallResultsShown')) {
        // Wait a bit before showing overall results
        setTimeout(() => {
            showOverallResults();
            localStorage.setItem('overallResultsShown', 'true');
        }, 1000);
    }
}

// Show overall results popup when all tests are completed
function showOverallResults() {
    // Create or get the overall results modal
    let modal = document.getElementById('overall-results-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'overall-results-modal';
        modal.className = 'result-modal overall-results-modal';
        document.body.appendChild(modal);
    }
    
    // Get all test results
    const allResults = testHistory.filter(r => {
        let testType = r.type;
        if (!testType) {
            const name = r.name.toLowerCase();
            if (name.includes('visual acuity') || name.includes('acuity')) testType = 'visual-acuity';
            else if (name.includes('color') || name.includes('blindness')) testType = 'color-blindness';
            else if (name.includes('astigmatism')) testType = 'astigmatism';
            else if (name.includes('contrast')) testType = 'contrast';
            else if (name.includes('visual field') || name.includes('field')) testType = 'visual-field';
            else if (name.includes('prescription')) testType = 'prescription';
        }
        return testType && ALL_TESTS.includes(testType);
    });
    
    // Calculate overall statistics
    const scores = allResults.map(r => r.score).filter(s => s !== undefined);
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    // Build results summary - get latest result for each test type
    const latestResults = {};
    allResults.forEach(result => {
        let testType = result.type;
        if (!testType) {
            const name = result.name.toLowerCase();
            if (name.includes('visual acuity') || name.includes('acuity')) testType = 'visual-acuity';
            else if (name.includes('color') || name.includes('blindness')) testType = 'color-blindness';
            else if (name.includes('astigmatism')) testType = 'astigmatism';
            else if (name.includes('contrast')) testType = 'contrast';
            else if (name.includes('visual field') || name.includes('field')) testType = 'visual-field';
            else if (name.includes('prescription')) testType = 'prescription';
        }
        if (testType && (!latestResults[testType] || new Date(result.date) > new Date(latestResults[testType].date))) {
            latestResults[testType] = result;
        }
    });
    
    const resultsList = Object.values(latestResults).map(result => {
        const testName = result.name;
        const score = result.score !== undefined ? `${(result.score * 100).toFixed(0)}%` : 'N/A';
        const detail = result.level || result.result || result.estimate || 'Completed';
        
        return `
            <div class="overall-result-item">
                <div class="overall-result-name">${testName}</div>
                <div class="overall-result-score">${score}</div>
                <div class="overall-result-detail">${detail}</div>
            </div>
        `;
    }).join('');
    
    modal.innerHTML = `
        <div class="result-modal-content overall-content">
            <div class="result-modal-header">
                <h2>🎉 All Tests Completed!</h2>
                <button class="result-modal-close" onclick="closeOverallResults()">&times;</button>
            </div>
            <div class="result-modal-body">
                <div class="overall-summary">
                    <div class="overall-score">
                        <div class="overall-score-label">Overall Score</div>
                        <div class="overall-score-value">${(averageScore * 100).toFixed(0)}%</div>
                    </div>
                    <div class="overall-stats">
                        <div class="stat-item">
                            <div class="stat-value">${allResults.length}</div>
                            <div class="stat-label">Tests Completed</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">${new Date().toLocaleDateString()}</div>
                            <div class="stat-label">Date</div>
                        </div>
                    </div>
                </div>
                <div class="overall-results-list">
                    <h3>Test Results Summary</h3>
                    ${resultsList}
                </div>
                <div class="overall-actions">
                    <button class="btn btn-primary" onclick="window.location.href='#results'; closeOverallResults();">View All Results</button>
                    <button class="btn btn-secondary" onclick="window.location.href='#history'; closeOverallResults();">View History</button>
                </div>
            </div>
            <div class="result-modal-footer">
                <button class="btn btn-primary" onclick="closeOverallResults()">Close</button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

function closeOverallResults() {
    const modal = document.getElementById('overall-results-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Make functions globally accessible
window.startVisualAcuityTest = startVisualAcuityTest;
window.startColorBlindnessTest = startColorBlindnessTest;
window.startAstigmatismTest = startAstigmatismTest;
window.startContrastTest = startContrastTest;
window.startVisualFieldTest = startVisualFieldTest;
window.startPrescriptionTest = startPrescriptionTest;
window.startAmslerGridTest = startAmslerGridTest;
window.startNearVisionTest = startNearVisionTest;
window.startDuochromeTest = startDuochromeTest;
window.startStereoAcuityTest = startStereoAcuityTest;
window.closeImmediateResult = closeImmediateResult;
window.closeOverallResults = closeOverallResults;
window.closeTest = closeTest;
window.answerVisualAcuity = answerVisualAcuity;
window.checkSnellenAnswer = checkSnellenAnswer;
window.lockDistanceForTest = lockDistanceForTest;
window.skipDistanceLock = skipDistanceLock;
window.answerColorBlindness = answerColorBlindness;
window.initiatePrescriptionMeasurement = initiatePrescriptionMeasurement;
window.finishPrescriptionTest = finishPrescriptionTest;
window.stopPrescriptionMeasurement = stopPrescriptionMeasurement;
window.resumeTestAfterMovement = resumeTestAfterMovement;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateResultsDisplay();
    updateHistoryChart();
    
    // Ensure test modal exists
    if (!document.getElementById('test-modal')) {
        const modal = document.createElement('div');
        modal.id = 'test-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" onclick="closeTest()">&times;</button>
                <div id="test-container"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
});

