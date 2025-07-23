const mongoose = require('mongoose');
const Place = require('../Place');

// Park-specific schema extending the base Place model
const parkSchema = new mongoose.Schema({
  // Park-specific features
  features: {
    type: [String],
    default: [],
    validate: {
      validator: function(features) {
        const validFeatures = [
          'playground', 'picnic_areas', 'walking_trails', 'sports_facilities',
          'parking', 'restrooms', 'water_fountains', 'benches',
          'barbecue_areas', 'fishing', 'boating', 'swimming',
          'wildlife_viewing', 'botanical_gardens', 'amphitheater', 'visitor_center'
        ];
        return features.every(feature => validFeatures.includes(feature));
      },
      message: 'Invalid park feature'
    }
  },
  // Park-specific data
  typeSpecificData: {
    // Park size and type
    size: {
      type: String,
      enum: ['small', 'medium', 'large', 'very_large']
    },
    parkType: {
      type: String,
      enum: ['urban', 'national', 'botanical', 'recreation', 'wildlife', 'historical']
    },
    // Facilities
    facilities: {
      playground: Boolean,
      picnicAreas: Boolean,
      sportsCourts: Boolean,
      walkingTrails: Boolean,
      parking: Boolean,
      restrooms: Boolean,
      visitorCenter: Boolean,
      cafe: Boolean
    },
    // Activities available
    activities: [String],
    // Entry requirements
    entryFee: {
      type: Number,
      default: 0
    },
    // Special events
    events: [{
      name: String,
      description: String,
      date: Date,
      recurring: Boolean
    }],
    // Wildlife and nature
    wildlife: [String],
    plantSpecies: [String]
  }
}, {
  discriminatorKey: 'type'
});

// Park-specific methods
parkSchema.methods.isFree = function() {
  return this.typeSpecificData.entryFee === 0;
};

parkSchema.methods.getAvailableActivities = function() {
  return this.typeSpecificData.activities || [];
};

parkSchema.methods.hasFacility = function(facility) {
  return this.typeSpecificData.facilities && this.typeSpecificData.facilities[facility];
};

module.exports = Place.discriminator('park', parkSchema); 