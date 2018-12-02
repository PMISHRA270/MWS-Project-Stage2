importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

/**
 * Workbox 3.2.0
 */

if (workbox) {
  console.log(`[DEBUG] Workbox is loaded.`);

  workbox.setConfig({ debug: false });

  workbox.core.setCacheNameDetails({
    prefix: 'pwa',
    suffix: 'v1'
  });
  workbox.precaching.precacheAndRoute([
  {
    "url": "css/styles.css",
    "revision": "58edaaff537b9dc945022a2fb58881d1"
  },
  {
    "url": "index.html",
    "revision": "0497febcff1ce78eab9eaa9253f1430f"
  },
  {
    "url": "js/idb-bundle.min.js",
    "revision": "8bb586d989093dc901e8718cc534f8c5"
  },
  {
    "url": "js/main-bundle.min.js",
    "revision": "2562f9baea60750daffcdc07d53e68e9"
  },
  {
    "url": "js/resto-bundle.min.js",
    "revision": "ecf9bc7e13f919de2df4de9df3f30e15"
  },
  {
    "url": "restaurant.html",
    "revision": "a71ef303adf3b46f1e66751802c10505"
  },
  {
    "url": "img/touch/homescreen-192.png",
    "revision": "3c51341ad47db2f4f1fcae9ed396e95b"
  },
  {
    "url": "img/touch/homescreen-512.png",
    "revision": "192c0f01d43243007c75dfecea42fc98"
  },
  {
    "url": "manifest.json",
    "revision": "70734e689aa308ac55dbc2638265dd5e"
  }
]);

  workbox.routing.registerRoute(
    new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
    workbox.strategies.cacheFirst({
      cacheName: 'pwa-cache-google-fonts',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 30,
        }),
      ],
    }),
  );

  workbox.routing.registerRoute(
    /\.(?:jpeg|webp|png|gif|jpg|svg)$/,
    workbox.strategies.cacheFirst({
      cacheName: 'pwa-images-cache',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        })
      ]
    })
  );

  workbox.routing.registerRoute(
    new RegExp('restaurant.html(.*)'),
    workbox.strategies.networkFirst({
      cacheName: 'pwa-restaurants-cache',
      cacheableResponse: {statuses: [0, 200]}
    })
  );

} else {
  console.log(`[DEBUG] Workbox didn't load.`);
}
