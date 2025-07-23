require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const SearchTracker = require('../models/SearchTracker');

async function checkStatus() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Read grid points from JSON
    const gridPointsPath = path.join(__dirname, '..', 'grid_points.json');
    const allPoints = JSON.parse(fs.readFileSync(gridPointsPath, 'utf8'));
    
    console.log(`📊 Total grid points: ${allPoints.length}`);
    
    // Get all processed points from SearchTracker (only new format with location field)
    const processedPoints = await SearchTracker.find({ location: { $exists: true } }).lean();
    const processedLocations = new Set(processedPoints.map(p => p.location));
    
    console.log(`✅ Already processed: ${processedPoints.length} points`);
    
    // Find unprocessed points
    const unprocessedPoints = [];
    for (const point of allPoints) {
      const locationKey = `${point.lat},${point.lng}`;
      if (!processedLocations.has(locationKey)) {
        unprocessedPoints.push(point);
      }
    }
    
    console.log(`❌ Unprocessed points: ${unprocessedPoints.length} (${allPoints.length - processedPoints.length})`);
    console.log(`📈 Progress: ${((processedPoints.length / allPoints.length) * 100).toFixed(1)}%`);
    
    if (unprocessedPoints.length > 0) {
      console.log('\n📍 First 5 unprocessed points:');
      unprocessedPoints.slice(0, 5).forEach((point, index) => {
        console.log(`  ${index + 1}. ${point.lat}, ${point.lng}`);
      });
      
      if (unprocessedPoints.length > 5) {
        console.log(`  ... and ${unprocessedPoints.length - 5} more`);
      }
    } else {
      console.log('🎉 All points have been processed!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the check
checkStatus(); 