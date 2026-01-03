
const CACHE_NAME = 'uangkita-v3';
const STATIC_ASSETS = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com'
];

// Install Event - Caching core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate Event - Clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache First with Dynamic Updates
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        // Cache dynamic external dependencies
        const isExternal = 
          event.request.url.includes('esm.sh') || 
          event.request.url.includes('gstatic.com') ||
          event.request.url.includes('googleapis.com');

        if (isExternal && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fallback for navigation (offline support)
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
        return null;
      });
    })
  );
});
