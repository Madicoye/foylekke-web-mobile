# Foy Lekke Backend API

A robust backend API for Foy Lekke, a restaurant discovery app for Senegal. This API provides comprehensive restaurant data management, user authentication, and integration with Google Places API.

## Features

- 🍽️ **Restaurant Management**: CRUD operations for restaurants with rich data models
- 🔐 **Authentication**: JWT-based user authentication and authorization
- 📍 **Google Places Integration**: Sync restaurant data from Google Places API
- 🌍 **Geospatial Queries**: Location-based restaurant search and filtering
- ⭐ **Review System**: Restaurant reviews and ratings
- 📢 **Advertisement System**: Sponsored restaurant listings
- 🖼️ **Image Management**: Restaurant photo handling with Cloudinary
- 📊 **Analytics**: Restaurant statistics and performance metrics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **External APIs**: Google Places API, Google Maps API
- **File Upload**: Multer + Cloudinary
- **Validation**: Built-in Express validation

## Prerequisites

- Node.js (>= 16.0.0)
- MongoDB (local or cloud instance)
- Google Maps API Key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foy-lekke-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=9999
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/foy-lekke
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_here
   
   # Google APIs
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
   
   # Cloudinary (for image uploads)
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. **Initialize Database**
   ```bash
   npm run init-db
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Sync Places from Google
```bash
# Sync restaurants from a specific region
npm run sync-places "Dakar" 50

# Or run directly
node scripts/syncPlaces.js "Dakar" 50
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Restaurants
- `GET /api/restaurants` - Get all restaurants (with filtering)
- `GET /api/restaurants/:id` - Get single restaurant
- `POST /api/restaurants` - Create new restaurant (authenticated)
- `PUT /api/restaurants/:id` - Update restaurant (authenticated)
- `DELETE /api/restaurants/:id` - Delete restaurant (authenticated)
- `GET /api/restaurants/top/:region` - Get top rated restaurants by region

### Reviews
- `GET /api/reviews` - Get reviews
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)

### Advertisements
- `GET /api/ads` - Get advertisements
- `POST /api/ads` - Create advertisement (authenticated)
- `PUT /api/ads/:id` - Update advertisement (authenticated)
- `DELETE /api/ads/:id` - Delete advertisement (authenticated)

## Query Parameters

### Restaurant Filtering
- `region` - Filter by region
- `cuisine` - Filter by cuisine type(s)
- `priceRange` - Filter by price range (low, medium, high)
- `rating` - Filter by minimum rating
- `features` - Filter by features (delivery, takeout, etc.)
- `search` - Text search in name, description, or menu items
- `lat`, `lng`, `radius` - Location-based search
- `sort` - Sort by rating, reviews, name, or date

## Database Models

### Restaurant Schema
- Basic info (name, description, address)
- Contact details (phone, email, website)
- Menu items with categories and prices
- Images and opening hours
- Ratings (Google + app ratings)
- Features and cuisine types
- Verification and sponsorship status
- Google Place ID for external sync

### User Schema
- Authentication details
- Profile information
- Role-based permissions

### Review Schema
- Restaurant association
- User reviews and ratings
- Timestamps and moderation

### Advertisement Schema
- Sponsored content management
- Expiry dates and targeting

## Google Places Integration

The backend includes a comprehensive Places Sync Service that:

1. **Fetches places** from Google Places API by region
2. **Processes place details** including photos, ratings, and hours
3. **Maps data** to our restaurant schema
4. **Syncs to database** with duplicate prevention
5. **Handles pagination** for large datasets

### Supported Regions
- Dakar, Thiès, Saint-Louis, Ziguinchor
- Kaolack, Louga, Fatick, Kolda
- Matam, Kaffrine, Tambacounda
- Kédougou, Sédhiou, Diourbel

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed messages
- Authentication and authorization errors
- Database connection and query errors
- External API error handling
- Graceful degradation for missing data

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Rate limiting (can be added)
- Environment variable protection

## Testing

```bash
npm test
```

## Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper JWT secret
- Set up Cloudinary credentials
- Configure CORS origins

### Recommended Hosting
- **Backend**: Heroku, Railway, or DigitalOcean
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please open an issue in the repository. 