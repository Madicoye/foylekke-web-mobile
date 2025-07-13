# 🏗️ Places System Migration Guide

## Overview

The Foy Lekke backend has been upgraded to support multiple types of places beyond just restaurants. This includes parks, museums, shopping centers, hotels, cafes, bars, entertainment venues, cultural sites, sports facilities, and more.

## 🆕 New Features

### Multi-Type Place Support
- **Restaurants**: Full restaurant functionality with menus, cuisine types, and meal periods
- **Parks**: Recreational areas with facilities, activities, and entry fees
- **Museums**: Cultural institutions with exhibitions, admission pricing, and educational programs
- **Shopping Centers**: Retail complexes with stores, amenities, and services
- **Hotels**: Accommodation with room types, amenities, and services
- **Cafes**: Coffee shops with menus and seating options
- **Bars**: Entertainment venues with drinks and live music
- **Entertainment**: Amusement parks, cinemas, and recreational facilities
- **Cultural Sites**: Religious sites, historical landmarks, and cultural venues
- **Sports Venues**: Gyms, stadiums, and sports facilities

### Enhanced API Endpoints
- **Generic Places API**: `/api/places` - Handle all place types
- **Type-Specific Filtering**: Filter by place type, features, and amenities
- **Advanced Search**: Search across all place types with type-specific criteria
- **Backward Compatibility**: Original restaurant endpoints still work

## 🚀 Migration Process

### 1. Install New Dependencies
```bash
npm install
```

### 2. Initialize New Database Schema
```bash
npm run init-db
```

### 3. Run Migration (Optional)
If you have existing restaurant data, migrate it to the new system:
```bash
npm run migrate-to-places
```

### 4. Test the New System
```bash
npm run dev
```

## 📊 API Changes

### New Generic Places Endpoints

#### Get All Places
```http
GET /api/places?type=restaurant,park&region=Dakar&rating=4&features=parking,wifi
```

**Query Parameters:**
- `type` - Filter by place type(s) (comma-separated)
- `region` - Filter by region
- `cuisine` - Filter by cuisine (for restaurants)
- `priceRange` - Filter by price range
- `rating` - Minimum rating
- `features` - Filter by features
- `search` - Text search
- `lat`, `lng`, `radius` - Location-based search
- `sort` - Sort by rating, reviews, name, distance, or date
- `limit` - Number of results (default: 50)
- `page` - Page number (default: 1)

#### Get Place Types
```http
GET /api/places/types
```

Returns available place types with their features and display names.

#### Create New Place
```http
POST /api/places
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Park",
  "type": "park",
  "description": "A beautiful urban park",
  "address": {
    "street": "123 Park Street",
    "city": "Dakar",
    "region": "Dakar",
    "coordinates": {
      "type": "Point",
      "coordinates": [-17.4677, 14.7167]
    }
  },
  "features": ["playground", "picnic_areas", "walking_trails"],
  "typeSpecificData": {
    "size": "medium",
    "parkType": "urban",
    "entryFee": 0
  }
}
```

#### Sync Places from Google
```http
POST /api/places/sync/Dakar?type=park&limit=20
Authorization: Bearer <jwt_token>
```

### Backward Compatibility

