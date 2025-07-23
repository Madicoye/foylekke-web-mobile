const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  // Basic Info
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Ad Type and Source
  type: {
    type: String,
    enum: ['banner', 'sponsored_place', 'native', 'interstitial', 'google_adsense'],
    required: true
  },
  source: {
    type: String,
    enum: ['custom', 'google_adsense'],
    default: 'custom'
  },
  
  // Content
  image: String,
  images: [String], // Multiple images for carousel ads
  videoUrl: String,
  ctaText: {
    type: String,
    default: 'Learn More'
  },
  ctaUrl: String,
  
  // Placement and Targeting
  placement: {
    type: String,
    enum: ['homepage_hero', 'homepage_between_sections', 'places_list', 'place_detail', 'search_results', 'hangouts', 'sidebar'],
    required: true
  },
  targetRegions: [{
    type: String,
    required: true
  }],
  targetPlaceTypes: [{
    type: String,
    enum: ['restaurant', 'park', 'museum', 'hotel', 'attraction', 'shopping']
  }],
  targetAudience: {
    ageRange: {
      min: { type: Number, min: 13, max: 100 },
      max: { type: Number, min: 13, max: 100 }
    },
    interests: [String],
    location: String
  },
  
  // Scheduling
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  schedule: {
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: String, // HH:MM format
    endTime: String    // HH:MM format
  },
  
  // Status and Approval
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'paused', 'expired', 'rejected'],
    default: 'draft'
  },
  rejectionReason: String,
  
  // Performance Metrics
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    ctr: { type: Number, default: 0 }, // Click-through rate
    cost: { type: Number, default: 0 }
  },
  
  // Budget and Pricing
  budget: {
    type: {
      type: String,
      enum: ['daily', 'total', 'cpc', 'cpm'], // Cost per click, cost per mille
      default: 'total'
    },
    amount: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    currency: {
      type: String,
      default: 'XOF'
    }
  },
  
  // Payment information
  payment: {
    paymentId: String,
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'XOF'
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date,
    failedAt: Date,
    failureReason: String,
    confirmedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refundedAt: Date,
    refundAmount: Number
  },

  // Review information (for admin approval)
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  reviewNotes: String,
  
  // Advertiser Info
  advertiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place'
  },
  
  // Google Ads specific fields
  googleAds: {
    unitId: String,
    slotId: String,
    format: String,
    size: String
  },
  
  // Priority and Weight
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  weight: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Indexes for better performance
advertisementSchema.index({ status: 1, startDate: 1, endDate: 1 });
advertisementSchema.index({ targetRegions: 1, placement: 1 });
advertisementSchema.index({ advertiser: 1 });

// Virtual for CTR calculation
advertisementSchema.virtual('ctr').get(function() {
  return this.metrics.impressions > 0 ? (this.metrics.clicks / this.metrics.impressions) * 100 : 0;
});

// Methods
advertisementSchema.methods.trackImpression = async function() {
  this.metrics.impressions += 1;
  this.metrics.ctr = this.metrics.impressions > 0 ? (this.metrics.clicks / this.metrics.impressions) * 100 : 0;
  return this.save();
};

advertisementSchema.methods.trackClick = async function() {
  this.metrics.clicks += 1;
  this.metrics.ctr = this.metrics.impressions > 0 ? (this.metrics.clicks / this.metrics.impressions) * 100 : 0;
  return this.save();
};

advertisementSchema.methods.trackConversion = async function() {
  this.metrics.conversions += 1;
  return this.save();
};

advertisementSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         this.budget.spent < this.budget.amount;
};

// Automatically update place's sponsored status
advertisementSchema.post('save', async function() {
  if (this.place && this.type === 'sponsored_place') {
    const Place = mongoose.model('Place');
    await Place.findByIdAndUpdate(this.place, {
      isSponsored: this.status === 'active',
      sponsorshipExpiry: this.endDate
    });
  }
});

// Pre-save middleware to calculate CTR
advertisementSchema.pre('save', function(next) {
  if (this.metrics.impressions > 0) {
    this.metrics.ctr = (this.metrics.clicks / this.metrics.impressions) * 100;
  }
  next();
});

module.exports = mongoose.model('Advertisement', advertisementSchema); 