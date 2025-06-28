const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../models/Restaurant');

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

const PLACE_TYPES = ['restaurant', 'food', 'cafe', 'meal_takeaway', 'bakery'];
const SEARCH_RADIUS = 50000; // 50km

class PlacesSyncService {
  constructor(apiKey) {
    this.client = new Client({});
    this.apiKey = apiKey;
  }

  async findPlacesInRegion(region, coordinates, limit = null) {
    const places = new Set();
    
    for (const type of PLACE_TYPES) {
      try {
        const response = await client.placesNearby({
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
            
            const nextResponse = await client.placesNearby({
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
      const response = await client.placeDetails({
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'geometry',
            'type',
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
        // Debug photo information
        console.log(`Photos for ${response.data.result.name}:`, 
          response.data.result.photos ? 
          response.data.result.photos.map(p => p.photo_reference).join('\n') : 
          'No photos');
        
        // Debug price level information
        console.log(`Price level for ${response.data.result.name}:`, response.data.result.price_level);
        
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

      const existingRestaurant = await Restaurant.findOne({
        googlePlaceId: placeDetails.place_id
      });

      const restaurantData = {
        name: placeDetails.name,
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
        phone: placeDetails.formatted_phone_number,
        website: placeDetails.website,
        rating: placeDetails.rating,
        totalRatings: placeDetails.user_ratings_total,
        priceRange: this.mapPriceLevel(placeDetails.price_level),
        images: await this.fetchPlacePhotos(placeDetails.photos),
        source: 'google_places',
        verified: true,
        googlePlaceId: placeDetails.place_id
      };

      if (existingRestaurant) {
        console.log(`Updated existing restaurant: ${placeDetails.name}`);
        return await Restaurant.findOneAndUpdate(
          { googlePlaceId: placeDetails.place_id },
          restaurantData,
          { new: true }
        );
      } else {
        console.log(`Created new restaurant: ${placeDetails.name}`);
        return await Restaurant.create(restaurantData);
      }
    } catch (error) {
      console.error('Error syncing place to database:', error);
      return null;
    }
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

  formatOpeningHours(googleHours) {
    if (!googleHours?.periods) return {};

    const daysMap = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday'
    };

    const formattedHours = {};
    for (const period of googleHours.periods) {
      if (period.open && period.close) {
        const day = daysMap[period.open.day];
        formattedHours[day] = {
          open: `${period.open.time.slice(0, 2)}:${period.open.time.slice(2)}`,
          close: `${period.close.time.slice(0, 2)}:${period.close.time.slice(2)}`
        };
      }
    }

    return formattedHours;
  }

  async fetchPlacePhotos(photos) {
    if (!photos || !Array.isArray(photos)) {
      console.log('No photos available');
      return [];
    }

    console.log(`Processing ${Math.min(photos.length, 5)} photos`);
    const photoUrls = [];
    
    for (const photo of photos.slice(0, 5)) { // Limit to 5 photos
      try {
        if (!photo.photo_reference) {
          console.log('Photo missing reference');
          continue;
        }

        // Generate the photo URL using the photo reference
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${this.apiKey}`;
        console.log('Generated photo URL:', photoUrl.substring(0, 100) + '...');
        photoUrls.push(photoUrl);
      } catch (error) {
        console.error('Error generating photo URL:', error);
      }
    }

    console.log(`Successfully generated ${photoUrls.length} photo URLs`);
    return photoUrls;
  }

  async syncRegion(region, limit = null) {
    console.log(`Starting sync for region: ${region}${limit ? ` (limited to ${limit} places)` : ''}`);
    const coordinates = SENEGAL_REGIONS[region];
    
    if (!coordinates) {
      throw new Error(`Unknown region: ${region}`);
    }

    const placeIds = await this.findPlacesInRegion(region, coordinates, limit);
    console.log(`Found ${placeIds.length} places in ${region}`);

    const results = {
      total: placeIds.length,
      synced: 0,
      failed: 0
    };

    for (const placeId of placeIds) {
      const details = await this.getPlaceDetails(placeId);
      if (details) {
        const restaurant = await this.syncPlaceToDatabase(details);
        if (restaurant) {
          results.synced++;
          console.log(`Synced ${restaurant.name} (${results.synced}/${placeIds.length})`);
        } else {
          results.failed++;
          console.log(`Failed to sync place ${placeId}`);
        }
      } else {
        results.failed++;
        console.log(`Failed to get details for place ${placeId}`);
      }
    }

    return results;
  }

  async syncAllRegions() {
    const results = {};
    
    for (const region of Object.keys(SENEGAL_REGIONS)) {
      console.log(`Starting sync for ${region}`);
      results[region] = await this.syncRegion(region);
    }

    return results;
  }
}

module.exports = PlacesSyncService;