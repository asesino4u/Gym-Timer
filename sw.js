const CACHE = 'gym-timer-v2';
const FILES = ['/Gym-Timer/', '/Gym-Timer/index.html', '/Gym-Timer/manifest.json', '/Gym-Timer/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
