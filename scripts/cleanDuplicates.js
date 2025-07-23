require('dotenv').config();
const mongoose = require('mongoose');

// Load models
require('../models/Place');
require('../models/Review');
require('../models/Hangout');

async function cleanDuplicates() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Place = mongoose.model('Place');
    const Review = mongoose.model('Review');
    const Hangout = mongoose.model('Hangout');

    console.log('\n🔍 Checking for duplicates...');

    // First, check for exact duplicates (same Google Place ID)
    const googlePlaceIdDuplicates = await Place.aggregate([
      {
        $group: {
          _id: '$googlePlaceId',
          count: { $sum: 1 },
          places: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (googlePlaceIdDuplicates.length > 0) {
      console.log(`\n⚠️ Found ${googlePlaceIdDuplicates.length} groups of Google Place ID duplicates:`);
      
      let totalRemoved = 0;
      for (const group of googlePlaceIdDuplicates) {
        console.log(`\n📍 Google Place ID: ${group._id} (${group.count} instances)`);
        
        // Sort by creation date (keep the oldest)
        const sortedPlaces = group.places.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );

        // Keep the first (oldest) one, remove the rest
        const placesToRemove = sortedPlaces.slice(1);
        
        for (const place of placesToRemove) {
          console.log(`  🗑️ Removing duplicate: ${place.name} (ID: ${place._id})`);
          
          // Transfer associated data
          await transferAssociatedData(place._id, sortedPlaces[0]._id);
          
          // Remove the duplicate place
          await Place.findByIdAndDelete(place._id);
          totalRemoved++;
        }
        
        console.log(`  ✅ Kept: ${sortedPlaces[0].name} (ID: ${sortedPlaces[0]._id})`);
      }
      
      console.log(`\n🎉 Removed ${totalRemoved} Google Place ID duplicates.`);
    }

    // Now check for potential name duplicates within the same region
    // But be more careful - only flag if they're very close geographically
    const nameRegionDuplicates = await Place.aggregate([
      {
        $group: {
          _id: {
            name: '$name',
            region: '$address.region'
          },
          count: { $sum: 1 },
          places: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (nameRegionDuplicates.length > 0) {
      console.log(`\n🔍 Found ${nameRegionDuplicates.length} groups with same name in same region:`);
      
      for (const group of nameRegionDuplicates) {
        console.log(`\n📍 "${group._id.name}" in ${group._id.region} (${group.count} instances)`);
        
        const places = group.places;
        
        // Check if they're actually the same place by comparing coordinates
        for (let i = 0; i < places.length; i++) {
          for (let j = i + 1; j < places.length; j++) {
            const place1 = places[i];
            const place2 = places[j];
            
            if (place1.address?.coordinates && place2.address?.coordinates) {
              const distance = calculateDistance(
                place1.address.coordinates[1], // lat
                place1.address.coordinates[0], // lng
                place2.address.coordinates[1], // lat
                place2.address.coordinates[0]  // lng
              );
              
              // If places are within 100 meters, they're likely the same
              if (distance < 0.1) {
                console.log(`  ⚠️ Places are very close (${distance.toFixed(3)}km apart) - likely same location`);
                console.log(`    - ${place1.name} (${place1.address.street})`);
                console.log(`    - ${place2.name} (${place2.address.street})`);
                
                // Keep the one with more data (reviews, ratings, etc.)
                const place1Score = getPlaceScore(place1);
                const place2Score = getPlaceScore(place2);
                
                const [keepPlace, removePlace] = place1Score >= place2Score ? [place1, place2] : [place2, place1];
                
                console.log(`  🗑️ Removing: ${removePlace.name} (score: ${getPlaceScore(removePlace)})`);
                console.log(`  ✅ Keeping: ${keepPlace.name} (score: ${getPlaceScore(keepPlace)})`);
                
                // Transfer associated data
                await transferAssociatedData(removePlace._id, keepPlace._id);
                
                // Remove the duplicate place
                await Place.findByIdAndDelete(removePlace._id);
              } else {
                console.log(`  ✅ Places are ${distance.toFixed(3)}km apart - likely different locations`);
                console.log(`    - ${place1.name} (${place1.address.street})`);
                console.log(`    - ${place2.name} (${place2.address.street})`);
              }
            }
          }
        }
      }
    }

    // Show final counts
    const finalCount = await Place.countDocuments();
    console.log(`\n📊 Final place count: ${finalCount}`);

  } catch (error) {
    console.error('Error cleaning duplicates:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

async function transferAssociatedData(fromPlaceId, toPlaceId) {
  const Review = mongoose.model('Review');
  const Hangout = mongoose.model('Hangout');
  
  // Transfer reviews
  const reviewCount = await Review.countDocuments({ place: fromPlaceId });
  if (reviewCount > 0) {
    await Review.updateMany(
      { place: fromPlaceId },
      { place: toPlaceId }
    );
    console.log(`    📝 Transferred ${reviewCount} reviews`);
  }
  
  // Transfer hangouts
  const hangoutCount = await Hangout.countDocuments({ place: fromPlaceId });
  if (hangoutCount > 0) {
    await Hangout.updateMany(
      { place: fromPlaceId },
      { place: toPlaceId }
    );
    console.log(`    🎉 Transferred ${hangoutCount} hangouts`);
  }
}

function getPlaceScore(place) {
  let score = 0;
  
  // Higher score for places with more data
  if (place.ratings?.googleRating) score += 10;
  if (place.ratings?.reviewCount) score += place.ratings.reviewCount;
  if (place.images?.length) score += place.images.length * 2;
  if (place.contact?.phone) score += 5;
  if (place.contact?.website) score += 5;
  if (place.description) score += 3;
  if (place.priceRange) score += 2;
  if (place.cuisine?.length) score += place.cuisine.length;
  
  return score;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

cleanDuplicates(); 