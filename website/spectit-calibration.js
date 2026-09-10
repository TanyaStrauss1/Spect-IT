/* ==========================================================================
 * Spect-IT — Clinical Screen Calibration
 * Calibrates screen PPI and viewing distance for clinically-accurate angular sizing
 * Required before acuity, contrast, and any test using angular measurements
 * ========================================================================== */
(function () {
  'use strict';

  var PX_KEY = 'spectit_px_per_mm';
  var DIST_KEY = 'spectit_view_distance_cm';
  var SKIP_KEY = 'spectit_calibration_skipped';
  var CAL_VERSION_KEY = 'spectit_cal_version';
  var CAL_VERSION = '2.0'; // Clinical calibration version
  var CARD_MM_WIDTH = 85.6; // ISO/IEC 7810 ID-1 standard

  function getPx() {
    var v = parseFloat(localStorage.getItem(PX_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  
  function getDist() {
    var v = parseFloat(localStorage.getItem(DIST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  
  function isCalibrated() {
    var hasData = !!(getPx() && getDist());
    var version = localStorage.getItem(CAL_VERSION_KEY);
    return hasData && version === CAL_VERSION;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c];
    });
  }

  function ensureModal() {
    var el = document.getElementById('calibration-modal');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'calibration-modal';
    el.className = 'rx-modal';
    el.innerHTML =
      '<div class="rx-modal-card" style="max-width:600px; max-height:90vh; overflow-y:auto">' +
        '<button class="rx-modal-close" type="button" aria-label="Close">&times;</button>' +
        '<div id="calibration-body"></div>' +
      '</div>';
    document.body.appendChild(el);
    el.querySelector('.rx-modal-close').onclick = close;
    el.addEventListener('click', function (e) { if (e.target === el) close(); });
    return el;
  }

  function body() { return document.getElementById('calibration-body'); }
  function open() { ensureModal().classList.add('active'); }
  function close() { ensureModal().classList.remove('active'); }

  function renderForm(onDone) {
    var px = getPx() || 3.8;
    var dist = getDist() || 60;
    var cardWidthPx = px * CARD_MM_WIDTH;
    
    body().innerHTML =
      '<h2 class="bk-title" style="margin-bottom:0.5rem">📏 Screen Calibration</h2>' +
      '<p class="bk-sub" style="margin-bottom:1.5rem; color:#666">Required for clinically-accurate angular sizing in vision tests</p>' +
      
      '<div class="bk-form">' +
        '<div style="background:#f8f9fa; border-radius:12px; padding:1.5rem; margin-bottom:1.5rem">' +
          '<h3 style="font-size:1.1rem; margin:0 0 1rem 0; color:#152a45">Step 1: Screen Size Calibration</h3>' +
          '<p style="margin:0 0 1rem 0; font-size:0.95rem; color:#555">Adjust the slider until the box below matches a <strong>credit card</strong> (85.6mm wide) placed on your screen.</p>' +
          '<div style="text-align:center; margin:1rem 0">' +
            '<div id="cal-card-box" style="display:inline-block; width:' + cardWidthPx + 'px; height:54px; border:3px solid #a8864a; background:linear-gradient(135deg, #c9a962, #a8864a); border-radius:8px; position:relative; box-shadow:0 4px 12px rgba(0,0,0,0.15)">' +
              '<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-weight:600; font-size:0.85rem; text-shadow:0 1px 2px rgba(0,0,0,0.3)">85.6 mm</div>' +
            '</div>' +
          '</div>' +
          '<label style="display:block; margin-top:1rem">Screen pixels per millimeter<input type="range" id="cal-px" min="2" max="8" step="0.01" value="' + px + '" style="width:100%; margin-top:0.5rem"></label>' +
          '<p class="bk-note" id="cal-px-label" style="text-align:center; margin:0.5rem 0 0 0; font-weight:600; color:#a8864a">' + px.toFixed(2) + ' px/mm (≈' + Math.round(px * 25.4) + ' PPI)</p>' +
        '</div>' +
        
        '<div style="background:#f8f9fa; border-radius:12px; padding:1.5rem; margin-bottom:1.5rem">' +
          '<h3 style="font-size:1.1rem; margin:0 0 1rem 0; color:#152a45">Step 2: Viewing Distance</h3>' +
          '<p style="margin:0 0 1rem 0; font-size:0.95rem; color:#555">Measure or estimate your distance from the screen. For acuity tests, <strong>3 meters (300cm)</strong> is standard for home screening.</p>' +
          '<label style="display:block">Distance (cm)<input type="number" id="cal-dist" min="30" max="600" value="' + dist + '" style="width:100%; padding:0.75rem; border:2px solid #ddd; border-radius:8px; margin-top:0.5rem; font-size:1rem"></label>' +
          '<div style="display:flex; gap:0.5rem; margin-top:0.75rem; flex-wrap:wrap">' +
            '<button type="button" class="btn btn-secondary" style="font-size:0.85rem; padding:0.5rem 1rem" onclick="document.getElementById(\'cal-dist\').value = 60">60cm (near)</button>' +
            '<button type="button" class="btn btn-secondary" style="font-size:0.85rem; padding:0.5rem 1rem" onclick="document.getElementById(\'cal-dist\').value = 200">2m</button>' +
            '<button type="button" class="btn btn-secondary" style="font-size:0.85rem; padding:0.5rem 1rem" onclick="document.getElementById(\'cal-dist\').value = 300">3m (standard)</button>' +
            '<button type="button" class="btn btn-secondary" style="font-size:0.85rem; padding:0.5rem 1rem" onclick="document.getElementById(\'cal-dist\').value = 600">6m (optimal)</button>' +
          '</div>' +
        '</div>' +
        
        '<div style="background:#fff3cd; border-left:4px solid #ffc107; padding:1rem; border-radius:4px; margin-bottom:1rem">' +
          '<p style="margin:0; font-size:0.9rem; color:#856404"><strong>⚠️ Important:</strong> Accurate calibration is essential for clinically-meaningful results. Without it, optotypes will be sized incorrectly and scores will be unreliable.</p>' +
        '</div>' +
      '</div>' +
      
      '<div class="bk-actions" style="display:flex; gap:0.75rem; justify-content:flex-end">' +
        '<button class="btn btn-ghost-dark" type="button" id="cal-skip">Skip (not recommended)</button>' +
        '<button class="btn btn-gradient" type="button" id="cal-save">✓ Save &amp; Continue</button>' +
      '</div>';

    var slider = document.getElementById('cal-px');
    var label = document.getElementById('cal-px-label');
    var cardBox = document.getElementById('cal-card-box');
    
    slider.oninput = function () {
      var p = parseFloat(slider.value);
      var w = p * CARD_MM_WIDTH;
      cardBox.style.width = w + 'px';
      label.textContent = p.toFixed(2) + ' px/mm (≈' + Math.round(p * 25.4) + ' PPI)';
    };
    
    document.getElementById('cal-skip').onclick = function () {
      if (!confirm('Skipping calibration will make test results unreliable and not clinically meaningful. Continue anyway?')) return;
      localStorage.setItem(SKIP_KEY, '1');
      close();
      if (onDone) onDone();
    };
    
    document.getElementById('cal-save').onclick = function () {
      var p = parseFloat(slider.value);
      var d = parseFloat(document.getElementById('cal-dist').value);
      
      if (!Number.isFinite(p) || p <= 0 || p < 2 || p > 8) {
        alert('Please adjust the slider to match a credit card on your screen.');
        return;
      }
      if (!Number.isFinite(d) || d < 30 || d > 600) {
        alert('Please enter a viewing distance between 30cm and 600cm.');
        return;
      }
      
      localStorage.setItem(PX_KEY, String(p));
      localStorage.setItem(DIST_KEY, String(d));
      localStorage.setItem(CAL_VERSION_KEY, CAL_VERSION);
      localStorage.removeItem(SKIP_KEY);
      
      console.log('[Calibration] Saved: ' + p.toFixed(2) + ' px/mm, ' + d + ' cm distance');
      close();
      if (onDone) onDone();
    };
  }

  function ensureBeforeTest(testFn, opts) {
    opts = opts || {};
    
    // Always require calibration for clinical tests unless explicitly skipped
    if (isCalibrated()) {
      if (typeof testFn === 'function') testFn();
      return;
    }
    
    // If user previously skipped, allow but warn in console
    if (localStorage.getItem(SKIP_KEY) === '1' && !opts.force) {
      console.warn('[Calibration] Test running without calibration - results will be unreliable');
      if (typeof testFn === 'function') testFn();
      return;
    }
    
    // Show calibration modal
    open();
    renderForm(testFn);
  }

  function openSettings() {
    open();
    renderForm(null);
  }
  
  function resetCalibration() {
    localStorage.removeItem(PX_KEY);
    localStorage.removeItem(DIST_KEY);
    localStorage.removeItem(SKIP_KEY);
    localStorage.removeItem(CAL_VERSION_KEY);
    console.log('[Calibration] Reset complete');
  }

  window.SpectitCalibration = {
    isCalibrated: isCalibrated,
    ensureBeforeTest: ensureBeforeTest,
    openSettings: openSettings,
    resetCalibration: resetCalibration,
    getPxPerMm: getPx,
    getDistanceCm: getDist,
    version: CAL_VERSION
  };
})();
