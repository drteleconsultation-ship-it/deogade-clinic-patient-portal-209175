/* eslint-env serviceworker */
/* Basic service worker for offline caching of app shell and navigation fallbacks.
   This SW is only registered when REACT_APP_PWA_ENABLED === 'true'.
*/
const swSelf = self; // alias to satisfy some linters and clarity
const CACHE_VERSION = 'deogade-clinic-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

swSelf.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => swSelf.skipWaiting())
  );
});

swSelf.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_VERSION ? caches.delete(k) : Promise.resolve())))
    ).then(() => swSelf.clients.claim())
  );
});

// Network-first for API, cache-first for others; fallback to cached shell on navigation requests
swSelf.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== swSelf.location.origin) return;

  // API requests: network first
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() => caches.match(req))
    );
    return;
  }

  // Navigation requests: try network, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE_VERSION).then((cache) => cache.put(req, resClone));
      return res;
    }).catch(() => cached))
  );
});
