// ─── SERVICE WORKER — EdgeGuard PWA ──────────────────────────────────────────
// Cache-first pour les assets statiques, network-first pour les données

const CACHE_NAME = "edgeguard-v1";
const STATIC_ASSETS = [
  "/",
  "/dashboard",
  "/avant-trade",
  "/calendar",
  "/analytics",
  "/manifest.json",
];

// ── Installation : mise en cache des ressources statiques ──────────────────
self.addEventListener("install", /** @param {ExtendableEvent} event */ (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activation : nettoyage des anciens caches ──────────────────────────────
self.addEventListener("activate", /** @param {ExtendableEvent} event */ (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch : stratégie network-first avec fallback cache ───────────────────
self.addEventListener("fetch", /** @param {FetchEvent} event */ (event) => {
  // Ignorer les requêtes non-GET et les extensions Chrome
  if (
    event.request.method !== "GET" ||
    event.request.url.includes("chrome-extension")
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre en cache une copie fraîche si la réponse est valide
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback sur le cache si hors-ligne
        return caches.match(event.request).then(
          (cachedResponse) =>
            cachedResponse ||
            caches.match("/dashboard") // Page de fallback offline
        );
      })
  );
});