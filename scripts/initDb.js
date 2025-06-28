require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Review = require('../models/Review');
const Advertisement = require('../models/Advertisement');
const connectDB = require('../config/database');

async function initializeDatabase() {
  try {
    // Connect to MongoDB using our configuration
    await connectDB();

    // Create indexes
    console.log('Creating indexes...');
    
    // Restaurant indexes
    await Restaurant.collection.createIndex({ 'address.coordinates': '2dsphere' });
    await Restaurant.collection.createIndex({ googlePlaceId: 1 }, { sparse: true, unique: true });
    await Restaurant.collection.createIndex({ 'address.region': 1 });
    await Restaurant.collection.createIndex({ name: 'text', description: 'text' });
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    
    // Review indexes
    await Review.collection.createIndex({ restaurant: 1 });
    await Review.collection.createIndex({ user: 1 });
    
    // Advertisement indexes
    await Advertisement.collection.createIndex({ restaurant: 1 });
    await Advertisement.collection.createIndex({ status: 1 });
    await Advertisement.collection.createIndex({ targetRegions: 1 });

    console.log('Database initialization completed successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

initializeDatabase(); 