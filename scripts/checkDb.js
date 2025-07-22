const mongoose = require('mongoose');
const Place = require('../models/Place');
const User = require('../models/User');
const Hangout = require('../models/Hangout');
const Review = require('../models/Review');
const Advertisement = require('../models/Advertisement');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foy-lekke';

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Check Places
    const placeCount = await Place.countDocuments();
    console.log(`📍 Places: ${placeCount}`);
    if (placeCount > 0) {
      const places = await Place.find().limit(3);
      console.log('Sample places:');
      places.forEach(place => {
        console.log(`  - ${place.name} (${place.type})`);
      });
    }

    // Check Users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users: ${userCount}`);
    if (userCount > 0) {
      const users = await User.find().limit(3);
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`  - ${user.username || user.email}`);
      });
    }

    // Check Hangouts
    const hangoutCount = await Hangout.countDocuments();
    console.log(`\n🎉 Hangouts: ${hangoutCount}`);
    if (hangoutCount > 0) {
      const hangouts = await Hangout.find().limit(3);
      console.log('Sample hangouts:');
      hangouts.forEach(hangout => {
        console.log(`  - ${hangout.title}`);
      });
    }

    // Check Reviews
    const reviewCount = await Review.countDocuments();
    console.log(`\n⭐ Reviews: ${reviewCount}`);

    // Check Advertisements
    const adCount = await Advertisement.countDocuments();
    console.log(`\n📢 Advertisements: ${adCount}`);

    // Summary
    console.log('\n📊 Database Summary:');
    console.log(`Total documents: ${placeCount + userCount + hangoutCount + reviewCount + adCount}`);
    console.log(`Collections with data: ${[placeCount, userCount, hangoutCount, reviewCount, adCount].filter(count => count > 0).length}/5`);

  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the check
checkDatabase(); 