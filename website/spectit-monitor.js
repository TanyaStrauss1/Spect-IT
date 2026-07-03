/* ==========================================================================
 * Spect-IT — Monitoring scaffold (Sentry optional)
 * Set window.SPECTIT_SENTRY_DSN before this script loads to enable.
 * ========================================================================== */
(function () {
  'use strict';

  var dsn = window.SPECTIT_SENTRY_DSN || '';

  function loadSentry(cb) {
    if (!dsn || window.Sentry) { if (cb) cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://browser.sentry-cdn.com/8.45.0/bundle.min.js';
    s.crossOrigin = 'anonymous';
    s.onload = function () {
      try {
        window.Sentry.init({
          dsn: dsn,
          environment: location.hostname === 'localhost' ? 'development' : 'production',
          tracesSampleRate: 0.1,
          ignoreErrors: ['ResizeObserver loop', 'Non-Error promise rejection']
        });
      } catch (e) { console.warn('Sentry init failed', e); }
      if (cb) cb();
    };
    s.onerror = function () { if (cb) cb(); };
    document.head.appendChild(s);
  }

  loadSentry(function () {
    window.addEventListener('error', function (e) {
      if (window.Sentry && e.error) window.Sentry.captureException(e.error);
    });
    window.addEventListener('unhandledrejection', function (e) {
      if (window.Sentry) window.Sentry.captureException(e.reason);
    });
  });

  window.SpectitMonitor = {
    capture: function (err, ctx) {
      console.error('[Spect-IT]', err, ctx || '');
      if (window.Sentry) window.Sentry.captureException(err, { extra: ctx });
    },
    isEnabled: function () { return !!dsn && !!window.Sentry; }
  };
})();
