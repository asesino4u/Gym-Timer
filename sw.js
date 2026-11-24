// Gym Timer PWA — service worker
// IMPORTANT: bump CACHE in lockstep with the <span class="version"> in
// index.html on every update. New baseline starts at v1.
const CACHE = 'gym-timer-v1';
const FILES = [
  '/Gym-Timer/',
  '/Gym-Timer/index.html',
  '/Gym-Timer/manifest.json',
  '/Gym-Timer/icon.svg',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const isHTML = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html');

  // Network-first for HTML so code updates land instantly on reload.
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.open(CACHE).then(c => c.match(req)
          .then(hit => hit || c.match('/Gym-Timer/index.html'))))
    );
    return;
  }

  // Cache-first for everything else.
  e.respondWith(
    caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req)))
  );
});
