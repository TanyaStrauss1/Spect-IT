/* Spect-IT — enhanced UX interactions (progressive, non-blocking).
   Adds: sticky-header state, mobile nav, scroll reveal, animated counters.
   Safe: only touches new markup; never interferes with test/shop/specialist logic. */
(function () {
    'use strict';

    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var header = document.querySelector('header');
        var toggle = document.querySelector('.nav-toggle');
        var body = document.body;

        /* Sticky header state */
        var onScroll = function () {
            if (!header) return;
            header.classList.toggle('scrolled', window.scrollY > 12);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        /* Mobile nav */
        if (toggle) {
            toggle.addEventListener('click', function () {
                var open = body.classList.toggle('nav-open');
                toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        }
        // Close the mobile menu after tapping a link or the backdrop
        document.querySelectorAll('.nav-links a, .nav-links button').forEach(function (a) {
            a.addEventListener('click', function () { body.classList.remove('nav-open'); });
        });
        document.addEventListener('click', function (e) {
            if (!body.classList.contains('nav-open')) return;
            var links = document.querySelector('.nav-links');
            if (toggle && toggle.contains(e.target)) return;
            if (links && links.contains(e.target)) return;
            body.classList.remove('nav-open');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') body.classList.remove('nav-open');
        });

        /* Scroll reveal */
        var reveals = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window && reveals.length) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            reveals.forEach(function (el) { io.observe(el); });
        } else {
            reveals.forEach(function (el) { el.classList.add('in'); });
        }

        /* Animated counters */
        var counters = document.querySelectorAll('[data-count]');
        var animateCount = function (el) {
            var target = parseFloat(el.getAttribute('data-count'));
            var suffix = el.getAttribute('data-suffix') || '';
            var decimals = (el.getAttribute('data-decimals') | 0);
            var start = null, dur = 1400;
            var step = function (ts) {
                if (!start) start = ts;
                var p = Math.min((ts - start) / dur, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                var val = target * eased;
                el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        if ('IntersectionObserver' in window && counters.length) {
            var cio = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
                });
            }, { threshold: 0.5 });
            counters.forEach(function (el) { cio.observe(el); });
        }
    });
})();
