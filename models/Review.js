const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  images: [String],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  visitDate: Date,
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Update restaurant rating when a review is added or modified
reviewSchema.post('save', async function() {
  const Restaurant = mongoose.model('Restaurant');
  const restaurant = await Restaurant.findById(this.restaurant);
  
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { restaurant: this.restaurant } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    restaurant.ratings.appRating = stats[0].avgRating;
    restaurant.ratings.reviewCount = stats[0].count;
    await restaurant.save();
  }
});

module.exports = mongoose.model('Review', reviewSchema); 