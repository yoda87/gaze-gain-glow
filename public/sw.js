
// This is a minimal service worker for PWA functionality
self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  // Add offline caching logic here if needed
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Return cached assets for offline use
        return caches.match(event.request);
      })
  );
});
