// Define Dakar's boundaries more precisely
const DAKAR_BOUNDS = {
  north: 14.74, // Almadies/Ngor area (moved south from 14.75)
  south: 14.65, // Port area
  west: -17.52, // Ngor/Yoff coast
  east: -17.32  // Eastern limit
};

// Generate grid points for comprehensive coverage
function generateGrid(startLat, startLon, endLat, endLon, spacingKm = 0.4) { // 400m = 0.4km
  const points = [];
  // Convert spacing to approximate degrees (1 degree ≈ 111km at equator)
  const latSpacing = spacingKm / 111; // Approximate degree spacing for latitude
  const lonSpacing = spacingKm / (111 * Math.cos(startLat * Math.PI / 180)); // Adjust for longitude at this latitude

  let currentLat = startLat;
  while (currentLat >= endLat) { // Changed > to >= to include southern boundary
    let currentLon = startLon;
    while (currentLon <= endLon) { // Changed < to <= to include eastern boundary
      points.push({
        lat: parseFloat(currentLat.toFixed(6)),
        lng: parseFloat(currentLon.toFixed(6)),
        radius: 400
      });
      currentLon += lonSpacing;
    }
    currentLat -= latSpacing;
  }
  return points;
}

// Generate the search points
const DAKAR_SEARCH_POINTS = generateGrid(
  DAKAR_BOUNDS.north,
  DAKAR_BOUNDS.west,
  DAKAR_BOUNDS.south,
  DAKAR_BOUNDS.east
);

console.log('\n📍 Grid Statistics:');
console.log(`Total search points: ${DAKAR_SEARCH_POINTS.length}`);
console.log('Grid spacing: 400m');
console.log('Search radius per point: 400m');

// Export the points and bounds
module.exports = {
  DAKAR_BOUNDS,
  DAKAR_SEARCH_POINTS
}; 