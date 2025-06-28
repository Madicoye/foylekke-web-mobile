const mongoose = require('mongoose');

const advertisementSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  type: {
    type: String,
    enum: ['featured', 'banner', 'popup'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  image: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  targetRegions: [{
    type: String,
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'active', 'expired', 'rejected'],
    default: 'pending'
  },
  clicks: {
    type: Number,
    default: 0
  },
  impressions: {
    type: Number,
    default: 0
  },
  budget: {
    amount: Number,
    currency: {
      type: String,
      default: 'XOF'
    }
  }
}, {
  timestamps: true
});

// Automatically update restaurant's sponsored status
advertisementSchema.post('save', async function() {
  const Restaurant = mongoose.model('Restaurant');
  await Restaurant.findByIdAndUpdate(this.restaurant, {
    isSponsored: this.status === 'active',
    sponsorshipExpiry: this.endDate
  });
});

module.exports = mongoose.model('Advertisement', advertisementSchema); 