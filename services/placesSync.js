const { Client } = require('@googlemaps/google-maps-services-js');
const { Place, getModelByType, getGooglePlacesTypes, PLACE_TYPES } = require('../models/placeTypes');

const client = new Client({});

// Senegal regions with their approximate centers
const SENEGAL_REGIONS = {
  Dakar: { lat: 14.7167, lng: -17.4677 },
  Thiès: { lat: 14.7894, lng: -16.9253 },
  'Saint-Louis': { lat: 16.0179, lng: -16.4896 },
  Ziguinchor: { lat: 12.5598, lng: -16.2887 },
  Kaolack: { lat: 14.1652, lng: -16.0726 },
  Louga: { lat: 15.6173, lng: -16.2240 },
  Fatick: { lat: 14.3390, lng: -16.4178 },
  Kolda: { lat: 12.8983, lng: -14.9409 },
  Matam: { lat: 15.6562, lng: -13.2558 },
  Kaffrine: { lat: 14.1059, lng: -15.5456 },
  Tambacounda: { lat: 13.7707, lng: -13.6673 },
  Kédougou: { lat: 12.5605, lng: -12.1747 },
  Sédhiou: { lat: 12.7081, lng: -15.5569 },
  Diourbel: { lat: 14.6479, lng: -16.2436 }
};

const SEARCH_RADIUS = 50000; // 50km

class PlacesSyncService {
  constructor(apiKey) {
    this.client = new Client({});
    this.apiKey = apiKey;
  }

  // Get place types to search for based on target place type
  getPlaceTypesToSearch(targetPlaceType = 'restaurant') {
    const googlePlacesTypes = getGooglePlacesTypes();
    return googlePlacesTypes[targetPlaceType] || ['restaurant', 'food', 'cafe', 'meal_takeaway', 'bakery'];
  }

  // Determine place type from Google Places data
  determinePlaceType(placeDetails) {
    const types = placeDetails.types || [];
    
    // Map Google Places types to our place types
    if (types.includes('restaurant') || types.includes('food') || types.includes('meal_takeaway') || types.includes('bakery')) {
      return 'restaurant';
    }
    if (types.includes('park') || types.includes('natural_feature')) {
      return 'park';
    }
    if (types.includes('museum') || types.includes('art_gallery')) {
      return 'museum';
    }
    if (types.includes('shopping_mall') || types.includes('store')) {
      return 'shopping_center';
    }
    if (types.includes('lodging')) {
      return 'hotel';
    }
    if (types.includes('cafe')) {
      return 'cafe';
    }
    if (types.includes('bar')) {
      return 'bar';
    }
    if (types.includes('amusement_park') || types.includes('movie_theater') || types.includes('bowling_alley')) {
      return 'entertainment';
    }
    if (types.includes('church') || types.includes('mosque')) {
      return 'cultural';
    }
    if (types.includes('gym') || types.includes('stadium')) {
      return 'sports';
    }
    
    return 'other';
  }

  async findPlacesInRegion(region, coordinates, limit = null, targetPlaceType = 'restaurant') {
    const places = new Set();
    const placeTypes = this.getPlaceTypesToSearch(targetPlaceType);
    
    for (const type of placeTypes) {
      try {
        const response = await this.client.placesNearby({
          params: {
            location: coordinates,
            radius: SEARCH_RADIUS,
            type: type,
            key: this.apiKey
          }
        });

        if (response.data.results) {
          for (const place of response.data.results) {
            places.add(place.place_id);
            // Check if we've reached the limit
            if (limit && places.size >= limit) {
              console.log(`Reached limit of ${limit} places`);
              return Array.from(places).slice(0, limit);
            }
          }
        }

        // Only fetch next page if we haven't reached the limit
        if (!limit || places.size < limit) {
          let pageToken = response.data.next_page_token;
          while (pageToken) {
            // Wait for token to become valid
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const nextResponse = await this.client.placesNearby({
              params: {
                pagetoken: pageToken,
                key: this.apiKey
              }
            });

            if (nextResponse.data.results) {
              for (const place of nextResponse.data.results) {
                places.add(place.place_id);
                // Check if we've reached the limit
                if (limit && places.size >= limit) {
                  console.log(`Reached limit of ${limit} places`);
                  return Array.from(places).slice(0, limit);
                }
              }
            }

            pageToken = nextResponse.data.next_page_token;
          }
        }
      } catch (error) {
        console.error(`Error fetching ${type} places in ${region}:`, error);
      }
    }

    return limit ? Array.from(places).slice(0, limit) : Array.from(places);
  }

