require('dotenv').config();
const mongoose = require('mongoose');

async function fixGooglePlaceIds() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const Place = require('../models/Place');
    const Restaurant = require('../models/Restaurant');
    
    // Get all restaurants with Google Place IDs
    const restaurants = await Restaurant.find({ googlePlaceId: { $exists: true, $ne: null } });
    console.log(`Found ${restaurants.length} restaurants with Google Place IDs`);
    
    let updatedCount = 0;
    for (const restaurant of restaurants) {
      // Find matching place by name
      const place = await Place.findOne({ name: restaurant.name });
      if (place && !place.googlePlaceId) {
        place.googlePlaceId = restaurant.googlePlaceId;
        place.source = restaurant.source || 'google_places';
        await place.save();
        console.log(`✅ Updated ${place.name} with Google Place ID`);
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Updated ${updatedCount} places with Google Place IDs`);
    
    // Verify the update
    const placesWithGoogleIds = await Place.find({ googlePlaceId: { $exists: true, $ne: null } });
    console.log(`\n📊 Places with Google Place IDs: ${placesWithGoogleIds.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixGooglePlaceIds(); 