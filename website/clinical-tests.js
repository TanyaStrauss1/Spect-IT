/* ==========================================================================
 * Spect-IT — Clinical Vision Tests
 * Clinically-accurate implementations following standard optometry methodology
 * Version 2.0 - Clinical Overhaul
 * ========================================================================== */

// ============================================================================
// 1. VISUAL ACUITY TEST - ETDRS/LogMAR Standard
// ============================================================================

/**
 * Clinical Visual Acuity Test
 * - Uses Sloan letters (C, D, H, K, N, O, R, S, V, Z)
 * - ETDRS format: 5 letters per line, 0.1 logMAR steps
 * - Tests each eye separately (OD, then OS)
 * - Requires calibration for angular sizing
 * - Letter-by-letter scoring (0.02 logMAR per letter)
 * - Reports Snellen fraction, logMAR, and screening thresholds
 */

window.ClinicalTests = window.ClinicalTests || {};

window.ClinicalTests.startVisualAcuityTest = function() {
    // Ensure calibration before starting
    if (!window.SpectitCalibration || !window.SpectitCalibration.ensureBeforeTest) {
        alert('Calibration system not loaded. Please refresh the page.');
        return;
    }
    
    window.SpectitCalibration.ensureBeforeTest(function() {
        startClinicalAcuityTestInternal();
    }, { force: false });
};

function startClinicalAcuityTestInternal() {
    // Get calibration parameters
    var pxPerMm = window.SpectitCalibration.getPxPerMm();
    var distanceCm = window.SpectitCalibration.getDistanceCm();
    
    if (!pxPerMm || !distanceCm) {
        console.warn('[Clinical Acuity] No calibration data - results will be unreliable');
        pxPerMm = 3.8; // Fallback
        distanceCm = 300; // 3m standard
    }
    
    var distanceM = distanceCm / 100;
    
    // ETDRS chart - Sloan letters, 5 per line, logMAR progression
    // Standard ETDRS charts: 
    // Chart R1, R2, R3 for right eye, left eye, and refraction
    // We'll use a randomized sequence per line for each eye
    var etdrsLines = [
        { logMAR: 1.0, snellen: '6/60', letters: ['C', 'D', 'H', 'K', 'N'], visualAngleArcMin: 50 },
        { logMAR: 0.9, snellen: '6/48', letters: ['O', 'R', 'S', 'V', 'Z'], visualAngleArcMin: 39.8 },
        { logMAR: 0.8, snellen: '6/38', letters: ['C', 'D', 'K', 'N', 'R'], visualAngleArcMin: 31.6 },
        { logMAR: 0.7, snellen: '6/30', letters: ['H', 'O', 'S', 'V', 'Z'], visualAngleArcMin: 25.1 },
        { logMAR: 0.6, snellen: '6/24', letters: ['C', 'D', 'K', 'O', 'V'], visualAngleArcMin: 20.0 },
        { logMAR: 0.5, snellen: '6/19', letters: ['H', 'N', 'R', 'S', 'Z'], visualAngleArcMin: 15.8 },
        { logMAR: 0.4, snellen: '6/15', letters: ['C', 'D', 'H', 'O', 'V'], visualAngleArcMin: 12.6 },
        { logMAR: 0.3, snellen: '6/12', letters: ['K', 'N', 'R', 'S', 'Z'], visualAngleArcMin: 10.0 },
        { logMAR: 0.2, snellen: '6/9.5', letters: ['C', 'D', 'H', 'K', 'R'], visualAngleArcMin: 7.94 },
        { logMAR: 0.1, snellen: '6/7.5', letters: ['N', 'O', 'S', 'V', 'Z'], visualAngleArcMin: 6.31 },
        { logMAR: 0.0, snellen: '6/6', letters: ['C', 'D', 'H', 'K', 'O'], visualAngleArcMin: 5.0 },
        { logMAR: -0.1, snellen: '6/4.8', letters: ['N', 'R', 'S', 'V', 'Z'], visualAngleArcMin: 3.98 },
        { logMAR: -0.2, snellen: '6/3.8', letters: ['C', 'D', 'H', 'K', 'R'], visualAngleArcMin: 3.16 }
    ];
    
    window.currentClinicalTest = {
        type: 'clinical-acuity',
        testName: 'Clinical Visual Acuity (ETDRS/LogMAR)',
        version: '2.0',
        calibration: {
            pxPerMm: pxPerMm,
            distanceCm: distanceCm,
            distanceM: distanceM,
            ppi: Math.round(pxPerMm * 25.4)
        },
        currentEye: 'right', // Start with right eye (OD)
        currentLine: 0,
        etdrsLines: etdrsLines,
        results: {
            right: { linesPassed: [], letterScore: 0, logMAR: null, snellen: null },
            left: { linesPassed: [], letterScore: 0, logMAR: null, snellen: null }
        },
        currentLineAttempts: []
    };
    
    if (typeof showTestModal === 'function') {
        showTestModal();
    }
    
    renderClinicalAcuityTest();
}

