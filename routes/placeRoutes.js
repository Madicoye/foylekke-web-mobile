const express = require('express');
const router = express.Router();
const { Place, getModelByType, getAvailableTypes, getTypeFeatures, PLACE_TYPES } = require('../models/placeTypes');
const auth = require('../middleware/auth');
const { Client } = require('@googlemaps/google-maps-services-js');
const PlacesSyncService = require('../services/placesSync');

const googleMapsClient = new Client({});
const placesSyncService = new PlacesSyncService(process.env.GOOGLE_MAPS_API_KEY);

// Get all places with filtering and sorting
router.get('/', async (req, res) => {
  try {
    const {
      type,
      region,
      cuisine,
      priceRange,
      rating,
      features,
      search,
      lat,
      lng,
      radius,
      sort,
      limit = 50,
      page = 1
    } = req.query;

    let query = {};

    // Filter by place type
    if (type) {
      const types = type.split(',');
      query.type = { $in: types };
    }

    // Filter by region
    if (region) {
      query['address.region'] = region;
    }

    // Filter by cuisine (for restaurants)
    if (cuisine && (!type || type.includes('restaurant'))) {
      query.cuisine = { $in: cuisine.split(',') };
    }

    // Filter by price range (for restaurants and other paid places)
    if (priceRange) {
      if (type === 'restaurant' || !type) {
        query.priceRange = { $in: priceRange.split(',') };
             } else {
         // For other place types, check typeSpecificData
         query['typeSpecificData.entryFee'] = { $lte: mapPriceRangeToNumber(priceRange) };
       }
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
        { description: { $regex: search, $options: 'i' } }
      ];
      
      // Add menu search for restaurants
      if (!type || type.includes('restaurant')) {
        query.$or.push({ 'menu.items.name': { $regex: search, $options: 'i' } });
      }
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
        case 'distance':
          if (lat && lng) {
            // Distance sorting is handled by $near query
            sortOption = { 'address.coordinates': 1 };
          }
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const places = await Place.find(query)
      .sort(sortOption)
      .populate('owner', 'name email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Place.countDocuments(query);

    res.json({
      places,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get place types and their features
router.get('/types', async (req, res) => {
  try {
    const types = getAvailableTypes();
    const typeFeatures = getTypeFeatures();
    const typeDisplayNames = {
      restaurant: 'Restaurant',
      park: 'Park',
      museum: 'Museum',
      shopping_center: 'Shopping Center',
      hotel: 'Hotel',
      cafe: 'Café',
      bar: 'Bar',
      entertainment: 'Entertainment',
      cultural: 'Cultural Site',
      sports: 'Sports Venue',
      other: 'Other'
    };

    const typeInfo = types.map(type => ({
      value: type,
      label: typeDisplayNames[type],
      features: typeFeatures[type] || []
    }));

    res.json(typeInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get top rated places by region and type
router.get('/top/:region', async (req, res) => {
  try {
    const { type } = req.query;
    let query = {
      'address.region': req.params.region,
      'ratings.appRating': { $gt: 0 }
    };

    if (type) {
      query.type = type;
    }

    const places = await Place.find(query)
      .sort({ 'ratings.appRating': -1 })
      .limit(10)
      .populate('owner', 'name email')
      .lean();

    res.json(places);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single place
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'reviews',
        populate: { path: 'user', select: 'name profilePicture' }
      })
      .lean();

    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(place);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new place (requires authentication)
router.post('/', auth, async (req, res) => {
  try {
    const { type = 'other', ...placeData } = req.body;
    
    // Validate place type
    if (!getAvailableTypes().includes(type)) {
      return res.status(400).json({ message: 'Invalid place type' });
    }

    // Get the appropriate model for the place type
    const PlaceModel = getModelByType(type);
    
    // Create the place
    const place = new PlaceModel({
      ...placeData,
      type,
      source: 'user',
      submittedBy: req.user._id,
      verificationStatus: 'pending'
    });

    await place.save();
    
    // Populate owner information
    await place.populate('owner', 'name email');
    
    res.status(201).json(place);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update place (requires authentication and ownership)
router.put('/:id', auth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    if (place.owner && place.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(place, req.body);
    await place.save();
    
    await place.populate('owner', 'name email');
    res.json(place);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete place (requires authentication and ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    if (place.owner && place.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await place.remove();
    res.json({ message: 'Place deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Sync places from Google Places API (admin only)
router.post('/sync/:region', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { region } = req.params;
    const { type = 'restaurant', limit } = req.query;

    const result = await placesSyncService.syncRegion(region, limit ? parseInt(limit) : null, type);
    
    res.json({
      message: `Sync completed for ${type} places in ${region}`,
      result
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to map price range to number
function mapPriceRangeToNumber(priceRange) {
  const priceMap = {
    'low': 10,
    'medium': 50,
    'high': 200
  };
  
  const ranges = priceRange.split(',');
  const maxPrice = Math.max(...ranges.map(range => priceMap[range] || 0));
  return maxPrice;
}

module.exports = router; 