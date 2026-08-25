const CACHE_NAME = 'so-lo-monitoring-v2';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];


/* ================================
   INSTALL
================================ */

self.addEventListener('install', event => {

  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
  );

});


/* ================================
   ACTIVATE
================================ */

self.addEventListener('activate', event => {

  event.waitUntil(
    caches.keys()
      .then(keys => {

        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );

      })
      .then(() => self.clients.claim())
  );

});


/* ================================
   FETCH
================================ */

self.addEventListener('fetch', event => {

  if (event.request.method !== 'GET') return;


  /*
   * UNTUK HTML / NAVIGASI:
   * Selalu coba ambil versi terbaru dari server.
   * Jika offline, baru gunakan cache.
   */

  if (event.request.mode === 'navigate') {

    event.respondWith(

      fetch(event.request)
        .then(response => {

          const responseClone = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {

              cache.put('./index.html', responseClone);

            });

          return response;

        })
        .catch(() => {

          return caches.match('./index.html');

        })

    );

    return;

  }


  /*
   * UNTUK FILE LAIN:
   * Cache dulu, jika belum ada ambil dari network.
   */

  event.respondWith(

    caches.match(event.request)
      .then(cached => {

        if (cached) {

          return cached;

        }

        return fetch(event.request)
          .then(response => {

            if (
              !response ||
              response.status !== 200 ||
              response.type === 'opaque'
            ) {

              return response;

            }

            const responseClone = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  responseClone
                );

              });

            return response;

          });

      })
      .catch(() => {

        return caches.match('./index.html');

      })

  );

});