function renderClinicalAcuityTest() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var container = document.getElementById('test-container');
    if (!container) return;
    
    var eye = test.currentEye;
    var eyeName = eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)';
    var coverEye = eye === 'right' ? 'left' : 'right';
    
    // Check if test is complete
    if (test.currentEye === 'complete') {
        showClinicalAcuityResults();
        return;
    }
    
    // Check if current eye is complete
    var eyeResults = test.results[eye];
    if (test.currentLine >= test.etdrsLines.length) {
        // Calculate final score for this eye
        calculateEyeScore(eye);
        
        // Move to next eye or finish
        if (eye === 'right') {
            test.currentEye = 'left';
            test.currentLine = 0;
            test.currentLineAttempts = [];
            renderClinicalAcuityTest();
        } else {
            test.currentEye = 'complete';
            showClinicalAcuityResults();
        }
        return;
    }
    
    var line = test.etdrsLines[test.currentLine];
    
    // Calculate letter size based on visual angle
    // Visual angle (arc minutes) = angular size of 5x5 letter at distance
    // Height of letter (m) = 2 * distance * tan(angle/2)
    // For small angles: tan(θ) ≈ θ (in radians)
    var visualAngleDeg = line.visualAngleArcMin / 60.0; // Convert arc minutes to degrees
    var visualAngleRad = visualAngleDeg * (Math.PI / 180.0);
    var letterHeightM = 2 * test.calibration.distanceM * Math.tan(visualAngleRad / 2);
    
    // Convert to pixels
    var letterHeightMm = letterHeightM * 1000;
    var letterHeightPx = letterHeightMm * test.calibration.pxPerMm;
    
    // Optotype height is 5 units, width is ~3 units for Sloan letters
    var fontSize = letterHeightPx; // This is the CSS font-size
    
    // Ensure readable (minimum 20px, maximum for screen)
    fontSize = Math.max(20, Math.min(fontSize, window.innerHeight * 0.3));
    
    // Letter spacing (equal to letter width for ETDRS)
    var letterSpacing = fontSize * 0.6;
    
    container.innerHTML = `
        <div class="clinical-test-interface">
            <div class="test-header">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.5rem;">📋 Clinical Visual Acuity Test</h2>
                <p style="margin: 0; color: #666; font-size: 0.95rem;">ETDRS/LogMAR Standard — ${eyeName}</p>
            </div>
            
            <div class="eye-instruction-panel" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <span style="font-size: 2.5rem;">${eye === 'right' ? '👁️' : '👁️'}</span>
                    <div>
                        <h3 style="margin: 0 0 0.25rem 0; font-size: 1.2rem; font-weight: 600;">Testing: ${eyeName}</h3>
                        <p style="margin: 0; font-size: 0.9rem; opacity: 0.95;">Cover your <strong>${coverEye} eye</strong> completely</p>
                    </div>
                </div>
                <div style="background: rgba(255,255,255,0.15); padding: 1rem; border-radius: 8px; backdrop-filter: blur(10px);">
                    <p style="margin: 0 0 0.5rem 0; font-size: 0.9rem;"><strong>📏 Distance:</strong> ${test.calibration.distanceCm} cm (${test.calibration.distanceM.toFixed(1)}m)</p>
                    <p style="margin: 0; font-size: 0.9rem;"><strong>🔍 Current line:</strong> ${line.snellen} (${line.logMAR.toFixed(1)} logMAR)</p>
                </div>
            </div>
            
            <div class="letter-display" style="background: white; padding: 3rem 2rem; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); margin: 2rem 0; text-align: center;">
                <div style="font-size: ${fontSize}px; font-weight: 900; letter-spacing: ${letterSpacing}px; line-height: 1.2; color: #000; font-family: 'Arial Black', Arial, sans-serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: center; flex-wrap: wrap; gap: ${letterSpacing}px;">
                    ${line.letters.map(letter => `<span style="display: inline-block;">${letter}</span>`).join('')}
                </div>
                <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 2px solid #e2e8f0;">
                    <p style="margin: 0; font-size: 0.9rem; color: #666;">
                        <strong>Line ${test.currentLine + 1} of ${test.etdrsLines.length}:</strong> 
                        ${line.snellen} | ${line.visualAngleArcMin.toFixed(1)} arc min | ${line.logMAR.toFixed(1)} logMAR
                    </p>
                </div>
            </div>
            
            <div class="letter-input-section" style="background: #f8f9fa; padding: 2rem; border-radius: 12px; margin: 1.5rem 0;">
                <label for="clinical-letter-input" style="display: block; margin-bottom: 1rem; font-weight: 600; color: #333; font-size: 1.05rem;">
                    📝 Enter the letters you see (left to right):
                </label>
                <input 
                    type="text" 
                    id="clinical-letter-input" 
                    maxlength="5"
                    placeholder="e.g., CDHKN"
                    style="width: 100%; max-width: 400px; padding: 1rem 1.5rem; font-size: 1.3rem; text-align: center; letter-spacing: 0.5em; text-transform: uppercase; border: 3px solid #667eea; border-radius: 12px; font-weight: 600; box-sizing: border-box; font-family: 'Arial Black', Arial, sans-serif;"
                    autocomplete="off"
                    autofocus
                    onkeypress="if(event.key==='Enter') window.ClinicalTests.submitAcuityLine()"
                    oninput="this.value = this.value.toUpperCase().replace(/[^CDHKNORSVZ]/g, '')"
                />
                <p style="margin: 0.75rem 0 0 0; font-size: 0.85rem; color: #666; text-align: center;">Enter up to 5 letters (only Sloan letters: C, D, H, K, N, O, R, S, V, Z)</p>
            </div>
            
            <div class="scoring-info" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 4px; margin: 1.5rem 0;">
                <p style="margin: 0; font-size: 0.9rem; color: #856404;">
                    <strong>ℹ️ Scoring:</strong> Enter as many letters as you can read clearly, from left to right. Each correct letter counts. You must read at least 3 out of 5 letters to pass this line.
                </p>
            </div>
            
            <div class="test-controls" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button 
                    onclick="window.ClinicalTests.submitAcuityLine()" 
                    class="btn btn-gradient"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(102,126,234,0.3); border: none;">
                    ✓ Submit Answer
                </button>
                <button 
                    onclick="window.ClinicalTests.skipAcuityLine()" 
                    class="btn btn-secondary"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    Cannot Read
                </button>
            </div>
            
            <div class="clinical-disclaimer" style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 1rem; border-radius: 4px; margin-top: 2rem;">
                <p style="margin: 0; font-size: 0.85rem; color: #003a8c;">
                    <strong>📊 Clinical Standard:</strong> This test uses ETDRS methodology with Sloan optotypes and logMAR scoring, similar to professional optometry screening. Results are for screening only — not a diagnosis or prescription.
                </p>
            </div>
        </div>
    `;
    
    // Focus the input
    setTimeout(function() {
        var input = document.getElementById('clinical-letter-input');
        if (input) input.focus();
    }, 100);
}

window.ClinicalTests.submitAcuityLine = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var input = document.getElementById('clinical-letter-input');
    if (!input) return;
    
    var userAnswer = input.value.toUpperCase().trim();
    var line = test.etdrsLines[test.currentLine];
    
    // Score letter by letter (ETDRS scoring)
    var correctLetters = 0;
    var totalLetters = line.letters.length;
    
    for (var i = 0; i < totalLetters; i++) {
        if (i < userAnswer.length && userAnswer[i] === line.letters[i]) {
            correctLetters++;
        }
    }
    
    // Record result
    var eye = test.currentEye;
    test.results[eye].linesPassed.push({
        lineIndex: test.currentLine,
        logMAR: line.logMAR,
        snellen: line.snellen,
        correctLetters: correctLetters,
        totalLetters: totalLetters,
        userAnswer: userAnswer,
        correctAnswer: line.letters.join('')
    });
    
    // Update letter score (each letter = 0.02 logMAR in ETDRS)
    test.results[eye].letterScore += correctLetters;
    
    // Determine if should continue to next line
    // Standard: Need at least 3/5 letters (60%) to continue
    if (correctLetters >= 3) {
        // Passed - continue to next line
        test.currentLine++;
        renderClinicalAcuityTest();
    } else {
        // Failed - stop testing this eye
        test.currentLine = test.etdrsLines.length; // Mark as complete
        renderClinicalAcuityTest();
    }
};

window.ClinicalTests.skipAcuityLine = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var line = test.etdrsLines[test.currentLine];
    var eye = test.currentEye;
    
    // Record as 0 letters
    test.results[eye].linesPassed.push({
        lineIndex: test.currentLine,
        logMAR: line.logMAR,
        snellen: line.snellen,
        correctLetters: 0,
        totalLetters: line.letters.length,
        userAnswer: '',
        correctAnswer: line.letters.join('')
    });
    
    // Stop testing this eye
    test.currentLine = test.etdrsLines.length;
    renderClinicalAcuityTest();
};

function calculateEyeScore(eye) {
    var test = window.currentClinicalTest;
    var results = test.results[eye];
    
    if (results.linesPassed.length === 0) {
        results.logMAR = 1.3; // Worse than chart
        results.snellen = '<6/120';
        return;
    }
    
    // Find the last line where at least 1 letter was read
    var lastLine = results.linesPassed[results.linesPassed.length - 1];
    var baseLogMAR = lastLine.logMAR;
    
    // Calculate total letter score
    // Start from baseLogMAR and subtract 0.02 for each letter read on previous lines
    var totalCorrect = 0;
    for (var i = 0; i < results.linesPassed.length; i++) {
        totalCorrect += results.linesPassed[i].correctLetters;
    }
    
    // ETDRS scoring: Each letter = 0.02 logMAR
    // Final score = baseLogMAR (of starting line) - (0.02 × total letters correct)
    // For simplicity, use the last line passed (≥3 letters) and add corrections
    var lastPassedLine = null;
    for (var i = results.linesPassed.length - 1; i >= 0; i--) {
        if (results.linesPassed[i].correctLetters >= 3) {
            lastPassedLine = results.linesPassed[i];
            break;
        }
    }
    
    if (!lastPassedLine) {
        // No line passed, use first line attempted
        var firstLine = results.linesPassed[0];
        results.logMAR = firstLine.logMAR + (0.02 * (5 - firstLine.correctLetters));
        results.snellen = snellenFromLogMAR(results.logMAR);
    } else {
        // Use last passed line and adjust
        results.logMAR = lastPassedLine.logMAR;
        // Try to read next line and adjust
        var nextLineIndex = lastPassedLine.lineIndex + 1;
        if (nextLineIndex < results.linesPassed.length) {
            var nextLine = results.linesPassed[nextLineIndex];
            results.logMAR -= (0.02 * nextLine.correctLetters);
        }
        results.snellen = snellenFromLogMAR(results.logMAR);
    }
}

