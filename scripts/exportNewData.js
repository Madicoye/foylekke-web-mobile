require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function exportNewData() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const Place = require('../models/Place');
    const SearchTracker = require('../models/SearchTracker');

    // Create exports directory
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    console.log('📊 Exporting new location-based data...\n');

    // Export Places (all places from new sync)
    console.log('📍 Exporting places...');
    const places = await Place.find({}).lean();
    const placesFilePath = path.join(exportsDir, 'places_new.json');
    fs.writeFileSync(placesFilePath, JSON.stringify(places, null, 2));
    console.log(`✅ Exported ${places.length} places to exports/places_new.json`);

    // Export SearchTracker (only new format with location field)
    console.log('🔍 Exporting SearchTracker (new location format)...');
    const searchTrackers = await SearchTracker.find({ location: { $exists: true } }).lean();
    const searchTrackerFilePath = path.join(exportsDir, 'searchtrackers_new.json');
    fs.writeFileSync(searchTrackerFilePath, JSON.stringify(searchTrackers, null, 2));
    console.log(`✅ Exported ${searchTrackers.length} SearchTracker records to exports/searchtrackers_new.json`);

    // Export old SearchTracker format for comparison
    console.log('🔍 Exporting SearchTracker (old format)...');
    const oldSearchTrackers = await SearchTracker.find({ location: { $exists: false } }).lean();
    const oldSearchTrackerFilePath = path.join(exportsDir, 'searchtrackers_old.json');
    fs.writeFileSync(oldSearchTrackerFilePath, JSON.stringify(oldSearchTrackers, null, 2));
    console.log(`✅ Exported ${oldSearchTrackers.length} old SearchTracker records to exports/searchtrackers_old.json`);

    // Generate summary
    console.log('\n📋 Export Summary:');
    console.log(`• Places: ${places.length} records`);
    console.log(`• SearchTracker (new location format): ${searchTrackers.length} records`);
    console.log(`• SearchTracker (old format): ${oldSearchTrackers.length} records`);
    console.log(`• Total SearchTracker: ${searchTrackers.length + oldSearchTrackers.length} records`);
    console.log(`• Export location: ${exportsDir}`);

    // Show some statistics about the new data
    if (searchTrackers.length > 0) {
      console.log('\n📊 New Location-Based Data Statistics:');
      
      // Count places found per point
      const placesPerPoint = searchTrackers.map(st => st.placeIds.length);
      const avgPlacesPerPoint = placesPerPoint.reduce((a, b) => a + b, 0) / placesPerPoint.length;
      const maxPlacesPerPoint = Math.max(...placesPerPoint);
      const minPlacesPerPoint = Math.min(...placesPerPoint);
      const zeroPlacesPoints = placesPerPoint.filter(count => count === 0).length;
      
      console.log(`• Average places per point: ${avgPlacesPerPoint.toFixed(1)}`);
      console.log(`• Max places per point: ${maxPlacesPerPoint}`);
      console.log(`• Min places per point: ${minPlacesPerPoint}`);
      console.log(`• Points with 0 places: ${zeroPlacesPoints} (${(zeroPlacesPoints/searchTrackers.length*100).toFixed(1)}%)`);
      console.log(`• Points with places found: ${searchTrackers.length - zeroPlacesPoints} (${((searchTrackers.length - zeroPlacesPoints)/searchTrackers.length*100).toFixed(1)}%)`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the export
exportNewData(); 