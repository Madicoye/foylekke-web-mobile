require('dotenv').config();
const mongoose = require('mongoose');
const { Place, Restaurant } = require('../models/placeTypes');
const RestaurantOld = require('../models/Restaurant');
const connectDB = require('../config/database');

async function migrateToPlaces() {
  try {
    console.log('🔄 Starting migration to Places system...');
    
    // Connect to MongoDB
    await connectDB();

    // Step 1: Migrate existing restaurants to the new Place system
    console.log('📦 Migrating existing restaurants...');
    const existingRestaurants = await RestaurantOld.find({});
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const restaurant of existingRestaurants) {
      try {
        // Check if place already exists with this Google Place ID
        if (restaurant.googlePlaceId) {
          const existingPlace = await Place.findOne({ googlePlaceId: restaurant.googlePlaceId });
          if (existingPlace) {
            console.log(`⏭️  Skipping ${restaurant.name} - already exists as place`);
            skippedCount++;
            continue;
          }
        }

        // Create new place from restaurant data
        const placeData = {
          name: restaurant.name,
          type: 'restaurant',
          description: restaurant.description,
          address: restaurant.address,
          contact: restaurant.contact,
          menu: restaurant.menu,
          images: restaurant.images,
          openingHours: restaurant.openingHours,
          ratings: restaurant.ratings,
          features: restaurant.features,
          cuisine: restaurant.cuisine,
          priceRange: restaurant.priceRange,
          isVerified: restaurant.isVerified,
          isSponsored: restaurant.isSponsored,
          sponsorshipExpiry: restaurant.sponsorshipExpiry,
          googlePlaceId: restaurant.googlePlaceId,
          source: restaurant.source,
          verificationStatus: restaurant.verificationStatus,
          submittedBy: restaurant.submittedBy,
          owner: restaurant.owner
        };

        const newPlace = new Place(placeData);
        await newPlace.save();
        
        console.log(`✅ Migrated: ${restaurant.name}`);
        migratedCount++;
        
      } catch (error) {
        console.error(`❌ Error migrating ${restaurant.name}:`, error.message);
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`- Migrated: ${migratedCount} restaurants`);
    console.log(`- Skipped: ${skippedCount} restaurants (already existed)`);
    console.log(`- Total processed: ${existingRestaurants.length}`);

    // Step 2: Update user favorites and owned places
    console.log('\n👥 Updating user references...');
    const User = require('../models/User');
    const users = await User.find({});
    
    let userUpdateCount = 0;
    for (const user of users) {
      let updated = false;
      
      // Update favorites
      if (user.favorites && user.favorites.length > 0) {
        for (let i = 0; i < user.favorites.length; i++) {
          const oldRestaurant = await RestaurantOld.findById(user.favorites[i]);
          if (oldRestaurant) {
            const newPlace = await Place.findOne({ 
              googlePlaceId: oldRestaurant.googlePlaceId,
              type: 'restaurant'
            });
            if (newPlace) {
              user.favorites[i] = newPlace._id;
              updated = true;
            }
          }
        }
      }
      
      // Update owned places
      if (user.ownedRestaurants && user.ownedRestaurants.length > 0) {
        for (let i = 0; i < user.ownedRestaurants.length; i++) {
          const oldRestaurant = await RestaurantOld.findById(user.ownedRestaurants[i]);
          if (oldRestaurant) {
            const newPlace = await Place.findOne({ 
              googlePlaceId: oldRestaurant.googlePlaceId,
              type: 'restaurant'
            });
            if (newPlace) {
              user.ownedRestaurants[i] = newPlace._id;
              updated = true;
            }
          }
        }
      }
      
      if (updated) {
        await user.save();
        userUpdateCount++;
      }
    }
    
    console.log(`✅ Updated ${userUpdateCount} users`);

    // Step 3: Update reviews
    console.log('\n⭐ Updating reviews...');
    const Review = require('../models/Review');
    const reviews = await Review.find({});
    
    let reviewUpdateCount = 0;
    for (const review of reviews) {
      const oldRestaurant = await RestaurantOld.findById(review.restaurant);
      if (oldRestaurant) {
        const newPlace = await Place.findOne({ 
          googlePlaceId: oldRestaurant.googlePlaceId,
          type: 'restaurant'
        });
        if (newPlace) {
          review.place = newPlace._id;
          await review.save();
          reviewUpdateCount++;
        }
      }
    }
    
    console.log(`✅ Updated ${reviewUpdateCount} reviews`);

    // Step 4: Update hangouts
    console.log('\n🎉 Updating hangouts...');
    const Hangout = require('../models/Hangout');
    const hangouts = await Hangout.find({});
    
    let hangoutUpdateCount = 0;
    for (const hangout of hangouts) {
      const oldRestaurant = await RestaurantOld.findById(hangout.restaurant);
      if (oldRestaurant) {
        const newPlace = await Place.findOne({ 
          googlePlaceId: oldRestaurant.googlePlaceId,
          type: 'restaurant'
        });
        if (newPlace) {
          hangout.place = newPlace._id;
          await hangout.save();
          hangoutUpdateCount++;
        }
      }
    }
    
    console.log(`✅ Updated ${hangoutUpdateCount} hangouts`);

    // Step 5: Update advertisements
    console.log('\n📢 Updating advertisements...');
    const Advertisement = require('../models/Advertisement');
    const advertisements = await Advertisement.find({});
    
    let adUpdateCount = 0;
    for (const ad of advertisements) {
      const oldRestaurant = await RestaurantOld.findById(ad.restaurant);
      if (oldRestaurant) {
        const newPlace = await Place.findOne({ 
          googlePlaceId: oldRestaurant.googlePlaceId,
          type: 'restaurant'
        });
        if (newPlace) {
          ad.place = newPlace._id;
          await ad.save();
          adUpdateCount++;
        }
      }
    }
    
    console.log(`✅ Updated ${adUpdateCount} advertisements`);

    console.log('\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Restaurants migrated: ${migratedCount}`);
    console.log(`- Users updated: ${userUpdateCount}`);
    console.log(`- Reviews updated: ${reviewUpdateCount}`);
    console.log(`- Hangouts updated: ${hangoutUpdateCount}`);
    console.log(`- Advertisements updated: ${adUpdateCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToPlaces();
}

module.exports = migrateToPlaces; 