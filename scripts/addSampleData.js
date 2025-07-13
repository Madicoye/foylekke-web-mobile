const mongoose = require('mongoose');
const Place = require('../models/Place');
const User = require('../models/User');
const Hangout = require('../models/Hangout');
const Review = require('../models/Review');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foy-lekke';

const users = [
  {
    name: 'Mariama Diallo',
    username: 'mariama_diallo',
    email: 'mariama@example.com',
    password: 'password123',
    profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    bio: 'Food lover and restaurant explorer',
  },
  {
    name: 'Amadou Sow',
    username: 'amadou_sow',
    email: 'amadou@example.com',
    password: 'password123',
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'Adventure seeker and social butterfly',
  },
  {
    name: 'Fatou Ndiaye',
    username: 'fatou_ndiaye',
    email: 'fatou@example.com',
    password: 'password123',
    profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    bio: 'Coffee enthusiast and pastry lover',
  },
];

async function addSampleData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Add users if not present
    let createdUsers = [];
    for (const user of users) {
      let existing = await User.findOne({ email: user.email });
      if (!existing) {
        const newUser = new User(user);
        await newUser.save();
        createdUsers.push(newUser);
        console.log(`Added user: ${user.username}`);
      } else {
        createdUsers.push(existing);
        console.log(`User already exists: ${user.username}`);
      }
    }

    // Get 3 places
    const places = await Place.find().limit(3);
    if (places.length < 3) throw new Error('Not enough places in DB');

    // Add hangouts if not present
    const hangouts = [
      {
        title: 'Dakar Food Tour',
        description: "Let's explore the best restaurants in Dakar together!",
        place: places[0]._id,
        creator: createdUsers[0]._id,
        participants: [
          { user: createdUsers[0]._id, status: 'accepted' },
          { user: createdUsers[1]._id, status: 'accepted' }
        ],
        maxParticipants: 8,
        dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'planned',
        tags: ['food tour', 'dakar', 'restaurants'],
        isPrivate: false,
      },
      {
        title: 'Coffee & Conversation',
        description: 'Casual meetup for coffee lovers.',
        place: places[1]._id,
        creator: createdUsers[2]._id,
        participants: [
          { user: createdUsers[2]._id, status: 'accepted' },
          { user: createdUsers[0]._id, status: 'accepted' }
        ],
        maxParticipants: 6,
        dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        status: 'planned',
        tags: ['coffee', 'social', 'meetup'],
        isPrivate: false,
      },
      {
        title: 'Seafood Night',
        description: 'Dinner at Chez Loutcha for seafood lovers.',
        place: places[2]._id,
        creator: createdUsers[1]._id,
        participants: [
          { user: createdUsers[1]._id, status: 'accepted' },
          { user: createdUsers[2]._id, status: 'accepted' }
        ],
        maxParticipants: 4,
        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        status: 'planned',
        tags: ['seafood', 'dinner', 'fine dining'],
        isPrivate: true,
      },
    ];
    for (const hangout of hangouts) {
      let exists = await Hangout.findOne({ title: hangout.title });
      if (!exists) {
        await Hangout.create(hangout);
        console.log(`Added hangout: ${hangout.title}`);
      } else {
        console.log(`Hangout already exists: ${hangout.title}`);
      }
    }

    // Add reviews if not present
    const reviews = [
      {
        place: places[0]._id,
        user: createdUsers[0]._id,
        rating: 5,
        title: 'Great food!',
        content: 'Amazing food and great atmosphere! Highly recommend.'
      },
      {
        place: places[1]._id,
        user: createdUsers[1]._id,
        rating: 4,
        title: 'Cozy spot',
        content: 'Nice spot for coffee and pastries.'
      },
      {
        place: places[2]._id,
        user: createdUsers[2]._id,
        rating: 4,
        title: 'Fresh seafood',
        content: 'Fresh seafood and friendly staff.'
      },
    ];
    for (const review of reviews) {
      let exists = await Review.findOne({ place: review.place, user: review.user });
      if (!exists) {
        await Review.create(review);
        console.log('Added review');
      } else {
        console.log('Review already exists');
      }
    }

    console.log('Sample data added!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addSampleData(); 