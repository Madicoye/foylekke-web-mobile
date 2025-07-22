const fs = require('fs');
const { DAKAR_SEARCH_POINTS } = require('./dakarGrid.js');

// Save points to JSON file
fs.writeFileSync(
    'grid_points.json',
    JSON.stringify(DAKAR_SEARCH_POINTS, null, 2)
);

console.log(`Saved ${DAKAR_SEARCH_POINTS.length} points to grid_points.json`); 