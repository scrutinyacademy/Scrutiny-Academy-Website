const CACHE = "scrutiny-academy-v56-kota-chapter-cart";
const APP_SHELL = [
  "./index.html",
  "./student.html",
  "./preview-v2.html",
  "./neet-kota-biology.html",
  "./neet-kota-biology.css?v=1",
  "./neet-kota-biology.js?v=1",
  "./neet-kota-gate.js?v=1",
  "./neet-kota-purchase.js?v=1",
  "./neet-countdown.js?v=1",
  "./neet-ranker-free.html",
  "./ncert-quest.html",
  "./auth.css?v=3",
  "./auth.js",
  "./student.js",
  "./student-success.js",
  "./student-success.css",
  "./class8-ssc.html",
  "./jee.html",
  "./jee-gate.js",
  "./jee-rigid-body-free.html",
  "./jee-rigid-access.js",
  "./class8-ssc.css?v=3",
  "./class8-enhanced.css?v=3",
  "./class8-ssc.js?v=3",
  "./class8-content.js?v=3",
  "./class10-board.html",
  "./class10-board.css?v=3",
  "./class10-board.js?v=3",
  "./app-gate.js",
  "./v2.css",
  "./v2.js",
  "./v2-core.js",
  "./ranker-free.css",
  "./ranker-free.js",
  "./ncert-quest.css?v=3",
  "./ncert-quest.js?v=3",
  "./ncert-quest-gate.js",
  "./ncert-booster.js",
  "./learning-tools.js",
  "./firebase-config.js",
  "./course-catalog.js",
  "./help-bot.js",
  "./today-goal.js",
  "./physics-formulas.html",
  "./physics-formulas.css?v=1",
  "./physics-formulas.js?v=1",
  "./physics-formula-notes.js?v=1",
  "./assets/physics-formulas/catalog.json?v=2",
  "./assets/logo.svg",
  "./assets/favicon.svg",
  "./assets/medical-hero-v2.webp",
  "./assets/ranker/plasma-membrane.png",
  "./assets/ranker/mitochondrion.png",
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
  "./data/class10/textbooks/biology/catalog.json",
  "./data/class10/textbooks/physics/catalog.json",
  "./data/class10/textbooks/mathematics/catalog.json",
  "./data/class10/textbooks/social-science/catalog.json",
  "./data/class11/zoology.json",
  "./data/class11/physics.json",
  "./data/class11/chemistry.json",
  "./assets/zoology/body-plans.svg",
  "./assets/zoology/invertebrate-phyla.svg",
  "./assets/zoology/chordate-classes.svg",
  "./assets/zoology/paramecium-conjugation.svg",
  "./assets/zoology/plasmodium-cycle.svg",
  "./assets/zoology/cockroach-systems.svg",
  "./assets/zoology/ecosystem-flow.svg",
  "./assets/physics-board/straight-line-graphs.svg",
  "./assets/physics-board/projectile-vectors.svg",
  "./assets/physics-board/friction-incline.svg",
  "./assets/physics-board/work-energy.svg",
  "./assets/physics-board/rotational-motion.svg",
  "./assets/physics-board/shm-energy.svg",
  "./assets/physics-board/orbit-escape.svg",
  "./assets/physics-board/stress-strain.svg",
  "./assets/physics-board/bernoulli-capillary.svg",
  "./assets/physics-board/heat-transfer.svg",
  "./assets/physics-board/heat-engine.svg",
  "./assets/physics-board/emerging-tech.svg",
  "./assets/chemistry-board/atomic-orbitals.svg",
  "./assets/chemistry-board/periodic-trends.svg",
  "./assets/chemistry-board/molecular-shapes.svg",
  "./assets/chemistry-board/gas-laws.svg",
  "./assets/chemistry-board/stoichiometry-redox.svg",
  "./assets/chemistry-board/hess-cycle.svg",
  "./assets/chemistry-board/equilibrium-ph.svg",
  "./assets/chemistry-board/hydrogen-peroxide.svg",
  "./assets/chemistry-board/sblock-flame.svg",
  "./assets/chemistry-board/diborane.svg",
  "./assets/chemistry-board/carbon-silicon.svg",
  "./assets/chemistry-board/pollution-cycle.svg",
  "./assets/chemistry-board/organic-reactions.svg",
  "./data/neet/ranker/cell-unit-of-life.json",
  "./data/ncert-quest/cell-under-attack.json",
  "./data/ncert-quest/arcade.json",
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
  // Prefer fresh account/payment code so old activation gates do not persist.
  const accountFiles = ["index.html", "login.html", "payment.html", "auth.js", "payment.js", "student.js", "student-success.js", "course-catalog.js", "help-bot.js", "class10-board.html", "class10-board.js"];
  if (url.pathname.endsWith("/") || accountFiles.some(file => url.pathname.endsWith(`/${file}`))) {
    event.respondWith(fetch(request, { cache: "no-store" }).catch(() => caches.match(request)));
    return;
  }
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
