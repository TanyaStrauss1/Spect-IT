/* ==========================================================================
 * Spect-IT — Results export (JSON, CSV, printable text)
 * ========================================================================== */
(function () {
  'use strict';

  function readHistory() {
    try { return JSON.parse(localStorage.getItem('testHistory') || '[]'); }
    catch (e) { return []; }
  }

  function download(filename, content, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
  }

  function toCsv(rows) {
    if (!rows.length) return '';
    var keys = Object.keys(rows[0]);
    var lines = [keys.join(',')];
    rows.forEach(function (r) {
      lines.push(keys.map(function (k) {
        var v = r[k];
        if (v == null) return '';
        var s = typeof v === 'object' ? JSON.stringify(v) : String(v);
        return '"' + s.replace(/"/g, '""') + '"';
      }).join(','));
    });
    return lines.join('\n');
  }

  function flattenResult(r) {
    return {
      name: r.name,
      type: r.type,
      date: r.date,
      score: r.score,
      level: r.level,
      result: r.result,
      estimate: r.estimate,
      eye: r.eye
    };
  }

  function printableReport(history) {
    var lines = [
      'SPECT-IT VISION SCREENING REPORT',
      'Generated: ' + new Date().toLocaleString(),
      'Email: ' + (localStorage.getItem('spectit_user_email') || 'not provided'),
      '',
      '--- RESULTS ---'
    ];
    history.forEach(function (r, i) {
      lines.push('');
      lines.push((i + 1) + '. ' + (r.name || r.type || 'Test'));
      lines.push('   Date: ' + new Date(r.date).toLocaleString());
      if (r.level) lines.push('   Visual acuity: ' + r.level);
      if (r.result) lines.push('   Result: ' + r.result);
      if (r.estimate) lines.push('   Estimate: ' + r.estimate);
      if (r.score != null) lines.push('   Score: ' + (r.score * 100).toFixed(0) + '%');
    });
    lines.push('');
    lines.push('DISCLAIMER: Screening only — not a diagnosis or dispensable prescription.');
    lines.push('Consult a licensed optometrist or ophthalmologist.');
    return lines.join('\n');
  }

  function exportJson() {
    var h = readHistory();
    download('spectit-results-' + Date.now() + '.json', JSON.stringify(h, null, 2), 'application/json');
  }

  function exportCsv() {
    var h = readHistory().map(flattenResult);
    if (!h.length) { alert('No results to export yet.'); return; }
    download('spectit-results-' + Date.now() + '.csv', toCsv(h), 'text/csv');
  }

  function exportText() {
    var h = readHistory();
    if (!h.length) { alert('No results to export yet.'); return; }
    download('spectit-report-' + Date.now() + '.txt', printableReport(h), 'text/plain');
  }

  function shareResults() {
    var text = printableReport(readHistory());
    if (navigator.share) {
      navigator.share({ title: 'Spect-IT Results', text: text }).catch(function () {});
      return;
    }
    exportText();
  }

  function injectToolbar() {
    var section = document.getElementById('results-container');
    if (!section || document.getElementById('export-toolbar')) return;
    var bar = document.createElement('div');
    bar.id = 'export-toolbar';
    bar.className = 'export-toolbar';
    bar.innerHTML =
      '<button type="button" class="btn btn-ghost-dark" onclick="SpectitExport.exportText()">Download report</button>' +
      '<button type="button" class="btn btn-ghost-dark" onclick="SpectitExport.exportJson()">Export JSON</button>' +
      '<button type="button" class="btn btn-ghost-dark" onclick="SpectitExport.exportCsv()">Export CSV</button>' +
      '<button type="button" class="btn btn-gradient" onclick="SpectitExport.shareResults()">Share</button>' +
      '<button type="button" class="btn btn-ghost-dark" onclick="SpectitCalibration.openSettings()">Calibrate screen</button>';
    section.parentNode.insertBefore(bar, section);
  }

  document.addEventListener('DOMContentLoaded', injectToolbar);

  window.SpectitExport = {
    exportJson: exportJson,
    exportCsv: exportCsv,
    exportText: exportText,
    shareResults: shareResults
  };
})();
