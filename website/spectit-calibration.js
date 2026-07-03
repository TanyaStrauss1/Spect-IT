/* ==========================================================================
 * Spect-IT — Screen calibration gate
 * Prompts once for px/mm + viewing distance before acuity-sensitive tests.
 * ========================================================================== */
(function () {
  'use strict';

  var PX_KEY = 'spectit_px_per_mm';
  var DIST_KEY = 'spectit_view_distance_cm';
  var SKIP_KEY = 'spectit_calibration_skipped';
  var CARD_MM = 85.6;

  function getPx() {
    var v = parseFloat(localStorage.getItem(PX_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  function getDist() {
    var v = parseFloat(localStorage.getItem(DIST_KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  }
  function isCalibrated() {
    return !!(getPx() && getDist());
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
    body().innerHTML =
      '<h2 class="bk-title">Screen calibration</h2>' +
      '<p class="bk-sub">For accurate results, calibrate your screen size and viewing distance once.</p>' +
      '<div class="bk-form">' +
        '<label>Card width on screen (drag slider until a credit card would fit)<input type="range" id="cal-px" min="2" max="8" step="0.05" value="' + px + '"></label>' +
        '<p class="bk-note" id="cal-px-label">~' + px.toFixed(2) + ' px/mm</p>' +
        '<label>Viewing distance (cm)<input type="number" id="cal-dist" min="30" max="300" value="' + dist + '"></label>' +
      '</div>' +
      '<div class="bk-actions">' +
        '<button class="btn btn-ghost-dark" type="button" id="cal-skip">Skip for now</button>' +
        '<button class="btn btn-gradient" type="button" id="cal-save">Save &amp; continue</button>' +
      '</div>';

    var slider = document.getElementById('cal-px');
    var label = document.getElementById('cal-px-label');
    slider.oninput = function () {
      label.textContent = '~' + parseFloat(slider.value).toFixed(2) + ' px/mm';
    };
    document.getElementById('cal-skip').onclick = function () {
      localStorage.setItem(SKIP_KEY, '1');
      close();
      if (onDone) onDone();
    };
    document.getElementById('cal-save').onclick = function () {
      var p = parseFloat(slider.value);
      var d = parseFloat(document.getElementById('cal-dist').value);
      if (p > 0) localStorage.setItem(PX_KEY, String(p));
      if (d > 0) localStorage.setItem(DIST_KEY, String(d));
      localStorage.removeItem(SKIP_KEY);
      close();
      if (onDone) onDone();
    };
  }

  function ensureBeforeTest(testFn, opts) {
    opts = opts || {};
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

  window.SpectitCalibration = {
    isCalibrated: isCalibrated,
    ensureBeforeTest: ensureBeforeTest,
    openSettings: openSettings,
    getPxPerMm: getPx,
    getDistanceCm: getDist
  };
})();
