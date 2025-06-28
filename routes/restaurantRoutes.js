const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');
const { Client } = require('@googlemaps/google-maps-services-js');
const RestaurantSubmissionService = require('../services/restaurantSubmission');

const googleMapsClient = new Client({});
const submissionService = new RestaurantSubmissionService(process.env.GOOGLE_MAPS_API_KEY);

// Get all restaurants with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const {
      region,
      cuisine,
      priceRange,
      rating,
      features,
      search,
      lat,
      lng,
      radius,
      sort
    } = req.query;

    let query = {};

    // Filter by region
    if (region) {
      query['address.region'] = region;
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: cuisine.split(',') };
    }

    // Filter by price range
    if (priceRange) {
      query.priceRange = { $in: priceRange.split(',') };
    }

    // Filter by minimum rating
    if (rating) {
      query['ratings.appRating'] = { $gte: parseFloat(rating) };
    }

    // Filter by features
    if (features) {
      query.features = { $all: features.split(',') };
    }

    // Text search
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'menu.items.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Nearby search
    if (lat && lng && radius) {
      query['address.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Convert km to meters
        }
      };
    }

    // Sorting
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'rating':
          sortOption = { 'ratings.appRating': -1 };
          break;
        case 'reviews':
          sortOption = { 'ratings.reviewCount': -1 };
          break;
        case 'name':
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const restaurants = await Restaurant.find(query)
      .sort(sortOption)
      .populate('owner', 'name email')
      .lean();

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top rated restaurants by region
router.get('/top/:region', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      'address.region': req.params.region,
      'ratings.appRating': { $gt: 0 }
    })
    .sort({ 'ratings.appRating': -1 })
    .limit(10)
    .lean();

    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single restaurant
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name profilePicture' }
      })
      .lean();

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new restaurant (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const restaurant = await submissionService.submitRestaurant(req.body, req.user._id);
    res.status(201).json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update restaurant (requires authentication and ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();
    res.json(restaurant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete restaurant (requires authentication and ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await restaurant.remove();
    res.json({ message: 'Restaurant deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 