# Duplicate Handling in Foy Lekke

## Overview

The Foy Lekke system intelligently handles duplicates while respecting restaurant chains and multiple locations. This document explains how duplicates are detected and handled.

## Types of Duplicates

### 1. **Exact Duplicates (Google Place ID)**
- **Detection**: Same Google Place ID
- **Action**: Always update existing record
- **Example**: Same restaurant synced multiple times

### 2. **Location-Based Duplicates**
- **Detection**: Same name + within 100 meters
- **Action**: Keep existing, skip new
- **Example**: Same restaurant with slightly different addresses

### 3. **Restaurant Chains**
- **Detection**: Same name + different locations (>100m apart)
- **Action**: Create separate records
- **Example**: "McDonald's" in different parts of Dakar

## Duplicate Detection Logic

### During Sync (`services/placesSync.js`)

```javascript
// Primary check: Google Place ID
const existingPlace = await PlaceModel.findOne({
  googlePlaceId: placeDetails.place_id
});

// Secondary check: Name + Location proximity
const potentialDuplicates = await PlaceModel.find({
  name: placeDetails.name,
  'address.coordinates': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      $maxDistance: 100 // 100 meters
    }
  }
});
```

### Manual Cleanup (`scripts/cleanDuplicates.js`)

1. **Google Place ID Duplicates**: Remove exact duplicates
2. **Geographic Duplicates**: Check distance between same-name places
3. **Data Transfer**: Move reviews/hangouts to kept places
4. **Scoring System**: Keep places with more complete data

## Distance Thresholds

- **< 100 meters**: Considered same location (duplicate)
- **> 100 meters**: Considered different locations (restaurant chain)

## Scoring System

Places are scored based on data completeness:

```javascript
function getPlaceScore(place) {
  let score = 0;
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
```

## Database Indexes

```javascript
// Geospatial index for location queries
placeSchema.index({ 'address.coordinates': '2dsphere' });

// Compound index for name + region queries
placeSchema.index({ name: 1, 'address.region': 1 });

// Unique index for Google Place ID
placeSchema.index({ googlePlaceId: 1 }, { unique: true });
```

## Commands

### Clean Duplicates
```bash
npm run clean-duplicates
```

### Sync Places (with duplicate prevention)
```bash
npm run sync-places "Dakar" 50
```

## Examples

### ✅ Restaurant Chain (Different Locations)
```
McDonald's - Dakar Plateau (14.7167, -17.4677)
McDonald's - Dakar Almadies (14.7247, -17.4677)
Distance: 0.8km → Different locations, both kept
```

### ⚠️ Duplicate (Same Location)
```
La Fourchette - Dakar (14.7167, -17.4677)
La Fourchette - Dakar (14.7168, -17.4678)
Distance: 0.05km → Same location, keep one
```

### ✅ Update Existing
```
La Fourchette (Google Place ID: ChIJ...)
La Fourchette (Google Place ID: ChIJ...)
Same Google Place ID → Update existing record
```

## Best Practices

1. **Always use Google Place ID** as primary identifier
2. **Respect restaurant chains** - don't merge different locations
3. **Transfer associated data** when removing duplicates
4. **Keep most complete data** when choosing which record to keep
5. **Log all decisions** for transparency

## Monitoring

Check logs for duplicate detection:
```bash
tail -f logs/combined.log | grep "duplicate\|Updated existing\|Created new"
``` 