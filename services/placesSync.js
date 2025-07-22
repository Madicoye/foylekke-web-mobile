const { Client } = require('@googlemaps/google-maps-services-js');
const { Place } = require('../models/placeTypes');
const SearchTracker = require('../models/SearchTracker');
const PlaceRaw = require('../models/PlaceRaw');
const fs = require('fs');
const path = require('path');

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REFRESH_INTERVAL = 30; // days

// All eatery types joined for single search
const ALL_EATERY_TYPES = [
  'restaurant', 'food', 'meal_takeaway', 'bakery', 'cafe', 'bar',
  'fast_food', 'pizza_restaurant', 'seafood_restaurant',
  'chinese_restaurant', 'japanese_restaurant', 'indian_restaurant',
  'italian_restaurant', 'mexican_restaurant', 'thai_restaurant',
  'korean_restaurant', 'greek_restaurant', 'french_restaurant',
  'spanish_restaurant', 'portuguese_restaurant', 'brazilian_restaurant',
  'lebanese_restaurant', 'turkish_restaurant', 'american_restaurant',
  'african_restaurant', 'caribbean_restaurant', 'mediterranean_restaurant',
  'middle_eastern_restaurant', 'asian_restaurant', 'european_restaurant',
  'latin_american_restaurant', 'fusion_restaurant'
].join('|');

