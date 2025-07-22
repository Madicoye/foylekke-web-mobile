const mongoose = require('mongoose');
require('../models/Place');
require('../models/PlaceRaw');
const Place = mongoose.model('Place');
const PlaceRaw = mongoose.model('PlaceRaw');

async function checkPlaceIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foy-lekke', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('\n📊 Google Place IDs Statistics');
    console.log('============================');

    // Count total places
    const totalPlaces = await Place.countDocuments();
    console.log(`\nTotal places in database: ${totalPlaces}`);

    // Count places with Google Place IDs
    const placesWithGoogleIds = await Place.countDocuments({ googlePlaceId: { $exists: true, $ne: null } });
    console.log(`Places with Google Place IDs: ${placesWithGoogleIds}`);

    // Count unique Google Place IDs
    const uniqueGoogleIds = await Place.distinct('googlePlaceId');
    console.log(`Unique Google Place IDs: ${uniqueGoogleIds.length}`);

    // Count raw place records
    const totalRawPlaces = await PlaceRaw.countDocuments();
    console.log(`\nTotal raw place records: ${totalRawPlaces}`);

    // Count unique Google Place IDs in raw data
    const uniqueRawGoogleIds = await PlaceRaw.distinct('googlePlaceId');
    console.log(`Unique Google Place IDs in raw data: ${uniqueRawGoogleIds.length}`);

    // Sample of recent Google Place IDs
    console.log('\nRecent Google Place IDs:');
    const recentPlaces = await Place.find({ googlePlaceId: { $exists: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name googlePlaceId createdAt');
    
    recentPlaces.forEach(place => {
      console.log(`\n- ${place.name}`);
      console.log(`  Google Place ID: ${place.googlePlaceId}`);
      console.log(`  Created: ${place.createdAt?.toLocaleString()}`);
    });

    // Check for duplicates
    const duplicateGoogleIds = await Place.aggregate([
      { $match: { googlePlaceId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$googlePlaceId',
          count: { $sum: 1 },
          names: { $push: '$name' }
        }
      },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicateGoogleIds.length > 0) {
      console.log('\n⚠️  Duplicate Google Place IDs found:');
      duplicateGoogleIds.forEach(dup => {
        console.log(`\nGoogle Place ID: ${dup._id}`);
        console.log(`Count: ${dup.count}`);
        console.log(`Names: ${dup.names.join(', ')}`);
      });
    } else {
      console.log('\n✅ No duplicate Google Place IDs found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

checkPlaceIds(); 