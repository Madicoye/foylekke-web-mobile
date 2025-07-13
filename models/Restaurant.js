const mongoose = require('mongoose');

/**
 * @deprecated This model is deprecated. Use the new Place system instead.
 * 
 * The new system supports multiple place types including restaurants, parks, museums, etc.
 * 
 * Migration steps:
 * 1. Use the new Place model: require('../models/placeTypes').Place
 * 2. For restaurants specifically: require('../models/placeTypes').Restaurant
 * 3. Run migration script: npm run migrate-to-places
 * 
 * New API endpoints:
 * - GET /api/places - Generic places API
 * - GET /api/restaurants - Still works for backward compatibility
 * 
 * @see PLACES_MIGRATION.md for detailed migration guide
 */

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
  menu: [{
    category: String,
    items: [{
      name: String,
      description: String,
      price: Number,
      image: String
    }]
  }],
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
  features: [String], // e.g., ['Delivery', 'Takeout', 'Outdoor Seating']
  cuisine: [String],
  priceRange: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
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
  }
}, {
  timestamps: true
});

// Index for geospatial queries
restaurantSchema.index({ 'address.coordinates': '2dsphere' });
// Index for Google Place ID lookups
restaurantSchema.index({ googlePlaceId: 1 });

module.exports = mongoose.model('Restaurant', restaurantSchema); 