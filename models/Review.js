const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
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

// Update place rating when a review is added or modified
reviewSchema.post('save', async function() {
  const Place = mongoose.model('Place');
  const place = await Place.findById(this.place);
  
  const Review = this.constructor;
  const stats = await Review.aggregate([
    { $match: { place: this.place } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    place.ratings.appRating = stats[0].avgRating;
    place.ratings.reviewCount = stats[0].count;
    await place.save();
  }
});

module.exports = mongoose.model('Review', reviewSchema); 