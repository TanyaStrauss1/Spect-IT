/* ==========================================================================
 * Spect-IT — Appointment Booking ("book a nearby optometrist")
 * --------------------------------------------------------------------------
 * Lets a user book an appointment with a specialist from Find Specialists,
 * optionally attaching their latest Spect-IT vision results for context.
 *
 * MVP notes:
 *  - Availability is simulated (deterministic per practice+day) until real
 *    provider accounts/schedules exist. Bookings are stored locally and, when
 *    a backend is available, can be forwarded. A confirmation + .ics is given.
 * ========================================================================== */
(function () {
  'use strict';

  var STORE_KEY = 'spectit_appointments';
  var SERVICES = [
    { id: 'exam', label: 'Comprehensive eye exam', mins: 45 },
    { id: 'contacts', label: 'Contact lens fitting', mins: 30 },
    { id: 'recheck', label: 'Follow-up / recheck', mins: 20 },
    { id: 'frames', label: 'Frame selection & fitting', mins: 30 },
    { id: 'child', label: 'Children\u2019s eye test', mins: 30 }
  ];

  var booking = null; // in-progress booking state

  /* ------------------------------------------------------------------ utils */
  function readAppointments() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function writeAppointments(list) { localStorage.setItem(STORE_KEY, JSON.stringify(list)); }
  function userEmail() {
    try { return (window.getUserEmail && window.getUserEmail()) || localStorage.getItem('spectit_user_email') || ''; }
    catch (e) { return ''; }
  }
  function findSpecialist(placeId) {
    try {
      if (typeof specialistsList !== 'undefined' && Array.isArray(specialistsList)) {
        return specialistsList.find(function (s) { return s.place_id === placeId; }) || null;
      }
    } catch (e) {}
    return null;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function hashStr(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return Math.abs(h); }

  function latestResultsSnapshot() {
    var hist;
    try { hist = JSON.parse(localStorage.getItem('testHistory') || '[]'); } catch (e) { hist = []; }
    var types = ['prescription', 'visual-acuity', 'astigmatism', 'duochrome', 'color-blindness', 'contrast', 'visual-field', 'amsler-grid', 'near-vision', 'stereo-acuity'];
    var snap = {};
    types.forEach(function (t) {
      var latest = null;
      hist.forEach(function (r) { if (r && r.type === t && (!latest || new Date(r.date) > new Date(latest.date))) latest = r; });
      if (latest) snap[t] = latest;
    });
    return snap;
  }
  function hasResults() { return Object.keys(latestResultsSnapshot()).length > 0; }

  /* --------------------------------------------------------------- calendar */
  function upcomingDays(n) {
    var out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d)); // skip Sundays
    }
    return out;
  }
  function ymd(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function slotsFor(placeId, dateStr) {
    var slots = [];
    for (var h = 9; h <= 16; h++) {
      ['00', '30'].forEach(function (m) {
        if (h === 16 && m === '30') return;
        var time = String(h).padStart(2, '0') + ':' + m;
        var taken = (hashStr(placeId + dateStr + time) % 3 === 0);
        slots.push({ time: time, taken: taken });
      });
    }
    return slots;
  }

  /* ----------------------------------------------------------------- modal */
  function ensureModal() {
    var m = document.getElementById('booking-modal');
    if (m) return m;
    m = document.createElement('div');
    m.id = 'booking-modal';
    m.className = 'rx-modal';
    m.innerHTML = '<div class="rx-modal-card"><button class="rx-modal-close" aria-label="Close" onclick="SpectitBooking.close()">\u00d7</button><div id="booking-body"></div></div>';
    document.body.appendChild(m);
    m.addEventListener('click', function (e) { if (e.target === m) close(); });
    return m;
  }
  function body() { return document.getElementById('booking-body'); }
  function openModal() { var m = ensureModal(); m.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function close() { var m = document.getElementById('booking-modal'); if (m) m.classList.remove('active'); document.body.style.overflow = ''; }

  /* ------------------------------------------------------------- book flow */
  function bookAppointment(placeId) {
    var sp = findSpecialist(placeId);
    if (!sp) { alert('Could not find this practice. Please search again.'); return; }
    booking = {
      specialist: {
        place_id: sp.place_id, name: sp.name, type: sp.type, address: sp.address,
        phone: sp.phone || '', website: sp.website || '',
        lat: sp.location && sp.location.lat, lng: sp.location && sp.location.lng,
        distance: sp.distance
      },
      service: SERVICES[0].id, date: null, time: null,
      patient: { name: '', email: userEmail(), phone: '', notes: '' },
      attachResults: hasResults()
    };
    openModal();
    renderService();
  }

  function stepHeader(step, title) {
    var dots = [1, 2, 3, 4].map(function (n) {
      return '<span style="width:8px;height:8px;border-radius:50%;background:' + (n <= step ? '#6366f1' : '#d1d5db') + ';display:inline-block;"></span>';
    }).join('<span style="width:18px;height:2px;background:#e6e8f0;display:inline-block;"></span>');
    return '<div class="bk-practice">Booking with <strong>' + esc(booking.specialist.name) + '</strong>' +
      (booking.specialist.distance != null ? ' \u00b7 ' + booking.specialist.distance.toFixed(1) + ' km' : '') + '</div>' +
      '<div style="display:flex;align-items:center;gap:6px;justify-content:center;margin:.5rem 0 1.1rem;">' + dots + '</div>' +
      '<h2 class="bk-title">' + title + '</h2>';
  }

  function renderService() {
    var opts = SERVICES.map(function (s) {
      var on = booking.service === s.id;
      return '<button class="bk-choice' + (on ? ' on' : '') + '" onclick="SpectitBooking.setService(\'' + s.id + '\')">' +
        '<span>' + esc(s.label) + '</span><span class="bk-mins">' + s.mins + ' min</span></button>';
    }).join('');
    body().innerHTML = stepHeader(1, 'Choose a service') +
      '<div class="bk-list">' + opts + '</div>' +
      '<div class="bk-actions"><span></span><button class="btn btn-gradient" onclick="SpectitBooking.toDate()">Continue</button></div>';
  }
  function setService(id) { booking.service = id; renderService(); }

  function renderDate() {
    var days = upcomingDays(14);
    var btns = days.map(function (d) {
      var ds = ymd(d), on = booking.date === ds;
      var wd = d.toLocaleDateString(undefined, { weekday: 'short' });
      var dm = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
      return '<button class="bk-day' + (on ? ' on' : '') + '" onclick="SpectitBooking.setDate(\'' + ds + '\')"><span class="bk-wd">' + wd + '</span><span class="bk-dm">' + dm + '</span></button>';
    }).join('');
    var slotHtml = '';
    if (booking.date) {
      var slots = slotsFor(booking.specialist.place_id, booking.date);
      slotHtml = '<div class="bk-slots-title">Available times</div><div class="bk-slots">' +
        slots.map(function (s) {
          if (s.taken) return '<button class="bk-slot taken" disabled>' + s.time + '</button>';
          var on = booking.time === s.time;
          return '<button class="bk-slot' + (on ? ' on' : '') + '" onclick="SpectitBooking.setTime(\'' + s.time + '\')">' + s.time + '</button>';
        }).join('') + '</div>' +
        '<p class="bk-note">Live availability is confirmed with the practice after you request the booking.</p>';
    }
    body().innerHTML = stepHeader(2, 'Pick a date &amp; time') +
      '<div class="bk-days">' + btns + '</div>' + slotHtml +
      '<div class="bk-actions"><button class="btn btn-ghost-dark" onclick="SpectitBooking.toService()">Back</button>' +
      '<button class="btn btn-gradient" ' + (booking.date && booking.time ? '' : 'disabled') + ' onclick="SpectitBooking.toDetails()">Continue</button></div>';
  }
  function setDate(ds) { booking.date = ds; booking.time = null; renderDate(); }
  function setTime(t) { booking.time = t; renderDate(); }

  function renderDetails() {
    var resultsCount = Object.keys(latestResultsSnapshot()).length;
    body().innerHTML = stepHeader(3, 'Your details') +
      '<div class="bk-form">' +
        '<label>Full name<input id="bk-name" type="text" value="' + esc(booking.patient.name) + '" placeholder="Your name"></label>' +
        '<label>Email<input id="bk-email" type="email" value="' + esc(booking.patient.email) + '" placeholder="you@email.com"></label>' +
        '<label>Phone<input id="bk-phone" type="tel" value="' + esc(booking.patient.phone) + '" placeholder="+27 ..."></label>' +
        '<label>Reason / notes (optional)<textarea id="bk-notes" rows="2" placeholder="e.g. blurry distance vision">' + esc(booking.patient.notes) + '</textarea></label>' +
        (resultsCount ? '<label class="bk-check"><input type="checkbox" id="bk-attach" ' + (booking.attachResults ? 'checked' : '') + '> Attach my latest Spect-IT results (' + resultsCount + ') for the optometrist</label>' : '') +
      '</div>' +
      '<div class="bk-actions"><button class="btn btn-ghost-dark" onclick="SpectitBooking.toDate()">Back</button>' +
      '<button class="btn btn-gradient" onclick="SpectitBooking.confirm()">Request booking</button></div>';
  }

  function collectDetails() {
    var g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
    booking.patient.name = g('bk-name');
    booking.patient.email = g('bk-email');
    booking.patient.phone = g('bk-phone');
    booking.patient.notes = g('bk-notes');
    var att = document.getElementById('bk-attach');
    booking.attachResults = att ? att.checked : false;
  }

  function confirm() {
    collectDetails();
    if (!booking.patient.name) { alert('Please enter your name.'); return; }
    if (!booking.patient.email || booking.patient.email.indexOf('@') === -1) { alert('Please enter a valid email.'); return; }

    var svc = SERVICES.filter(function (s) { return s.id === booking.service; })[0] || SERVICES[0];
    var appt = {
      id: 'appt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      createdAt: new Date().toISOString(),
      status: 'requested',
      specialist: booking.specialist,
      service: svc.id, serviceLabel: svc.label, durationMins: svc.mins,
      date: booking.date, time: booking.time,
      patient: booking.patient,
      results: booking.attachResults ? latestResultsSnapshot() : null
    };

    var list = readAppointments();
    list.push(appt);
    writeAppointments(list);

    try {
      if (booking.patient.email) localStorage.setItem('spectit_user_email', booking.patient.email);
    } catch (e) {}

    // Cloud sync (local-first is already done above); non-blocking.
    try {
      if (window.SupabaseStorage && window.SupabaseStorage.appointments) {
        window.SupabaseStorage.appointments.save(appt).then(function (res) {
          appt._synced = !!(res && res.method && res.method.indexOf('supabase') === 0);
        }).catch(function () {});
      }
    } catch (e) {}

    notifyBooking(appt);
    renderConfirmation(appt);
  }

  // Best-effort notification via the existing Supabase Edge Function ("send-email").
  // Works once that function is deployed; silently no-ops otherwise.
  function notifyBooking(appt) {
    try {
      var when = fmtDatePretty(appt.date, appt.time);
      var patientBody = 'Hi ' + appt.patient.name + ',\n\nYour appointment request has been sent to ' +
        appt.specialist.name + ' for ' + when + ' (' + appt.serviceLabel + ').\n' +
        'The practice will confirm the time with you. Address: ' + (appt.specialist.address || '') + '.\n\n' +
        (appt.results ? 'Your latest Spect-IT results were attached for the optometrist.\n\n' : '') +
        'This is an appointment request via Spect-IT, not medical advice.';

      var invoke = window.SupabaseStorage && window.SupabaseStorage.invoke;
      if (!invoke) return;

      invoke('send-email', {
        to: appt.patient.email,
        subject: 'Your Spect-IT appointment request \u2013 ' + appt.specialist.name,
        text: patientBody
      }).catch(function () {});

      if (appt.specialist.phone) {
        invoke('send-sms', {
          to: appt.specialist.phone,
          body: 'Spect-IT: New booking request from ' + appt.patient.name + ' for ' + when + '. Open your practice console to confirm.'
        }).catch(function () {});
      }

      var practiceEmail = appt.specialist.email;
      if (practiceEmail) {
        invoke('send-email', {
          to: practiceEmail,
          subject: 'New Spect-IT appointment request \u2013 ' + appt.patient.name,
          text: 'New appointment request:\n\nPatient: ' + appt.patient.name + ' (' + appt.patient.email + ')\n' +
            'Phone: ' + (appt.patient.phone || '\u2014') + '\nService: ' + appt.serviceLabel + '\nWhen: ' + when + '\n' +
            (appt.patient.notes ? 'Notes: ' + appt.patient.notes + '\n' : '') +
            (appt.results ? 'Spect-IT results attached in the booking record.\n' : '')
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function fmtDatePretty(dateStr, time) {
    try {
      var d = new Date(dateStr + 'T' + (time || '09:00'));
      return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }) + ' at ' + time;
    } catch (e) { return dateStr + ' ' + time; }
  }

  function renderConfirmation(appt) {
    var attached = appt.results ? Object.keys(appt.results).length : 0;
    body().innerHTML =
      '<div class="bk-confirm">' +
        '<div class="bk-check-badge">\u2713</div>' +
        '<h2 class="bk-title">Booking requested</h2>' +
        '<p class="bk-sub">We\u2019ve saved your request. The practice will confirm the time with you.</p>' +
        '<div class="bk-summary">' +
          '<div><span>Practice</span><strong>' + esc(appt.specialist.name) + '</strong></div>' +
          '<div><span>Service</span><strong>' + esc(appt.serviceLabel) + '</strong></div>' +
          '<div><span>When</span><strong>' + esc(fmtDatePretty(appt.date, appt.time)) + '</strong></div>' +
          '<div><span>Where</span><strong>' + esc(appt.specialist.address || '\u2014') + '</strong></div>' +
          (attached ? '<div><span>Attached</span><strong>' + attached + ' test result(s)</strong></div>' : '') +
        '</div>' +
        '<div class="bk-actions" style="justify-content:center;flex-wrap:wrap;gap:.6rem;">' +
          '<button class="btn btn-gradient" onclick="SpectitBooking.ics(\'' + appt.id + '\')">Add to calendar</button>' +
          (appt.specialist.lat ? '<button class="btn btn-ghost-dark" onclick="SpectitBooking.directions(' + appt.specialist.lat + ',' + appt.specialist.lng + ')">Directions</button>' : '') +
          '<button class="btn btn-ghost-dark" onclick="SpectitBooking.mine()">My appointments</button>' +
        '</div>' +
        '<p class="bk-note" style="margin-top:1rem;">This is an appointment request via Spect-IT, not medical advice. The practice confirms final availability.</p>' +
      '</div>';
  }

  function directions(lat, lng) { window.open('https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng, '_blank'); }

  function toICSDate(dateStr, time) {
    var d = new Date(dateStr + 'T' + (time || '09:00'));
    function p(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(d.getHours()) + p(d.getMinutes()) + '00';
  }
  function ics(id) {
    var appt = readAppointments().filter(function (a) { return a.id === id; })[0];
    if (!appt) return;
    var start = toICSDate(appt.date, appt.time);
    var endD = new Date(appt.date + 'T' + appt.time); endD.setMinutes(endD.getMinutes() + (appt.durationMins || 30));
    function p(n) { return String(n).padStart(2, '0'); }
    var end = endD.getFullYear() + p(endD.getMonth() + 1) + p(endD.getDate()) + 'T' + p(endD.getHours()) + p(endD.getMinutes()) + '00';
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Spect-IT//Booking//EN', 'BEGIN:VEVENT',
      'UID:' + appt.id + '@spect-it.com',
      'DTSTAMP:' + start, 'DTSTART:' + start, 'DTEND:' + end,
      'SUMMARY:' + (appt.serviceLabel || 'Optometrist appointment') + ' \u2013 ' + appt.specialist.name,
      'LOCATION:' + (appt.specialist.address || '').replace(/,/g, '\\,'),
      'DESCRIPTION:Booked via Spect-IT.' + (appt.patient.notes ? (' Notes: ' + appt.patient.notes.replace(/,/g, '\\,')) : ''),
      'END:VEVENT', 'END:VCALENDAR'
    ];
    var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'spect-it-appointment.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ------------------------------------------------------- my appointments */
  function mine() {
    openModal();
    renderAppointmentsList(readAppointments()); // instant from local
    // Refresh from cloud (merged) if available.
    try {
      var email = userEmail();
      if (email && window.SupabaseStorage && window.SupabaseStorage.appointments) {
        window.SupabaseStorage.appointments.list(email).then(function (list) {
          if (Array.isArray(list)) { writeAppointments(list); renderAppointmentsList(list); }
        }).catch(function () {});
      }
    } catch (e) {}
  }

  function renderAppointmentsList(raw) {
    var list = (raw || []).slice().sort(function (a, b) { return (a.date + a.time) < (b.date + b.time) ? -1 : 1; });
    var now = new Date();
    var content;
    if (!list.length) {
      content = '<p class="bk-sub" style="text-align:center;">No appointments yet. Find a specialist and book one.</p>';
    } else {
      content = '<div class="bk-list">' + list.map(function (a) {
        var past = new Date(a.date + 'T' + a.time) < now;
        var inactive = (a.status === 'cancelled' || a.status === 'declined');
        var dim = past || inactive;
        return '<div class="bk-appt' + (dim ? ' past' : '') + '">' +
          '<div class="bk-appt-main"><strong>' + esc(a.specialist.name) + '</strong>' +
          '<span>' + esc(a.serviceLabel) + '</span>' +
          '<span>' + esc(fmtDatePretty(a.date, a.time)) + '</span></div>' +
          '<div class="bk-appt-side">' +
            '<span class="bk-status ' + esc(a.status) + '">' + esc(a.status) + '</span>' +
            (past || inactive ? '' : '<button class="bk-cancel" onclick="SpectitBooking.cancel(\'' + a.id + '\')">Cancel</button>') +
          '</div></div>';
      }).join('') + '</div>';
    }
    body().innerHTML =
      '<h2 class="bk-title">My appointments</h2>' + content +
      '<div class="bk-actions" style="justify-content:center;"><button class="btn btn-gradient" onclick="SpectitBooking.close()">Done</button></div>';
  }
  function cancel(id) {
    if (!window.confirm('Cancel this appointment request?')) return;
    // Sync cancellation so the practice sees it; keep the record as "cancelled".
    try {
      if (window.SupabaseStorage && window.SupabaseStorage.appointments) {
        window.SupabaseStorage.appointments.setStatus(id, 'cancelled');
      }
    } catch (e) {}
    var list = readAppointments().map(function (a) { return a.id === id ? Object.assign({}, a, { status: 'cancelled' }) : a; });
    writeAppointments(list);
    renderAppointmentsList(list);
  }

  /* --------------------------------------------------------------- exports */
  window.SpectitBooking = {
    open: bookAppointment,
    close: close,
    setService: setService, toService: renderService,
    toDate: renderDate, setDate: setDate, setTime: setTime,
    toDetails: renderDetails, confirm: confirm,
    ics: ics, directions: directions, mine: mine, cancel: cancel
  };
  // Global entry points used by specialist cards / nav.
  window.bookAppointment = bookAppointment;
  window.myAppointments = mine;
})();
