const CACHE_NAME = 'pwa-csv-static-v1';
const STATIC_ASSETS = [
    '/app/',
    '/app/index.html',
    '/app/app.js',
    '/app/idb.js',
    '/app/manifest.json',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