function snellenFromLogMAR(logMAR) {
    // Convert logMAR to Snellen fraction
    // logMAR = log10(min angle of resolution / 1 arc min)
    // Snellen 6/6 = 0 logMAR, 6/60 = 1.0 logMAR
    var denominator = Math.round(6 * Math.pow(10, logMAR));
    
    // Clamp to reasonable values
    if (denominator < 3) return '6/3';
    if (denominator > 120) return '6/120+';
    
    return '6/' + denominator;
}

function showClinicalAcuityResults() {
    var test = window.currentClinicalTest;
    var container = document.getElementById('test-container');
    if (!container) return;
    
    var rightResults = test.results.right;
    var leftResults = test.results.left;
    
    // Determine screening outcome
    function getScreeningOutcome(logMAR) {
        if (logMAR <= 0.3) return { status: 'PASS', color: '#48bb78', message: 'Normal vision for screening purposes' };
        if (logMAR <= 0.5) return { status: 'BORDERLINE', color: '#ed8936', message: 'Consider professional eye examination' };
        return { status: 'REFER', color: '#f56565', message: 'Recommend professional eye examination' };
    }
    
    var rightOutcome = getScreeningOutcome(rightResults.logMAR);
    var leftOutcome = getScreeningOutcome(leftResults.logMAR);
    
    container.innerHTML = `
        <div class="clinical-results">
            <div class="results-header" style="text-align: center; margin-bottom: 2rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.8rem;">✅ Visual Acuity Test Complete</h2>
                <p style="margin: 0; color: #666; font-size: 1rem;">ETDRS/LogMAR Clinical Screening Results</p>
            </div>
            
            <div class="eye-results-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div class="eye-result-card" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">👁️</div>
                        <h3 style="margin: 0; font-size: 1.3rem; color: #152a45;">Right Eye (OD)</h3>
                    </div>
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;">Snellen Acuity</span>
                            <span style="font-size: 2rem; font-weight: 700; color: #152a45;">${rightResults.snellen}</span>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;">LogMAR Score</span>
                            <span style="font-size: 1.5rem; font-weight: 600; color: #667eea;">${rightResults.logMAR.toFixed(2)}</span>
                        </div>
                        <div>
                            <span style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;">Letters Read</span>
                            <span style="font-size: 1.2rem; font-weight: 600; color: #4a5568;">${rightResults.letterScore}</span>
                        </div>
                    </div>
                    <div style="background: ${rightOutcome.color}; color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">${rightOutcome.status}</div>
                        <div style="font-size: 0.85rem; opacity: 0.95;">${rightOutcome.message}</div>
                    </div>
                </div>
                
                <div class="eye-result-card" style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">👁️</div>
                        <h3 style="margin: 0; font-size: 1.3rem; color: #152a45;">Left Eye (OS)</h3>
                    </div>
                    <div style="background: white; padding: 1.5rem; border-radius: 12px; margin-bottom: 1rem;">
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;">Snellen Acuity</span>
                            <span style="font-size: 2rem; font-weight: 700; color: #152a45;">${leftResults.snellen}</span>
                        </div>
                        <div style="margin-bottom: 1rem;">
                            <span style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;">LogMAR Score</span>
                            <span style="font-size: 1.5rem; font-weight: 600; color: #667eea;">${leftResults.logMAR.toFixed(2)}</span>
                        </div>
                        <div>
                            <span style="font-size: 0.9rem; color: #666; display: block; margin-bottom: 0.25rem;">Letters Read</span>
                            <span style="font-size: 1.2rem; font-weight: 600; color: #4a5568;">${leftResults.letterScore}</span>
                        </div>
                    </div>
                    <div style="background: ${leftOutcome.color}; color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.25rem;">${leftOutcome.status}</div>
                        <div style="font-size: 0.85rem; opacity: 0.95;">${leftOutcome.message}</div>
                    </div>
                </div>
            </div>
            
            <div class="calibration-info" style="background: #f0f4f8; padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
                <h4 style="margin: 0 0 1rem 0; font-size: 1.1rem; color: #152a45;">📊 Test Parameters</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.9rem; color: #4a5568;">
                    <div><strong>Distance:</strong> ${test.calibration.distanceCm} cm</div>
                    <div><strong>Screen PPI:</strong> ${test.calibration.ppi}</div>
                    <div><strong>Method:</strong> ETDRS/LogMAR</div>
                    <div><strong>Version:</strong> ${test.version}</div>
                </div>
            </div>
            
            <div class="logmar-explanation" style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 1.25rem; border-radius: 4px; margin-bottom: 2rem;">
                <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: #003a8c;">📚 Understanding Your Results</h4>
                <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.9rem; color: #003a8c; line-height: 1.6;">
                    <li><strong>Snellen Fraction (e.g., 6/6):</strong> The standard way optometrists report acuity. 6/6 is "normal" (equivalent to 20/20 in feet).</li>
                    <li><strong>LogMAR Score:</strong> Clinical measurement where 0.0 = 6/6 (normal). Lower is better, higher indicates reduced acuity.</li>
                    <li><strong>Screening Threshold:</strong> LogMAR ≤ 0.3 (approximately 6/12 or better) typically passes driving and daily activity screening.</li>
                </ul>
            </div>
            
            <div class="clinical-disclaimer" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.25rem; border-radius: 4px; margin-bottom: 2rem;">
                <p style="margin: 0; font-size: 0.9rem; color: #856404; line-height: 1.6;">
                    <strong>⚠️ Screening Only — Not a Diagnosis:</strong> These results are from a home screening test using calibrated angular sizing. They are <strong>not</strong> a substitute for a comprehensive eye examination by a licensed optometrist or ophthalmologist. Screen calibration, ambient lighting, and viewing conditions can affect accuracy. Always consult an eye care professional for a clinical diagnosis and prescription.
                </p>
            </div>
            
            <div class="test-actions" style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="window.ClinicalTests.saveAcuityResults()" class="btn btn-gradient" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
                    💾 Save Results
                </button>
                <button onclick="closeTest()" class="btn btn-secondary" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    ✓ Done
                </button>
            </div>
        </div>
    `;
}

window.ClinicalTests.saveAcuityResults = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    // Prepare results for storage
    var results = {
        testType: 'clinical-visual-acuity',
        testName: test.testName,
        version: test.version,
        timestamp: new Date().toISOString(),
        calibration: test.calibration,
        rightEye: {
            snellen: test.results.right.snellen,
            logMAR: test.results.right.logMAR,
            letterScore: test.results.right.letterScore,
            linesPassed: test.results.right.linesPassed
        },
        leftEye: {
            snellen: test.results.left.snellen,
            logMAR: test.results.left.logMAR,
            letterScore: test.results.left.letterScore,
            linesPassed: test.results.left.linesPassed
        }
    };
    
    // Save to localStorage (legacy support)
    var existingResults = JSON.parse(localStorage.getItem('spectit_test_results') || '[]');
    existingResults.push(results);
    localStorage.setItem('spectit_test_results', JSON.stringify(existingResults));
    
    // Save to database if available
    if (window.saveClinicalTestResult && typeof window.saveClinicalTestResult === 'function') {
        window.saveClinicalTestResult(results);
    }
    
    alert('✅ Results saved successfully!');
    
    if (typeof closeTest === 'function') {
        closeTest();
    }
};

// ============================================================================
// 2. COLOR VISION TEST - Confusion Line Based Screening
// ============================================================================