  async getPlaceDetails(placeId) {
    try {
      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'types',
            'formatted_phone_number',
            'website',
            'rating',
            'user_ratings_total',
            'price_level',
            'opening_hours',
            'photos',
            'reviews',
            'place_id'
          ],
          key: this.apiKey
        }
      });

      if (response.data.status === 'OK') {
        return response.data.result;
      } else {
        console.error(`Error fetching place details for ${placeId}:`, response.data.status);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching details for place ${placeId}:`, error.response?.data || error.message);
      return null;
    }
  }

  mapPriceLevel(googlePriceLevel) {
    // Google price levels:
    // 0: Free
    // 1: Inexpensive ($)
    // 2: Moderate ($$)
    // 3: Expensive ($$$)
    // 4: Very Expensive ($$$$)
    switch (googlePriceLevel) {
      case 0:
      case 1:
        return 'low';      // $
      case 2:
        return 'medium';   // $$
      case 3:
        return 'high';     // $$$
      case 4:
        return 'high';     // $$$$
      default:
        return 'medium';   // If no price level is provided, assume medium
    }
  }

  async syncPlaceToDatabase(placeDetails) {
    try {
      if (!placeDetails.place_id) {
        console.error('No place_id provided in place details');
        return null;
      }

      // Determine the place type
      const placeType = this.determinePlaceType(placeDetails);
      const PlaceModel = getModelByType(placeType);

      const existingPlace = await PlaceModel.findOne({
        googlePlaceId: placeDetails.place_id
      });

      // Base place data
      const placeData = {
        name: placeDetails.name,
        type: placeType,
        description: placeDetails.editorial_summary?.overview || `${placeDetails.name} in ${placeDetails.formatted_address}`,
        address: {
          street: placeDetails.formatted_address,
          region: this.determineRegion(placeDetails.geometry.location),
          coordinates: {
            type: 'Point',
            coordinates: [
              placeDetails.geometry.location.lng,
              placeDetails.geometry.location.lat
            ]
          }
        },
        contact: {
          phone: placeDetails.formatted_phone_number,
          website: placeDetails.website
        },
        ratings: {
          googleRating: placeDetails.rating,
          appRating: 0,
          reviewCount: placeDetails.user_ratings_total || 0
        },
        images: await this.fetchPlacePhotos(placeDetails.photos),
        source: 'google_places',
        isVerified: true,
        googlePlaceId: placeDetails.place_id
      };

      // Add type-specific data
      if (placeType === 'restaurant') {
        placeData.priceRange = this.mapPriceLevel(placeDetails.price_level);
        placeData.cuisine = this.extractCuisineFromTypes(placeDetails.types);
      } else if (placeType === 'park') {
        placeData.typeSpecificData = {
          size: 'medium',
          parkType: 'urban',
          entryFee: 0
        };
      } else if (placeType === 'museum') {
        placeData.typeSpecificData = {
          museumType: 'cultural',
          admission: {
            adult: 0,
            child: 0,
            student: 0,
            senior: 0,
            freeDays: []
          }
        };
      }

      if (existingPlace) {
        console.log(`Updated existing ${placeType}: ${placeDetails.name}`);
        return await PlaceModel.findOneAndUpdate(
          { googlePlaceId: placeDetails.place_id },
          placeData,
          { new: true }
        );
      } else {
        console.log(`Created new ${placeType}: ${placeDetails.name}`);
        return await PlaceModel.create(placeData);
      }
    } catch (error) {
      console.error('Error syncing place to database:', error);
      return null;
    }
  }

  extractCuisineFromTypes(types) {
    const cuisineMap = {
      'restaurant': 'international',
      'food': 'international',
      'meal_takeaway': 'fast_food',
      'bakery': 'bakery',
      'cafe': 'cafe',
      'bar': 'bar'
    };
    
    for (const type of types) {
      if (cuisineMap[type]) {
        return [cuisineMap[type]];
      }
    }
    
    return ['international'];
  }

  determineRegion(location) {
    let nearestRegion = null;
    let shortestDistance = Infinity;

    for (const [region, coords] of Object.entries(SENEGAL_REGIONS)) {
      const distance = this.calculateDistance(
        location.lat,
        location.lng,
        coords.lat,
        coords.lng
      );

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestRegion = region;
      }
    }

    return nearestRegion;
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async fetchPlacePhotos(photos) {
    if (!photos || photos.length === 0) {
      return [];
    }

    const imageUrls = [];
    const maxPhotos = Math.min(photos.length, 5); // Limit to 5 photos

    for (let i = 0; i < maxPhotos; i++) {
      try {
        const photo = photos[i];
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${this.apiKey}`;
        imageUrls.push(photoUrl);
      } catch (error) {
        console.error('Error fetching photo:', error);
      }
    }

    return imageUrls;
  }

  async syncRegion(region, limit = null, placeType = 'restaurant') {
    console.log(`Starting sync for ${placeType} places in ${region}`);
    
    const coordinates = SENEGAL_REGIONS[region];
    if (!coordinates) {
      throw new Error(`Unknown region: ${region}`);
    }

    const placeIds = await this.findPlacesInRegion(region, coordinates, limit, placeType);
    console.log(`Found ${placeIds.length} ${placeType} places in ${region}`);

    let successCount = 0;
    let errorCount = 0;

    for (const placeId of placeIds) {
      try {
        const placeDetails = await this.getPlaceDetails(placeId);
        if (placeDetails) {
          await this.syncPlaceToDatabase(placeDetails);
          successCount++;
        }
      } catch (error) {
        console.error(`Error syncing place ${placeId}:`, error);
        errorCount++;
      }
    }

    console.log(`Sync completed for ${region}: ${successCount} successful, ${errorCount} errors`);
    return { successCount, errorCount };
  }

  async syncAllRegions(placeType = 'restaurant') {
    console.log(`Starting full sync for ${placeType} places across all regions`);
    
    for (const region of Object.keys(SENEGAL_REGIONS)) {
      try {
        await this.syncRegion(region, null, placeType);
        // Add delay between regions to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error syncing region ${region}:`, error);
      }
    }
  }
}

module.exports = PlacesSyncService;