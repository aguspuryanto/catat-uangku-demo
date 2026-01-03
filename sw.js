
const CACHE_NAME = 'uangkita-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  'https://cdn.tailwindcss.com'
];

// Install Event - Caching basic assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Pre-caching core assets');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => console.log('SW: Install caching error', err))
  );
  self.skipWaiting();
});

// Activate Event - Cleaning up old caches
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

// Fetch Event - Dynamic Caching Strategy
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (like POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Cache external dependencies dynamically (scripts, fonts)
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
        // Return index.html as fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
        return null;
      });
    })
  );
});
