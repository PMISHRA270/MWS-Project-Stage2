
// Declare global variables.
let map;
let neighborhoods;
let cuisines;
let restaurants;
let markers = [];
const endpointRestaurants = `http://localhost:1337/restaurants`;

// Declare the id elements.
const elementGoogleMap = document.getElementById('map');
const elementNeighborhoodsSelect = document.getElementById('neighborhoods-select');
const elementCuisinesSelect = document.getElementById('cuisines-select');
const elementRestaurantsList = document.getElementById('restaurants-list');


document.addEventListener('DOMContentLoaded', (event) => {
  loadMainNetworkFirst();
});

const loadMainNetworkFirst = () => {
  DBHelper.getServerData(endpointRestaurants)
  .then(dataFromNetwork => {
    updateNeighborhoodsUI(dataFromNetwork);
    updateCuisinesUI(dataFromNetwork);
    saveRestaurantsDataLocally(dataFromNetwork)
    .then(() => {
      DBHelper.setLastUpdated(new Date());
      // DBHelper.messageDataSaved();
    }).catch(err => {
      // DBHelper.messageSaveError();
      console.warn(err);
    });
  }).catch(err => {
    console.log('[DEBUG] Network requests have failed, this is expected if offline');
    getLocalRestaurantsData()
    .then(offlineData => {
      if (!offlineData.length) {
        // DBHelper.messageNoData();
      } else {
        // DBHelper.messageOffline();
        updateNeighborhoodsUI(offlineData);
        updateCuisinesUI(offlineData);
      }
    });
  });
}

/**
 * Update UI of Neighborhoods select element.
 */
const updateNeighborhoodsUI = (result) => {
  // Get all neighborhoods from all restaurants.
  let allNeighborhoods = result.map((v, i) => result[i].neighborhood);
  // Remove duplicates from neighborhoods and assign to global variable.
  self.neighborhoods = allNeighborhoods.filter((v, i) => allNeighborhoods.indexOf(v) == i);
  // Update the neighborhoods select.
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    elementNeighborhoodsSelect.appendChild(option);
  });
}

/**
 * Update UI of Cuisines select element.
 */
const updateCuisinesUI = (result) => {
  let allCuisines = result.map((v, i) => result[i].cuisine_type);
  self.cuisines = allCuisines.filter((v, i) => allCuisines.indexOf(v) == i);
  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    elementCuisinesSelect.appendChild(option);
  });
}

/**
 * Fetch all restaurants from network and fallback to IndexedDB, update UI.
 */
const refreshRestaurantsNetworkFirst = () => {
  DBHelper.getServerData(endpointRestaurants)
  .then(dataFromNetwork => {
    refreshRestaurantsUI(dataFromNetwork);
    saveRestaurantsDataLocally(dataFromNetwork)
    .then(() => {
      DBHelper.setLastUpdated(new Date());
    }).catch(err => {
      console.warn(err);
    });
  }).catch(err => {
    console.log('[DEBUG] Network requests have failed, this is expected if offline');
    getLocalRestaurantsData()
    .then(offlineData => {
      if (!offlineData.length) {
        // DBHelper.messageNoData();
      } else {
        // DBHelper.messageOffline();
        refreshRestaurantsUI(offlineData);
      }
    });
  });
}

const refreshRestaurantsUI = (result) => {
  const neighborhoodIndex = elementNeighborhoodsSelect.selectedIndex;
  const cuisineIndex = elementCuisinesSelect.selectedIndex;
  const neighborhood = elementNeighborhoodsSelect[neighborhoodIndex].value;
  const cuisine = elementCuisinesSelect[cuisineIndex].value;

  // Clear ul restaurants-list and markers on map for current restaurants.
  self.restaurants = [];
  elementRestaurantsList.innerHTML = '';
  markers.forEach(m => m.setMap(null));
  markers = [];

  // Filter the data by neighborhood and cuisine.
  self.restaurants = result;
  if (neighborhood != 'all') {
    self.restaurants = self.restaurants.filter(r => r.neighborhood == neighborhood);
  }
  if (cuisine != 'all') {
    self.restaurants = self.restaurants.filter(r => r.cuisine_type == cuisine);
  }

  // Create ul restaurants-list and add markers on map for current restaurants.
  self.restaurants.forEach(restaurant => {
    elementRestaurantsList.appendChild(addRestaurantCardUI(restaurant));
  });
  addMarkersToMapUI();
}

