/* eslint-disable no-restricted-globals */
/**
 * CRA-compatible Workbox service worker.
 * Satisfies the "self.__WB_MANIFEST" requirement by importing workbox-precaching
 * and declaring the precache manifest injected at build time.
 */
/* global workbox */
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// This will be replaced by workbox at build time
precacheAndRoute(self.__WB_MANIFEST || []);

// Clean old caches created by previous versions
cleanupOutdatedCaches();

// App Shell-style navigation fallback to index.html for SPA routes
const handler = createHandlerBoundToURL('/index.html');
const navigationRoute = new NavigationRoute(handler, {
  denylist: [/^\/api\//],
});
registerRoute(navigationRoute);

// Runtime caching strategy for same-origin static assets not included in precache
registerRoute(
  ({ request, url }) => request.method === 'GET' && url.origin === self.location.origin && /\.(?:png|jpg|jpeg|svg|css|js)$/.test(url.pathname),
  new StaleWhileRevalidate({ cacheName: 'runtime-assets' })
);

// Listen for SKIP_WAITING command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
