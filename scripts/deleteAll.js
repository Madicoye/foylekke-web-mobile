require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');
const Restaurant = require('../models/Restaurant');

async function deleteAllPlaces() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('🗑️  Starting places cleanup...\n');

    // Delete all places from both new and legacy systems
    const places = await Place.deleteMany({});
    console.log(`✅ Deleted ${places.deletedCount} places (new system)`);

    const restaurants = await Restaurant.deleteMany({});
    console.log(`✅ Deleted ${restaurants.deletedCount} restaurants (legacy system)`);

    console.log('\n🎉 All places have been successfully deleted!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the deletion
deleteAllPlaces(); 