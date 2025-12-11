const CACHE_NAME = 'kvts-erp-v1';

self.addEventListener('install', (event) => {
  // Forces the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Tells the active service worker to take control of the page immediately.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Basic pass-through fetching. 
  // We can add advanced caching here later if needed.
  event.respondWith(fetch(event.request));
});