All existing restaurant endpoints continue to work:
- `GET /api/restaurants` - Get restaurants
- `POST /api/restaurants` - Create restaurant
- `PUT /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

## 🗄️ Database Schema Changes

### New Place Model
```javascript
{
  name: String,
  type: String, // 'restaurant', 'park', 'museum', etc.
  description: String,
  address: {
    street: String,
    city: String,
    region: String,
    coordinates: {
      type: 'Point',
      coordinates: [Number, Number]
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  images: [String],
  openingHours: Object,
  ratings: {
    googleRating: Number,
    appRating: Number,
    reviewCount: Number
  },
  features: [String],
  isVerified: Boolean,
  isSponsored: Boolean,
  googlePlaceId: String,
  source: String,
  typeSpecificData: Object // Type-specific information
}
```

### Type-Specific Data Examples

#### Restaurant
```javascript
{
  menu: [...],
  cuisine: [...],
  priceRange: 'medium',
  typeSpecificData: {
    mealHours: {...},
    services: {...},
    awards: [...]
  }
}
```

#### Park
```javascript
{
  typeSpecificData: {
    size: 'medium',
    parkType: 'urban',
    facilities: {...},
    activities: [...],
    entryFee: 0,
    events: [...]
  }
}
```

#### Museum
```javascript
{
  typeSpecificData: {
    museumType: 'cultural',
    collections: [...],
    currentExhibitions: [...],
    admission: {...},
    programs: {...}
  }
}
```

## 🔄 Migration Details

### What Gets Migrated
1. **Restaurants**: All existing restaurants become places with `type: 'restaurant'`
2. **User Favorites**: Updated to reference new place IDs
3. **User Owned Places**: Updated to reference new place IDs
4. **Reviews**: Updated to reference new place IDs
5. **Hangouts**: Updated to reference new place IDs
6. **Advertisements**: Updated to reference new place IDs

### What Stays the Same
- All existing restaurant data is preserved
- Original restaurant endpoints continue to work
- User accounts and authentication remain unchanged
- Review and rating systems work the same way

## 🛠️ Development

### Adding New Place Types

1. **Create Type Schema** (`models/placeTypes/NewType.js`):
```javascript
const mongoose = require('mongoose');
const Place = require('../Place');

const newTypeSchema = new mongoose.Schema({
  // Type-specific fields
  typeSpecificData: {
    // Custom data structure
  }
}, {
  discriminatorKey: 'type'
});

module.exports = Place.discriminator('new_type', newTypeSchema);
```

2. **Update Place Types Index** (`models/placeTypes/index.js`):
```javascript
const NewType = require('./NewType');

module.exports.PLACE_TYPES.NEW_TYPE = 'new_type';
module.exports.getModelByType = function(type) {
  const models = {
    // ... existing types
    new_type: NewType
  };
  return models[type] || Place;
};
```

3. **Add Google Places Mapping**:
```javascript
module.exports.getGooglePlacesTypes = function() {
  return {
    // ... existing mappings
    new_type: ['google_places_type']
  };
};
```

### Testing New Place Types

```bash
# Test creating a new place type
curl -X POST http://localhost:9999/api/places \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Park",
    "type": "park",
    "description": "A test park",
    "address": {
      "street": "Test Street",
      "region": "Dakar"
    }
  }'

# Test filtering by type
curl "http://localhost:9999/api/places?type=park"
```

## 📈 Performance Considerations

### Indexes
The new system includes optimized indexes for:
- Geospatial queries (`address.coordinates`)
- Place type filtering (`type`)
- Region filtering (`address.region`)
- Text search (`name`, `description`)
- Google Place ID lookups (`googlePlaceId`)

### Query Optimization
- Use `type` filter to limit searches to specific place types
- Combine filters for better performance
- Use pagination for large result sets
- Leverage geospatial indexes for location-based queries

## 🔒 Security

### Authorization
- Place creation requires authentication
- Place updates require ownership or admin role
- Admin-only operations (sync, bulk operations)
- Type-specific validation for place data

### Data Validation
- Place type validation
- Feature validation per type
- Required fields validation
- Coordinate validation

## 🚨 Breaking Changes

### Minimal Breaking Changes
- Review model now references `place` instead of `restaurant`
- User model now has `ownedPlaces` instead of `ownedRestaurants`
- Hangout model now references `place` instead of `restaurant`
- Advertisement model now references `place` instead of `restaurant`

### Migration Required
Run the migration script to update existing data:
```bash
npm run migrate-to-places
```

## 📚 Additional Resources

- [API Documentation](./API.md)
- [Database Schema](./models/)
- [Place Types](./models/placeTypes/)
- [Services](./services/)

## 🆘 Support

If you encounter issues during migration:
1. Check the migration logs for specific errors
2. Verify database connectivity
3. Ensure all dependencies are installed
4. Run the migration script in a test environment first
5. Create a backup before running migration in production

For additional help, please refer to the main README.md or create an issue in the repository. 