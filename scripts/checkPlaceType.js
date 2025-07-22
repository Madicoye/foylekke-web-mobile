require('dotenv').config();
const { Client } = require('@googlemaps/google-maps-services-js');

async function checkPlaceType(placeName) {
  const client = new Client({});
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('❌ GOOGLE_MAPS_API_KEY not found');
    return;
  }

  try {
    console.log(`\n🔍 Searching for: ${placeName}`);

    // First, search for the place
    const searchResponse = await client.findPlaceFromText({
      params: {
        input: placeName + ' Dakar',
        inputtype: 'textquery',
        locationbias: 'point:14.7167,-17.4677', // Dakar coordinates
        fields: ['place_id', 'name', 'formatted_address'],
        key: apiKey
      }
    });

    if (searchResponse.data.status !== 'OK' || !searchResponse.data.candidates.length) {
      console.log('❌ Place not found');
      return;
    }

    const place = searchResponse.data.candidates[0];
    console.log(`✅ Found: ${place.name}`);
    console.log(`📍 Address: ${place.formatted_address}`);

    // Get detailed information
    const detailsResponse = await client.placeDetails({
      params: {
        place_id: place.place_id,
        fields: [
          'name', 'types', 'rating', 'user_ratings_total',
          'formatted_phone_number', 'website', 'opening_hours',
          'price_level', 'business_status'
        ],
        key: apiKey
      }
    });

    if (detailsResponse.data.status !== 'OK') {
      console.log('❌ Failed to get place details');
      return;
    }

    const details = detailsResponse.data.result;
    
    // Print all types
    console.log('\n📋 Google Places Types:');
    details.types.forEach((type, index) => {
      console.log(`   ${index === 0 ? '(Primary)' : '        '} ${type}`);
    });

    // Print business info
    console.log('\n💼 Business Information:');
    if (details.business_status) {
      console.log(`   Status: ${details.business_status}`);
    }
    if (details.formatted_phone_number) {
      console.log(`   Phone: ${details.formatted_phone_number}`);
    }
    if (details.website) {
      console.log(`   Website: ${details.website}`);
    }
    if (details.rating) {
      console.log(`   Rating: ${details.rating} (${details.user_ratings_total} reviews)`);
    }
    if (details.price_level) {
      const priceLabels = ['Inexpensive', 'Moderate', 'Expensive', 'Very Expensive'];
      console.log(`   Price: ${priceLabels[details.price_level - 1]} (${details.price_level}/4)`);
    }

    // Print opening hours if available
    if (details.opening_hours?.periods) {
      console.log('\n🕒 Opening Hours:');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      details.opening_hours.periods.forEach(period => {
        const day = days[period.open.day];
        const open = period.open.time;
        const close = period.close?.time || 'Unknown';
        console.log(`   ${day}: ${open} - ${close}`);
      });
    }

    // Check if it would be valid in our system
    console.log('\n🔍 Validation Check:');
    
    // Check for invalid primary types
    const invalidPrimaryTypes = [
      'lodging', 'school', 'store', 'health', 'clothing_store',
      'university', 'bank', 'finance', 'route'
    ];
    
    if (invalidPrimaryTypes.includes(details.types[0])) {
      console.log('❌ Invalid: Primary type is', details.types[0]);
      return;
    }

    // Check for route/street in any type
    if (details.types.includes('route')) {
      console.log('❌ Invalid: This is a street/route');
      return;
    }

    // Check name for invalid words
    const invalidWords = [
      'hotel', 'hôtel', 'lodge', 'residence', 'résidence',
      'council', 'institute', 'institut', 'school', 'école',
      'cleaning', 'nettoyage', 'service', 'ministry', 'ministère',
      'route', 'street', 'rue', 'avenue'
    ];
    
    const nameLower = place.name.toLowerCase();
    const invalidWord = invalidWords.find(word => nameLower.includes(word));
    if (invalidWord) {
      console.log(`❌ Invalid: Name contains "${invalidWord}"`);
      return;
    }

    // Check for valid food types
    const validTypes = [
      'bakery', 'bar', 'cafe', 'restaurant', 'food',
      'meal_takeaway', 'meal_delivery', 'ice_cream',
      'coffee_shop', 'fast_food'
    ];
    
    const matchingTypes = details.types.filter(t => validTypes.includes(t));
    if (matchingTypes.length > 0) {
      console.log('✅ Valid eatery:', matchingTypes);
      
      // Determine specific type
      let specificType;
      if (details.types.includes('restaurant') || details.types.includes('food')) {
        if (nameLower.includes('gelato') || 
            nameLower.includes('ice cream') || 
            nameLower.includes('glacier') ||
            details.types.includes('ice_cream')) {
          specificType = 'ice_cream_shop';
        } else {
          specificType = 'restaurant';
        }
      } else if (details.types.includes('bakery')) {
        specificType = 'bakery';
      } else if (details.types.includes('bar')) {
        specificType = 'bar';
      } else if (details.types.includes('cafe')) {
        specificType = 'coffee_shop';
      }
      
      console.log('📝 Would be saved as:', specificType);
    } else {
      console.log('❌ Invalid: No valid food types found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get place name from command line or use default
const placeName = process.argv[2] || "Graine D'or";
checkPlaceType(placeName); 