const CACHE_NAME = 'radio-al-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.png',
  '/channel1.jpg',
  '/Klan kosova.png',
  '/clubfm.png',
  '/topalbania.png',
  '/top-gold-radio.png',

  // Shto skedarët e imazheve të reja
  '/my-music.png',
  '/travel.jpg',
  '/chill.jpg',
  '/love.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
