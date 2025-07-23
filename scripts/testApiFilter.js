require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('../models/Place');

async function testApiFilter() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📡 Connected to MongoDB\n');

    // Test the API filter logic
    const baseFilter = {
      $or: [
        // Has photos
        {
          $or: [
            { images: { $exists: true, $ne: null, $ne: [] } },
            { images: { $size: { $gt: 0 } } }
          ]
        },
        // Has reviews (either Google or app reviews)
        {
          $or: [
            { 'ratings.reviewCount': { $gt: 0 } },
            { 'ratings.googleRating': { $gt: 0 } },
            { 'ratings.appRating': { $gt: 0 } }
          ]
        }
      ]
    };

    // Get total places
    const totalPlaces = await Place.countDocuments({});
    
    // Get places with photos only
    const placesWithPhotos = await Place.countDocuments({
      $or: [
        { images: { $exists: true, $ne: null } },
        { images: { $size: { $gt: 0 } } }
      ]
    });

    // Get places with reviews only
    const placesWithReviews = await Place.countDocuments({
      $or: [
        { 'ratings.reviewCount': { $gt: 0 } },
        { 'ratings.googleRating': { $gt: 0 } },
        { 'ratings.appRating': { $gt: 0 } }
      ]
    });

    // Get places that will be returned by API (photos OR reviews)
    const apiPlaces = await Place.countDocuments(baseFilter);

    console.log('📊 API Filter Test Results:');
    console.log('=' .repeat(50));
    console.log(`Total places in database: ${totalPlaces}`);
    console.log(`Places with photos: ${placesWithPhotos}`);
    console.log(`Places with reviews: ${placesWithReviews}`);
    console.log(`Places with photos OR reviews (API filter): ${apiPlaces}`);
    console.log(`Places excluded by API filter: ${totalPlaces - apiPlaces}`);

    // Test sample places
    console.log('\n📋 Sample places that will be returned:');
    console.log('=' .repeat(50));
    const samplePlaces = await Place.find(baseFilter)
      .limit(5)
      .select('name type ratings images')
      .lean();

    samplePlaces.forEach((place, index) => {
      const hasPhotos = place.images && place.images.length > 0;
      const hasReviews = (place.ratings?.reviewCount > 0) || 
                        (place.ratings?.googleRating > 0) || 
                        (place.ratings?.appRating > 0);
      
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Type: ${place.type}`);
      console.log(`   Has photos: ${hasPhotos} (${place.images?.length || 0} photos)`);
      console.log(`   Has reviews: ${hasReviews} (${place.ratings?.reviewCount || 0} reviews)`);
      console.log('');
    });

    // Test places that will be excluded
    console.log('❌ Sample places that will be excluded:');
    console.log('=' .repeat(50));
    const excludedPlaces = await Place.find({
      $and: [
        // No photos
        {
          $or: [
            { images: { $exists: false } },
            { images: null },
            { images: { $size: 0 } }
          ]
        },
        // No reviews
        {
          $and: [
            { 'ratings.reviewCount': { $lte: 0 } },
            { 'ratings.googleRating': { $lte: 0 } },
            { 'ratings.appRating': { $lte: 0 } }
          ]
        }
      ]
    })
    .limit(3)
    .select('name type ratings images')
    .lean();

    excludedPlaces.forEach((place, index) => {
      console.log(`${index + 1}. ${place.name}`);
      console.log(`   Photos: ${place.images?.length || 0}, Reviews: ${place.ratings?.reviewCount || 0}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testApiFilter(); 