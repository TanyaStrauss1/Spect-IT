/* ==========================================================================
 * Spect-IT — Clinical Results Summary
 * Unified results page with per-eye breakdown, PDF export, and recommendations
 * ========================================================================== */
(function () {
  'use strict';

  function readHistory() {
    try { return JSON.parse(localStorage.getItem('testHistory') || '[]'); }
    catch (e) { return []; }
  }

  function groupResultsByEye(history) {
    var byEye = { left: [], right: [], both: [], unknown: [] };
    history.forEach(function(r) {
      var eye = (r.eye || 'both').toLowerCase();
      if (byEye[eye]) byEye[eye].push(r);
      else byEye.unknown.push(r);
    });
    return byEye;
  }

  function getLatestResultByType(history, type) {
    var filtered = history.filter(function(r) { return r.type === type; });
    if (!filtered.length) return null;
    return filtered.reduce(function(latest, current) {
      return new Date(current.date) > new Date(latest.date) ? current : latest;
    });
  }

  function convertSnellenToLogMAR(snellen) {
    // Convert Snellen (e.g., "6/6", "20/20") to logMAR
    if (!snellen || typeof snellen !== 'string') return null;
    var parts = snellen.split('/');
    if (parts.length !== 2) return null;
    var num = parseFloat(parts[0]);
    var denom = parseFloat(parts[1]);
    if (!num || !denom) return null;
    return Math.log10(denom / num);
  }

  function interpretLogMAR(logMAR) {
    if (logMAR <= 0.0) return { category: 'Excellent', color: '#10b981', recommendation: 'Your distance vision is excellent.' };
    if (logMAR <= 0.3) return { category: 'Good', color: '#10b981', recommendation: 'Your distance vision is good.' };
    if (logMAR <= 0.5) return { category: 'Fair', color: '#f59e0b', recommendation: 'Your distance vision may benefit from correction. Consider an eye exam.' };
    if (logMAR <= 1.0) return { category: 'Reduced', color: '#ef4444', recommendation: 'Your distance vision is reduced. Schedule an eye exam.' };
    return { category: 'Severely reduced', color: '#dc2626', recommendation: 'Your distance vision is severely reduced. See an optometrist soon.' };
  }

  function generateClinicalSummary() {
    var history = readHistory();
    if (!history.length) {
      return '<div class="no-results"><p>No screening results yet. Complete tests to see your clinical summary.</p></div>';
    }

    var byEye = groupResultsByEye(history);
    var acuityLeft = getLatestResultByType(byEye.left, 'visual-acuity');
    var acuityRight = getLatestResultByType(byEye.right, 'visual-acuity');
    var acuityBoth = getLatestResultByType(byEye.both, 'visual-acuity');
    var color = getLatestResultByType(history, 'color-blindness');
    var contrast = getLatestResultByType(history, 'contrast');
    var astigmatism = getLatestResultByType(history, 'astigmatism');
    var prescription = getLatestResultByType(history, 'prescription');

    var html = '<div class="clinical-summary-page">';
    html += '<div class="summary-header">';
    html += '<h2>Clinical Screening Summary</h2>';
    html += '<p class="summary-subtitle">Generated ' + new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString() + '</p>';
    html += '<p class="summary-disclaimer"><strong>Important:</strong> This is a screening, not a diagnosis or dispensable prescription. Consult a licensed optometrist or ophthalmologist.</p>';
    html += '</div>';

    // Visual Acuity Summary
    html += '<div class="summary-section">';
    html += '<h3>📏 Distance Vision (Visual Acuity)</h3>';
    if (acuityLeft || acuityRight || acuityBoth) {
      html += '<div class="eye-results-grid">';
      
      if (acuityLeft) {
        var logMARLeft = convertSnellenToLogMAR(acuityLeft.level);
        var interpLeft = logMARLeft != null ? interpretLogMAR(logMARLeft) : null;
        html += '<div class="eye-result-card">';
        html += '<div class="eye-badge" style="background: linear-gradient(135deg, #667eea, #764ba2);">Left Eye</div>';
        html += '<div class="result-value">' + (acuityLeft.level || 'N/A') + '</div>';
        if (interpLeft) {
          html += '<div class="result-category" style="color: ' + interpLeft.color + ';">' + interpLeft.category + '</div>';
          html += '<div class="result-logmar">logMAR: ' + logMARLeft.toFixed(2) + '</div>';
        }
        html += '<div class="result-date">Tested ' + new Date(acuityLeft.date).toLocaleDateString() + '</div>';
        html += '</div>';
      }
      
      if (acuityRight) {
        var logMARRight = convertSnellenToLogMAR(acuityRight.level);
        var interpRight = logMARRight != null ? interpretLogMAR(logMARRight) : null;
        html += '<div class="eye-result-card">';
        html += '<div class="eye-badge" style="background: linear-gradient(135deg, #f59e0b, #ef4444);">Right Eye</div>';
        html += '<div class="result-value">' + (acuityRight.level || 'N/A') + '</div>';
        if (interpRight) {
          html += '<div class="result-category" style="color: ' + interpRight.color + ';">' + interpRight.category + '</div>';
          html += '<div class="result-logmar">logMAR: ' + logMARRight.toFixed(2) + '</div>';
        }
        html += '<div class="result-date">Tested ' + new Date(acuityRight.date).toLocaleDateString() + '</div>';
        html += '</div>';
      }
      
      if (acuityBoth) {
        var logMARBoth = convertSnellenToLogMAR(acuityBoth.level);
        var interpBoth = logMARBoth != null ? interpretLogMAR(logMARBoth) : null;
        html += '<div class="eye-result-card">';
        html += '<div class="eye-badge" style="background: linear-gradient(135deg, #10b981, #059669);">Both Eyes</div>';
        html += '<div class="result-value">' + (acuityBoth.level || 'N/A') + '</div>';
        if (interpBoth) {
          html += '<div class="result-category" style="color: ' + interpBoth.color + ';">' + interpBoth.category + '</div>';
          html += '<div class="result-logmar">logMAR: ' + logMARBoth.toFixed(2) + '</div>';
        }
        html += '<div class="result-date">Tested ' + new Date(acuityBoth.date).toLocaleDateString() + '</div>';
        html += '</div>';
      }
      
      html += '</div>';
      
      // Recommendation
      var worstLogMAR = Math.max(
        logMARLeft != null ? logMARLeft : -999,
        logMARRight != null ? logMARRight : -999,
        logMARBoth != null ? logMARBoth : -999
      );
      if (worstLogMAR > -999) {
        var worstInterp = interpretLogMAR(worstLogMAR);
        html += '<div class="recommendation-box" style="border-left-color: ' + worstInterp.color + ';">';
        html += '<strong>Recommendation:</strong> ' + worstInterp.recommendation;
        html += '</div>';
      }
    } else {
      html += '<p class="no-data">No visual acuity tests completed yet.</p>';
    }
    html += '</div>';

    // Other Tests Summary
    html += '<div class="summary-section">';
    html += '<h3>🎨 Other Screening Tests</h3>';
    html += '<div class="other-tests-grid">';
    
    if (color) {
      var colorResult = color.result || 'Unknown';
      var colorClass = colorResult.toLowerCase().includes('normal') ? 'success' : 'warning';
      html += '<div class="test-result-card ' + colorClass + '">';
      html += '<div class="test-icon">🎨</div>';
      html += '<div class="test-info">';
      html += '<div class="test-name">Color Vision</div>';
      html += '<div class="test-result">' + colorResult + '</div>';
      html += '<div class="test-date">Tested ' + new Date(color.date).toLocaleDateString() + '</div>';
      html += '</div>';
      html += '</div>';
    }
    
    if (contrast) {
      html += '<div class="test-result-card">';
      html += '<div class="test-icon">🌓</div>';
      html += '<div class="test-info">';
      html += '<div class="test-name">Contrast Sensitivity</div>';
      html += '<div class="test-result">' + ((contrast.score || 0) * 100).toFixed(0) + '% correct</div>';
      if (contrast.level) html += '<div class="test-result">Level: ' + contrast.level + '</div>';
      html += '<div class="test-date">Tested ' + new Date(contrast.date).toLocaleDateString() + '</div>';
      html += '</div>';
      html += '</div>';
    }
    
    if (astigmatism) {
      var astigResult = astigmatism.result || 'Unknown';
      var astigClass = astigResult.toLowerCase().includes('no') ? 'success' : 'warning';
      html += '<div class="test-result-card ' + astigClass + '">';
      html += '<div class="test-icon">⚫</div>';
      html += '<div class="test-info">';
      html += '<div class="test-name">Astigmatism</div>';
      html += '<div class="test-result">' + astigResult + '</div>';
      html += '<div class="test-date">Tested ' + new Date(astigmatism.date).toLocaleDateString() + '</div>';
      html += '</div>';
      html += '</div>';
    }
    
    if (prescription) {
      html += '<div class="test-result-card info">';
      html += '<div class="test-icon">🔍</div>';
      html += '<div class="test-info">';
      html += '<div class="test-name">Refractive Screening</div>';
      html += '<div class="test-result">' + (prescription.estimate || 'See details') + '</div>';
      html += '<div class="test-date">Tested ' + new Date(prescription.date).toLocaleDateString() + '</div>';
      html += '</div>';
      html += '</div>';
    }
    
    html += '</div>';
    html += '</div>';

    // When to see an optometrist
    html += '<div class="summary-section recommendation-section">';
    html += '<h3>👁️ When to See an Optometrist</h3>';
    html += '<div class="recommendation-list">';
    html += '<div class="rec-item"><span class="rec-icon">✓</span> <strong>Annual eye exams:</strong> Recommended for everyone, even with good screening results.</div>';
    html += '<div class="rec-item"><span class="rec-icon">!</span> <strong>Vision changes:</strong> If you notice blurriness, difficulty reading, or eye strain.</div>';
    html += '<div class="rec-item"><span class="rec-icon">!</span> <strong>Reduced acuity:</strong> If your screening shows reduced vision (logMAR &gt; 0.3).</div>';
    html += '<div class="rec-item"><span class="rec-icon">!</span> <strong>Color deficiency:</strong> An optometrist can confirm and provide guidance.</div>';
    html += '<div class="rec-item"><span class="rec-icon">!</span> <strong>Astigmatism detected:</strong> Can be corrected with glasses or contact lenses.</div>';
    html += '<div class="rec-item"><span class="rec-icon">🚨</span> <strong>Urgent signs:</strong> Flashes of light, sudden vision loss, distortion, or eye pain — see an eye care professional immediately.</div>';
    html += '</div>';
    html += '</div>';

    // Actions
    html += '<div class="summary-actions">';
    html += '<button class="btn btn-gradient" onclick="SpectitResults.exportPDF()">📄 Download PDF Report</button>';
    html += '<button class="btn btn-ghost-dark" onclick="SpectitResults.shareResults()">📤 Share</button>';
    html += '<a href="#find-specialists" class="btn btn-primary">🔍 Find Optometrist Near You</a>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  function renderSummaryPage() {
    var container = document.getElementById('results-container');
    if (!container) return;
    
    var summaryHtml = generateClinicalSummary();
    container.innerHTML = summaryHtml;
  }

  function exportPDF() {
    // Generate a printable version
    var history = readHistory();
    if (!history.length) {
      alert('No results to export yet.');
      return;
    }

    // Open print dialog with a clean summary
    var printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to export PDF.');
      return;
    }

    var printContent = generatePrintableHTML();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(function() {
      printWindow.print();
    }, 500);
  }

  function generatePrintableHTML() {
    var summary = generateClinicalSummary();
    var userEmail = localStorage.getItem('spectit_user_email') || 'Not provided';
    var calibration = window.SpectitCalibration ? window.SpectitCalibration.getCalibrationSummary() : null;

    return '<!DOCTYPE html><html><head>' +
      '<meta charset="UTF-8">' +
      '<title>Spect-IT Vision Screening Report</title>' +
      '<style>' +
      'body { font-family: Arial, sans-serif; max-width: 800px; margin: 2rem auto; padding: 2rem; line-height: 1.6; }' +
      'h1, h2, h3 { color: #1e3a5f; }' +
      'h1 { font-size: 2rem; margin-bottom: 0.5rem; }' +
      '.subtitle { color: #666; font-size: 0.9rem; margin-bottom: 2rem; }' +
      '.disclaimer { background: #fef3c7; padding: 1rem; border-left: 4px solid #f59e0b; margin: 1rem 0; font-size: 0.9rem; }' +
      '.section { margin: 2rem 0; page-break-inside: avoid; }' +
      '.section h3 { border-bottom: 2px solid #667eea; padding-bottom: 0.5rem; }' +
      '.result-row { display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; margin: 0.5rem 0; border-radius: 4px; }' +
      '.footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.85rem; color: #666; text-align: center; }' +
      '@media print { body { margin: 0; padding: 1cm; } .no-print { display: none; } }' +
      '</style>' +
      '</head><body>' +
      '<h1>Spect-IT Vision Screening Report</h1>' +
      '<div class="subtitle">Generated: ' + new Date().toLocaleString() + '<br>Email: ' + userEmail + '</div>' +
      '<div class="disclaimer"><strong>Important Medical Notice:</strong> This is a vision screening for informational use only. It is NOT a diagnosis, medical assessment, or dispensable prescription. Always consult a licensed optometrist or ophthalmologist for clinical eye care decisions.</div>' +
      '<div class="section"><h3>Patient Information</h3>' +
      '<div class="result-row"><span><strong>Email:</strong></span><span>' + userEmail + '</span></div>' +
      (calibration && calibration.calibrated ? '<div class="result-row"><span><strong>Screen Calibration:</strong></span><span>' + calibration.pxPerMm + ' px/mm at ' + calibration.distanceCm + ' cm (' + calibration.ppi + ' PPI)</span></div>' : '') +
      '</div>' +
      '<div class="section"><h3>Screening Results</h3>';

    var history = readHistory();
    history.forEach(function(r) {
      printContent += '<div class="result-row">' +
        '<span><strong>' + (r.name || r.type) + '</strong> (' + new Date(r.date).toLocaleDateString() + ')</span>' +
        '<span>' + (r.level || r.result || ((r.score || 0) * 100).toFixed(0) + '%') + '</span>' +
        '</div>';
    });

    var printContent = generatePrintableHTML() + '</div>' +
      '<div class="section"><h3>Recommendations</h3>' +
      '<p>• Schedule regular comprehensive eye exams with a licensed optometrist or ophthalmologist.</p>' +
      '<p>• If screening shows reduced acuity or abnormalities, book an in-person eye exam soon.</p>' +
      '<p>• For urgent symptoms (sudden vision loss, flashes, pain), seek immediate professional care.</p>' +
      '</div>' +
      '<div class="footer">Generated by Spect-IT (spect-it.com) — For screening and informational use only</div>' +
      '</body></html>';

    return printContent;
  }

  function injectSummaryButton() {
    var resultsSection = document.getElementById('results');
    if (!resultsSection || document.getElementById('view-summary-btn')) return;
    
    var existingH2 = resultsSection.querySelector('h2');
    if (existingH2 && !document.getElementById('view-summary-btn')) {
      var btn = document.createElement('button');
      btn.id = 'view-summary-btn';
      btn.className = 'btn btn-gradient';
      btn.textContent = '📊 View Clinical Summary';
      btn.onclick = renderSummaryPage;
      btn.style.cssText = 'margin: 1rem 0;';
      existingH2.insertAdjacentElement('afterend', btn);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(injectSummaryButton, 1000);
  });

  window.SpectitResults = {
    generateClinicalSummary: generateClinicalSummary,
    renderSummaryPage: renderSummaryPage,
    exportPDF: exportPDF,
    shareResults: function() {
      var text = 'Spect-IT Vision Screening Report\n\n' + 
                 'Completed: ' + new Date().toLocaleDateString() + '\n\n' +
                 'View full results at spect-it.com\n\n' +
                 'Note: Screening only — not a diagnosis or prescription.';
      
      if (navigator.share) {
        navigator.share({ 
          title: 'Spect-IT Vision Screening', 
          text: text,
          url: 'https://www.spect-it.com'
        }).catch(function() {});
      } else {
        exportPDF();
      }
    }
  };
})();
