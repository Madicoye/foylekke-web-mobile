const express = require('express');
const router = express.Router();
const Advertisement = require('../models/Advertisement');
const { Place } = require('../models/placeTypes');
const auth = require('../middleware/auth');
const User = require('../models/User'); // Added for admin analytics
const { uploadAd, handleUploadError, deleteFromCloudinary, extractPublicId } = require('../middleware/upload');

// Get active ads for a specific placement and region
router.get('/placement/:placement', async (req, res) => {
  try {
    const { placement } = req.params;
    const { region, placeType, limit = 5 } = req.query;
    
    const query = {
      placement,
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };
    
    // Add targeting filters
    if (region) {
      query.targetRegions = region;
    }
    
    if (placeType) {
      query.$or = [
        { targetPlaceTypes: placeType },
        { targetPlaceTypes: { $exists: false } },
        { targetPlaceTypes: { $size: 0 } }
      ];
    }
    
    const ads = await Advertisement.find(query)
      .populate('place', 'name description images address')
      .populate('advertiser', 'name email')
      .sort({ priority: -1, weight: -1, 'budget.amount': -1 })
      .limit(parseInt(limit));
    
    // Track impressions for returned ads
    const impressionPromises = ads.map(ad => ad.trackImpression());
    await Promise.all(impressionPromises);
    
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get active ads for a region (legacy endpoint)
router.get('/region/:region', async (req, res) => {
  try {
    const ads = await Advertisement.find({
      status: 'active',
      targetRegions: req.params.region,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    })
    .populate('place', 'name description images address')
    .populate('advertiser', 'name email')
    .sort({ priority: -1, 'budget.amount': -1 });
    
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sponsored places for a specific region and type
router.get('/sponsored-places', async (req, res) => {
  try {
    const { region, placeType, limit = 3 } = req.query;
    
    const query = {
      type: 'sponsored_place',
      status: 'active',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    };
    
    if (region) {
      query.targetRegions = region;
    }
    
    if (placeType) {
      query.targetPlaceTypes = placeType;
    }
    
    const ads = await Advertisement.find(query)
      .populate('place')
      .populate('advertiser', 'name')
      .sort({ priority: -1, weight: -1 })
      .limit(parseInt(limit));
    
    // Track impressions
    const impressionPromises = ads.map(ad => ad.trackImpression());
    await Promise.all(impressionPromises);
    
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new ad
router.post('/', auth, async (req, res) => {
  try {
    const adData = {
      ...req.body,
      advertiser: req.user._id,
      status: 'draft'
    };
    
    // If place is specified, verify ownership
    if (adData.place) {
      const place = await Place.findById(adData.place);
      if (!place) {
        return res.status(404).json({ message: 'Place not found' });
      }
      
      if (place.owner && place.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to advertise this place' });
      }
    }
    
    const ad = new Advertisement(adData);
    await ad.save();
    
    await ad.populate('place', 'name description images address');
    await ad.populate('advertiser', 'name email');
    
    res.status(201).json(ad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update ad
router.put('/:id', auth, async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    // Check authorization
    if (ad.advertiser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Don't allow updates to active ads unless admin
    if (ad.status === 'active' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot update active advertisement' });
    }
    
    Object.assign(ad, req.body);
    await ad.save();
    
    await ad.populate('place', 'name description images address');
    await ad.populate('advertiser', 'name email');
    
    res.json(ad);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Submit ad for approval
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    if (ad.advertiser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    if (ad.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft ads can be submitted' });
    }
    
    ad.status = 'pending';
    await ad.save();
    
    res.json({ message: 'Advertisement submitted for approval', ad });
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
    
    const { status, rejectionReason } = req.body;
    
    if (!['draft', 'pending', 'active', 'paused', 'expired', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    ad.status = status;
    if (status === 'rejected' && rejectionReason) {
      ad.rejectionReason = rejectionReason;
    }
    
    await ad.save();
    
    await ad.populate('place', 'name description images address');
    await ad.populate('advertiser', 'name email');
    
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
    
    await ad.trackClick();
    
    res.json({ 
      clicks: ad.metrics.clicks,
      impressions: ad.metrics.impressions,
      ctr: ad.ctr
    });
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
    
    await ad.trackImpression();
    
    res.json({ 
      impressions: ad.metrics.impressions,
      clicks: ad.metrics.clicks,
      ctr: ad.ctr
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Track ad conversion
router.post('/:id/conversion', async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    await ad.trackConversion();
    
    res.json({ 
      conversions: ad.metrics.conversions,
      clicks: ad.metrics.clicks,
      impressions: ad.metrics.impressions
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get ads for a place owner
router.get('/my-ads', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = { advertiser: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const ads = await Advertisement.find(query)
      .populate('place', 'name description images address')
      .sort('-createdAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Advertisement.countDocuments(query);
    
    res.json({
      ads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get ad analytics
router.get('/:id/analytics', auth, async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    // Check authorization
    if (ad.advertiser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const analytics = {
      impressions: ad.metrics.impressions,
      clicks: ad.metrics.clicks,
      conversions: ad.metrics.conversions,
      ctr: ad.ctr,
      cost: ad.metrics.cost,
      budget: ad.budget,
      performance: {
        costPerClick: ad.metrics.clicks > 0 ? ad.metrics.cost / ad.metrics.clicks : 0,
        costPerConversion: ad.metrics.conversions > 0 ? ad.metrics.cost / ad.metrics.conversions : 0,
        conversionRate: ad.metrics.clicks > 0 ? (ad.metrics.conversions / ad.metrics.clicks) * 100 : 0
      }
    };
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin routes for ad approval workflow
// Get all pending ads for admin review
router.get('/admin/pending', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const pendingAds = await Advertisement.find({ status: 'pending' })
      .populate('advertiser', 'name email advertiserInfo.companyName')
      .sort({ createdAt: -1 });

    res.json(pendingAds);
  } catch (error) {
    console.error('Error fetching pending ads:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all ads for admin (with filters)
router.get('/admin/all', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const ads = await Advertisement.find(query)
      .populate('advertiser', 'name email advertiserInfo.companyName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Advertisement.countDocuments(query);

    res.json({
      ads,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all ads:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve an ad
router.put('/admin/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { reviewNotes } = req.body;

    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    ad.status = 'active';
    ad.reviewedBy = req.user._id;
    ad.reviewedAt = new Date();
    ad.reviewNotes = reviewNotes;

    await ad.save();

    // Update admin info
    await User.findByIdAndUpdate(req.user._id, {
      'adminInfo.lastLogin': new Date()
    });

    res.json({ message: 'Ad approved successfully', ad });
  } catch (error) {
    console.error('Error approving ad:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject an ad
router.put('/admin/:id/reject', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { reviewNotes } = req.body;

    const ad = await Advertisement.findById(req.params.id);
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    ad.status = 'rejected';
    ad.reviewedBy = req.user._id;
    ad.reviewedAt = new Date();
    ad.reviewNotes = reviewNotes;

    await ad.save();

    // Update admin info
    await User.findByIdAndUpdate(req.user._id, {
      'adminInfo.lastLogin': new Date()
    });

    res.json({ message: 'Ad rejected successfully', ad });
  } catch (error) {
    console.error('Error rejecting ad:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin analytics
router.get('/admin/analytics', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};

    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get ad statistics
    const totalAds = await Advertisement.countDocuments();
    const pendingAds = await Advertisement.countDocuments({ status: 'pending' });
    const activeAds = await Advertisement.countDocuments({ status: 'active' });
    const rejectedAds = await Advertisement.countDocuments({ status: 'rejected' });

    // Get revenue statistics
    const revenueStats = await Advertisement.aggregate([
      { $match: { status: 'active', ...dateFilter } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$budget.amount' },
          averageRevenue: { $avg: '$budget.amount' },
          totalImpressions: { $sum: '$metrics.impressions' },
          totalClicks: { $sum: '$metrics.clicks' }
        }
      }
    ]);

    // Get top advertisers
    const topAdvertisers = await Advertisement.aggregate([
      { $match: { status: 'active', ...dateFilter } },
      {
        $group: {
          _id: '$advertiser',
          totalSpent: { $sum: '$budget.amount' },
          adCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'advertiser'
        }
      },
      { $unwind: '$advertiser' }
    ]);

    res.json({
      overview: {
        totalAds,
        pendingAds,
        activeAds,
        rejectedAds
      },
      revenue: revenueStats[0] || {
        totalRevenue: 0,
        averageRevenue: 0,
        totalImpressions: 0,
        totalClicks: 0
      },
      topAdvertisers
    });
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete ad
router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Advertisement not found' });
    }
    
    // Check authorization
    if (ad.advertiser.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Don't allow deletion of active ads unless admin
    if (ad.status === 'active' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Cannot delete active advertisement' });
    }
    
    await Advertisement.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload ad image
router.post('/upload-image', auth, uploadAd.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      imageUrl: req.file.path,
      publicId: req.file.filename,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// Upload multiple ad images
router.post('/upload-images', auth, uploadAd.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const uploadedImages = req.files.map(file => ({
      imageUrl: file.path,
      publicId: file.filename
    }));

    res.json({
      images: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Images upload failed' });
  }
});

// Delete ad image
router.delete('/delete-image/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    // Delete from Cloudinary
    const result = await deleteFromCloudinary(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      res.status(400).json({ message: 'Failed to delete image' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Image deletion failed' });
  }
});

// Add error handling middleware
router.use(handleUploadError);

module.exports = router; 