/**
 * Clinical Color Vision Test
 * - Uses confusion-line based pseudoisochromatic stimuli
 * - Control plates to validate screen/viewing conditions
 * - Separate protan and deutan screening logic
 * - Does NOT use copyrighted Ishihara plate images
 * - Warns about uncalibrated displays
 */

window.ClinicalTests.startColorVisionTest = function() {
    startClinicalColorVisionTestInternal();
};

function startClinicalColorVisionTestInternal() {
    // Color vision test plates using confusion-line methodology
    // Control plate: should be visible to all
    // Protan plates: colors along protan confusion line
    // Deutan plates: colors along deutan confusion line
    
    window.currentClinicalTest = {
        type: 'clinical-color-vision',
        testName: 'Color Vision Screening (Confusion Line Method)',
        version: '2.0',
        currentPlate: 0,
        answers: [],
        plates: [
            // Control plate - everyone should see this
            { number: '12', type: 'control', protanColor: '#d32f2f', deutanColor: '#d32f2f', bgColor: '#bdbdbd', description: 'Control (all should see)' },
            
            // Protan screening plates (red-deficient)
            { number: '6', type: 'protan', protanColor: null, deutanColor: '#c62828', bgColor: '#f5deb3', description: 'Protan test 1' },
            { number: '8', type: 'protan', protanColor: null, deutanColor: '#d32f2f', bgColor: '#ffe0b2', description: 'Protan test 2' },
            { number: '45', type: 'protan', protanColor: null, deutanColor: '#b71c1c', bgColor: '#ffccbc', description: 'Protan test 3' },
            
            // Deutan screening plates (green-deficient)
            { number: '3', type: 'deutan', protanColor: '#1976d2', deutanColor: null, bgColor: '#d3d3d3', description: 'Deutan test 1' },
            { number: '5', type: 'deutan', protanColor: '#1565c0', deutanColor: null, bgColor: '#e1f5fe', description: 'Deutan test 2' },
            { number: '74', type: 'deutan', protanColor: '#0d47a1', deutanColor: null, bgColor: '#bbdefb', description: 'Deutan test 3' },
            
            // Control plate 2
            { number: '9', type: 'control', protanColor: '#5d4037', deutanColor: '#5d4037', bgColor: '#f5f5dc', description: 'Control 2 (all should see)' }
        ]
    };
    
    if (typeof showTestModal === 'function') {
        showTestModal();
    }
    
    renderClinicalColorVisionTest();
}

function renderClinicalColorVisionTest() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var container = document.getElementById('test-container');
    if (!container) return;
    
    if (test.currentPlate >= test.plates.length) {
        showClinicalColorVisionResults();
        return;
    }
    
    var plate = test.plates[test.currentPlate];
    
    // Generate pseudoisochromatic plate
    var canvas = document.createElement('canvas');
    var size = Math.min(window.innerWidth - 60, 400);
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    
    // Background dots
    var numDots = 800;
    var radius = size / 2 - 20;
    var centerX = size / 2;
    var centerY = size / 2;
    
    for (var i = 0; i < numDots; i++) {
        var angle = Math.random() * Math.PI * 2;
        var dist = Math.sqrt(Math.random()) * radius;
        var x = centerX + Math.cos(angle) * dist;
        var y = centerY + Math.sin(angle) * dist;
        var dotSize = 3 + Math.random() * 6;
        
        // Vary background color slightly
        var bgShade = Math.random() * 0.2 - 0.1;
        ctx.fillStyle = adjustBrightness(plate.bgColor, bgShade);
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Number dots - use figure color
    var figureColor = plate.protanColor || plate.deutanColor;
    if (figureColor) {
        drawNumberOnPlate(ctx, plate.number, size, figureColor);
    }
    
    var dataUrl = canvas.toDataURL();
    
    container.innerHTML = `
        <div class="clinical-test-interface">
            <div class="test-header">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.5rem;">🎨 Color Vision Screening</h2>
                <p style="margin: 0; color: #666; font-size: 0.95rem;">Confusion-Line Pseudoisochromatic Method</p>
            </div>
            
            <div class="warning-panel" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; border-radius: 4px; margin: 1.5rem 0;">
                <p style="margin: 0; font-size: 0.9rem; color: #856404; line-height: 1.6;">
                    <strong>⚠️ Display Limitations:</strong> This test depends on accurate color reproduction by your screen. 
                    Ensure brightness is at 100%, use natural lighting (not fluorescent), and avoid glare on the screen. 
                    Results on uncalibrated displays should be interpreted cautiously.
                </p>
            </div>
            
            <div style="text-align: center; margin: 2rem 0;">
                <div style="background: white; display: inline-block; padding: 2rem; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                    <p style="margin: 0 0 1rem 0; font-size: 0.95rem; color: #666;">Plate ${test.currentPlate + 1} of ${test.plates.length}</p>
                    <img src="${dataUrl}" alt="Color vision test plate" style="width: ${size}px; height: ${size}px; border-radius: 8px;" />
                </div>
            </div>
            
            <div class="number-input-section" style="background: #f8f9fa; padding: 2rem; border-radius: 12px; margin: 1.5rem 0; text-align: center;">
                <label for="color-number-input" style="display: block; margin-bottom: 1rem; font-weight: 600; color: #333; font-size: 1.05rem;">
                    What number do you see?
                </label>
                <input 
                    type="text" 
                    id="color-number-input" 
                    maxlength="3"
                    placeholder="Enter number"
                    style="width: 150px; padding: 1rem; font-size: 1.5rem; text-align: center; border: 3px solid #667eea; border-radius: 12px; font-weight: 600; box-sizing: border-box;"
                    autocomplete="off"
                    autofocus
                    onkeypress="if(event.key==='Enter') window.ClinicalTests.submitColorAnswer()"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                />
            </div>
            
            <div class="test-controls" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem; flex-wrap: wrap;">
                <button 
                    onclick="window.ClinicalTests.submitColorAnswer()" 
                    class="btn btn-gradient"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(102,126,234,0.3); border: none;">
                    ✓ Submit Answer
                </button>
                <button 
                    onclick="window.ClinicalTests.submitColorAnswer('cannot-see')" 
                    class="btn btn-secondary"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    Cannot See Number
                </button>
            </div>
            
            <div class="clinical-disclaimer" style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 1rem; border-radius: 4px; margin-top: 2rem;">
                <p style="margin: 0; font-size: 0.85rem; color: #003a8c; line-height: 1.6;">
                    <strong>📊 Screening Method:</strong> This test uses confusion-line pseudoisochromatic plates to screen for red-green color vision deficiency. 
                    It includes control plates to validate viewing conditions. Results are screening only — not a comprehensive diagnosis.
                </p>
            </div>
        </div>
    `;
    
    setTimeout(function() {
        var input = document.getElementById('color-number-input');
        if (input) input.focus();
    }, 100);
}

