// InviteStory - Royal Tilak Invitation Service Worker
const CACHE_NAME = 'royal-tilak-invite-v4';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/og-image.jpg',
  '/assets/audio/wedding-melody.mp3',
  '/assets/doors/1.mp4',
  '/assets/doors/1.webp',
  '/assets/gallery/photo-1.webp',
  '/assets/gallery/photo-2.webp',
  '/assets/gallery/photo-3.webp',
  '/assets/gallery/photo-4.webp',
  '/assets/gallery/photo-5.webp',
  '/assets/gallery/photo-6.webp',
  '/assets/gallery/photo-7.webp',
];

// Install Event - Cache Core Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('SW precache notice:', err);
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Cache-First for Media & Static Assets, Network-first for navigations
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  
  if (url.origin !== location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.url.includes('/assets/') || event.request.url.endsWith('.css') || event.request.url.endsWith('.js') || event.request.url.endsWith('.mp3') || event.request.url.endsWith('.webp') || event.request.url.endsWith('.mp4'))
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);
    })
  );
});
