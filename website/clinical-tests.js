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
