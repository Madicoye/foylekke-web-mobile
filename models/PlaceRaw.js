const mongoose = require('mongoose');

const placeRawSchema = new mongoose.Schema({
  googlePlaceId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  foundAt: {
    type: String,  // The search point where this place was found
    required: true
  },
  foundOn: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for quick lookups
placeRawSchema.index({ foundAt: 1, foundOn: -1 });

module.exports = mongoose.model('PlaceRaw', placeRawSchema); 