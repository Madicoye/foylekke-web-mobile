const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new review
router.post('/', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const existingReview = await Review.findOne({
      restaurant: req.body.restaurant,
      user: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this restaurant' });
    }

    const review = new Review({
      ...req.body,
      user: req.user._id
    });

    await review.save();
    
    // Add review to user's reviews
    req.user.reviews.push(review._id);
    await req.user.save();

    await review.populate('user', 'name profilePicture');
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    Object.assign(review, req.body);
    await review.save();
    
    await review.populate('user', 'name profilePicture');
    res.json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.remove();
    
    // Remove review from user's reviews
    const index = req.user.reviews.indexOf(req.params.id);
    if (index > -1) {
      req.user.reviews.splice(index, 1);
      await req.user.save();
    }

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle like on review
router.post('/:id/like', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const likeIndex = review.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      review.likes.splice(likeIndex, 1);
    } else {
      review.likes.push(req.user._id);
    }

    await review.save();
    res.json(review.likes);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 