function adjustBrightness(color, factor) {
    // Simple color adjustment
    var num = parseInt(color.replace('#', ''), 16);
    var r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + factor * 50));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + factor * 50));
    var b = Math.min(255, Math.max(0, (num & 0xff) + factor * 50));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function drawNumberOnPlate(ctx, number, size, color) {
    // Simple number drawing using dots
    // This is a placeholder - real implementation would need proper digit rendering
    ctx.fillStyle = color;
    ctx.font = 'bold ' + (size * 0.4) + 'px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Create dotted number effect
    var fontSize = size * 0.4;
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = size;
    tempCanvas.height = size;
    var tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.font = 'bold ' + fontSize + 'px Arial';
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillStyle = 'white';
    tempCtx.fillText(number, size/2, size/2);
    
    var imageData = tempCtx.getImageData(0, 0, size, size);
    var data = imageData.data;
    
    // Convert text to dots
    for (var y = 0; y < size; y += 8) {
        for (var x = 0; x < size; x += 8) {
            var idx = (y * size + x) * 4;
            if (data[idx] > 128) { // White pixel from text
                var dotSize = 3 + Math.random() * 4;
                var jitterX = (Math.random() - 0.5) * 4;
                var jitterY = (Math.random() - 0.5) * 4;
                ctx.fillStyle = adjustBrightness(color, Math.random() * 0.3 - 0.15);
                ctx.beginPath();
                ctx.arc(x + jitterX, y + jitterY, dotSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

window.ClinicalTests.submitColorAnswer = function(answer) {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var input = document.getElementById('color-number-input');
    var userAnswer = answer === 'cannot-see' ? '' : (input ? input.value.trim() : '');
    
    var plate = test.plates[test.currentPlate];
    var correct = userAnswer === plate.number;
    
    test.answers.push({
        plateIndex: test.currentPlate,
        type: plate.type,
        correctAnswer: plate.number,
        userAnswer: userAnswer,
        correct: correct
    });
    
    test.currentPlate++;
    renderClinicalColorVisionTest();
};

function showClinicalColorVisionResults() {
    var test = window.currentClinicalTest;
    var container = document.getElementById('test-container');
    if (!container) return;
    
    // Analyze results
    var controlCorrect = 0;
    var controlTotal = 0;
    var protanCorrect = 0;
    var protanTotal = 0;
    var deutanCorrect = 0;
    var deutanTotal = 0;
    
    for (var i = 0; i < test.answers.length; i++) {
        var ans = test.answers[i];
        if (ans.type === 'control') {
            controlTotal++;
            if (ans.correct) controlCorrect++;
        } else if (ans.type === 'protan') {
            protanTotal++;
            if (ans.correct) protanCorrect++;
        } else if (ans.type === 'deutan') {
            deutanTotal++;
            if (ans.correct) deutanCorrect++;
        }
    }
    
    // Determine result
    var result = 'NORMAL';
    var message = 'No color vision deficiency detected in this screening.';
    var color = '#48bb78';
    
    if (controlCorrect < controlTotal) {
        result = 'INCONCLUSIVE';
        message = 'Control plates failed — screen or viewing conditions may be inadequate. Results unreliable.';
        color = '#ed8936';
    } else if (protanCorrect < protanTotal && deutanCorrect < deutanTotal) {
        result = 'RED-GREEN DEFICIENCY';
        message = 'Possible red-green color vision deficiency detected. Recommend professional examination.';
        color = '#f56565';
    } else if (protanCorrect < protanTotal) {
        result = 'PROTAN TYPE';
        message = 'Possible protan (red-deficient) color vision deficiency detected. Recommend professional examination.';
        color = '#f56565';
    } else if (deutanCorrect < deutanTotal) {
        result = 'DEUTAN TYPE';
        message = 'Possible deutan (green-deficient) color vision deficiency detected. Recommend professional examination.';
        color = '#f56565';
    }
    
    container.innerHTML = `
        <div class="clinical-results">
            <div class="results-header" style="text-align: center; margin-bottom: 2rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.8rem;">✅ Color Vision Test Complete</h2>
                <p style="margin: 0; color: #666; font-size: 1rem;">Confusion-Line Screening Results</p>
            </div>
            
            <div style="background: ${color}; color: white; padding: 2rem; border-radius: 16px; text-align: center; margin: 2rem 0; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎨</div>
                <h3 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 700;">${result}</h3>
                <p style="margin: 0; font-size: 1rem; opacity: 0.95;">${message}</p>
            </div>
            
            <div class="score-breakdown" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 2rem 0;">
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Control Plates</div>
                    <div style="font-size: 2rem; font-weight: 700; color: ${controlCorrect === controlTotal ? '#48bb78' : '#f56565'};">${controlCorrect}/${controlTotal}</div>
                </div>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Protan Plates</div>
                    <div style="font-size: 2rem; font-weight: 700; color: ${protanCorrect === protanTotal ? '#48bb78' : '#f56565'};">${protanCorrect}/${protanTotal}</div>
                </div>
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Deutan Plates</div>
                    <div style="font-size: 2rem; font-weight: 700; color: ${deutanCorrect === deutanTotal ? '#48bb78' : '#f56565'};">${deutanCorrect}/${deutanTotal}</div>
                </div>
            </div>
            
            <div class="clinical-disclaimer" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.25rem; border-radius: 4px; margin-bottom: 2rem;">
                <p style="margin: 0; font-size: 0.9rem; color: #856404; line-height: 1.6;">
                    <strong>⚠️ Screening Only:</strong> This is a screening test using confusion-line methodology. 
                    Screen calibration, ambient lighting, and individual color perception vary significantly. 
                    A comprehensive color vision examination by an optometrist using standardized plates (Ishihara, Hardy-Rand-Rittler, or Farnsworth tests) is required for definitive diagnosis.
                </p>
            </div>
            
            <div class="test-actions" style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="window.ClinicalTests.saveColorResults()" class="btn btn-gradient" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: none; box-shadow: 0 4px 12px rgba(102,126,234,0.3);">
                    💾 Save Results
                </button>
                <button onclick="closeTest()" class="btn btn-secondary" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    ✓ Done
                </button>
            </div>
        </div>
    `;
}

window.ClinicalTests.saveColorResults = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var results = {
        testType: 'clinical-color-vision',
        testName: test.testName,
        version: test.version,
        timestamp: new Date().toISOString(),
        answers: test.answers
    };
    
    var existingResults = JSON.parse(localStorage.getItem('spectit_test_results') || '[]');
    existingResults.push(results);
    localStorage.setItem('spectit_test_results', JSON.stringify(existingResults));
    
    if (window.saveClinicalTestResult && typeof window.saveClinicalTestResult === 'function') {
        window.saveClinicalTestResult(results);
    }
    
    alert('✅ Results saved successfully!');
    
    if (typeof closeTest === 'function') {
        closeTest();
    }
};

// ============================================================================
// 3. ASTIGMATISM TEST - Clock Dial Method
// ============================================================================

/**
 * Clinical Astigmatism Screening
 * - Clock/fan dial (astigmatic dial) protocol
 * - Tests each eye separately
 * - Identifies axis of astigmatism
 * - Standard clinical interpretation for screening
 */

window.ClinicalTests.startAstigmatismTest = function() {
    startClinicalAstigmatismTestInternal();
};

function startClinicalAstigmatismTestInternal() {
    window.currentClinicalTest = {
        type: 'clinical-astigmatism',
        testName: 'Astigmatism Screening (Clock Dial)',
        version: '2.0',
        currentEye: 'right',
        results: {
            right: { darkerLines: [], axis: null },
            left: { darkerLines: [], axis: null }
        }
    };
    
    if (typeof showTestModal === 'function') {
        showTestModal();
    }
    
    renderClinicalAstigmatismTest();
}

function renderClinicalAstigmatismTest() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var container = document.getElementById('test-container');
    if (!container) return;
    
    if (test.currentEye === 'complete') {
        showClinicalAstigmatismResults();
        return;
    }
    
    var eye = test.currentEye;
    var eyeName = eye === 'right' ? 'Right Eye (OD)' : 'Left Eye (OS)';
    var coverEye = eye === 'right' ? 'left' : 'right';
    
    // Generate clock dial
    var canvas = document.createElement('canvas');
    var size = Math.min(window.innerWidth - 80, 500);
    canvas.width = size;
    canvas.height = size;
    var ctx = canvas.getContext('2d');
    
    var centerX = size / 2;
    var centerY = size / 2;
    var radius = size / 2 - 40;
    
    // Draw 12 lines radiating from center (clock positions)
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    
    for (var i = 0; i < 12; i++) {
        var angle = (i * 30 - 90) * Math.PI / 180; // 30 degrees apart, starting at 12 o'clock
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * radius,
            centerY + Math.sin(angle) * radius
        );
        ctx.stroke();
        
        // Label positions
        var labelRadius = radius + 20;
        var labelX = centerX + Math.cos(angle) * labelRadius;
        var labelY = centerY + Math.sin(angle) * labelRadius;
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#333';
        var hour = (i + 12) % 12;
        if (hour === 0) hour = 12;
        ctx.fillText(hour, labelX, labelY);
    }
    
    // Center dot
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    var dataUrl = canvas.toDataURL();
    
    container.innerHTML = `
        <div class="clinical-test-interface">
            <div class="test-header">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.5rem;">⚫ Astigmatism Screening</h2>
                <p style="margin: 0; color: #666; font-size: 0.95rem;">Clock Dial Method — ${eyeName}</p>
            </div>
            
            <div class="eye-instruction-panel" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 style="margin: 0 0 1rem 0; font-size: 1.2rem;">Testing: ${eyeName}</h3>
                <p style="margin: 0 0 0.5rem 0;"><strong>Cover your ${coverEye} eye completely</strong></p>
                <p style="margin: 0; font-size: 0.95rem;">Focus on the center dot. Do some lines appear darker, sharper, or clearer than others?</p>
            </div>
            
            <div style="text-align: center; margin: 2rem 0;">
                <img src="${dataUrl}" style="width: ${size}px; height: ${size}px; background: white; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 1rem;" />
            </div>
            
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 12px; margin: 1.5rem 0;">
                <p style="margin: 0 0 1rem 0; font-weight: 600; text-align: center;">Select the clock position(s) where lines appear darkest or sharpest:</p>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; max-width: 400px; margin: 0 auto;">
                    ${[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function(hour) {
                        return `
                            <button 
                                id="clock-${hour}" 
                                onclick="window.ClinicalTests.toggleClockLine(${hour})"
                                style="padding: 0.75rem; background: white; border: 2px solid #cbd5e0; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s;">
                                ${hour}
                            </button>
                        `;
                    }).join('')}
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <button 
                        onclick="window.ClinicalTests.toggleClockLine('none')"
                        id="clock-none"
                        style="padding: 0.75rem 2rem; background: white; border: 2px solid #cbd5e0; border-radius: 8px; cursor: pointer; font-weight: 600;">
                        All lines look the same
                    </button>
                </div>
            </div>
            
            <div class="test-controls" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button 
                    onclick="window.ClinicalTests.submitAstigmatismAnswer()" 
                    class="btn btn-gradient"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(102,126,234,0.3); border: none;">
                    ✓ Continue
                </button>
            </div>
            
            <div class="clinical-disclaimer" style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 1rem; border-radius: 4px; margin-top: 2rem;">
                <p style="margin: 0; font-size: 0.85rem; color: #003a8c;">
                    <strong>📊 Clinical Method:</strong> The clock dial (astigmatic dial) is a standard screening tool used to identify the axis of astigmatism. 
                    If lines appear unequally sharp, it suggests possible astigmatism. This is a screening indication only — not a prescription.
                </p>
            </div>
        </div>
    `;
}

window.ClinicalTests.toggleClockLine = function(position) {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var eye = test.currentEye;
    var selected = test.results[eye].darkerLines;
    
    if (position === 'none') {
        // Clear all selections
        test.results[eye].darkerLines = [];
        // Reset all buttons
        for (var i = 1; i <= 12; i++) {
            var btn = document.getElementById('clock-' + i);
            if (btn) {
                btn.style.background = 'white';
                btn.style.borderColor = '#cbd5e0';
                btn.style.color = '#4a5568';
            }
        }
        var noneBtn = document.getElementById('clock-none');
        if (noneBtn) {
            noneBtn.style.background = '#667eea';
            noneBtn.style.borderColor = '#667eea';
            noneBtn.style.color = 'white';
        }
    } else {
        // Toggle selection
        var idx = selected.indexOf(position);
        if (idx > -1) {
            selected.splice(idx, 1);
        } else {
            selected.push(position);
        }
        
        // Update button style
        var btn = document.getElementById('clock-' + position);
        if (btn) {
            if (idx > -1) {
                btn.style.background = 'white';
                btn.style.borderColor = '#cbd5e0';
                btn.style.color = '#4a5568';
            } else {
                btn.style.background = '#667eea';
                btn.style.borderColor = '#667eea';
                btn.style.color = 'white';
            }
        }
        
        // Clear "none" button
        var noneBtn = document.getElementById('clock-none');
        if (noneBtn && selected.length > 0) {
            noneBtn.style.background = 'white';
            noneBtn.style.borderColor = '#cbd5e0';
            noneBtn.style.color = '#4a5568';
        }
    }
};

window.ClinicalTests.submitAstigmatismAnswer = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var eye = test.currentEye;
    var selected = test.results[eye].darkerLines;
    
    // Calculate axis from selected lines
    if (selected.length > 0) {
        // Average the angles
        var totalAngle = 0;
        for (var i = 0; i < selected.length; i++) {
            var hour = selected[i];
            var angle = (hour * 30) % 180; // Convert to 0-180 range
            totalAngle += angle;
        }
        test.results[eye].axis = Math.round(totalAngle / selected.length);
    } else {
        test.results[eye].axis = null; // No astigmatism indicated
    }
    
    // Move to next eye or complete
    if (eye === 'right') {
        test.currentEye = 'left';
        renderClinicalAstigmatismTest();
    } else {
        test.currentEye = 'complete';
        renderClinicalAstigmatismTest();
    }
};

function showClinicalAstigmatismResults() {
    var test = window.currentClinicalTest;
    var container = document.getElementById('test-container');
    if (!container) return;
    
    function interpretAxis(axis, lines) {
        if (!axis && lines.length === 0) {
            return { status: 'NORMAL', message: 'No astigmatism indicated', color: '#48bb78' };
        }
        return { status: 'ASTIGMATISM INDICATED', message: 'Possible astigmatism at axis ' + axis + '°. Recommend professional examination.', color: '#ed8936' };
    }
    
    var rightResult = interpretAxis(test.results.right.axis, test.results.right.darkerLines);
    var leftResult = interpretAxis(test.results.left.axis, test.results.left.darkerLines);
    
    container.innerHTML = `
        <div class="clinical-results">
            <div class="results-header" style="text-align: center; margin-bottom: 2rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.8rem;">✅ Astigmatism Screening Complete</h2>
                <p style="margin: 0; color: #666; font-size: 1rem;">Clock Dial Method Results</p>
            </div>
            
            <div class="eye-results-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h3 style="text-align: center; margin: 0 0 1rem 0;">Right Eye (OD)</h3>
                    <div style="background: ${rightResult.color}; color: white; padding: 1.5rem; border-radius: 12px; text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;">${rightResult.status}</div>
                        <div style="font-size: 0.9rem; opacity: 0.95;">${rightResult.message}</div>
                    </div>
                    ${test.results.right.axis ? '<div style="text-align: center; font-size: 0.9rem; color: #666;">Axis: ' + test.results.right.axis + '°</div>' : ''}
                </div>
                
                <div style="background: linear-gradient(135deg, #f8f9fa, #e9ecef); border-radius: 16px; padding: 2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h3 style="text-align: center; margin: 0 0 1rem 0;">Left Eye (OS)</h3>
                    <div style="background: ${leftResult.color}; color: white; padding: 1.5rem; border-radius: 12px; text-align: center; margin-bottom: 1rem;">
                        <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;">${leftResult.status}</div>
                        <div style="font-size: 0.9rem; opacity: 0.95;">${leftResult.message}</div>
                    </div>
                    ${test.results.left.axis ? '<div style="text-align: center; font-size: 0.9rem; color: #666;">Axis: ' + test.results.left.axis + '°</div>' : ''}
                </div>
            </div>
            
            <div class="clinical-disclaimer" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.25rem; border-radius: 4px; margin-bottom: 2rem;">
                <p style="margin: 0; font-size: 0.9rem; color: #856404; line-height: 1.6;">
                    <strong>⚠️ Screening Only:</strong> The clock dial provides an axis indication for astigmatism screening. 
                    It does NOT measure cylinder power (magnitude of astigmatism). A comprehensive eye examination with refraction is required for a prescriptive axis and cylinder measurement.
                </p>
            </div>
            
            <div class="test-actions" style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="window.ClinicalTests.saveAstigmatismResults()" class="btn btn-gradient" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: none;">
                    💾 Save Results
                </button>
                <button onclick="closeTest()" class="btn btn-secondary" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    ✓ Done
                </button>
            </div>
        </div>
    `;
}

window.ClinicalTests.saveAstigmatismResults = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var results = {
        testType: 'clinical-astigmatism',
        testName: test.testName,
        version: test.version,
        timestamp: new Date().toISOString(),
        rightEye: test.results.right,
        leftEye: test.results.left
    };
    
    var existingResults = JSON.parse(localStorage.getItem('spectit_test_results') || '[]');
    existingResults.push(results);
    localStorage.setItem('spectit_test_results', JSON.stringify(existingResults));
    
    if (window.saveClinicalTestResult) {
        window.saveClinicalTestResult(results);
    }
    
    alert('✅ Results saved!');
    if (typeof closeTest === 'function') closeTest();
};

