const mongoose = require('mongoose');
const Place = require('../Place');

// Museum-specific schema extending the base Place model
const museumSchema = new mongoose.Schema({
  // Museum-specific features
  features: {
    type: [String],
    default: [],
    validate: {
      validator: function(features) {
        const validFeatures = [
          'exhibitions', 'guided_tours', 'gift_shop', 'cafe', 'parking',
          'wheelchair_accessible', 'audio_guides', 'photography_allowed',
          'coat_check', 'library', 'research_center', 'workshops',
          'lectures', 'special_events', 'membership_program'
        ];
        return features.every(feature => validFeatures.includes(feature));
      },
      message: 'Invalid museum feature'
    }
  },
  // Museum-specific data
  typeSpecificData: {
    // Museum type
    museumType: {
      type: String,
      enum: ['art', 'history', 'science', 'natural_history', 'cultural', 'specialized']
    },
    // Collections and exhibitions
    collections: [String],
    currentExhibitions: [{
      name: String,
      description: String,
      startDate: Date,
      endDate: Date,
      curator: String
    }],
    permanentExhibitions: [String],
    // Admission and pricing
    admission: {
      adult: Number,
      child: Number,
      student: Number,
      senior: Number,
      freeDays: [String] // Days of the week when admission is free
    },
    // Educational programs
    programs: {
      guidedTours: Boolean,
      audioGuides: Boolean,
      workshops: Boolean,
      lectures: Boolean,
      schoolPrograms: Boolean
    },
    // Special services
    services: {
      giftShop: Boolean,
      cafe: Boolean,
      library: Boolean,
      researchCenter: Boolean,
      coatCheck: Boolean
    },
    // Operating information
    lastEntry: String, // Last entry time
    averageVisitDuration: Number, // in minutes
    photographyPolicy: {
      type: String,
      enum: ['allowed', 'restricted', 'prohibited']
    }
  }
}, {
  discriminatorKey: 'type'
});

// Museum-specific methods
museumSchema.methods.isFreeToday = function() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  return this.typeSpecificData.admission.freeDays.includes(today);
};

museumSchema.methods.getCurrentExhibitions = function() {
  const now = new Date();
  return this.typeSpecificData.currentExhibitions.filter(exhibition => 
    exhibition.startDate <= now && exhibition.endDate >= now
  );
};

museumSchema.methods.getAdmissionPrice = function(category = 'adult') {
  return this.typeSpecificData.admission[category] || 0;
};

module.exports = Place.discriminator('museum', museumSchema); 