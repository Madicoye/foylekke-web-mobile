// Import all place type models
const Place = require('../Place');
const Restaurant = require('./Restaurant');
const Park = require('./Park');
const Museum = require('./Museum');

// Export all models
module.exports = {
  Place,
  Restaurant,
  Park,
  Museum
};

// Utility functions for working with place types
module.exports.PLACE_TYPES = {
  RESTAURANT: 'restaurant',
  PARK: 'park',
  MUSEUM: 'museum',
  SHOPPING_CENTER: 'shopping_center',
  HOTEL: 'hotel',
  CAFE: 'cafe',
  BAR: 'bar',
  ENTERTAINMENT: 'entertainment',
  CULTURAL: 'cultural',
  SPORTS: 'sports',
  OTHER: 'other'
};

// Get model by place type
module.exports.getModelByType = function(type) {
  const models = {
    restaurant: Restaurant,
    park: Park,
    museum: Museum,
    // Add other types as they are implemented
    shopping_center: Place,
    hotel: Place,
    cafe: Place,
    bar: Place,
    entertainment: Place,
    cultural: Place,
    sports: Place,
    other: Place
  };
  
  return models[type] || Place;
};

// Get all available place types
module.exports.getAvailableTypes = function() {
  return Object.values(module.exports.PLACE_TYPES);
};

// Get place type display names
module.exports.getTypeDisplayNames = function() {
  return {
    restaurant: 'Restaurant',
    park: 'Park',
    museum: 'Museum',
    shopping_center: 'Shopping Center',
    hotel: 'Hotel',
    cafe: 'Café',
    bar: 'Bar',
    entertainment: 'Entertainment',
    cultural: 'Cultural Site',
    sports: 'Sports Venue',
    other: 'Other'
  };
};

// Get features available for each place type
module.exports.getTypeFeatures = function() {
  return {
    restaurant: [
      'delivery', 'takeout', 'outdoor_seating', 'reservations',
      'live_music', 'private_dining', 'buffet', 'brunch',
      'breakfast', 'lunch', 'dinner', 'late_night',
      'wifi', 'parking', 'wheelchair_accessible', 'family_friendly'
    ],
    park: [
      'playground', 'picnic_areas', 'walking_trails', 'sports_facilities',
      'parking', 'restrooms', 'water_fountains', 'benches',
      'barbecue_areas', 'fishing', 'boating', 'swimming',
      'wildlife_viewing', 'botanical_gardens', 'amphitheater', 'visitor_center'
    ],
    museum: [
      'exhibitions', 'guided_tours', 'gift_shop', 'cafe', 'parking',
      'wheelchair_accessible', 'audio_guides', 'photography_allowed',
      'coat_check', 'library', 'research_center', 'workshops',
      'lectures', 'special_events', 'membership_program'
    ],
    shopping_center: [
      'stores', 'parking', 'food_court', 'entertainment', 'accessibility',
      'atm', 'restrooms', 'security', 'valet_parking', 'shopping_assistance'
    ],
    hotel: [
      'rooms', 'amenities', 'pool', 'spa', 'restaurant', 'parking',
      'wifi', 'gym', 'concierge', 'room_service', 'laundry', 'business_center'
    ],
    cafe: [
      'menu', 'wifi', 'outdoor_seating', 'takeout', 'reservations',
      'coffee', 'pastries', 'breakfast', 'lunch', 'dinner'
    ],
    bar: [
      'drinks', 'live_music', 'outdoor_seating', 'parking',
      'cocktails', 'beer', 'wine', 'food', 'entertainment'
    ],
    entertainment: [
      'activities', 'age_restrictions', 'parking', 'food_available',
      'live_shows', 'games', 'arcade', 'bowling', 'cinema'
    ],
    cultural: [
      'exhibitions', 'events', 'guided_tours', 'parking',
      'performances', 'workshops', 'festivals', 'traditional_arts'
    ],
    sports: [
      'facilities', 'equipment_rental', 'lessons', 'parking',
      'fitness_center', 'swimming_pool', 'tennis_courts', 'soccer_field'
    ],
    other: []
  };
};

// Validate place type
module.exports.isValidPlaceType = function(type) {
  return Object.values(module.exports.PLACE_TYPES).includes(type);
};

// Get Google Places API types for each place type
module.exports.getGooglePlacesTypes = function() {
  return {
    restaurant: ['restaurant', 'food', 'meal_takeaway', 'bakery'],
    park: ['park', 'natural_feature'],
    museum: ['museum', 'art_gallery'],
    shopping_center: ['shopping_mall', 'store'],
    hotel: ['lodging'],
    cafe: ['cafe'],
    bar: ['bar'],
    entertainment: ['amusement_park', 'movie_theater', 'bowling_alley'],
    cultural: ['museum', 'art_gallery', 'church', 'mosque'],
    sports: ['gym', 'stadium'],
    other: []
  };
}; 