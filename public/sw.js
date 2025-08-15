const CACHE_NAME = 'english-center-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
];

const API_CACHE_PATTERNS = [
  /\/api\/teachers/,
  /\/api\/students/,
  /\/api\/classes/,
  /\/api\/parents/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
          })
          .map((cacheName) => {
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (isApiRequest(url.pathname)) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static assets
  if (isStaticAsset(url.pathname)) {
    event.respondWith(handleStaticAsset(request));
    return;
  }

  // Default network-first strategy
  event.respondWith(fetch(request));
});

// Check if request is for API
function isApiRequest(pathname) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(pathname));
}

// Check if request is for static asset
function isStaticAsset(pathname) {
  return STATIC_ASSETS.some((asset) => pathname.includes(asset));
}

// Handle API requests with cache-first strategy
async function handleApiRequest(request) {
  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Return cached response and update in background
      fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
      });
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      caches.open(DYNAMIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  } catch (error) {
    // If network fails, try to get from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseClone = response.clone();
      caches.open(STATIC_CACHE).then((cache) => {
        cache.put(request, responseClone);
      });
    }
    return response;
  } catch (error) {
    // Return offline page if available
    const offlineResponse = await caches.match('/offline.html');
    if (offlineResponse) {
      return offlineResponse;
    }
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending requests from IndexedDB
    const pendingRequests = await getPendingRequests();

    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body,
        });

        if (response.ok) {
          // Remove from pending requests
          await removePendingRequest(request.id);
        }
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Helper functions for IndexedDB
async function getPendingRequests() {
  // Implementation for getting pending requests from IndexedDB
  return [];
}

async function removePendingRequest(id) {
  // Implementation for removing pending request from IndexedDB
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/favicon.ico',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/favicon.ico',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('English Center', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
