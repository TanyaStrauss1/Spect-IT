const CACHE_NAME = 'spectit-v9';
const OFFLINE_URL = 'offline.html';

const PRECACHE_URLS = [
  './',
  'index.html',
  'offline.html',
  'privacy.html',
  'terms.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    ).then(() => self.clients.claim())
  );
});

// Allow the page to force an immediate SW update.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    })
    .catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === 'navigate' || request.destination === 'document') {
        return caches.match(OFFLINE_URL);
      }
      throw new Error('offline and not cached');
    });
}

function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response && response.ok) {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
      }
      return response;
    });
  });
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const dest = event.request.destination;
  const isDoc = event.request.mode === 'navigate' || dest === 'document';
  // App code & documents: network-first so deploys always ship fresh code.
  if (isDoc || dest === 'script' || dest === 'style' || url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  // Images / fonts / other: cache-first for speed & offline.
  event.respondWith(cacheFirst(event.request));
});