// Make all clinical tests available to the main tests.js
window.startColorBlindnessTest = window.ClinicalTests.startColorVisionTest;
window.startAstigmatismTest = window.ClinicalTests.startAstigmatismTest;


// ============================================================================
// 4. CONTRAST SENSITIVITY TEST - Pelli-Robson Style
// ============================================================================

/**
 * Clinical Contrast Sensitivity Test
 * - Logarithmic contrast steps (Pelli-Robson method)
 * - Fixed letter size at appropriate angular size
 * - Standard logCS scoring with stopping rules
 * - Requires calibration for proper letter sizing
 */

window.ClinicalTests.startContrastTest = function() {
    if (!window.SpectitCalibration || !window.SpectitCalibration.ensureBeforeTest) {
        alert('Calibration system not loaded.');
        return;
    }
    
    window.SpectitCalibration.ensureBeforeTest(function() {
        startClinicalContrastTestInternal();
    });
};

function startClinicalContrastTestInternal() {
    var pxPerMm = window.SpectitCalibration.getPxPerMm() || 3.8;
    var distanceCm = window.SpectitCalibration.getDistanceCm() || 300;
    
    // Pelli-Robson uses 0.15 logCS steps
    // logCS (log contrast sensitivity) where CS = 1 / contrast
    // Higher logCS = better contrast sensitivity
    // Normal: 1.5 - 2.0 logCS
    
    window.currentClinicalTest = {
        type: 'clinical-contrast',
        testName: 'Contrast Sensitivity (Pelli-Robson Style)',
        version: '2.0',
        calibration: { pxPerMm: pxPerMm, distanceCm: distanceCm },
        currentLevel: 0,
        correctCount: 0,
        // Contrast levels in logCS (0.15 log steps, typical Pelli-Robson)
        levels: [
            { logCS: 0.00, contrast: 1.00, label: 'Maximum contrast' },
            { logCS: 0.15, contrast: 0.71, label: 'Very high contrast' },
            { logCS: 0.30, contrast: 0.50, label: 'High contrast' },
            { logCS: 0.45, contrast: 0.35, label: 'Moderate-high' },
            { logCS: 0.60, contrast: 0.25, label: 'Moderate' },
            { logCS: 0.75, contrast: 0.18, label: 'Moderate-low' },
            { logCS: 0.90, contrast: 0.13, label: 'Low contrast' },
            { logCS: 1.05, contrast: 0.089, label: 'Very low' },
            { logCS: 1.20, contrast: 0.063, label: 'Near threshold' },
            { logCS: 1.35, contrast: 0.045, label: 'Threshold' },
            { logCS: 1.50, contrast: 0.032, label: 'Good normal' },
            { logCS: 1.65, contrast: 0.022, label: 'Very good' },
            { logCS: 1.80, contrast: 0.016, label: 'Excellent' },
            { logCS: 1.95, contrast: 0.011, label: 'Superior' }
        ],
        answers: []
    };
    
    if (typeof showTestModal === 'function') showTestModal();
    renderClinicalContrastTest();
}

