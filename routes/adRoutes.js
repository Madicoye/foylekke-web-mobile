const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const Restaurant = require('../models/Restaurant');
const auth = require('../middleware/auth');

// Get active ads for a region
router.get('/region/:region', async (req, res) => {
  try {
    const ads = await Advertisement.find({
      status: 'active',
      targetRegions: req.params.region,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate('restaurant', 'name description images')
    .sort('-budget.amount');
    
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new ad (requires restaurant owner or admin)
router.post('/', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.body.restaurant);
    
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const ad = new Advertisement(req.body);
    await ad.save();

    await ad.populate('restaurant', 'name description images');
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ad status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    if (!['pending', 'active', 'expired', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    ad.status = status;
    await ad.save();

    await ad.populate('restaurant', 'name description images');
    res.json(ad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Track ad click
router.post('/:id/click', async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    ad.clicks += 1;
    await ad.save();

    res.json({ clicks: ad.clicks });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Track ad impression
router.post('/:id/impression', async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }

    ad.impressions += 1;
    await ad.save();

    res.json({ impressions: ad.impressions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get ads for a restaurant owner
router.get('/my-ads', auth, async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ owner: req.user._id });
    const restaurantIds = restaurants.map(r => r._id);

    const ads = await Advertisement.find({
      restaurant: { $in: restaurantIds }
    })
    .populate('restaurant', 'name description images')
    .sort('-createdAt');

    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 