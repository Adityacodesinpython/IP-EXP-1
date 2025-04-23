// service-worker.js
const CACHE_NAME = 'v1';
const CACHE_ASSETS = [
  'index.html',
  'styles.css',
  'logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Serve cached content, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Sync event: Listen for background sync (requires registration from main thread)
self.addEventListener('sync', event => {
  console.log('[Service Worker] Sync event fired:', event.tag);
  if (event.tag === 'demoSync') {
    event.waitUntil(
      // Example: perform some background task
      fetch('/sync-endpoint').then(response => {
        return response.text();
      }).then(data => {
        console.log('[Service Worker] Sync completed:', data);
      }).catch(err => {
        console.error('[Service Worker] Sync failed:', err);
      })
    );
  }
});

// Push event: Handle push notifications
self.addEventListener('push', event => {
  console.log('[Service Worker] Push event received');
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Push Notification';
  const options = {
    body: data.body || 'You have a new message!',
    icon: 'logo.png',
    badge: 'logo.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
