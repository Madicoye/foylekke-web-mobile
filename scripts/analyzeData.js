const mongoose = require('mongoose');
require('../models/Place');
require('../models/PlaceRaw');
const Place = mongoose.model('Place');
const PlaceRaw = mongoose.model('PlaceRaw');

async function analyzeData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foy-lekke', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('\n🔍 Database Analysis');
    console.log('==================');

    // Count total places
    const totalPlaces = await Place.countDocuments();
    console.log(`\nTotal places in database: ${totalPlaces}`);

    // Places by type
    const typeStats = await Place.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$type', 'unspecified'] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nPlaces by type:');
    typeStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

    // Places by status
    const statusStats = await Place.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$status', 'unspecified'] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\nPlaces by status:');
    statusStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

    // Places by source
    const sourceStats = await Place.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$source', 'unspecified'] },
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\nPlaces by source:');
    sourceStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

    // Check for places without proper types
    console.log('\n⚠️  Places with missing or invalid types:');
    const invalidTypes = await Place.find({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: 'unspecified' }
      ]
    }).limit(10);

    invalidTypes.forEach(place => {
      console.log(`\n- ${place.name}`);
      console.log(`  Type: ${place.type || 'MISSING'}`);
      console.log(`  Status: ${place.status || 'MISSING'}`);
      console.log(`  Source: ${place.source || 'MISSING'}`);
      if (place.address) {
        console.log(`  Address: ${place.address.street || 'N/A'}`);
      }
    });

    // Check for places that might not be restaurants
    console.log('\n🔍 Places that might not be restaurants:');
    const suspiciousPlaces = await Place.find({
      $or: [
        { name: { $regex: /^(the|le|la|les|de|du|des|en|au|aux|sur)$/i } },
        { name: { $regex: /^(restaurant|café|cafe|bar|bistro|pizzeria|brasserie|eatery|dining|food|grill|chicken|burger|pizza|kebab)$/i } },
        { name: { $regex: /^(bakery|patisserie|boulangerie)$/i } }
      ]
    }).limit(10);

    suspiciousPlaces.forEach(place => {
      console.log(`\n- ${place.name}`);
      console.log(`  Type: ${place.type || 'MISSING'}`);
      console.log(`  Status: ${place.status || 'MISSING'}`);
      if (place.address) {
        console.log(`  Address: ${place.address.street || 'N/A'}`);
      }
    });

    // Check for places with very short names
    console.log('\n🔍 Places with very short names (potential issues):');
    const shortNames = await Place.find({
      name: { $regex: /^.{1,3}$/ }
    }).limit(10);

    shortNames.forEach(place => {
      console.log(`\n- ${place.name}`);
      console.log(`  Type: ${place.type || 'MISSING'}`);
      console.log(`  Status: ${place.status || 'MISSING'}`);
      if (place.address) {
        console.log(`  Address: ${place.address.street || 'N/A'}`);
      }
    });

    // Check for places without addresses
    console.log('\n🔍 Places without proper addresses:');
    const noAddress = await Place.find({
      $or: [
        { address: { $exists: false } },
        { address: null },
        { 'address.street': { $exists: false } },
        { 'address.street': null }
      ]
    }).limit(10);

    noAddress.forEach(place => {
      console.log(`\n- ${place.name}`);
      console.log(`  Type: ${place.type || 'MISSING'}`);
      console.log(`  Status: ${place.status || 'MISSING'}`);
      console.log(`  Address: ${place.address ? 'EXISTS BUT NO STREET' : 'MISSING'}`);
    });

    // Check for places without coordinates
    console.log('\n🔍 Places without coordinates:');
    const noCoords = await Place.find({
      $or: [
        { 'address.coordinates': { $exists: false } },
        { 'address.coordinates': null },
        { 'address.coordinates.lat': { $exists: false } },
        { 'address.coordinates.lng': { $exists: false } }
      ]
    }).limit(10);

    noCoords.forEach(place => {
      console.log(`\n- ${place.name}`);
      console.log(`  Type: ${place.type || 'MISSING'}`);
      console.log(`  Status: ${place.status || 'MISSING'}`);
      if (place.address && place.address.coordinates) {
        console.log(`  Coordinates: ${place.address.coordinates.lat}, ${place.address.coordinates.lng}`);
      } else {
        console.log(`  Coordinates: MISSING`);
      }
    });

    // Summary of issues
    const missingType = await Place.countDocuments({
      $or: [
        { type: { $exists: false } },
        { type: null },
        { type: 'unspecified' }
      ]
    });

    const missingAddress = await Place.countDocuments({
      $or: [
        { address: { $exists: false } },
        { address: null },
        { 'address.street': { $exists: false } },
        { 'address.street': null }
      ]
    });

    const missingCoords = await Place.countDocuments({
      $or: [
        { 'address.coordinates': { $exists: false } },
        { 'address.coordinates': null },
        { 'address.coordinates.lat': { $exists: false } },
        { 'address.coordinates.lng': { $exists: false } }
      ]
    });

    console.log('\n📊 Data Quality Summary:');
    console.log(`Total places: ${totalPlaces}`);
    console.log(`Missing type: ${missingType}`);
    console.log(`Missing address: ${missingAddress}`);
    console.log(`Missing coordinates: ${missingCoords}`);
    console.log(`Data quality score: ${((totalPlaces - missingType - missingAddress - missingCoords) / totalPlaces * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n📡 Disconnected from MongoDB');
  }
}

analyzeData(); 