const mongoose = require('mongoose');
const Place = require('../Place');

// Restaurant-specific schema extending the base Place model
const restaurantSchema = new mongoose.Schema({
  // Restaurant-specific fields
  menu: [{
    category: String,
    items: [{
      name: String,
      description: String,
      price: Number,
      image: String
    }]
  }],
  cuisine: [String],
  priceRange: {
    type: String,
    enum: ['low', 'medium', 'high']
  },
  // Additional restaurant-specific features
  features: {
    type: [String],
    default: [],
    validate: {
      validator: function(features) {
        const validFeatures = [
          'delivery', 'takeout', 'outdoor_seating', 'reservations',
          'live_music', 'private_dining', 'buffet', 'brunch',
          'breakfast', 'lunch', 'dinner', 'late_night',
          'wifi', 'parking', 'wheelchair_accessible', 'family_friendly'
        ];
        return features.every(feature => validFeatures.includes(feature));
      },
      message: 'Invalid restaurant feature'
    }
  },
  // Restaurant-specific data in typeSpecificData
  typeSpecificData: {
    // Operating hours for different meal periods
    mealHours: {
      breakfast: { start: String, end: String },
      lunch: { start: String, end: String },
      dinner: { start: String, end: String }
    },
    // Special services
    services: {
      catering: Boolean,
      privateEvents: Boolean,
      cookingClasses: Boolean,
      wineTasting: Boolean
    },
    // Awards and certifications
    awards: [String],
    certifications: [String]
  }
}, {
  // This ensures the discriminator key is set correctly
  discriminatorKey: 'type'
});

// Restaurant-specific methods
restaurantSchema.methods.getMealPeriod = function() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  
  if (this.typeSpecificData.mealHours) {
    const { breakfast, lunch, dinner } = this.typeSpecificData.mealHours;
    
    if (breakfast && currentTime >= breakfast.start && currentTime <= breakfast.end) {
      return 'breakfast';
    }
    if (lunch && currentTime >= lunch.start && currentTime <= lunch.end) {
      return 'lunch';
    }
    if (dinner && currentTime >= dinner.start && currentTime <= dinner.end) {
      return 'dinner';
    }
  }
  
  return null;
};

restaurantSchema.methods.getAveragePrice = function() {
  if (!this.menu || this.menu.length === 0) {
    return null;
  }
  
  let totalPrice = 0;
  let itemCount = 0;
  
  this.menu.forEach(category => {
    category.items.forEach(item => {
      if (item.price) {
        totalPrice += item.price;
        itemCount++;
      }
    });
  });
  
  return itemCount > 0 ? totalPrice / itemCount : null;
};

module.exports = Place.discriminator('restaurant', restaurantSchema); 