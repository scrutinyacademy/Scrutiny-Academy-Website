const CACHE = "scrutiny-academy-v17-course-entitlements";
const APP_SHELL = [
  "./index.html",
  "./student.html",
  "./preview-v2.html",
  "./auth.css",
  "./auth.js",
  "./student.js",
  "./app-gate.js",
  "./v2.css",
  "./v2.js",
  "./v2-core.js",
  "./ncert-booster.js",
  "./learning-tools.js",
  "./firebase-config.js",
  "./course-catalog.js",
  "./assets/logo.svg",
  "./assets/favicon.svg",
  "./assets/medical-hero-v2.webp",
  "./assets/chemistry/redox-transfer.svg",
  "./assets/chemistry/redox-number.svg",
  "./assets/chemistry/redox-balancing.svg",
  "./assets/chemistry/redox-electrode.svg",
  "./assets/chemistry/organic-bonding.svg",
  "./assets/chemistry/organic-representations.svg",
  "./assets/chemistry/organic-intermediates.svg",
  "./assets/chemistry/organic-effects.svg",
  "./assets/chemistry/organic-lab.svg",
  "./assets/chemistry/hydrocarbon-conformations.svg",
  "./assets/chemistry/hydrocarbon-addition.svg",
  "./assets/chemistry/hydrocarbon-benzene.svg",
  "./data/manifest.json",
  "./data/platform.json",
  "./data/neet/class11-physics-bank.js",
  "./data/neet/class11-chemistry-bank.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request).then((cached) => {
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok)
            caches
              .open(CACHE)
              .then((cache) => cache.put(request, response.clone()));
          return response;
        })
        .catch(() => cached);
      return cached || fresh;
    }),
  );
});
