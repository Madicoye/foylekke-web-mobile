const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const PlacesSyncService = require('../services/placesSync');
const Restaurant = require('../models/Restaurant');

// Debug information
console.log('Environment:', process.env.NODE_ENV);
console.log('Current directory:', __dirname);
console.log('Env file location:', path.resolve(__dirname, '../.env'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/foy-lekke';
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

console.log('MongoDB URI exists:', !!MONGODB_URI);
console.log('Google Maps API Key exists:', !!GOOGLE_MAPS_API_KEY);

if (!GOOGLE_MAPS_API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY is required');
  console.error('Please ensure your backend/.env file contains GOOGLE_MAPS_API_KEY=your_api_key_here');
  process.exit(1);
}

async function main() {
  try {
    const region = process.argv[2];
    const limit = parseInt(process.argv[3]) || 50;
    
    if (!region) {
      console.error('Please provide a region name');
      process.exit(1);
    }

    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const placesSyncService = new PlacesSyncService(GOOGLE_MAPS_API_KEY);
    const results = await placesSyncService.syncRegion(region, limit);
    
    console.log(`\nResults for ${region}:`);
    console.log(`Total places found: ${results.total}`);
    console.log(`Successfully synced: ${results.synced}`);
    console.log(`Failed to sync: ${results.failed}`);
    
    // Print a summary of what's in the database
    const totalInDb = await Restaurant.countDocuments();
    const verifiedInDb = await Restaurant.countDocuments({ isVerified: true });
    console.log(`\nDatabase Summary:`);
    console.log(`Total restaurants in database: ${totalInDb}`);
    console.log(`Verified restaurants: ${verifiedInDb}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Print usage if no arguments provided
if (process.argv.length <= 2) {
  console.log('Usage: node syncPlaces.js <region> [limit]');
  console.log('Example: node syncPlaces.js "Dakar" 10');
  process.exit(1);
}

main(); 