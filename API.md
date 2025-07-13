# Foy Lekke Backend API Documentation

## Base URL
```
http://localhost:9999/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <jwt_token>
```

### Restaurants

#### Get All Restaurants
```http
GET /restaurants?region=Dakar&cuisine=african&priceRange=medium&rating=4&search=pizza&sort=rating
```

**Query Parameters:**
- `region` - Filter by region
- `cuisine` - Filter by cuisine (comma-separated)
- `priceRange` - Filter by price range (low, medium, high)
- `rating` - Minimum rating
- `features` - Filter by features (comma-separated)
- `search` - Text search
- `lat`, `lng`, `radius` - Location-based search
- `sort` - Sort by (rating, reviews, name, date)

**Response:**
```json
[
  {
    "_id": "restaurant_id",
    "name": "Restaurant Name",
    "description": "Restaurant description",
    "address": {
      "street": "123 Main St",
      "city": "Dakar",
      "region": "Dakar",
      "coordinates": {
        "type": "Point",
        "coordinates": [-17.4677, 14.7167]
      }
    },
    "contact": {
      "phone": "+221123456789",
      "email": "contact@restaurant.com",
      "website": "https://restaurant.com"
    },
    "ratings": {
      "googleRating": 4.5,
      "appRating": 4.2,
      "reviewCount": 150
    },
    "priceRange": "medium",
    "cuisine": ["african", "seafood"],
    "features": ["delivery", "takeout"],
    "images": ["image_url_1", "image_url_2"],
    "isVerified": true,
    "source": "google_places"
  }
]
```

#### Get Single Restaurant
```http
GET /restaurants/:id
```

#### Create Restaurant
```http
POST /restaurants
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "New Restaurant",
  "description": "A great restaurant",
  "address": {
    "street": "456 Oak St",
    "city": "Dakar",
    "region": "Dakar",
    "coordinates": {
      "type": "Point",
      "coordinates": [-17.4677, 14.7167]
    }
  },
  "contact": {
    "phone": "+221123456789",
    "email": "contact@newrestaurant.com"
  },
  "cuisine": ["african", "international"],
  "priceRange": "medium",
  "features": ["delivery", "outdoor_seating"]
}
```

#### Update Restaurant
```http
PUT /restaurants/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Updated Restaurant Name",
  "description": "Updated description"
}
```

#### Delete Restaurant
```http
DELETE /restaurants/:id
Authorization: Bearer <jwt_token>
```

#### Get Top Rated Restaurants by Region
```http
GET /restaurants/top/:region
```

### Reviews

#### Get Reviews
```http
GET /reviews?restaurant=restaurant_id&user=user_id
```

#### Create Review
```http
POST /reviews
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "restaurant": "restaurant_id",
  "rating": 5,
  "comment": "Excellent food and service!",
  "foodRating": 5,
  "serviceRating": 4,
  "ambianceRating": 4
}
```

#### Update Review
```http
PUT /reviews/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review comment"
}
```

#### Delete Review
```http
DELETE /reviews/:id
Authorization: Bearer <jwt_token>
```

### Advertisements

#### Get Advertisements
```http
GET /ads?region=Dakar&active=true
```

#### Create Advertisement
```http
POST /ads
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Special Offer",
  "description": "20% off on all dishes",
  "restaurant": "restaurant_id",
  "region": "Dakar",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "budget": 1000,
  "targetAudience": ["foodies", "families"]
}
```

#### Update Advertisement
```http
PUT /ads/:id
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "title": "Updated Special Offer",
  "description": "30% off on all dishes"
}
```

#### Delete Advertisement
```http
DELETE /ads/:id
Authorization: Bearer <jwt_token>
```

### Hangouts

#### Create Hangout
```http
POST /hangouts
```
Requires authentication.

Request body:
```json
{
  "title": "string",
  "restaurantId": "string",
  "dateTime": "ISO date string",
  "maxParticipants": "number (optional)",
  "description": "string (optional)",
  "specialRequests": "string (optional)",
  "isPrivate": "boolean (optional)",
  "tags": ["string"] (optional)
}
```

#### Get Public Hangouts
```http
GET /hangouts
```
Requires authentication.

Query parameters:
- `status`: Filter by status (planned/ongoing/completed/cancelled)
- `restaurant`: Filter by restaurant ID
- `date`: Filter by date (YYYY-MM-DD)
- `tags`: Comma-separated list of tags
- `limit`: Results per page (default: 10)
- `page`: Page number (default: 1)

#### Get User's Hangouts
```http
GET /hangouts/my-hangouts
```
Requires authentication.

#### Get Single Hangout
```http
GET /hangouts/:id
```
Requires authentication.

#### Join Hangout
```http
POST /hangouts/:id/join
```
Requires authentication.

#### Leave Hangout
```http
POST /hangouts/:id/leave
```
Requires authentication.

#### Update Hangout
```http
PUT /hangouts/:id
```
Requires authentication and hangout ownership.

Request body:
```json
{
  "title": "string (optional)",
  "dateTime": "ISO date string (optional)",
  "maxParticipants": "number (optional)",
  "description": "string (optional)",
  "specialRequests": "string (optional)",
  "isPrivate": "boolean (optional)",
  "tags": ["string"] (optional),
  "status": "string (optional)"
}
```

#### Add Message to Hangout Chat
```http
POST /hangouts/:id/messages
```
Requires authentication and hangout participation.

Request body:
```json
{
  "content": "string"
}
```

#### Get Hangout Suggestions
```http
GET /hangouts/suggestions/for-me
```
Requires authentication.

Returns personalized hangout suggestions based on:
- User preferences (cuisine, price range)
- Friend participation
- Timing
- Location

## Error Responses

### Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Authentication Error
```json
{
  "message": "Access denied. No token provided."
}
```

### Not Found Error
```json
{
  "message": "Restaurant not found"
}
```

### Server Error
```json
{
  "message": "Internal server error"
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are configurable via environment variables.

## CORS

CORS is enabled for cross-origin requests. Configure allowed origins in your environment variables. 