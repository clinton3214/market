const CACHE_NAME = 'travis-pay-cache-v1';

const PRECACHE_ASSETS = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
});

// Purge old caches whenever the service worker updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests and API calls
  if (request.method !== 'GET' || url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) {
    return;
  }

  // NetworkFirst for navigation requests (HTML pages)
  if (request.mode === 'navigate' || request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response and cache it, so we have it for offline
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Network failed, fallback to cache
          return caches.match(request).then((response) => {
            if (response) return response;
            // Strict fallback to start_url if not cached
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Stale-While-Revalidate for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request).then((response) => {
        // Cache new version dynamically
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch((err) => {
        console.warn('SW: Network fetch failed, relying on cache', err);
      });

      return cachedResponse || networkFetch;
    })
  );
});