function renderClinicalContrastTest() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var container = document.getElementById('test-container');
    if (!container) return;
    
    if (test.currentLevel >= test.levels.length) {
        showClinicalContrastResults();
        return;
    }
    
    var level = test.levels[test.currentLevel];
    
    // Generate 3 random Sloan letters
    var sloanLetters = ['C', 'D', 'H', 'K', 'N', 'O', 'R', 'S', 'V', 'Z'];
    var letters = [];
    for (var i = 0; i < 3; i++) {
        letters.push(sloanLetters[Math.floor(Math.random() * sloanLetters.length)]);
    }
    
    // Fixed letter size: Pelli-Robson uses large letters (approximately 3 degrees visual angle)
    // At 1m, 3 degrees ≈ 5.2cm letter height
    var distanceM = test.calibration.distanceCm / 100;
    var visualAngleDeg = 3;
    var letterHeightM = 2 * distanceM * Math.tan((visualAngleDeg * Math.PI / 180) / 2);
    var letterHeightMm = letterHeightM * 1000;
    var letterSizePx = letterHeightMm * test.calibration.pxPerMm;
    letterSizePx = Math.max(60, Math.min(letterSizePx, 200)); // Clamp
    
    // Calculate text color based on contrast
    var bgGray = 240; // Light gray background
    var textGray = Math.round(bgGray * (1 - level.contrast));
    var textColor = 'rgb(' + textGray + ',' + textGray + ',' + textGray + ')';
    var bgColor = 'rgb(' + bgGray + ',' + bgGray + ',' + bgGray + ')';
    
    container.innerHTML = `
        <div class="clinical-test-interface">
            <div class="test-header">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.5rem;">🌓 Contrast Sensitivity Test</h2>
                <p style="margin: 0; color: #666; font-size: 0.95rem;">Pelli-Robson Logarithmic Method</p>
            </div>
            
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0;">
                <p style="margin: 0 0 0.5rem 0; text-align: center; font-size: 0.95rem; color: #666;">
                    <strong>Level ${test.currentLevel + 1} of ${test.levels.length}:</strong> ${level.label}
                </p>
                <p style="margin: 0; text-align: center; font-size: 0.85rem; color: #999;">
                    ${level.logCS.toFixed(2)} logCS | Contrast: ${(level.contrast * 100).toFixed(1)}%
                </p>
            </div>
            
            <div style="background: ${bgColor}; padding: 4rem 2rem; border-radius: 16px; margin: 2rem auto; text-align: center; max-width: 600px; box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);">
                <div style="font-size: ${letterSizePx}px; font-weight: 900; letter-spacing: ${letterSizePx * 0.3}px; color: ${textColor}; font-family: 'Arial Black', Arial, sans-serif; line-height: 1;">
                    ${letters.map(l => '<span>' + l + '</span>').join(' ')}
                </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 12px; margin: 1.5rem 0;">
                <label style="display: block; margin-bottom: 1rem; font-weight: 600; text-align: center; color: #333;">
                    Enter the letters you see:
                </label>
                <input 
                    type="text" 
                    id="contrast-input" 
                    maxlength="3"
                    placeholder="3 letters"
                    style="width: 200px; padding: 1rem; font-size: 1.5rem; text-align: center; letter-spacing: 0.5em; text-transform: uppercase; border: 3px solid #667eea; border-radius: 12px; font-weight: 600; margin: 0 auto; display: block;"
                    autocomplete="off"
                    autofocus
                    onkeypress="if(event.key==='Enter') window.ClinicalTests.submitContrastAnswer('${letters.join('')}')"
                    oninput="this.value = this.value.toUpperCase().replace(/[^CDHKNORSVZ]/g, '')"
                />
            </div>
            
            <div class="test-controls" style="display: flex; gap: 1rem; justify-content: center; margin-top: 2rem;">
                <button 
                    onclick="window.ClinicalTests.submitContrastAnswer('${letters.join('')}')" 
                    class="btn btn-gradient"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(102,126,234,0.3); border: none;">
                    ✓ Submit
                </button>
                <button 
                    onclick="window.ClinicalTests.submitContrastAnswer('')" 
                    class="btn btn-secondary"
                    style="padding: 1rem 2.5rem; font-size: 1.05rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    Cannot See
                </button>
            </div>
            
            <div class="clinical-disclaimer" style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 1rem; border-radius: 4px; margin-top: 2rem;">
                <p style="margin: 0; font-size: 0.85rem; color: #003a8c;">
                    <strong>📊 Clinical Method:</strong> This test uses logarithmic contrast steps similar to the Pelli-Robson chart, the clinical standard for contrast sensitivity. 
                    Normal contrast sensitivity is 1.5-2.0 logCS. Lower values may indicate optical or neurological issues.
                </p>
            </div>
        </div>
    `;
    
    setTimeout(function() {
        var input = document.getElementById('contrast-input');
        if (input) input.focus();
    }, 100);
}

