// Spect-IT PWA Service Worker
const CACHE_NAME = 'spectit-v1';

// Cache these on install (relative to scope)
const PRECACHE_URLS = [
  './',
  'index.html',
  'styles.css',
  'app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin GET
  if (url.origin !== self.location.origin || event.request.method !== 'GET') {
    return;
  }
  // Skip CDN and external scripts (TensorFlow, Supabase, etc.)
  if (url.hostname !== self.location.hostname) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        if (response.ok && (event.request.url.endsWith('.css') || event.request.url.endsWith('.js') || event.request.destination === 'document')) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
