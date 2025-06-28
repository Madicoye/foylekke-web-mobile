const { Client } = require('@googlemaps/google-maps-services-js');
const Restaurant = require('../models/Restaurant');

class RestaurantSubmissionService {
  constructor(apiKey) {
    this.client = new Client({});
    this.apiKey = apiKey;
  }

  async submitRestaurant(data, userId) {
    try {
      // First, save as user-submitted place
      const restaurant = new Restaurant({
        ...data,
        source: 'user',
        submittedBy: userId,
        verificationStatus: 'pending'
      });

      // If coordinates are not provided, geocode the address
      if (!data.address.coordinates && data.address.street) {
        const coordinates = await this.geocodeAddress(data.address);
        if (coordinates) {
          restaurant.address.coordinates = {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          };
        }
      }

      // Optional: Add to Google Places if requested
      if (data.addToGooglePlaces) {
        try {
          const placeId = await this.addToGooglePlaces(data);
          if (placeId) {
            restaurant.googlePlaceId = placeId;
            restaurant.verificationStatus = 'verified';
          }
        } catch (error) {
          console.error('Failed to add to Google Places:', error);
          // Continue with local submission even if Google Places fails
        }
      }

      await restaurant.save();
      return restaurant;
    } catch (error) {
      console.error('Restaurant submission error:', error);
      throw error;
    }
  }

  async geocodeAddress(address) {
    try {
      const response = await this.client.geocode({
        params: {
          address: `${address.street}, ${address.city}, ${address.region}, Senegal`,
          key: this.apiKey
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return { lat: location.lat, lng: location.lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  async addToGooglePlaces(data) {
    try {
      // Note: This requires a Google Places API Premium Plan
      const response = await this.client.placeAdd({
        params: {
          key: this.apiKey,
          place: {
            name: data.name,
            formatted_address: `${data.address.street}, ${data.address.city}, ${data.address.region}, Senegal`,
            location: data.address.coordinates ? {
              lat: data.address.coordinates.coordinates[1],
              lng: data.address.coordinates.coordinates[0]
            } : undefined,
            type: 'restaurant',
            phone_number: data.contact?.phone,
            website: data.contact?.website
          }
        }
      });

      return response.data.place_id;
    } catch (error) {
      console.error('Error adding to Google Places:', error);
      return null;
    }
  }
}

module.exports = RestaurantSubmissionService; 