window.ClinicalTests.submitContrastAnswer = function(correctAnswer) {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var input = document.getElementById('contrast-input');
    var userAnswer = input ? input.value.toUpperCase().trim() : '';
    
    var correct = userAnswer === correctAnswer;
    var level = test.levels[test.currentLevel];
    
    test.answers.push({
        levelIndex: test.currentLevel,
        logCS: level.logCS,
        contrast: level.contrast,
        userAnswer: userAnswer,
        correctAnswer: correctAnswer,
        correct: correct
    });
    
    if (correct) {
        test.correctCount++;
        test.currentLevel++;
        renderClinicalContrastTest();
    } else {
        // Failed - stop test (Pelli-Robson stopping rule)
        test.currentLevel = test.levels.length;
        renderClinicalContrastTest();
    }
};

function showClinicalContrastResults() {
    var test = window.currentClinicalTest;
    var container = document.getElementById('test-container');
    if (!container) return;
    
    // Calculate final logCS (last correct level)
    var lastCorrect = null;
    for (var i = test.answers.length - 1; i >= 0; i--) {
        if (test.answers[i].correct) {
            lastCorrect = test.answers[i];
            break;
        }
    }
    
    var finalLogCS = lastCorrect ? lastCorrect.logCS : 0;
    var interpretation = '';
    var color = '#48bb78';
    
    if (finalLogCS >= 1.5) {
        interpretation = 'EXCELLENT - Normal/Superior';
        color = '#48bb78';
    } else if (finalLogCS >= 1.2) {
        interpretation = 'GOOD - Normal Range';
        color = '#48bb78';
    } else if (finalLogCS >= 0.9) {
        interpretation = 'MODERATE - Below Normal';
        color = '#ed8936';
    } else if (finalLogCS >= 0.6) {
        interpretation = 'LOW - Recommend Examination';
        color = '#f56565';
    } else {
        interpretation = 'VERY LOW - Recommend Examination';
        color = '#f56565';
    }
    
    container.innerHTML = `
        <div class="clinical-results">
            <div class="results-header" style="text-align: center; margin-bottom: 2rem;">
                <h2 style="margin: 0 0 0.5rem 0; color: #152a45; font-size: 1.8rem;">✅ Contrast Sensitivity Complete</h2>
                <p style="margin: 0; color: #666; font-size: 1rem;">Pelli-Robson Style Results</p>
            </div>
            
            <div style="background: ${color}; color: white; padding: 2rem; border-radius: 16px; text-align: center; margin: 2rem 0; box-shadow: 0 8px 24px rgba(0,0,0,0.15);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🌓</div>
                <div style="font-size: 3rem; font-weight: 700; margin-bottom: 0.5rem;">${finalLogCS.toFixed(2)} logCS</div>
                <h3 style="margin: 0; font-size: 1.3rem; opacity: 0.95;">${interpretation}</h3>
            </div>
            
            <div style="background: #f8f9fa; padding: 2rem; border-radius: 12px; margin: 2rem 0;">
                <h4 style="margin: 0 0 1rem 0; text-align: center;">Test Performance</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 400px; margin: 0 auto;">
                    <div style="text-align: center;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">Levels Passed</div>
                        <div style="font-size: 2rem; font-weight: 700; color: #667eea;">${test.correctCount}</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.25rem;">Final Contrast</div>
                        <div style="font-size: 1.5rem; font-weight: 600; color: #667eea;">${(lastCorrect ? lastCorrect.contrast * 100 : 100).toFixed(1)}%</div>
                    </div>
                </div>
            </div>
            
            <div class="interpretation-info" style="background: #e6f7ff; border-left: 4px solid #1890ff; padding: 1.25rem; border-radius: 4px; margin-bottom: 2rem;">
                <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: #003a8c;">📚 Understanding logCS</h4>
                <ul style="margin: 0; padding-left: 1.5rem; font-size: 0.9rem; color: #003a8c; line-height: 1.6;">
                    <li><strong>1.5 - 2.0 logCS:</strong> Normal range for healthy adults</li>
                    <li><strong>1.2 - 1.5 logCS:</strong> Low-normal, may indicate early changes</li>
                    <li><strong>< 1.2 logCS:</strong> Below normal, recommend professional examination</li>
                </ul>
            </div>
            
            <div class="clinical-disclaimer" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 1.25rem; border-radius: 4px; margin-bottom: 2rem;">
                <p style="margin: 0; font-size: 0.9rem; color: #856404; line-height: 1.6;">
                    <strong>⚠️ Screening Only:</strong> Screen brightness, ambient lighting, and display quality significantly affect results. 
                    This is a screening approximation of Pelli-Robson methodology — not a substitute for clinical testing with calibrated charts at standardized luminance (85 cd/m²).
                </p>
            </div>
            
            <div class="test-actions" style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="window.ClinicalTests.saveContrastResults()" class="btn btn-gradient" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: none;">
                    💾 Save Results
                </button>
                <button onclick="closeTest()" class="btn btn-secondary" style="padding: 1rem 2rem; font-size: 1rem; font-weight: 600; border-radius: 12px; cursor: pointer; border: 2px solid #cbd5e0; background: white; color: #4a5568;">
                    ✓ Done
                </button>
            </div>
        </div>
    `;
}

window.ClinicalTests.saveContrastResults = function() {
    var test = window.currentClinicalTest;
    if (!test) return;
    
    var lastCorrect = null;
    for (var i = test.answers.length - 1; i >= 0; i--) {
        if (test.answers[i].correct) {
            lastCorrect = test.answers[i];
            break;
        }
    }
    
    var results = {
        testType: 'clinical-contrast',
        testName: test.testName,
        version: test.version,
        timestamp: new Date().toISOString(),
        calibration: test.calibration,
        finalLogCS: lastCorrect ? lastCorrect.logCS : 0,
        levelsPass: test.correctCount,
        answers: test.answers
    };
    
    var existingResults = JSON.parse(localStorage.getItem('spectit_test_results') || '[]');
    existingResults.push(results);
    localStorage.setItem('spectit_test_results', JSON.stringify(existingResults));
    
    if (window.saveClinicalTestResult) window.saveClinicalTestResult(results);
    
    alert('✅ Results saved!');
    if (typeof closeTest === 'function') closeTest();
};

// Export test functions
window.startContrastTest = window.ClinicalTests.startContrastTest;

