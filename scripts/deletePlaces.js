require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

async function deletePlaces() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count places before deletion
    const count = await Place.countDocuments();
    console.log(`Found ${count} places in database`);

    // Delete all places
    const result = await Place.deleteMany({});
    console.log(`\n✅ Successfully deleted ${result.deletedCount} places from database`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the deletion
console.log('🗑️  Starting database cleanup...');
deletePlaces(); 