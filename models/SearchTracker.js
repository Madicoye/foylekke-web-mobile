const mongoose = require('mongoose');

const searchTrackerSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    index: true
  },
  radius: {
    type: Number,
    required: true,
    default: 400
  },
  searchTerms: {
    type: String,
    required: true
  },
  placeIds: [{
    type: String
  }],
  lastSearched: {
    type: Date,
    default: Date.now
  },
  refreshInterval: {
    type: Number,
    default: 30 // days
  }
});

// Index for quick lookups
searchTrackerSchema.index({ location: 1, searchTerms: 1 });

module.exports = mongoose.model('SearchTracker', searchTrackerSchema); 