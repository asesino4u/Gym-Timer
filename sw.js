const CACHE = 'gym-timer-v8';
const FILES = ['/Gym-Timer/', '/Gym-Timer/index.html', '/Gym-Timer/manifest.json', '/Gym-Timer/icon.svg'];

self.addEventListener('install', e => {
  // Activate this SW immediately — don't wait for all tabs to close
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('activate', e => {
  // Delete every old cache and take over existing clients so the next request
  // from an open page is served by the fresh SW with the fresh cache.
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Network-first for HTML (so code updates land instantly on reload),
  // cache-first for other assets.
  const isHTML = req.mode === 'navigate'
    || (req.headers.get('accept') || '').includes('text/html');

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

  e.respondWith(
    caches.open(CACHE).then(c => c.match(req).then(hit => hit || fetch(req)))
  );
});
