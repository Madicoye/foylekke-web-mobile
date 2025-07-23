require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const PlacesSyncService = require('../services/placesSync');
const SearchTracker = require('../models/SearchTracker');

async function syncUnprocessedPoints() {
  try {
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get limit from command line
    const limit = parseInt(process.argv[2]) || 10;
    
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
    
    console.log(`❌ Unprocessed points: ${unprocessedPoints.length}`);
    
    if (unprocessedPoints.length === 0) {
      console.log('🎉 All points have been processed!');
      return;
    }
    
    // Take limited number of unprocessed points
    const pointsToSync = unprocessedPoints.slice(0, limit);
    
    console.log(`\n📋 Sync Configuration:`);
    console.log(`📊 Processing ${pointsToSync.length} unprocessed points out of ${unprocessedPoints.length} remaining`);
    console.log('🔍 Mode: Basic search with DB save');

    const syncService = new PlacesSyncService(process.env.GOOGLE_MAPS_API_KEY);
    let totalPlacesFound = 0;
    let totalApiCalls = 0;
    let totalCost = 0;
    
    console.log('\n🚀 Starting unprocessed points sync...');
    
    for (let i = 0; i < pointsToSync.length; i++) {
      const point = pointsToSync[i];
      console.log(`\n📍 Processing unprocessed point ${i + 1}/${pointsToSync.length}: ${point.lat}, ${point.lng}`);
      
      try {
        const result = await syncService.syncPoint(point);
        totalPlacesFound += result.totalFound;
        
        // Track API calls and cost from the sync result
        if (result.apiCalls) {
          totalApiCalls += result.apiCalls;
          totalCost += result.apiCalls * 0.017; // $0.017 per API call
        }
        
        // Calculate progress
        const progress = ((i + 1) / pointsToSync.length * 100).toFixed(1);
        console.log(`⏳ Progress: ${progress}% (${i + 1}/${pointsToSync.length} points)`);
        
        // Add delay between points to avoid rate limiting
        if (i < pointsToSync.length - 1) {
          console.log('⏳ Waiting 2 seconds before next point...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Error processing point ${point.lat}, ${point.lng}:`, error);
        // Continue with next point
        continue;
      }
    }

    console.log('\n✅ Unprocessed points sync completed!');
    console.log(`📊 Summary:`);
    console.log(`• Points processed: ${pointsToSync.length}`);
    console.log(`• Total unique places found: ${totalPlacesFound}`);
    console.log(`• Average places per point: ${(totalPlacesFound / pointsToSync.length).toFixed(1)}`);
    console.log(`• Total API calls: ${totalApiCalls}`);
    console.log(`• Total cost: $${totalCost.toFixed(2)} USD`);
    console.log(`• Remaining unprocessed points: ${unprocessedPoints.length - pointsToSync.length}`);
    console.log(`💾 All places saved to database with needsDetails=true`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB\n');
  }
}

// Run the sync
syncUnprocessedPoints(); 