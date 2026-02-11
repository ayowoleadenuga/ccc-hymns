const CACHE_NAME = 'ccc-hymns-v1';

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/manifest.json',
        '/favicon.ico',
        // Add other critical assets here if known immutable
      ]);
    })
  );
});

// Fetch event - Stale-while-revalidate for documents, cache-first for others
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin requests or non-http
  if (!url.protocol.startsWith('http')) return;

  // For navigating to pages (HTML), try network first, falling back to cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cache the response for offline usage
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If network failed, try to get from cache
          return caches.match(event.request).then((response) => {
              if (response) return response;
              // Optional: return a custom offline page
              return new Response('You are offline. This page is not cached.', {
                  status: 200,
                  headers: { 'Content-Type': 'text/plain' }
              });
          });
        })
    );
    return;
  }

  // For other resources (images, scripts, etc.), try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(response => {
           if (!response || response.status !== 200 || response.type !== 'basic') {
               return response;
           }
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then((cache) => {
               cache.put(event.request, responseToCache);
           });
           return response;
      });
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
