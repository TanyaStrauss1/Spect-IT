/* ==========================================================================
 * Spect-IT — Subjective Refraction Estimator
 * --------------------------------------------------------------------------
 * Re-bases the "Prescription" screening on genuine subjective refraction:
 *   - Sphere  <- uncorrected distance visual acuity, refined by duochrome
 *   - Cylinder/Axis <- astigmatism dial result
 *   - Validity <- screen-scale calibration (credit card) + viewing distance
 *
 * This deliberately REPLACES the old face-geometry heuristic, which inferred
 * diopters from eyelid/eye-opening shape (no physical basis).
 *
 * IMPORTANT: This is a screening estimate, not a dispensable prescription.
 * The VA->sphere mapping is a population approximation (best for myopia);
 * hyperopia is often masked by accommodation. Always disclaim.
 * ========================================================================== */
(function () {
  'use strict';

  var PX_PER_MM_KEY = 'spectit_px_per_mm';
  var DISTANCE_KEY = 'spectit_view_distance_cm';
  var ID1_CARD_WIDTH_MM = 85.6; // ISO/IEC 7810 ID-1 (credit card) width

  /* ------------------------------------------------------------------ utils */
  function readHistory() {
    try { return JSON.parse(localStorage.getItem('testHistory') || '[]'); }
    catch (e) { return []; }
  }
  function latestOfType(type, eye) {
    var hist = readHistory();
    var match = null;
    for (var i = 0; i < hist.length; i++) {
      var r = hist[i];
      if (!r || r.type !== type) continue;
      if (eye && r.eye && r.eye !== eye && r.eye !== 'both') continue;
      if (!match || new Date(r.date) > new Date(match.date)) match = r;
    }
    return match;
  }
  function getPxPerMm() {
    var v = parseFloat(localStorage.getItem(PX_PER_MM_KEY));
    return (Number.isFinite(v) && v > 0) ? v : null;
  }
  function setPxPerMm(v) { if (Number.isFinite(v) && v > 0) localStorage.setItem(PX_PER_MM_KEY, String(v)); }
  function getDistanceCm() {
    var v = parseFloat(localStorage.getItem(DISTANCE_KEY));
    return (Number.isFinite(v) && v > 0) ? v : null;
  }
  function setDistanceCm(v) { if (Number.isFinite(v) && v > 0) localStorage.setItem(DISTANCE_KEY, String(v)); }

  var FARPOINT_KEY = 'spectit_farpoint';
  function readFarPoints() {
    try { return JSON.parse(localStorage.getItem(FARPOINT_KEY) || '{}') || {}; }
    catch (e) { return {}; }
  }
  function getFarPoint(eye) {
    var fp = readFarPoints();
    return fp[eye || 'both'] || null;
  }
  function setFarPoint(eye, obj) {
    var fp = readFarPoints();
    fp[eye || 'both'] = obj;
    localStorage.setItem(FARPOINT_KEY, JSON.stringify(fp));
  }

  function liveLidarDistanceCm() {
    try {
      if (window.lidarEngine) {
        var m = window.lidarEngine.currentDistance || (window.lidarEngine.getAverageDistance && window.lidarEngine.getAverageDistance());
        if (Number.isFinite(m) && m > 0) return m * 100;
      }
    } catch (e) {}
    return null;
  }

  /* -------------------------------------------------- refraction estimation */
  // Uncorrected distance VA (logMAR) -> approximate spherical equivalent (D),
  // myopic assumption. Anchored to published uncorrected-VA / ametropia trends.
  var VA_SE_TABLE = [
    [0.0, 0.00],  // 20/20
    [0.1, -0.25], // 20/25
    [0.2, -0.50], // 20/32
    [0.3, -0.75], // 20/40
    [0.4, -1.00], // 20/50
    [0.5, -1.25], // 20/63
    [0.6, -1.75], // 20/80
    [0.7, -2.00], // 20/100
    [0.8, -2.50], // 20/125
    [0.9, -3.00], // 20/160
    [1.0, -3.50]  // 20/200
  ];

  function logMARFromDecimal(decimalAcuity) {
    if (!Number.isFinite(decimalAcuity) || decimalAcuity <= 0) return null;
    return -Math.log10(decimalAcuity);
  }

  function seFromLogMAR(logMAR) {
    if (logMAR == null) return null;
    if (logMAR <= 0) return 0;
    var t = VA_SE_TABLE;
    if (logMAR >= t[t.length - 1][0]) {
      // Extrapolate gently beyond the table, capped.
      var last = t[t.length - 1];
      var extra = (logMAR - last[0]) * -2.5; // ~ -0.25D per 0.1 logMAR
      return Math.max(-8, last[1] + extra);
    }
    for (var i = 1; i < t.length; i++) {
      if (logMAR <= t[i][0]) {
        var a = t[i - 1], b = t[i];
        var frac = (logMAR - a[0]) / (b[0] - a[0]);
        return a[1] + frac * (b[1] - a[1]);
      }
    }
    return 0;
  }

  // Duochrome refines the sphere endpoint by ~0.25 D and can reveal masked
  // hyperopia when distance VA is good.
  function applyDuochrome(se, duochromeText, logMAR) {
    if (!duochromeText) return { se: se, note: 'no duochrome data' };
    var t = duochromeText.toLowerCase();
    var goodVA = (logMAR != null && logMAR <= 0.1);
    if (t.indexOf('red clearer') !== -1 || t.indexOf('red ') === 0) {
      // Residual myopia -> a touch more minus
      if (goodVA && se >= 0) return { se: -0.25, note: 'red clearer (mild myopic tendency)' };
      return { se: se - 0.25, note: 'red clearer (more minus)' };
    }
    if (t.indexOf('green clearer') !== -1) {
      // Over-minus / latent hyperopia -> more plus (esp. if VA already good)
      if (goodVA) return { se: Math.max(se, 0) + 0.25, note: 'green clearer (hyperopic tendency)' };
      return { se: se + 0.25, note: 'green clearer (more plus)' };
    }
    return { se: se, note: 'balanced' };
  }

  function round25(x) { return Math.round(x * 4) / 4; }
  function fmtD(x) {
    var v = round25(x);
    var s = (v > 0 ? '+' : (v < 0 ? '\u2212' : '')) + Math.abs(v).toFixed(2);
    return s;
  }

  // Far point (cm) -> myopic spherical equivalent (D). 1/farpoint(m) = myopia.
  function seFromFarPoint(cm) {
    if (!Number.isFinite(cm) || cm <= 0) return null;
    return round25(-100 / cm); // negative diopters
  }

  // Compose an estimate for one eye (or binocular) from available results.
  function estimateForEye(eye) {
    var va = latestOfType('visual-acuity', eye);
    var duo = latestOfType('duochrome');
    var ast = latestOfType('astigmatism');
    var fp = getFarPoint(eye) || getFarPoint('both');
    var fpValid = fp && Number.isFinite(fp.cm) && fp.cm > 0 && !fp.beyondReach;

    if (!va && !fpValid) return null;

    var logMAR = va ? logMARFromDecimal(va.decimalAcuity) : null;

    // Sphere source: prefer the objective far-point measurement when present.
    var method = 'acuity';
    var se;
    if (fpValid) {
      se = seFromFarPoint(fp.cm);
      method = 'far-point';
    } else {
      se = seFromLogMAR(logMAR);
    }

    var duoAdj = applyDuochrome(se, duo && duo.result, logMAR);
    se = duoAdj.se;
    se = Math.max(-8, Math.min(4, se));

    var cyl = 0, axis = null;
    if (ast) {
      var c = parseFloat(String(ast.cylinderEstimate));
      if (Number.isFinite(c)) cyl = c;
      if (ast.axis != null && Number.isFinite(parseFloat(ast.axis))) axis = Math.round(parseFloat(ast.axis));
    }
    cyl = Math.max(0, Math.min(4, cyl));

    // Minus-cylinder convention; sphere derived from spherical equivalent.
    var cylinderSigned = -round25(cyl);
    var sphere = round25(se - cylinderSigned / 2); // sphere = SE - cyl/2

    // Confidence
    var conf = 0.5;
    if (getPxPerMm()) conf += 0.15;
    if (getDistanceCm() || liveLidarDistanceCm()) conf += 0.15;
    if (duo) conf += 0.1;
    if (ast) conf += 0.05;
    if (logMAR != null && logMAR <= 0.7) conf += 0.05; // model more reliable for mild-moderate
    if (method === 'far-point') conf += 0.1; // objective far-point is more reliable than VA table
    conf = Math.min(0.95, conf);

    return {
      eye: eye || (va && va.eye) || 'both',
      sphere: round25(sphere),
      cylinder: cylinderSigned,
      axis: (cyl >= 0.25 && axis != null) ? axis : null,
      sphericalEquivalent: round25(se),
      method: method,
      farPointCm: fpValid ? fp.cm : null,
      va: va ? (va.usNotation || (va.decimalAcuity ? ('~' + va.decimalAcuity) : 'n/a')) : 'n/a',
      logMAR: logMAR != null ? logMAR.toFixed(2) : 'n/a',
      duochrome: duoAdj.note,
      confidence: conf,
      sources: {
        acuity: !!va, duochrome: !!duo, astigmatism: !!ast, farPoint: fpValid,
        acuityEye: (va && va.eye) || 'both', acuityDate: va && va.date
      }
    };
  }

  function missingTests() {
    var missing = [];
    if (!latestOfType('visual-acuity')) missing.push({ key: 'visual-acuity', label: 'Visual Acuity', fn: 'startVisualAcuityTest' });
    if (!latestOfType('duochrome')) missing.push({ key: 'duochrome', label: 'Duochrome (Red-Green)', fn: 'startDuochromeTest' });
    if (!latestOfType('astigmatism')) missing.push({ key: 'astigmatism', label: 'Astigmatism Dial', fn: 'startAstigmatismTest' });
    return missing;
  }

  /* ----------------------------------------------------------------- render */
  function el() { return document.getElementById('test-container'); }

  function start() {
    if (typeof showTestModal === 'function') showTestModal();
    if (typeof currentTest !== 'undefined') { try { window.currentTest = { type: 'prescription' }; } catch (e) {} }
    renderIntro();
  }

  function renderIntro() {
    var c = el(); if (!c) return;
    c.innerHTML =
      '<div class="test-interface">' +
        '<h2 class="test-title">Refractive Screening (Prescription Estimate)</h2>' +
        '<div class="test-instructions">' +
          '<p><strong>How this works</strong></p>' +
          '<p>This estimate is built from your <strong>subjective vision tests</strong> — the same principle an optometrist uses with a trial lens set:</p>' +
          '<p>• <strong>Sphere</strong> from your distance visual acuity, refined by the duochrome (red/green) test<br>' +
          '• <strong>Cylinder &amp; axis</strong> from the astigmatism dial<br>' +
          '• <strong>Calibration</strong> (screen size + viewing distance) so the tests were shown at the correct size</p>' +
          '<p style="color:#b45309;margin-top:1rem;"><strong>Screening only.</strong> This is not a dispensable prescription. Online refraction is regulated — always confirm with a licensed eye-care professional.</p>' +
        '</div>' +
        '<div class="test-display" style="min-height:auto;padding:1.5rem;">' +
          '<div style="text-align:center;">' +
            '<button class="btn btn-primary" onclick="SpectitRx.calibrate()">Start: Calibrate &amp; Estimate</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderCalibration() {
    var c = el(); if (!c) return;
    var pxmm = getPxPerMm();
    var initCardPx = pxmm ? Math.round(pxmm * ID1_CARD_WIDTH_MM) : Math.round(3.78 * ID1_CARD_WIDTH_MM);
    var lidar = liveLidarDistanceCm();
    var savedDist = getDistanceCm();
    var vaResult = latestOfType('visual-acuity');
    var vaDistCm = vaResult && vaResult.testDistance ? Math.round(vaResult.testDistance * 100) : null;
    var defaultDist = (lidar ? Math.round(lidar) : (savedDist || vaDistCm || 40));

    c.innerHTML =
      '<div class="test-interface">' +
        '<h2 class="test-title">Step 1 — Calibrate</h2>' +
        '<div class="test-instructions">' +
          '<p><strong>A) Screen scale (credit-card method)</strong></p>' +
          '<p>Hold any bank/ID card flat against the screen and drag the slider until the on-screen box exactly matches the card width.</p>' +
        '</div>' +
        '<div class="test-display" style="flex-direction:column;gap:1rem;min-height:auto;padding:1.5rem;">' +
          '<div id="rx-card" style="height:54px;width:' + initCardPx + 'px;border-radius:10px;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 6px 18px rgba(79,70,229,.35);display:flex;align-items:center;justify-content:flex-end;color:#fff;font-weight:700;padding-right:10px;font-size:.8rem;">85.6 mm</div>' +
          '<input type="range" min="' + Math.round(2.0 * ID1_CARD_WIDTH_MM) + '" max="' + Math.round(6.0 * ID1_CARD_WIDTH_MM) + '" value="' + initCardPx + '" ' +
            'oninput="SpectitRx.onCard(this.value)" style="width:100%;max-width:520px;">' +
          '<p id="rx-card-readout" style="font-size:.9rem;color:#64748b;">Screen scale: ' + (initCardPx / ID1_CARD_WIDTH_MM).toFixed(2) + ' px/mm</p>' +
          '<hr style="width:100%;border:none;border-top:1px solid #e6e8f0;">' +
          '<div style="width:100%;max-width:520px;text-align:left;">' +
            '<p style="font-weight:700;margin-bottom:.5rem;">B) Viewing distance</p>' +
            (lidar ? '<p style="color:#059669;font-size:.9rem;margin-bottom:.5rem;">Depth sensor detected: ~' + Math.round(lidar) + ' cm (live)</p>' : '') +
            '<label style="font-size:.9rem;color:#475569;">Distance from eyes to screen (cm):</label>' +
            '<input type="number" id="rx-distance" value="' + defaultDist + '" min="20" max="300" ' +
              'style="width:120px;margin-left:.5rem;padding:.4rem .6rem;border:1.5px solid #e6e8f0;border-radius:8px;">' +
          '</div>' +
        '</div>' +
        '<div class="test-controls">' +
          '<button class="btn btn-incorrect" onclick="SpectitRx.intro()">Back</button>' +
          '<button class="btn btn-next" onclick="SpectitRx.saveCalibration()">Continue</button>' +
        '</div>' +
      '</div>';
  }

  function onCard(px) {
    var card = document.getElementById('rx-card');
    var out = document.getElementById('rx-card-readout');
    if (card) card.style.width = px + 'px';
    if (out) out.textContent = 'Screen scale: ' + (parseFloat(px) / ID1_CARD_WIDTH_MM).toFixed(2) + ' px/mm';
  }

  function saveCalibration() {
    var card = document.getElementById('rx-card');
    if (card) {
      var px = parseFloat(card.style.width);
      if (Number.isFinite(px) && px > 0) setPxPerMm(px / ID1_CARD_WIDTH_MM);
    }
    var distInput = document.getElementById('rx-distance');
    if (distInput) {
      var d = parseFloat(distInput.value);
      if (Number.isFinite(d) && d > 0) setDistanceCm(d);
    }
    renderDataCheck();
  }

  function renderDataCheck() {
    var c = el(); if (!c) return;
    var missing = missingTests();
    if (missing.length === 0) { renderResults(); return; }

    var items = [
      { key: 'visual-acuity', label: 'Visual Acuity', fn: 'startVisualAcuityTest' },
      { key: 'duochrome', label: 'Duochrome (Red-Green)', fn: 'startDuochromeTest' },
      { key: 'astigmatism', label: 'Astigmatism Dial', fn: 'startAstigmatismTest' }
    ].map(function (t) {
      var done = !!latestOfType(t.key);
      return '<div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 1rem;border:1px solid #e6e8f0;border-radius:12px;margin-bottom:.6rem;">' +
        '<span style="font-weight:600;">' + (done ? '\u2705 ' : '\u2013 ') + t.label + '</span>' +
        (done
          ? '<span style="color:#059669;font-size:.85rem;font-weight:600;">Done</span>'
          : '<button class="btn btn-test" style="width:auto;padding:.5rem 1rem;font-size:.85rem;" onclick="' + t.fn + '()">Run now</button>') +
      '</div>';
    }).join('');

    c.innerHTML =
      '<div class="test-interface">' +
        '<h2 class="test-title">Step 2 — Complete the vision tests</h2>' +
        '<div class="test-instructions">' +
          '<p>Your estimate is built from these tests. Complete the missing ones (cover one eye and test each separately for a per-eye result), then return here.</p>' +
          '<p style="margin-top:.5rem;color:#64748b;font-size:.9rem;">Tip: run each test once per eye for left/right values; otherwise you\'ll get a combined estimate.</p>' +
        '</div>' +
        '<div class="test-display" style="flex-direction:column;min-height:auto;padding:1.5rem;">' + items + '</div>' +
        '<div class="test-controls">' +
          '<button class="btn btn-incorrect" onclick="SpectitRx.calibrate()">Back</button>' +
          '<button class="btn btn-next" onclick="SpectitRx.results()">See estimate</button>' +
        '</div>' +
      '</div>';
  }

  function eyeBlock(est, title) {
    if (!est) return '';
    var axisStr = est.axis != null ? (' \u00d7 ' + est.axis + '\u00b0') : '';
    var cylStr = (est.cylinder < 0) ? (fmtD(est.cylinder) + axisStr) : 'none detected';
    return '<div style="border:1px solid #e6e8f0;border-radius:16px;padding:1.25rem;margin-bottom:1rem;background:#fff;">' +
      '<div style="font-weight:800;font-size:1.05rem;margin-bottom:.75rem;">' + title + '</div>' +
      '<div style="display:flex;gap:1.5rem;flex-wrap:wrap;">' +
        '<div><div style="font-size:.75rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">Sphere</div><div style="font-family:\'Sora\',sans-serif;font-size:1.6rem;font-weight:800;color:#4f46e5;">' + fmtD(est.sphere) + '</div></div>' +
        '<div><div style="font-size:.75rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">Cylinder \u00d7 Axis</div><div style="font-family:\'Sora\',sans-serif;font-size:1.6rem;font-weight:800;color:#4f46e5;">' + cylStr + '</div></div>' +
        '<div><div style="font-size:.75rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;">Sph. equiv.</div><div style="font-family:\'Sora\',sans-serif;font-size:1.6rem;font-weight:800;color:#0f172a;">' + fmtD(est.sphericalEquivalent) + '</div></div>' +
      '</div>' +
      '<div style="margin-top:.75rem;font-size:.82rem;color:#64748b;">' +
        'Sphere from: <strong style="color:#4f46e5;">' + (est.method === 'far-point' ? 'far-point ' + (est.farPointCm ? '(' + est.farPointCm + ' cm)' : '') : 'acuity chart') + '</strong>' +
        ' · VA ' + est.va + ' (logMAR ' + est.logMAR + ') · duochrome: ' + est.duochrome + ' · confidence ' + Math.round(est.confidence * 100) + '%</div>' +
    '</div>';
  }

  function renderResults() {
    var c = el(); if (!c) return;

    var left = latestOfType('visual-acuity', 'left') && latestOfType('visual-acuity', 'left').eye === 'left' ? estimateForEye('left') : null;
    var right = latestOfType('visual-acuity', 'right') && latestOfType('visual-acuity', 'right').eye === 'right' ? estimateForEye('right') : null;
    var combined = (!left && !right) ? estimateForEye(null) : null;

    var body;
    if (!left && !right && !combined) {
      body = '<div class="test-display" style="min-height:auto;padding:1.5rem;text-align:center;">' +
        '<p>No visual acuity result found yet. Run the Visual Acuity test first.</p>' +
        '<button class="btn btn-test" style="width:auto;margin-top:1rem;" onclick="startVisualAcuityTest()">Run Visual Acuity</button></div>';
    } else {
      var blocks = '';
      if (left) blocks += eyeBlock(left, 'Left eye (OS)');
      if (right) blocks += eyeBlock(right, 'Right eye (OD)');
      if (combined) blocks += eyeBlock(combined, 'Estimate (' + (combined.eye === 'both' ? 'both eyes' : combined.eye) + ')');
      var pxmm = getPxPerMm(), dist = getDistanceCm() || Math.round(liveLidarDistanceCm() || 0) || null;
      body = '<div class="test-display" style="flex-direction:column;min-height:auto;padding:1.25rem;">' + blocks +
        '<div style="font-size:.8rem;color:#94a3b8;margin-top:.25rem;">Calibration: ' +
          (pxmm ? pxmm.toFixed(2) + ' px/mm' : 'screen not calibrated') + ' · ' +
          (dist ? dist + ' cm viewing distance' : 'distance not set') + '</div>' +
      '</div>';
    }

    c.innerHTML =
      '<div class="test-interface">' +
        '<h2 class="test-title">Your Refractive Estimate</h2>' +
        '<div class="test-instructions" style="background:#fef3c7;border-color:#fde68a;">' +
          '<p style="color:#92400e;"><strong>Screening estimate — not a prescription.</strong> Best for myopia; hyperopia can be underestimated because focusing muscles compensate. Confirm with a licensed optometrist before ordering eyewear.</p>' +
        '</div>' +
        body +
        '<div class="test-controls">' +
          '<button class="btn btn-incorrect" onclick="SpectitRx.dataCheck()">Back</button>' +
          '<button class="btn btn-secondary" onclick="SpectitRx.farPoint()">\uD83C\uDFAF Refine with far-point</button>' +
          '<button class="btn btn-next" onclick="SpectitRx.saveAndClose()">Save result</button>' +
        '</div>' +
      '</div>';
  }

  function saveAndClose() {
    var left = latestOfType('visual-acuity', 'left') && latestOfType('visual-acuity', 'left').eye === 'left' ? estimateForEye('left') : null;
    var right = latestOfType('visual-acuity', 'right') && latestOfType('visual-acuity', 'right').eye === 'right' ? estimateForEye('right') : null;
    var combined = (!left && !right) ? estimateForEye(null) : null;
    var primary = left || combined || right;
    if (!primary) { if (typeof closeTest === 'function') closeTest(); return; }

    function line(e) {
      if (!e) return null;
      return 'Sphere ' + fmtD(e.sphere) + (e.cylinder < 0 ? (', Cyl ' + fmtD(e.cylinder) + (e.axis != null ? ' x ' + e.axis + '\u00b0' : '')) : '') + ' (SE ' + fmtD(e.sphericalEquivalent) + ')';
    }

    var result = {
      type: 'prescription',
      name: 'Refractive Screening (Subjective)',
      method: 'subjective-refraction',
      leftEye: left || null,
      rightEye: right || null,
      combined: combined || null,
      summary: (left || right)
        ? [left ? 'OS: ' + line(left) : null, right ? 'OD: ' + line(right) : null].filter(Boolean).join('  |  ')
        : (combined ? line(combined) : ''),
      sphere: fmtD(primary.sphere),
      cylinder: primary.cylinder < 0 ? fmtD(primary.cylinder) : '0.00',
      axis: primary.axis,
      sphericalEquivalent: fmtD(primary.sphericalEquivalent),
      sphereMethod: primary.method,
      farPointCm: primary.farPointCm,
      confidence: primary.confidence,
      calibration: { pxPerMm: getPxPerMm(), distanceCm: getDistanceCm() || liveLidarDistanceCm() },
      note: 'Screening estimate from subjective tests (acuity + duochrome + astigmatism). Not a dispensable prescription; confirm with a licensed eye-care professional.',
      date: new Date().toISOString()
    };

    try {
      if (typeof saveResult === 'function') saveResult(result);
      if (typeof showResult === 'function') { showResult(result); return; }
    } catch (e) {}
    if (typeof closeTest === 'function') closeTest();
  }

  /* ------------------------------------------------------- far-point method */
  var fpState = { eye: 'both', interval: null, lastCm: null, live: false };

  function fpAngleArcmin() { return 15; } // ~20/60 optotype: easily resolved in focus, blurs on defocus

  function fpOptotypePx(distanceCm) {
    var pxmm = getPxPerMm();
    if (!pxmm || !Number.isFinite(distanceCm) || distanceCm <= 0) return null;
    var distMm = distanceCm * 10;
    var rad = (fpAngleArcmin() / 60) * (Math.PI / 180);
    var heightMm = 2 * distMm * Math.tan(rad / 2);
    return Math.max(8, heightMm * pxmm);
  }

  function renderFarPointIntro() {
    var c = el(); if (!c) return;
    var pxmm = getPxPerMm();
    c.innerHTML =
      '<div class="test-interface">' +
        '<h2 class="test-title">Far-point refinement (objective sphere)</h2>' +
        '<div class="test-instructions">' +
          '<p>This measures the farthest distance you can still see a symbol sharply. For a short-sighted (myopic) eye, <strong>1 ÷ far-point (m) = the myopia in dioptres</strong> — a more objective sphere than the acuity chart.</p>' +
          '<p><strong>You will:</strong> cover one eye, hold the phone close so the symbol is sharp, then slowly move it away and tap the moment it blurs. The camera tracks the distance and keeps the symbol a constant size.</p>' +
          (!pxmm ? '<p style="color:#b45309;"><strong>Calibrate your screen first</strong> so the symbol size stays constant.</p>' : '') +
        '</div>' +
        '<div class="test-display" style="flex-direction:column;gap:.8rem;min-height:auto;padding:1.5rem;">' +
          '<p style="font-weight:700;">Which eye?</p>' +
          '<div style="display:flex;gap:.6rem;flex-wrap:wrap;justify-content:center;">' +
            '<button class="btn btn-test" style="width:auto;" onclick="SpectitRx.fpStart(\'left\')">Left eye</button>' +
            '<button class="btn btn-test" style="width:auto;" onclick="SpectitRx.fpStart(\'right\')">Right eye</button>' +
            '<button class="btn btn-test" style="width:auto;" onclick="SpectitRx.fpStart(\'both\')">Both eyes</button>' +
          '</div>' +
        '</div>' +
        '<div class="test-controls">' +
          (pxmm ? '' : '<button class="btn btn-primary" onclick="SpectitRx.calibrate()">Calibrate screen</button>') +
          '<button class="btn btn-incorrect" onclick="SpectitRx.results()">Back to estimate</button>' +
        '</div>' +
      '</div>';
  }

  async function fpStart(eye) {
    fpState.eye = eye || 'both';
    fpState.lastCm = null;
    var other = eye === 'left' ? 'right' : (eye === 'right' ? 'left' : 'other');
    var c = el(); if (!c) return;
    c.innerHTML =
      '<div class="test-interface">' +
        '<h2 class="test-title">Far-point — ' + (eye === 'both' ? 'both eyes' : eye + ' eye') + '</h2>' +
        '<div class="test-instructions">' +
          '<p>' + (eye === 'both' ? 'Keep both eyes open.' : 'Cover your <strong>' + other + '</strong> eye.') + ' Start close so the symbol is sharp, then move the phone away slowly. Tap <strong>Blurred</strong> the instant it turns fuzzy.</p>' +
          '<p id="fp-distance" style="font-weight:700;color:#4f46e5;margin-top:.5rem;">Distance: starting camera…</p>' +
        '</div>' +
        '<div class="test-display" id="fp-display" style="min-height:260px;background:#fff;">' +
          '<span id="fp-optotype" style="font-family:\'Courier New\',monospace;font-weight:800;color:#0f172a;line-height:1;">E</span>' +
        '</div>' +
        '<div id="fp-manual" style="display:none;text-align:center;margin-top:.5rem;">' +
          '<p style="color:#64748b;font-size:.9rem;">Camera distance unavailable — measure the blur distance with a ruler and enter it:</p>' +
          '<input type="number" id="fp-manual-cm" placeholder="cm" min="10" max="300" style="width:120px;padding:.4rem .6rem;border:1.5px solid #e6e8f0;border-radius:8px;">' +
          '<button class="btn btn-next" style="width:auto;margin-left:.5rem;" onclick="SpectitRx.fpManual()">Save</button>' +
        '</div>' +
        '<div class="test-controls">' +
          '<button class="btn btn-next" onclick="SpectitRx.fpBlur()">It just blurred</button>' +
          '<button class="btn btn-secondary" onclick="SpectitRx.fpBeyond()">Still sharp at arm\u2019s length</button>' +
          '<button class="btn btn-incorrect" onclick="SpectitRx.fpCancel()">Cancel</button>' +
        '</div>' +
      '</div>';

    // Try to start live distance tracking.
    fpState.live = false;
    try {
      if (window.lidarEngine && typeof window.lidarEngine.initialize === 'function') {
        var setup = await window.lidarEngine.initialize(0.4, 0.5);
        if (setup && setup.available) fpState.live = true;
      }
    } catch (e) { fpState.live = false; }

    if (!fpState.live) {
      var man = document.getElementById('fp-manual');
      if (man) man.style.display = 'block';
      var dEl = document.getElementById('fp-distance');
      if (dEl) dEl.textContent = 'Distance: enter manually below';
    }

    if (fpState.interval) clearInterval(fpState.interval);
    fpState.interval = setInterval(fpTick, 150);
    fpTick();
  }

  function fpTick() {
    var distEl = document.getElementById('fp-distance');
    var opto = document.getElementById('fp-optotype');
    var cm = null;
    if (fpState.live) {
      var m = liveLidarDistanceCm();
      if (Number.isFinite(m)) cm = m;
    }
    if (cm) {
      fpState.lastCm = cm;
      if (distEl) distEl.textContent = 'Distance: ' + Math.round(cm) + ' cm  (\u2248 ' + fmtD(seFromFarPoint(cm)) + ' if it blurs here)';
      var px = fpOptotypePx(cm);
      if (opto && px) opto.style.fontSize = px + 'px';
    }
  }

  function fpStop() {
    if (fpState.interval) { clearInterval(fpState.interval); fpState.interval = null; }
    try { if (window.lidarEngine && window.lidarEngine.stop) window.lidarEngine.stop(); } catch (e) {}
  }

  function fpBlur() {
    var cm = fpState.lastCm;
    if (!Number.isFinite(cm) || cm <= 0) {
      var man = document.getElementById('fp-manual');
      if (man) man.style.display = 'block';
      return;
    }
    setFarPoint(fpState.eye, { cm: Math.round(cm), beyondReach: false, method: 'live', date: new Date().toISOString() });
    fpStop();
    renderResults();
  }

  function fpManual() {
    var input = document.getElementById('fp-manual-cm');
    var cm = input ? parseFloat(input.value) : NaN;
    if (!Number.isFinite(cm) || cm <= 0) return;
    setFarPoint(fpState.eye, { cm: Math.round(cm), beyondReach: false, method: 'manual', date: new Date().toISOString() });
    fpStop();
    renderResults();
  }

  function fpBeyond() {
    var maxCm = Number.isFinite(fpState.lastCm) ? Math.round(fpState.lastCm) : null;
    setFarPoint(fpState.eye, { cm: null, beyondReach: true, maxCm: maxCm, date: new Date().toISOString() });
    fpStop();
    renderResults();
  }

  function fpCancel() { fpStop(); renderResults(); }

  /* --------------------------------------------------------------- exports */
  window.SpectitRx = {
    start: start,
    intro: renderIntro,
    calibrate: renderCalibration,
    onCard: onCard,
    saveCalibration: saveCalibration,
    dataCheck: renderDataCheck,
    results: renderResults,
    saveAndClose: saveAndClose,
    estimateForEye: estimateForEye,
    farPoint: renderFarPointIntro,
    fpStart: fpStart,
    fpBlur: fpBlur,
    fpManual: fpManual,
    fpBeyond: fpBeyond,
    fpCancel: fpCancel
  };

  // Override the legacy face-geometry prescription entry point.
  window.startPrescriptionTest = start;
})();
