const mongoose = require('mongoose');

// Base place schema with common fields
const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['restaurant', 'park', 'museum', 'shopping_center', 'hotel', 'cafe', 'bar', 'entertainment', 'cultural', 'sports', 'other'],
    default: 'other'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    region: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  images: [String],
  openingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  ratings: {
    googleRating: Number,
    appRating: {
      type: Number,
      default: 0
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  features: [String], // Generic features for all place types
  isVerified: {
    type: Boolean,
    default: false
  },
  isSponsored: {
    type: Boolean,
    default: false
  },
  sponsorshipExpiry: Date,
  googlePlaceId: {
    type: String,
    sparse: true,
    unique: true
  },
  source: {
    type: String,
    enum: ['user', 'google_places', 'admin'],
    default: 'user'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Type-specific data (using mixed type for flexibility)
  typeSpecificData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  discriminatorKey: 'type' // This allows us to use inheritance
});

// Index for geospatial queries
placeSchema.index({ 'address.coordinates': '2dsphere' });
// Index for Google Place ID lookups
placeSchema.index({ googlePlaceId: 1 });
// Index for place type filtering
placeSchema.index({ type: 1 });
// Index for region filtering
placeSchema.index({ 'address.region': 1 });
// Text search index
placeSchema.index({ name: 'text', description: 'text' });

// Virtual for checking if place is open now
placeSchema.virtual('isOpenNow').get(function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.openingHours[dayOfWeek];
  if (!todayHours || !todayHours.open || !todayHours.close) {
    return false;
  }
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

// Method to get place type display name
placeSchema.methods.getTypeDisplayName = function() {
  const typeNames = {
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
  
  return typeNames[this.type] || 'Other';
};

// Method to get place-specific features
placeSchema.methods.getTypeSpecificFeatures = function() {
  const typeFeatures = {
    restaurant: ['menu', 'cuisine', 'priceRange', 'delivery', 'takeout', 'reservations'],
    park: ['playground', 'picnic_areas', 'walking_trails', 'sports_facilities', 'parking'],
    museum: ['exhibitions', 'guided_tours', 'gift_shop', 'cafe', 'parking'],
    shopping_center: ['stores', 'parking', 'food_court', 'entertainment', 'accessibility'],
    hotel: ['rooms', 'amenities', 'pool', 'spa', 'restaurant', 'parking'],
    cafe: ['menu', 'wifi', 'outdoor_seating', 'takeout', 'reservations'],
    bar: ['drinks', 'live_music', 'outdoor_seating', 'parking'],
    entertainment: ['activities', 'age_restrictions', 'parking', 'food_available'],
    cultural: ['exhibitions', 'events', 'guided_tours', 'parking'],
    sports: ['facilities', 'equipment_rental', 'lessons', 'parking'],
    other: []
  };
  
  return typeFeatures[this.type] || [];
};

module.exports = mongoose.model('Place', placeSchema); 