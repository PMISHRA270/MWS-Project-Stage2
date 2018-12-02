/*
 * IndexedDB
 */

function createIndexedDB() {
  if (!('indexedDB' in window)) {
    console.log('[INFO] This browser doesn\'t support IndexedDB.');
    return null;
  }
  // Opening a database.
  return idb.open('pwa-resto-db1', 3, function(upgradeDb) {
    switch (upgradeDb.oldVersion) {
      case 0:
      case 1:
        if (!upgradeDb.objectStoreNames.contains('restaurants')) {
          console.log('[DEBUG] Creating a new object store for restaurants.');
          const restaurantsOS =
            upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
        }
      case 2:
        if (!upgradeDb.objectStoreNames.contains('reviews')) {
          console.log('[DEBUG] Creating a new object store for reviews.');
          const restaurantsOS =
            upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
        }
    }
  });
}

const dbPromise = createIndexedDB();
function saveRestaurantsDataLocally(restaurants) {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('restaurants', 'readwrite');
    const store = tx.objectStore('restaurants');
    if (restaurants.length > 1) {
      return Promise.all(restaurants.map(restaurant => store.put(restaurant)))
      .catch(() => {
        tx.abort();
        throw Error('[ERROR] Restaurants were not added to the store.');
      });
    } else {
      store.put(restaurants);
    }
  });
}

function getLocalRestaurantsData() {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('restaurants', 'readonly');
    const store = tx.objectStore('restaurants');
    return store.getAll();
  });
}

function getLocalRestaurantByIdData(id) {
  if (!('indexedDB' in window)) {return null;}
  return dbPromise.then(db => {
    const tx = db.transaction('restaurants', 'readonly');
    const store = tx.objectStore('restaurants');
    return store.get(parseInt(id));
  });
}
