const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Hangout = require('../models/Hangout');
const User = require('../models/User');
const { Place } = require('../models/placeTypes');

// Create a new hangout
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      placeId,
      dateTime,
      maxParticipants,
      description,
      specialRequests,
      isPrivate,
      tags
    } = req.body;

    // Validate place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    const hangout = new Hangout({
      title,
      creator: req.user.id,
      place: placeId,
      dateTime,
      maxParticipants,
      description,
      specialRequests,
      isPrivate,
      tags,
      participants: [{ user: req.user.id, status: 'accepted' }]
    });

    await hangout.save();

    // Add hangout to creator's hangouts
    await User.findByIdAndUpdate(req.user.id, {
      $push: { hangouts: hangout._id }
    });

    res.status(201).json(hangout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all public hangouts with filters
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      restaurant,
      date,
      tags,
      limit = 10,
      page = 1
    } = req.query;

    const query = { isPrivate: false };

    if (status) query.status = status;
    if (place) query.place = place;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.dateTime = { $gte: startDate, $lt: endDate };
    }
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    const hangouts = await Hangout.find(query)
      .populate('creator', 'name profilePicture')
      .populate('place', 'name address images')
      .populate('participants.user', 'name profilePicture')
      .sort({ dateTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Hangout.countDocuments(query);

    res.json({
      hangouts,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's hangouts
router.get('/my-hangouts', auth, async (req, res) => {
  try {
    const hangouts = await Hangout.find({
      $or: [
        { creator: req.user.id },
        { 'participants.user': req.user.id }
      ]
    })
    .populate('creator', 'name profilePicture')
    .populate('place', 'name address images')
    .populate('participants.user', 'name profilePicture')
    .sort({ dateTime: -1 });

    res.json(hangouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single hangout
router.get('/:id', auth, async (req, res) => {
  try {
    const hangout = await Hangout.findById(req.params.id)
      .populate('creator', 'name profilePicture')
      .populate('place', 'name address images')
      .populate('participants.user', 'name profilePicture')
      .populate('messages.sender', 'name profilePicture');

    if (!hangout) {
      return res.status(404).json({ message: 'Hangout not found' });
    }

    // Check if user has access to private hangout
    if (hangout.isPrivate) {
      const isParticipant = hangout.participants.some(
        p => p.user._id.toString() === req.user.id
      );
      if (!isParticipant && hangout.creator._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(hangout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a hangout
router.post('/:id/join', auth, async (req, res) => {
  try {
    const hangout = await Hangout.findById(req.params.id);
    if (!hangout) {
      return res.status(404).json({ message: 'Hangout not found' });
    }

    if (!hangout.canUserJoin(req.user.id)) {
      return res.status(400).json({ message: 'Cannot join this hangout' });
    }

    hangout.addParticipant(req.user.id);
    await hangout.save();

    // Add hangout to user's hangouts
    await User.findByIdAndUpdate(req.user.id, {
      $push: { hangouts: hangout._id }
    });

    res.json(hangout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Leave a hangout
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const hangout = await Hangout.findById(req.params.id);
    if (!hangout) {
      return res.status(404).json({ message: 'Hangout not found' });
    }

    // Remove user from participants
    hangout.participants = hangout.participants.filter(
      p => p.user.toString() !== req.user.id
    );
    await hangout.save();

    // Remove hangout from user's hangouts
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { hangouts: hangout._id }
    });

    res.json({ message: 'Successfully left the hangout' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update hangout details (creator only)
router.put('/:id', auth, async (req, res) => {
  try {
    const hangout = await Hangout.findById(req.params.id);
    if (!hangout) {
      return res.status(404).json({ message: 'Hangout not found' });
    }

    if (hangout.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only creator can update hangout' });
    }

    const updates = req.body;
    const allowedUpdates = [
      'title', 'dateTime', 'maxParticipants', 'description',
      'specialRequests', 'isPrivate', 'tags', 'status'
    ];

    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        hangout[update] = updates[update];
      }
    });

    await hangout.save();
    res.json(hangout);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add message to hangout chat
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const hangout = await Hangout.findById(req.params.id);
    
    if (!hangout) {
      return res.status(404).json({ message: 'Hangout not found' });
    }

    // Check if user is participant
    const isParticipant = hangout.participants.some(
      p => p.user.toString() === req.user.id
    );
    if (!isParticipant && hangout.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only participants can send messages' });
    }

    if (!hangout.chatEnabled) {
      return res.status(400).json({ message: 'Chat is disabled for this hangout' });
    }

    hangout.messages.push({
      sender: req.user.id,
      content
    });

    await hangout.save();
    
    // Populate sender info for the new message
    const newMessage = hangout.messages[hangout.messages.length - 1];
    await Hangout.populate(hangout, {
      path: 'messages.sender',
      select: 'name profilePicture',
      match: { _id: newMessage.sender }
    });

    res.json(newMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get hangout suggestions based on user preferences
router.get('/suggestions/for-me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends')
      .populate('preferences');

    const query = {
      status: 'planned',
      isPrivate: false,
      dateTime: { $gte: new Date() }
    };

    // Consider user preferences
    if (user.preferences?.cuisinePreferences?.length > 0) {
      query['restaurant.cuisine'] = {
        $in: user.preferences.cuisinePreferences
      };
    }

    const hangouts = await Hangout.find(query)
      .populate('creator', 'name profilePicture')
      .populate('restaurant', 'name cuisine priceRange')
      .populate('participants.user', 'name')
      .sort({ dateTime: 1 })
      .limit(10);

    // Score and sort hangouts based on relevance
    const scoredHangouts = hangouts.map(hangout => {
      let score = 0;
      
      // Friend participation score
      const friendsParticipating = hangout.participants.filter(p => 
        user.friends.some(f => f._id.toString() === p.user._id.toString())
      ).length;
      score += friendsParticipating * 2;

      // Price range match
      if (user.preferences?.priceRange === hangout.restaurant.priceRange) {
        score += 1;
      }

      // Cuisine preference match
      if (user.preferences?.cuisinePreferences?.includes(hangout.restaurant.cuisine)) {
        score += 2;
      }

      return {
        ...hangout.toObject(),
        relevanceScore: score
      };
    });

    // Sort by score and return top suggestions
    scoredHangouts.sort((a, b) => b.relevanceScore - a.relevanceScore);
    res.json(scoredHangouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 