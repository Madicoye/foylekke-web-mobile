const fs = require('fs');

try {
  const places = JSON.parse(fs.readFileSync('exports/places_new.json', 'utf8'));
  
  console.log('📊 Detailed Photo Analysis:');
  console.log('Total places:', places.length);
  
  // More detailed analysis
  let withPhotos = 0;
  let withoutPhotos = 0;
  let emptyImagesArray = 0;
  let missingImagesField = 0;
  let nullImages = 0;
  
  places.forEach(place => {
    if (!place.images) {
      missingImagesField++;
    } else if (place.images === null) {
      nullImages++;
    } else if (Array.isArray(place.images) && place.images.length === 0) {
      emptyImagesArray++;
    } else if (Array.isArray(place.images) && place.images.length > 0) {
      withPhotos++;
    } else {
      withoutPhotos++;
    }
  });
  
  console.log('\n📸 Breakdown:');
  console.log('With photos (non-empty array):', withPhotos);
  console.log('Empty images array []:', emptyImagesArray);
  console.log('Missing images field:', missingImagesField);
  console.log('Null images:', nullImages);
  console.log('Other cases:', withoutPhotos);
  
  // Check a few specific examples
  console.log('\n🔍 Sample Analysis:');
  
  // Find first place with photos
  const firstWithPhotos = places.find(p => p.images && Array.isArray(p.images) && p.images.length > 0);
  if (firstWithPhotos) {
    console.log('First place with photos:', firstWithPhotos.name);
    console.log('Images count:', firstWithPhotos.images.length);
    console.log('First image URL:', firstWithPhotos.images[0].url.substring(0, 100) + '...');
  }
  
  // Find first place without photos
  const firstWithoutPhotos = places.find(p => !p.images || (Array.isArray(p.images) && p.images.length === 0));
  if (firstWithoutPhotos) {
    console.log('\nFirst place without photos:', firstWithoutPhotos.name);
    console.log('Images field:', JSON.stringify(firstWithoutPhotos.images));
  }
  
  // Check recent places (last 5)
  console.log('\n📅 Recent places (last 5):');
  places.slice(-5).forEach((place, index) => {
    console.log(`${index + 1}. ${place.name}: images = ${JSON.stringify(place.images)}`);
  });
  
} catch (error) {
  console.error('Error:', error.message);
} 