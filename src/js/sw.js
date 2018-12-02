importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');

/**
 * Workbox 3.2.0
 * Workbox - https://developers.google.com/web/tools/workbox/
 * Codelab - https://codelabs.developers.google.com/codelabs/workbox-lab/
 */

if (workbox) {
  console.log(`[DEBUG] Workbox is loaded.`);

  workbox.setConfig({ debug: false });
  workbox.core.setCacheNameDetails({
    prefix: 'pwa',
    suffix: 'v1'
  });
  workbox.precaching.precacheAndRoute([]);

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

  // Restaurants
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
