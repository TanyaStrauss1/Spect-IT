/* ==========================================================================
 * Spect-IT — Guided Screening Journey
 * Recommended test order, progress tracking, pre-test checklists, session resume
 * ========================================================================== */
(function () {
  'use strict';

  var SESSION_KEY = 'spectit_screening_session';
  var PROGRESS_KEY = 'spectit_test_progress';

  // Recommended test order with clinical rationale
  var RECOMMENDED_TESTS = [
    {
      id: 'visual-acuity',
      name: 'Visual Acuity',
      icon: '📏',
      duration: '3-5 min',
      why: 'Baseline measurement of distance vision — the foundation for all other tests',
      requires: ['distance', 'lighting', 'glasses'],
      category: 'essential'
    },
    {
      id: 'near-vision',
      name: 'Near Vision (Jaeger)',
      icon: '📖',
      duration: '2-3 min',
      why: 'Reading acuity at close range — important for daily tasks',
      requires: ['lighting', 'glasses'],
      category: 'essential'
    },
    {
      id: 'contrast',
      name: 'Contrast Sensitivity',
      icon: '🌓',
      duration: '3-4 min',
      why: 'Assesses how well you see in low light or fog — critical for night driving',
      requires: ['distance', 'lighting', 'glasses'],
      category: 'essential'
    },
    {
      id: 'color-blindness',
      name: 'Color Vision',
      icon: '🎨',
      duration: '2-3 min',
      why: 'Detects color vision deficiencies using Ishihara plates',
      requires: ['lighting'],
      category: 'recommended'
    },
    {
      id: 'astigmatism',
      name: 'Astigmatism',
      icon: '⚫',
      duration: '2-3 min',
      why: 'Identifies corneal irregularities that blur vision',
      requires: ['distance', 'lighting', 'glasses-off'],
      category: 'recommended'
    },
    {
      id: 'duochrome',
      name: 'Duochrome (Red-Green)',
      icon: '🔴🟢',
      duration: '1-2 min',
      why: 'Refines sphere power estimate for better accuracy',
      requires: ['distance', 'lighting'],
      category: 'recommended'
    },
    {
      id: 'amsler-grid',
      name: 'Amsler Grid',
      icon: '⊞',
      duration: '1-2 min',
      why: 'Screens for macular health issues — important for early detection',
      requires: ['lighting', 'glasses', 'occlusion'],
      category: 'recommended'
    },
    {
      id: 'visual-field',
      name: 'Visual Field',
      icon: '👁️',
      duration: '5-7 min',
      why: 'Checks peripheral vision and blind spots',
      requires: ['distance', 'lighting', 'occlusion'],
      category: 'advanced'
    },
    {
      id: 'stereo-acuity',
      name: 'Stereo Acuity',
      icon: '👀',
      duration: '2-3 min',
      why: 'Assesses depth perception and binocular vision',
      requires: ['distance', 'lighting'],
      category: 'advanced'
    },
    {
      id: 'prescription',
      name: 'Refractive Screening',
      icon: '🔍',
      duration: '5-10 min',
      why: 'Estimates sphere, cylinder & axis from your other test results',
      requires: ['completed-acuity', 'completed-astigmatism'],
      category: 'summary'
    }
  ];

  // Pre-test checklist requirements
  var CHECKLIST_ITEMS = {
    distance: {
      id: 'distance',
      text: 'Position yourself at the recommended distance from your screen',
      detail: 'Most tests require 3-6 meters. Follow the on-screen guidance.',
      icon: '📏'
    },
    lighting: {
      id: 'lighting',
      text: 'Ensure moderate room lighting without glare on the display',
      detail: 'Avoid bright sunlight or darkness. Your screen should be clearly visible.',
      icon: '💡'
    },
    glasses: {
      id: 'glasses',
      text: 'Wear your usual glasses or contact lenses',
      detail: 'Test with your normal vision correction unless instructed otherwise.',
      icon: '👓'
    },
    'glasses-off': {
      id: 'glasses-off',
      text: 'Remove glasses or contact lenses for this test',
      detail: 'This test measures your uncorrected vision.',
      icon: '👓'
    },
    occlusion: {
      id: 'occlusion',
      text: 'You will need to cover one eye during this test',
      detail: 'Use your hand, a tissue, or an eye patch. Do not press on the closed eye.',
      icon: '👁️'
    },
    'completed-acuity': {
      id: 'completed-acuity',
      text: 'Complete the Visual Acuity test first',
      detail: 'This test uses your acuity results for accurate estimation.',
      icon: '✓'
    },
    'completed-astigmatism': {
      id: 'completed-astigmatism',
      text: 'Complete the Astigmatism test first',
      detail: 'This test uses your astigmatism results for accurate estimation.',
      icon: '✓'
    }
  };

  function getProgress() {
    try {
      var p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
      return {
        completed: p.completed || [],
        inProgress: p.inProgress || null,
        lastUpdated: p.lastUpdated || null
      };
    } catch (e) {
      return { completed: [], inProgress: null, lastUpdated: null };
    }
  }

  function saveProgress(completed, inProgress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({
      completed: completed,
      inProgress: inProgress,
      lastUpdated: Date.now()
    }));
  }

  function markTestComplete(testId) {
    var p = getProgress();
    if (!p.completed.includes(testId)) {
      p.completed.push(testId);
    }
    p.inProgress = null;
    saveProgress(p.completed, p.inProgress);
    updateJourneyUI();
  }

  function markTestInProgress(testId) {
    var p = getProgress();
    p.inProgress = testId;
    saveProgress(p.completed, p.inProgress);
  }

  function getNextRecommendedTest() {
    var p = getProgress();
    var completed = p.completed || [];
    
    // Find first uncompleted test in recommended order
    for (var i = 0; i < RECOMMENDED_TESTS.length; i++) {
      var test = RECOMMENDED_TESTS[i];
      if (!completed.includes(test.id)) {
        // Check if requirements are met
        var reqsMet = true;
        if (test.requires) {
          for (var j = 0; j < test.requires.length; j++) {
            var req = test.requires[j];
            if (req === 'completed-acuity' && !completed.includes('visual-acuity')) {
              reqsMet = false;
              break;
            }
            if (req === 'completed-astigmatism' && !completed.includes('astigmatism')) {
              reqsMet = false;
              break;
            }
          }
        }
        if (reqsMet) return test;
      }
    }
    return null;
  }

  function calculateProgress() {
    var p = getProgress();
    var completed = p.completed || [];
    var total = RECOMMENDED_TESTS.length;
    var percentage = Math.round((completed.length / total) * 100);
    
    return {
      completed: completed.length,
      total: total,
      percentage: percentage,
      remaining: total - completed.length
    };
  }

  function renderJourneyModal() {
    var modal = document.getElementById('journey-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'journey-modal';
      modal.className = 'rx-modal';
      document.body.appendChild(modal);
    }

    var p = getProgress();
    var progress = calculateProgress();
    var nextTest = getNextRecommendedTest();
    
    var essentialTests = RECOMMENDED_TESTS.filter(function(t) { return t.category === 'essential'; });
    var recommendedTests = RECOMMENDED_TESTS.filter(function(t) { return t.category === 'recommended'; });
    var advancedTests = RECOMMENDED_TESTS.filter(function(t) { return t.category === 'advanced'; });
    var summaryTests = RECOMMENDED_TESTS.filter(function(t) { return t.category === 'summary'; });

    function renderTestList(tests, categoryName) {
      return tests.map(function(test) {
        var isCompleted = p.completed.includes(test.id);
        var isInProgress = p.inProgress === test.id;
        var canStart = true;
        
        // Check requirements
        if (test.requires) {
          for (var j = 0; j < test.requires.length; j++) {
            var req = test.requires[j];
            if (req === 'completed-acuity' && !p.completed.includes('visual-acuity')) {
              canStart = false;
              break;
            }
            if (req === 'completed-astigmatism' && !p.completed.includes('astigmatism')) {
              canStart = false;
              break;
            }
          }
        }

        var statusBadge = isCompleted 
          ? '<span class="test-status completed">✓ Complete</span>'
          : isInProgress 
            ? '<span class="test-status in-progress">⏳ In progress</span>'
            : '<span class="test-status pending">○ Not started</span>';

        var startBtn = isCompleted
          ? '<button class="btn btn-ghost-dark btn-sm" onclick="SpectitJourney.retakeTest(\'' + test.id + '\')">Retake</button>'
          : canStart
            ? '<button class="btn btn-gradient btn-sm" onclick="SpectitJourney.startTest(\'' + test.id + '\')">Start</button>'
            : '<button class="btn btn-ghost-dark btn-sm" disabled>Requires previous tests</button>';

        return '<div class="journey-test-card' + (isCompleted ? ' completed' : '') + (isInProgress ? ' in-progress' : '') + '">' +
          '<div class="journey-test-header">' +
            '<div class="journey-test-icon">' + test.icon + '</div>' +
            '<div class="journey-test-info">' +
              '<h4>' + test.name + '</h4>' +
              '<p class="journey-test-duration">' + test.duration + '</p>' +
            '</div>' +
            statusBadge +
          '</div>' +
          '<p class="journey-test-why"><strong>Why:</strong> ' + test.why + '</p>' +
          '<div class="journey-test-actions">' +
            startBtn +
          '</div>' +
        '</div>';
      }).join('');
    }

    modal.innerHTML =
      '<div class="rx-modal-card journey-modal-card" style="max-width: 900px;">' +
        '<button class="rx-modal-close" type="button" aria-label="Close" onclick="SpectitJourney.closeJourney()">&times;</button>' +
        '<div class="journey-header">' +
          '<h2 class="bk-title">Your Vision Screening Journey</h2>' +
          '<p class="bk-sub">Complete a comprehensive suite of clinical-grade vision tests. Results are screening only — not a diagnosis.</p>' +
          '<div class="journey-progress-bar">' +
            '<div class="journey-progress-fill" style="width: ' + progress.percentage + '%"></div>' +
          '</div>' +
          '<div class="journey-progress-text">' +
            '<strong>' + progress.completed + ' of ' + progress.total + ' tests completed</strong>' +
            (progress.remaining > 0 ? ' (' + progress.remaining + ' remaining)' : ' — All done!') +
          '</div>' +
        '</div>' +
        
        (nextTest ? 
          '<div class="journey-next-test">' +
            '<h3>🎯 Recommended Next</h3>' +
            '<div class="journey-test-card featured">' +
              '<div class="journey-test-header">' +
                '<div class="journey-test-icon">' + nextTest.icon + '</div>' +
                '<div class="journey-test-info">' +
                  '<h4>' + nextTest.name + '</h4>' +
                  '<p class="journey-test-duration">' + nextTest.duration + '</p>' +
                '</div>' +
              '</div>' +
              '<p class="journey-test-why"><strong>Why now:</strong> ' + nextTest.why + '</p>' +
              '<div class="journey-test-actions">' +
                '<button class="btn btn-gradient" onclick="SpectitJourney.startTest(\'' + nextTest.id + '\')">Start ' + nextTest.name + '</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        : '') +

        '<div class="journey-all-tests">' +
          '<h3>Essential Tests</h3>' +
          '<div class="journey-test-grid">' + renderTestList(essentialTests, 'essential') + '</div>' +
          
          '<h3 style="margin-top: 2rem;">Recommended Tests</h3>' +
          '<div class="journey-test-grid">' + renderTestList(recommendedTests, 'recommended') + '</div>' +
          
          '<h3 style="margin-top: 2rem;">Advanced Tests</h3>' +
          '<div class="journey-test-grid">' + renderTestList(advancedTests, 'advanced') + '</div>' +
          
          '<h3 style="margin-top: 2rem;">Summary & Screening Estimate</h3>' +
          '<div class="journey-test-grid">' + renderTestList(summaryTests, 'summary') + '</div>' +
        '</div>' +

        '<div class="journey-footer">' +
          '<button class="btn btn-ghost-dark" onclick="SpectitJourney.resetProgress()">Reset Progress</button>' +
          '<button class="btn btn-gradient" onclick="SpectitJourney.closeJourney()">Close</button>' +
        '</div>' +
      '</div>';

    modal.classList.add('active');
  }

  function renderPreTestChecklist(testId, onProceed) {
    var test = RECOMMENDED_TESTS.find(function(t) { return t.id === testId; });
    if (!test) {
      console.warn('Test not found:', testId);
      if (onProceed) onProceed();
      return;
    }

    var modal = document.getElementById('checklist-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'checklist-modal';
      modal.className = 'rx-modal';
      document.body.appendChild(modal);
    }

    var checklistHtml = '<div class="checklist-items">';
    if (test.requires && test.requires.length > 0) {
      test.requires.forEach(function(req) {
        var item = CHECKLIST_ITEMS[req];
        if (item) {
          checklistHtml += 
            '<div class="checklist-item">' +
              '<div class="checklist-icon">' + item.icon + '</div>' +
              '<div class="checklist-content">' +
                '<div class="checklist-text">' + item.text + '</div>' +
                '<div class="checklist-detail">' + item.detail + '</div>' +
              '</div>' +
              '<input type="checkbox" class="checklist-checkbox" id="check-' + item.id + '">' +
            '</div>';
        }
      });
    }
    checklistHtml += '</div>';

    // Add general safety checks
    checklistHtml += '<div class="checklist-safety">' +
      '<h4>Safety Checklist</h4>' +
      '<div class="checklist-item">' +
        '<div class="checklist-icon">🛑</div>' +
        '<div class="checklist-content">' +
          '<div class="checklist-text">Safe, stationary setting</div>' +
          '<div class="checklist-detail">Never take tests while driving or operating machinery</div>' +
        '</div>' +
        '<input type="checkbox" class="checklist-checkbox" id="check-safety">' +
      '</div>' +
      '<div class="checklist-item">' +
        '<div class="checklist-icon">📱</div>' +
        '<div class="checklist-content">' +
          '<div class="checklist-text">Screen brightness 70%+ and clean</div>' +
          '<div class="checklist-detail">Ensure your screen is bright and free of smudges</div>' +
        '</div>' +
        '<input type="checkbox" class="checklist-checkbox" id="check-screen">' +
      '</div>' +
    '</div>';

    modal.innerHTML =
      '<div class="rx-modal-card" style="max-width: 600px;">' +
        '<button class="rx-modal-close" type="button" aria-label="Close" onclick="SpectitJourney.closeChecklist()">&times;</button>' +
        '<h2 class="bk-title">' + test.icon + ' ' + test.name + '</h2>' +
        '<p class="bk-sub">Before you begin, please confirm the following:</p>' +
        checklistHtml +
        '<div class="bk-actions" style="margin-top: 2rem;">' +
          '<button class="btn btn-ghost-dark" onclick="SpectitJourney.closeChecklist()">Cancel</button>' +
          '<button class="btn btn-gradient" onclick="SpectitJourney.proceedWithTest(\'' + testId + '\')">I\'m Ready — Start Test</button>' +
        '</div>' +
        '<p style="margin-top: 1rem; font-size: 0.9rem; color: #666; text-align: center;">You can skip this checklist in the future by clicking "Skip Checklist" in settings.</p>' +
      '</div>';

    modal.classList.add('active');
    
    // Store callback for proceed
    window._spectitChecklistCallback = onProceed;
  }

  function closeChecklist() {
    var modal = document.getElementById('checklist-modal');
    if (modal) modal.classList.remove('active');
  }

  function proceedWithTest(testId) {
    closeChecklist();
    var callback = window._spectitChecklistCallback;
    window._spectitChecklistCallback = null;
    
    // Map test IDs to their start functions
    var testFunctions = {
      'visual-acuity': 'startVisualAcuityTest',
      'color-blindness': 'startColorBlindnessTest',
      'astigmatism': 'startAstigmatismTest',
      'contrast': 'startContrastTest',
      'visual-field': 'startVisualFieldTest',
      'prescription': 'startPrescriptionTest',
      'amsler-grid': 'startAmslerGridTest',
      'near-vision': 'startNearVisionTest',
      'duochrome': 'startDuochromeTest',
      'stereo-acuity': 'startStereoAcuityTest'
    };

    markTestInProgress(testId);
    
    var fnName = testFunctions[testId];
    if (fnName && typeof window[fnName] === 'function') {
      window[fnName]();
    } else {
      console.error('Test function not found:', fnName);
      alert('Test not available yet.');
    }
  }

  function startTest(testId) {
    renderPreTestChecklist(testId, function() {
      proceedWithTest(testId);
    });
  }

  function retakeTest(testId) {
    startTest(testId);
  }

  function closeJourney() {
    var modal = document.getElementById('journey-modal');
    if (modal) modal.classList.remove('active');
  }

  function resetProgress() {
    if (confirm('Are you sure you want to reset all progress? Your test results will be preserved.')) {
      localStorage.removeItem(PROGRESS_KEY);
      renderJourneyModal();
    }
  }

  function updateJourneyUI() {
    // Update any journey UI elements on the page
    var journeyBtn = document.getElementById('journey-progress-btn');
    if (journeyBtn) {
      var progress = calculateProgress();
      journeyBtn.textContent = '🎯 Journey Progress: ' + progress.completed + '/' + progress.total;
    }
  }

  function injectJourneyButton() {
    // Add journey button to hero section
    var hero = document.querySelector('.hero-cta');
    if (hero && !document.getElementById('journey-progress-btn')) {
      var progress = calculateProgress();
      var btn = document.createElement('button');
      btn.id = 'journey-progress-btn';
      btn.className = 'btn btn-ghost';
      btn.textContent = '🎯 Guided Journey: ' + progress.completed + '/' + progress.total + ' Complete';
      btn.onclick = function() { renderJourneyModal(); };
      btn.style.marginTop = '1rem';
      hero.appendChild(btn);
    }
  }

  // Auto-track test completions from localStorage
  function syncProgressWithResults() {
    try {
      var history = JSON.parse(localStorage.getItem('testHistory') || '[]');
      var p = getProgress();
      var updated = false;

      history.forEach(function(result) {
        if (result.type && !p.completed.includes(result.type)) {
          p.completed.push(result.type);
          updated = true;
        }
      });

      if (updated) {
        saveProgress(p.completed, p.inProgress);
      }
    } catch (e) {
      console.error('Error syncing progress:', e);
    }
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
      syncProgressWithResults();
      injectJourneyButton();
      updateJourneyUI();
    }, 1000);
  });

  // Public API
  window.SpectitJourney = {
    openJourney: renderJourneyModal,
    closeJourney: closeJourney,
    closeChecklist: closeChecklist,
    startTest: startTest,
    retakeTest: retakeTest,
    proceedWithTest: proceedWithTest,
    markTestComplete: markTestComplete,
    markTestInProgress: markTestInProgress,
    getProgress: getProgress,
    getNextRecommendedTest: getNextRecommendedTest,
    resetProgress: resetProgress
  };
})();