const addRestaurantCardUI = (restaurant) => {
  const li = document.createElement('li');
  li.className = 'restaurant-card';

  li.appendChild(createResponsivePicture(restaurant));

  const divCardPrimary = document.createElement('div');
  divCardPrimary.className = 'card-primary';
  const name = document.createElement('h2');
  name.className = 'card-title';
  name.innerHTML = restaurant.name;
  divCardPrimary.appendChild(name);
  const neighborhood = document.createElement('h3');
  neighborhood.className = 'card-subtitle';
  neighborhood.innerHTML = restaurant.neighborhood;
  divCardPrimary.appendChild(neighborhood);
  li.appendChild(divCardPrimary);

  const divCardSecondary = document.createElement('div');
  divCardSecondary.className = 'card-secondary';

  const address = document.createElement('address');
  address.className = 'card-secondary-content';
  address.innerHTML = restaurant.address;
  divCardSecondary.appendChild(address);
  li.appendChild(divCardSecondary);


  const divCardActions = document.createElement('div');
  divCardActions.className = 'card-actions';
  const more = document.createElement('a');
  more.className = 'card-actions-link';
  more.innerHTML = 'View Details';
  more.href = DBHelper.getRestaurantURL(restaurant);
  divCardActions.appendChild(more);
  li.appendChild(divCardActions);

  return li;
}


const createResponsivePicture = (restaurant) => {
  const picture = document.createElement('picture');

  const sizes = '(min-width: 80rem) 22.5vw, (min-width: 60rem) 30vw, (min-width: 37.5rem) 45vw, 100vw';

  const srcsetWebP =
    `${DBHelper.getImageUrlForRestaurant(restaurant, 'webp', 300)} 300w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'webp', 433)} 433w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'webp', 552)} 552w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'webp', 653)} 653w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'webp', 752)} 752w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'webp', 800)} 800w`;

  const srcsetJPEG =
    `${DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 300)} 300w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 433)} 433w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 552)} 552w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 653)} 653w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 752)} 752w,
    ${DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 800)} 800w`;

  const sourceWebP = document.createElement('source');
  sourceWebP.srcset = srcsetWebP;
  sourceWebP.sizes = sizes;
  sourceWebP.type = 'image/webp';
  picture.appendChild(sourceWebP);

  const sourceDefault = document.createElement('source');
  sourceDefault.srcset = srcsetJPEG;
  sourceDefault.sizes = sizes;
  sourceDefault.type = 'image/jpeg';
  picture.appendChild(sourceDefault);

  const defaultImg = document.createElement('img');
  const imageSrc = DBHelper.getImageUrlForRestaurant(restaurant, 'jpeg', 800);
  defaultImg.src = imageSrc;

  let altText = DBHelper.getAlternativeText(restaurant.id);
  if (!altText) {
    altText = `Restaurant ${restaurant.name}`;
  }
  defaultImg.alt = altText;
  picture.appendChild(defaultImg);

  return picture;
}

window.initMap = () => {
  let loc = {lat: 40.722216, lng: -73.987501};
  map = new google.maps.Map(elementGoogleMap, {
    center: loc,
    zoom: 12
  });

  let setTitle = () => {
    const iFrameGoogleMaps = document.querySelector('#map iframe');
    iFrameGoogleMaps.setAttribute('title', 'Google Maps overview of restaurants');
  }
  map.addListener('tilesloaded', setTitle);
  refreshRestaurantsNetworkFirst();
}

const addMarkersToMapUI = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    const marker = DBHelper.addMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    markers.push(marker);
  });
}
