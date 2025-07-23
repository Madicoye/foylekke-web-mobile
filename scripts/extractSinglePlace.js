require('dotenv').config();
const mongoose = require('mongoose');
const { Client } = require('@googlemaps/google-maps-services-js');

async function extractSinglePlace(placeName) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Place = require('../models/Place');
    const client = new Client({});
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.error('❌ GOOGLE_MAPS_API_KEY not found');
      return;
    }

    console.log(`\n🔍 Searching for: ${placeName}`);

    // First, search for the place
    const searchResponse = await client.findPlaceFromText({
      params: {
        input: placeName,
        inputtype: 'textquery',
        locationbias: 'point:14.7167,-17.4677', // Dakar coordinates for better results
        fields: ['place_id', 'name', 'formatted_address'],
        key: apiKey
      }
    });

    if (searchResponse.data.status !== 'OK' || !searchResponse.data.candidates.length) {
      console.log('❌ Place not found');
      return;
    }

    const place = searchResponse.data.candidates[0];
    console.log(`✅ Found place: ${place.name}`);

    // Get detailed information
    const detailsResponse = await client.placeDetails({
      params: {
        place_id: place.place_id,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'user_ratings_total', 'photos', 'types', 'place_id', 'formatted_phone_number', 'website'],
        key: apiKey
      }
    });

    if (detailsResponse.data.status !== 'OK') {
      console.log('❌ Failed to get place details');
      return;
    }

    const details = detailsResponse.data.result;
    console.log('\n📍 Place Details:');
    console.log('Name:', details.name);
    console.log('Address:', details.formatted_address);
    console.log('Rating:', details.rating);
    console.log('Reviews:', details.user_ratings_total);
    console.log('Phone:', details.formatted_phone_number);
    console.log('Website:', details.website);

    // Determine place type
    let placeType = 'restaurant';
    if (details.types.includes('cafe')) placeType = 'cafe';
    if (details.types.includes('bar')) placeType = 'bar';

    // Fetch photos
    const images = [];
    if (details.photos) {
      const maxPhotos = Math.min(details.photos.length, 5);
      for (let i = 0; i < maxPhotos; i++) {
        const photo = details.photos[i];
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`;
        images.push({
          url: photoUrl,
          caption: `Photo ${i + 1}`,
          isDefault: i === 0
        });
      }
    }

    // Check if place already exists
    const existingPlace = await Place.findOne({ googlePlaceId: place.place_id });
    if (existingPlace) {
      console.log('\n⚠️  Place already exists in database');
      console.log('ID:', existingPlace._id);
      return;
    }

    // Save to database
    const placeData = {
      name: details.name,
      type: placeType,
      description: `${details.name} in ${details.formatted_address}`,
      address: {
        street: details.formatted_address,
        region: 'Dakar', // Assuming it's in Dakar
        coordinates: {
          type: 'Point',
          coordinates: [
            details.geometry.location.lng,
            details.geometry.location.lat
          ]
        }
      },
      contact: {
        phone: details.formatted_phone_number,
        website: details.website
      },
      ratings: {
        googleRating: details.rating,
        appRating: 0,
        reviewCount: details.user_ratings_total || 0
      },
      images: images,
      source: 'google_places',
      isVerified: true,
      googlePlaceId: place.place_id
    };

    const savedPlace = await Place.create(placeData);
    console.log('\n✅ Successfully saved to database');
    console.log('ID:', savedPlace._id);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Get place name from command line
const placeName = process.argv[2] || 'Wonderfood Sacré Cœur';
extractSinglePlace(placeName); 