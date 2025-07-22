const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['restaurant', 'bakery', 'bar', 'coffee_shop', 'ice_cream_shop', 'soup_kitchen'],
    index: true
  },
  cuisine: [{
    type: String,
    index: true
  }],
  features: [{
    type: String,
    enum: ['wifi', 'parking', 'outdoor_seating', 'live_music', 'reservations', 'wheelchair_accessible', 'family_friendly', 'delivery', 'takeout'],
    index: true
  }],
  address: {
    street: String,
    city: String,
    region: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  openingHours: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    open: String,
    close: String,
    isClosed: Boolean
  }],
  priceRange: {
    type: String,
    enum: ['low', 'medium', 'high'],
    index: true
  },
  images: [{
    url: String,
    caption: String,
    isDefault: Boolean
  }],
  ratings: {
    googleRating: Number,
    appRating: {
      type: Number,
      default: 0,
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'active',
    index: true
  },
  source: {
    type: String,
    enum: ['google_places', 'manual', 'api'],
    default: 'manual'
  },
  googlePlaceId: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  }
}, {
  timestamps: true
});

// Text search indexes
placeSchema.index({
  name: 'text',
  description: 'text',
  'address.street': 'text',
  'address.city': 'text',
  'address.region': 'text',
  cuisine: 'text'
}, {
  weights: {
    name: 10,
    cuisine: 5,
    description: 3,
    'address.street': 2,
    'address.city': 2,
    'address.region': 2
  },
  name: 'PlaceTextIndex'
});

// Compound indexes for common queries
placeSchema.index({ type: 1, status: 1 });
placeSchema.index({ cuisine: 1, status: 1 });
placeSchema.index({ 'ratings.appRating': -1, status: 1 });
placeSchema.index({ priceRange: 1, status: 1 });
placeSchema.index({ 'address.region': 1, status: 1 });
placeSchema.index({ features: 1, status: 1 });

// Add geospatial index for coordinates
placeSchema.index({ 'address.coordinates': '2dsphere' });

// Add compound index for name and region
placeSchema.index({ name: 1, 'address.region': 1 });

// Add index for Google Place ID
placeSchema.index({ googlePlaceId: 1 }, { unique: true });

// Static method for advanced search
placeSchema.statics.advancedSearch = async function(params) {
  const {
    query,
    type,
    cuisine,
    region,
    minRating,
    maxRating,
    priceRange,
    features = [],
    openNow,
    hasDelivery,
    hasTakeout,
    page = 1,
    limit = 20,
    sortBy = 'relevance'
  } = params;

  // Build search query
  const searchQuery = { status: 'active' };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Type filter
  if (type) {
    searchQuery.type = type;
  }

  // Cuisine filter
  if (cuisine) {
    searchQuery.cuisine = { $in: Array.isArray(cuisine) ? cuisine : [cuisine] };
  }

  // Region filter
  if (region) {
    searchQuery['address.region'] = { $regex: region, $options: 'i' };
  }

  // Rating filter
  if (minRating || maxRating) {
    searchQuery['ratings.appRating'] = {};
    if (minRating) searchQuery['ratings.appRating'].$gte = parseFloat(minRating);
    if (maxRating) searchQuery['ratings.appRating'].$lte = parseFloat(maxRating);
  }

  // Price range filter
  if (priceRange) {
    searchQuery.priceRange = priceRange;
  }

  // Features filter
  if (features.length > 0) {
    searchQuery.features = { $all: features };
  }

  // Delivery/Takeout filters
  if (hasDelivery) {
    searchQuery.features = { ...searchQuery.features, $all: [...(searchQuery.features?.$all || []), 'delivery'] };
  }
  if (hasTakeout) {
    searchQuery.features = { ...searchQuery.features, $all: [...(searchQuery.features?.$all || []), 'takeout'] };
  }

  // Build sort object
  let sort = {};
  switch (sortBy) {
    case 'rating':
      sort = { 'ratings.appRating': -1 };
      break;
    case 'name':
      sort = { name: 1 };
      break;
    case 'price_low':
      sort = { priceRange: 1 };
      break;
    case 'price_high':
      sort = { priceRange: -1 };
      break;
    case 'relevance':
    default:
      if (query) {
        sort = { score: { $meta: 'textScore' } };
      } else {
        sort = { 'ratings.appRating': -1 };
      }
  }

  // Execute search with pagination
  const skip = (page - 1) * limit;
  
  const [results, total] = await Promise.all([
    this.find(
      searchQuery,
      query ? { score: { $meta: 'textScore' } } : null
    )
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean(),
    this.countDocuments(searchQuery)
  ]);

  return {
    results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method for search suggestions
placeSchema.statics.getSuggestions = async function(query, limit = 5) {
  if (!query || query.length < 2) return [];

  const suggestions = await this.find(
    {
      $text: { $search: query },
      status: 'active'
    },
    {
      score: { $meta: 'textScore' },
      name: 1,
      type: 1,
      cuisine: 1,
      'address.city': 1,
      'address.region': 1
    }
  )
  .sort({ score: { $meta: 'textScore' } })
  .limit(limit)
  .lean();

  return suggestions;
};

module.exports = mongoose.model('Place', placeSchema); 