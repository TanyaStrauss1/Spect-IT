// Advanced Eye Testing Platform - Main App Logic

// Register Service Worker for PWA / Install as App
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js', { scope: './' }).then(function (reg) {
      if (reg.installing) console.log('Spect-IT: Service worker installing');
      else if (reg.waiting) console.log('Spect-IT: Service worker waiting');
      else if (reg.active) console.log('Spect-IT: Service worker active');
    }).catch(function (err) { console.warn('Spect-IT: Service worker registration failed', err); });
  });
}

function spectitIsStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.navigator.standalone === true;
}

function spectitIsIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent || '');
}

var spectitDeferredInstall = null;

window.addEventListener('beforeinstallprompt', function (event) {
  event.preventDefault();
  spectitDeferredInstall = event;
  var btn = document.getElementById('install-app-btn');
  if (btn && !spectitIsStandalone()) btn.hidden = false;
});

window.addEventListener('appinstalled', function () {
  spectitDeferredInstall = null;
  var btn = document.getElementById('install-app-btn');
  if (btn) btn.hidden = true;
  closeIosInstallHelp();
});

function showIosInstallHelp() {
  if (document.getElementById('ios-install-modal')) return;
  var modal = document.createElement('div');
  modal.id = 'ios-install-modal';
  modal.className = 'ios-install-modal';
  modal.innerHTML =
    '<div class="ios-install-card" role="dialog" aria-labelledby="ios-install-title">' +
      '<button type="button" class="ios-install-close" aria-label="Close" onclick="closeIosInstallHelp()">&times;</button>' +
      '<h2 id="ios-install-title">Install Spect-IT</h2>' +
      '<p>Add Spect-IT to your Home Screen to use it like an app.</p>' +
      '<ol>' +
        '<li>Tap the Share button in Safari.</li>' +
        '<li>Choose <strong>Add to Home Screen</strong>.</li>' +
        '<li>Tap Add. Open Spect-IT from your Home Screen.</li>' +
      '</ol>' +
      '<p class="ios-install-note">On Android or desktop Chrome, use Install app in the address bar or the header button.</p>' +
      '<button type="button" class="btn btn-primary" onclick="closeIosInstallHelp()">Got it</button>' +
    '</div>';
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeIosInstallHelp();
  });
  document.body.appendChild(modal);
}

function closeIosInstallHelp() {
  var modal = document.getElementById('ios-install-modal');
  if (modal) modal.remove();
}

function installSpectItApp() {
  if (spectitDeferredInstall) {
    spectitDeferredInstall.prompt();
    spectitDeferredInstall.userChoice.then(function () {
      spectitDeferredInstall = null;
      var btn = document.getElementById('install-app-btn');
      if (btn) btn.hidden = true;
    });
    return;
  }
  showIosInstallHelp();
}

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('install-app-btn');
  if (!btn) return;
  if (spectitIsStandalone()) {
    btn.hidden = true;
    document.body.classList.add('spectit-standalone');
    return;
  }
  if (spectitIsIos() || spectitDeferredInstall) btn.hidden = false;
});

// Smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
    // Handle hash navigation on page load
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === window.location.hash) {
                        link.classList.add('active');
                    }
                });
            }, 100);
        }
    }
    
    // Handle navigation clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const hash = this.getAttribute('href');
            const target = document.querySelector(hash);
            if (target) {
                // Update URL hash
                window.location.hash = hash;
                
                // Scroll to target
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
});

// Update active nav on scroll
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Close modal on outside click (guard in case modal is created later)
const testModal = document.getElementById('test-modal');
if (testModal) {
    testModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeTest();
        }
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeTest();
    }
});

