require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function exportData() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foylekke');
    console.log('✅ Connected to MongoDB\n');

    // Import models
    const Place = require('../models/Place');
    const SearchTracker = require('../models/SearchTracker');

    // Create exports directory
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    console.log('📊 Exporting data...\n');

    // Export Places
    console.log('📍 Exporting places...');
    const places = await Place.find({}).lean();
    const placesFilePath = path.join(exportsDir, 'places.json');
    fs.writeFileSync(placesFilePath, JSON.stringify(places, null, 2));
    console.log(`✅ Exported ${places.length} places to exports/places.json`);

    // Export SearchTracker
    console.log('🔍 Exporting SearchTracker...');
    const searchTrackers = await SearchTracker.find({}).lean();
    const searchTrackerFilePath = path.join(exportsDir, 'searchtrackers.json');
    fs.writeFileSync(searchTrackerFilePath, JSON.stringify(searchTrackers, null, 2));
    console.log(`✅ Exported ${searchTrackers.length} SearchTracker records to exports/searchtrackers.json`);

    // Generate summary
    console.log('\n📋 Export Summary:');
    console.log(`• Places: ${places.length} records`);
    console.log(`• SearchTracker: ${searchTrackers.length} records`);
    console.log(`• Export location: ${exportsDir}`);

    // Generate statistics
    if (places.length > 0) {
      console.log('\n📊 Places Statistics:');
      
      // Count by type
      const typeCounts = {};
      places.forEach(place => {
        const type = place.type || 'unknown';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      console.log('• Places by type:');
      Object.entries(typeCounts).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });

      // Count by source
      const sourceCounts = {};
      places.forEach(place => {
        const source = place.source || 'unknown';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });
      
      console.log('• Places by source:');
      Object.entries(sourceCounts).forEach(([source, count]) => {
        console.log(`  - ${source}: ${count}`);
      });

      // Count by status
      const statusCounts = {};
      places.forEach(place => {
        const status = place.status || 'unknown';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      console.log('• Places by status:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
      });
    }

    if (searchTrackers.length > 0) {
      console.log('\n🔍 SearchTracker Statistics:');
      
      // Count total place IDs across all trackers
      const totalPlaceIds = searchTrackers.reduce((sum, tracker) => sum + (tracker.placeIds?.length || 0), 0);
      console.log(`• Total place IDs tracked: ${totalPlaceIds}`);
      
      // Average places per search point
      const avgPlacesPerPoint = (totalPlaceIds / searchTrackers.length).toFixed(1);
      console.log(`• Average places per search point: ${avgPlacesPerPoint}`);
      
      // Date range
      const dates = searchTrackers.map(t => new Date(t.lastSearched)).sort();
      if (dates.length > 0) {
        console.log(`• Date range: ${dates[0].toISOString().split('T')[0]} to ${dates[dates.length - 1].toISOString().split('T')[0]}`);
      }
    }

    console.log('\n✅ Export completed successfully!');

  } catch (error) {
    console.error('❌ Export error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the export
exportData(); 