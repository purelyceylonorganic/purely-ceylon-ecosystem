const CACHE_NAME = "pco-cache-v2";

// Install event → cache core files
self.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/offline.html",
      ]);
    })
  );
});

// Fetch event → network first, fallback to cache
self.addEventListener("fetch", (event: any) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});