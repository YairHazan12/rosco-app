// ROSCO Service Worker — minimal for PWA installability
const CACHE_NAME = "rosco-v1";
const OFFLINE_URLS = ["/handyman", "/offline.html"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache shell pages (best-effort; ignore failures)
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests for same-origin navigation
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Network-first strategy: try network, fall back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses for navigation requests
        if (
          response.ok &&
          event.request.mode === "navigate"
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Fallback for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/handyman");
          }
        });
      })
  );
});

// Push notification support
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "ROSCO";
  const options = {
    body: data.body || "You have a new update.",
    icon: "/apple-touch-icon.png",
    badge: "/apple-touch-icon.png",
    tag: data.tag || "rosco-notification",
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/handyman";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url.includes("/handyman"));
        if (existing) return existing.focus();
        return clients.openWindow(url);
      })
  );
});
