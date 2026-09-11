/* ==========================================================================
 * Spect-IT — Screen calibration gate
 * Prompts once for px/mm + viewing distance before acuity-sensitive tests.
 * Enhanced with validation, re-check prompts, and dashboard display.
 * ========================================================================== */
(function () {
  'use strict';

  var PX_KEY = 'spectit_px_per_mm';
  var DIST_KEY = 'spectit_view_distance_cm';
  var SKIP_KEY = 'spectit_calibration_skipped';
  var TIMESTAMP_KEY = 'spectit_calibration_timestamp';
  var VALIDATION_KEY = 'spectit_calibration_validated';
  var CARD_MM = 85.6;

  // Validation ranges (based on typical devices)
  var PX_PER_MM_MIN = 2.0;  // ~50 DPI
  var PX_PER_MM_MAX = 12.0; // ~300 DPI
  var DISTANCE_MIN = 30;     // 30 cm
  var DISTANCE_MAX = 300;    // 3 meters
  
  // Recheck after 30 days
  var RECHECK_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000;

  function getPx() {
    var v = parseFloat(localStorage.getItem(PX_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  function getDist() {
    var v = parseFloat(localStorage.getItem(DIST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  function getTimestamp() {
    var v = parseInt(localStorage.getItem(TIMESTAMP_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  function isValidated() {
    return localStorage.getItem(VALIDATION_KEY) === '1';
  }
  function isCalibrated() {
    return !!(getPx() && getDist());
  }
  function needsRecheck() {
    var timestamp = getTimestamp();
    if (!timestamp) return true;
    return (Date.now() - timestamp) > RECHECK_INTERVAL_MS;
  }
  function validateCalibration(px, dist) {
    var warnings = [];
    
    if (px < PX_PER_MM_MIN || px > PX_PER_MM_MAX) {
      warnings.push('Screen size value seems unusual (' + px.toFixed(2) + ' px/mm). Please verify with a physical card.');
    }
    
    if (dist < DISTANCE_MIN) {
      warnings.push('Viewing distance is very close (' + dist + ' cm). For accurate results, sit at least 50-60 cm away.');
    }
    
    if (dist > DISTANCE_MAX) {
      warnings.push('Viewing distance is very far (' + dist + ' cm). This may affect test accuracy.');
    }
    
    // Check if PPI is reasonable
    var ppi = px * 25.4;
    if (ppi < 70 || ppi > 400) {
      warnings.push('Calculated screen density (' + Math.round(ppi) + ' PPI) seems unusual. Double-check your measurements.');
    }
    
    return warnings;
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
      '<div class="rx-modal-card" style="max-width:480px">' +
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
    var isRecalibration = isCalibrated();
    
    body().innerHTML =
      '<h2 class="bk-title">' + (isRecalibration ? 'Re-calibrate Screen' : 'Screen Calibration') + '</h2>' +
      '<p class="bk-sub">For accurate clinical-grade results, calibrate your screen size and viewing distance.</p>' +
      (isRecalibration ? '<p class="bk-note" style="color: #667eea;">✓ You have existing calibration. Update it below or keep current values.</p>' : '') +
      '<div class="bk-form">' +
        '<label>Card width on screen' +
          '<div style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">Place a credit card on your screen. Drag the slider until it matches the card width exactly.</div>' +
          '<input type="range" id="cal-px" min="' + PX_PER_MM_MIN + '" max="' + PX_PER_MM_MAX + '" step="0.05" value="' + px + '">' +
        '</label>' +
        '<div style="margin: 1rem 0; padding: 1rem; background: #f7fafc; border-radius: 8px; border: 2px dashed #cbd5e0; min-height: 80px; display: flex; align-items: center; justify-content: center;">' +
          '<div style="width: ' + (px * CARD_MM) + 'px; height: 54px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.9rem; transition: all 0.3s ease;">Credit Card<br>85.6mm</div>' +
        '</div>' +
        '<p class="bk-note" id="cal-px-label">Screen: ~' + px.toFixed(2) + ' px/mm (' + Math.round(px * 25.4) + ' PPI)</p>' +
        '<label>Viewing distance (cm)' +
          '<div style="margin: 0.5rem 0; font-size: 0.9rem; color: #666;">How far are you sitting from your screen? Use a tape measure for best accuracy.</div>' +
          '<input type="number" id="cal-dist" min="' + DISTANCE_MIN + '" max="' + DISTANCE_MAX + '" value="' + dist + '">' +
        '</label>' +
        '<div id="cal-warnings" style="margin-top: 1rem;"></div>' +
      '</div>' +
      '<div class="bk-actions">' +
        '<button class="btn btn-ghost-dark" type="button" id="cal-skip">Skip for now</button>' +
        '<button class="btn btn-gradient" type="button" id="cal-save">Save &amp; continue</button>' +
      '</div>' +
      '<div style="margin-top: 1rem; padding: 1rem; background: #fffbeb; border-left: 3px solid #f59e0b; border-radius: 6px; font-size: 0.9rem;">' +
        '<strong>💡 Why calibrate?</strong><br>' +
        'Accurate calibration ensures test optotypes (letters) appear at the correct physical size for your viewing distance, making your screening results clinically meaningful.' +
      '</div>';

    var slider = document.getElementById('cal-px');
    var label = document.getElementById('cal-px-label');
    var cardPreview = document.querySelector('[style*="transition"]');
    var distInput = document.getElementById('cal-dist');
    var warningsDiv = document.getElementById('cal-warnings');
    
    function updatePreview() {
      var currentPx = parseFloat(slider.value);
      var currentDist = parseFloat(distInput.value);
      label.textContent = 'Screen: ~' + currentPx.toFixed(2) + ' px/mm (' + Math.round(currentPx * 25.4) + ' PPI)';
      if (cardPreview) {
        cardPreview.style.width = (currentPx * CARD_MM) + 'px';
      }
      
      // Show warnings
      var warnings = validateCalibration(currentPx, currentDist);
      if (warnings.length > 0) {
        warningsDiv.innerHTML = '<div style="padding: 0.75rem; background: #fef3c7; border-left: 3px solid #f59e0b; border-radius: 6px; color: #92400e;">' +
          '<strong>⚠️ Please verify:</strong><ul style="margin: 0.5rem 0 0 1.5rem; padding: 0;">' +
          warnings.map(function(w) { return '<li>' + w + '</li>'; }).join('') +
          '</ul></div>';
      } else {
        warningsDiv.innerHTML = '<div style="padding: 0.75rem; background: #d1fae5; border-left: 3px solid #10b981; border-radius: 6px; color: #065f46;">' +
          '<strong>✓ Calibration looks good!</strong> These values are within expected ranges.' +
        '</div>';
      }
    }
    
    slider.oninput = updatePreview;
    distInput.oninput = updatePreview;
    updatePreview();
    
    document.getElementById('cal-skip').onclick = function () {
      if (confirm('Skip calibration? For best results, we recommend calibrating your screen. You can do this later in settings.')) {
        localStorage.setItem(SKIP_KEY, '1');
        close();
        if (onDone) onDone();
      }
    };
    
    document.getElementById('cal-save').onclick = function () {
      var p = parseFloat(slider.value);
      var d = parseFloat(distInput.value);
      
      var warnings = validateCalibration(p, d);
      if (warnings.length > 0) {
        if (!confirm('Warnings detected:\n\n' + warnings.join('\n\n') + '\n\nSave anyway?')) {
          return;
        }
      }
      
      if (p > 0) localStorage.setItem(PX_KEY, String(p));
      if (d > 0) localStorage.setItem(DIST_KEY, String(d));
      localStorage.setItem(TIMESTAMP_KEY, String(Date.now()));
      localStorage.setItem(VALIDATION_KEY, '1');
      localStorage.removeItem(SKIP_KEY);
      close();
      updateCalibrationStatus();
      if (onDone) onDone();
    };
  }

  function ensureBeforeTest(testFn, opts) {
    opts = opts || {};
    
    // Check if recheck is needed
    if (isCalibrated() && needsRecheck() && !localStorage.getItem(SKIP_KEY)) {
      if (confirm('Your screen calibration is over 30 days old. Re-calibrate for best accuracy?\n\n(You can skip and use existing calibration)')) {
        open();
        renderForm(testFn);
        return;
      }
    }
    
    if (isCalibrated() || localStorage.getItem(SKIP_KEY) === '1') {
      if (typeof testFn === 'function') testFn();
      return;
    }
    if (opts.force) {
      open();
      renderForm(testFn);
      return;
    }
    // Soft prompt first time only per session
    if (sessionStorage.getItem('spectit_cal_prompted')) {
      if (typeof testFn === 'function') testFn();
      return;
    }
    sessionStorage.setItem('spectit_cal_prompted', '1');
    open();
    renderForm(testFn);
  }

  function openSettings() {
    open();
    renderForm(null);
  }
  
  function getCalibrationSummary() {
    var px = getPx();
    var dist = getDist();
    var timestamp = getTimestamp();
    var validated = isValidated();
    
    if (!px || !dist) {
      return {
        calibrated: false,
        status: 'Not calibrated',
        statusClass: 'warning',
        message: 'Screen not calibrated. Tests may be less accurate.'
      };
    }
    
    var ppi = Math.round(px * 25.4);
    var ageMs = timestamp ? Date.now() - timestamp : 0;
    var ageDays = Math.round(ageMs / (24 * 60 * 60 * 1000));
    var needsCheck = needsRecheck();
    
    return {
      calibrated: true,
      pxPerMm: px.toFixed(2),
      distanceCm: dist,
      ppi: ppi,
      ageDays: ageDays,
      validated: validated,
      needsRecheck: needsCheck,
      status: needsCheck ? 'Calibration outdated' : 'Calibrated',
      statusClass: needsCheck ? 'warning' : 'success',
      message: needsCheck 
        ? 'Calibration is ' + ageDays + ' days old. Re-calibrate for best accuracy.'
        : 'Screen calibrated ' + ageDays + ' days ago. ' + px.toFixed(2) + ' px/mm at ' + dist + ' cm.'
    };
  }
  
  function updateCalibrationStatus() {
    var statusEl = document.getElementById('calibration-status-badge');
    if (!statusEl) return;
    
    var summary = getCalibrationSummary();
    statusEl.innerHTML = 
      '<div class="cal-status-' + summary.statusClass + '">' +
        '<div class="cal-status-icon">' + (summary.calibrated ? '✓' : '⚠️') + '</div>' +
        '<div class="cal-status-text">' +
          '<div class="cal-status-title">' + summary.status + '</div>' +
          '<div class="cal-status-detail">' + summary.message + '</div>' +
        '</div>' +
        '<button class="btn btn-ghost-dark btn-sm" onclick="SpectitCalibration.openSettings()">Re-calibrate</button>' +
      '</div>';
  }
  
  function injectCalibrationBadge() {
    var resultsSection = document.getElementById('results-container');
    if (!resultsSection || document.getElementById('calibration-status-badge')) return;
    
    var badge = document.createElement('div');
    badge.id = 'calibration-status-badge';
    badge.style.cssText = 'margin: 1rem 0; padding: 1rem; background: #f7fafc; border-radius: 8px;';
    
    resultsSection.parentNode.insertBefore(badge, resultsSection);
    updateCalibrationStatus();
  }
  
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(injectCalibrationBadge, 1500);
  });

  window.SpectitCalibration = {
    isCalibrated: isCalibrated,
    ensureBeforeTest: ensureBeforeTest,
    openSettings: openSettings,
    getPxPerMm: getPx,
    getDistanceCm: getDist,
    getCalibrationSummary: getCalibrationSummary,
    updateCalibrationStatus: updateCalibrationStatus,
    needsRecheck: needsRecheck
  };
})();
