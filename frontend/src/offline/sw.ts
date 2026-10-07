const CACHE_NAME = "pco-cache-v3";

const CORE_ASSETS = [
  "/",
  "/index.html",
];

const serviceWorker = self as unknown as {
  skipWaiting: () => Promise<void>;
  clients: {
    claim: () => Promise<void>;
  };
  addEventListener: (
    type: string,
    listener: (event: any) => void
  ) => void;
};

serviceWorker.addEventListener("install", (event: any) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => serviceWorker.skipWaiting())
  );
});

serviceWorker.addEventListener("activate", (event: any) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => serviceWorker.clients.claim())
  );
});

serviceWorker.addEventListener("fetch", (event: any) => {
  const request = event.request;

  // Never cache API requests.
  if (
    request.method !== "GET" ||
    request.url.includes("/api/")
  ) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response: Response) => {
        if (response.ok) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() =>
        caches.match(request).then(
          (cachedResponse) =>
            cachedResponse ||
            new Response("You are currently offline.", {
              status: 503,
              headers: {
                "Content-Type": "text/plain",
              },
            })
        )
      )
  );
});