class PlacesSyncService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.client = new Client({});
    
    // Ensure logs directory exists
    const logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  // Helper method for API calls with retries
  async makeApiCall(method, retries = MAX_RETRIES) {
    try {
      return await method();
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        
        // Handle rate limiting
        if (status === 429 && retries > 0) {
          console.log(`Rate limited, waiting ${RETRY_DELAY}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return this.makeApiCall(method, retries - 1);
        }
        
        // Handle other status codes
        if (status === 400) {
          console.error('Invalid request:', error.response.data.error_message);
        } else if (status === 403) {
          console.error('API key issues:', error.response.data.error_message);
        } else if (status === 500) {
          console.error('Google Maps server error');
        }
      }
      throw error;
    }
  }

  async findPlacesAtPoint(point, limit = null) {
    const places = new Set();
    let apiCallCount = 0;
    const RESULTS_PER_PAGE = 20;
    const pointKey = `${point.lat},${point.lng}`;
    
    try {
      // Check if we've recently searched this point
      const recentSearch = await SearchTracker.findOne({
        location: pointKey,
        lastSearched: { 
          $gte: new Date(Date.now() - REFRESH_INTERVAL * 24 * 60 * 60 * 1000)
        }
      });

      if (recentSearch) {
        recentSearch.placeIds.forEach(id => places.add(id));
        console.log(`Found ${places.size} places from cache for point ${pointKey}`);
        return Array.from(places);
      }

      console.log(`\n🔍 Searching around ${pointKey} (${point.radius}m radius)`);
      
      try {
        apiCallCount++;
        const response = await this.makeApiCall(
          () => this.client.placesNearby({
            params: {
              location: { lat: point.lat, lng: point.lng },
              radius: point.radius || 400,
              type: ALL_EATERY_TYPES,
              key: this.apiKey,
              language: 'fr'
            },
            timeout: 5000
          })
        );

        if (response.data.results) {
          const foundPlaces = [];
          const initialResults = response.data.results.length;
          console.log(`  Found ${initialResults} places`);
          
          for (const place of response.data.results) {
            if (place.vicinity?.toLowerCase().includes('dakar')) {
              places.add(place.place_id);
              
              // Save raw place data
              await PlaceRaw.findOneAndUpdate(
                { googlePlaceId: place.place_id },
                {
                  googlePlaceId: place.place_id,
                  rawData: place,
                  foundAt: pointKey,
                  foundOn: new Date()
                },
                { upsert: true, new: true }
              );
              
              // Map Google Places data to our Place model
              const placeData = {
                name: place.name,
                description: `Discovered via Google Places API at ${pointKey}`,
                type: this.mapGoogleType(place.types),
                googlePlaceId: place.place_id,
                source: 'google_places',
                status: 'pending', // Needs verification
                address: {
                  street: place.vicinity,
                  city: 'Dakar',
                  region: 'Dakar',
                  country: 'Senegal',
                  coordinates: {
                    lat: place.geometry.location.lat,
                    lng: place.geometry.location.lng
                  }
                },
                ratings: {
                  googleRating: place.rating,
                  reviewCount: place.user_ratings_total || 0,
                  appRating: 0
                }
              };
              
              foundPlaces.push(placeData);
              console.log(`    - ${place.name} (${place.place_id})`);
              if (place.types) console.log(`      Types: ${place.types.join(', ')}`);
              if (place.rating) console.log(`      Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
            }
          }

          // Get next page if available
          if (initialResults === RESULTS_PER_PAGE && 
              response.data.next_page_token &&
              (!limit || places.size < limit)) {
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            apiCallCount++;
            
            const nextResponse = await this.makeApiCall(
              () => this.client.placesNearby({
                params: {
                  pagetoken: response.data.next_page_token,
                  key: this.apiKey
                },
                timeout: 5000
              })
            );

            if (nextResponse.data.results) {
              for (const place of nextResponse.data.results) {
                if (place.vicinity?.toLowerCase().includes('dakar')) {
                  places.add(place.place_id);
                  
                  // Save raw place data
                  await PlaceRaw.findOneAndUpdate(
                    { googlePlaceId: place.place_id },
                    {
                      googlePlaceId: place.place_id,
                      rawData: place,
                      foundAt: pointKey,
                      foundOn: new Date()
                    },
                    { upsert: true, new: true }
                  );
                  
                  // Map Google Places data to our Place model
                  const placeData = {
                    name: place.name,
                    description: `Discovered via Google Places API at ${pointKey}`,
                    type: this.mapGoogleType(place.types),
                    googlePlaceId: place.place_id,
                    source: 'google_places',
                    status: 'pending', // Needs verification
                    address: {
                      street: place.vicinity,
                      city: 'Dakar',
                      region: 'Dakar',
                      country: 'Senegal',
                      coordinates: {
                        lat: place.geometry.location.lat,
                        lng: place.geometry.location.lng
                      }
                    },
                    ratings: {
                      googleRating: place.rating,
                      reviewCount: place.user_ratings_total || 0,
                      appRating: 0
                    }
                  };
                  
                  foundPlaces.push(placeData);
                  console.log(`    - ${place.name} (${place.place_id})`);
                  if (place.types) console.log(`      Types: ${place.types.join(', ')}`);
                  if (place.rating) console.log(`      Rating: ${place.rating} (${place.user_ratings_total} reviews)`);
                }
              }
              console.log(`  Found ${nextResponse.data.results.length} more places on page 2`);
            }
          }

          if (foundPlaces.length > 0) {
            // Save to SearchTracker
            await SearchTracker.create({
              location: pointKey,
              radius: point.radius || 400,
              searchTerms: ALL_EATERY_TYPES,
              placeIds: Array.from(places),
              lastSearched: new Date(),
              refreshInterval: 30 // 30 days default
            });

            // Save places to DB
            for (const placeData of foundPlaces) {
              await Place.findOneAndUpdate(
                { googlePlaceId: placeData.googlePlaceId },
                placeData,
                { upsert: true, new: true }
              );
            }

            // Show progress
            const cost = (apiCallCount * 0.017).toFixed(2);
            console.log(`  💰 Current cost: $${cost} USD (${apiCallCount} calls)`);
            console.log(`  📊 Total unique places: ${places.size}`);
          }
        }

      } catch (error) {
        console.error(`Error searching point ${pointKey}:`, error.message);
        throw error;
      }

    } catch (error) {
      console.error(`Error in findPlacesAtPoint:`, error);
      throw error;
    }

    return Array.from(places);
  }

  // Helper method to map Google Places types to our place types
  mapGoogleType(types) {
    if (!types || !Array.isArray(types)) return 'restaurant';

    // Map Google Places types to our types
    if (types.includes('bakery')) return 'bakery';
    if (types.includes('bar')) return 'bar';
    if (types.includes('cafe')) return 'coffee_shop';
    if (types.includes('ice_cream')) return 'ice_cream_shop';
    if (types.includes('meal_takeaway') && !types.includes('restaurant')) return 'restaurant';
    
    return 'restaurant'; // Default type
  }

  async syncPoint(point) {
    try {
      console.log(`\n🔄 Starting sync for point ${point.lat},${point.lng}`);
      
      const placeIds = await this.findPlacesAtPoint(point);
      
      console.log(`\n📊 Point sync completed:`);
      console.log(`📍 Total unique places found: ${placeIds.length}`);
      
      return {
        point,
        totalFound: placeIds.length,
        placeIds
      };
    } catch (error) {
      console.error(`Error syncing point ${point.lat},${point.lng}:`, error);
      throw error;
    }
  }
}

module.exports = PlacesSyncService; 