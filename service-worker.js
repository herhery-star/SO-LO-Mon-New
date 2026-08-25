const CACHE_NAME = 'so-lo-static-v1';

/* =========================================
   FILE STATIS YANG BOLEH DI-CACHE
========================================= */

const STATIC_ASSETS = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png'
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener('install', event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );

});


/* =========================================
   ACTIVATE
========================================= */

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


/* =========================================
   FETCH
========================================= */

self.addEventListener('fetch', event => {

  /* Hanya tangani request GET */

  if (event.request.method !== 'GET') return;


  /* =======================================
     HTML / HALAMAN APLIKASI

     SELALU AMBIL VERSI TERBARU
     DARI SERVER

     JANGAN CACHE INDEX.HTML
  ======================================= */

  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document'
  ) {

    event.respondWith(

      fetch(event.request, {
        cache: 'no-store'
      })

      .catch(() => {

        return new Response(

          `
          <!DOCTYPE html>
          <html lang="id">

          <head>

            <meta charset="UTF-8">

            <meta name="viewport"
                  content="width=device-width, initial-scale=1.0">

            <title>SO-LO Offline</title>

          </head>

          <body style="
            font-family:Arial,sans-serif;
            padding:40px;
            text-align:center;
          ">

            <h2>SO-LO membutuhkan koneksi internet</h2>

            <p>
              Tidak dapat memuat versi terbaru aplikasi.
            </p>

            <p>
              Silakan periksa koneksi internet Anda.
            </p>

          </body>

          </html>
          `,

          {
            headers: {
              'Content-Type': 'text/html'
            }
          }

        );

      })

    );

    return;

  }


  /* =======================================
     FILE STATIS

     CACHE FIRST
  ======================================= */

  if (
    event.request.url.includes('/icons/') ||
    event.request.url.includes('manifest.webmanifest')
  ) {

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
                response.status !== 200
              ) {

                return response;

              }

              const copy = response.clone();

              caches.open(CACHE_NAME)
                .then(cache => {

                  cache.put(
                    event.request,
                    copy
                  );

                });

              return response;

            });

        })

    );

    return;

  }


  /* =======================================
     REQUEST LAIN

     SELALU NETWORK

     INI PENTING UNTUK:
     - SUPABASE
     - API
     - DATA TERBARU
  ======================================= */

  event.respondWith(

    fetch(event.request)

      .catch(() => {

        return new Response(
          JSON.stringify({
            error: 'Offline'
          }),
          {
            status: 503,

            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

      })

  );

});
