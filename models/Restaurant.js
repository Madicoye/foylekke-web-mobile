const mongoose = require('mongoose');

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