# Foy Lekke - Full Stack Application

A comprehensive full-stack application for Foy Lekke, a multi-type place discovery platform for Senegal. This repository contains both the frontend React application and the backend Node.js API.

## 🚀 Features

### Frontend Features
- 🏠 **Beautiful Homepage** - Hero section, featured places, and category exploration
- 🔍 **Advanced Search** - Search modal with filters for place type, region, and rating
- 📍 **Place Discovery** - Browse and filter places by type (restaurants, parks, museums, etc.)
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and Framer Motion animations
- 🔐 **User Authentication** - Login, registration, and profile management
- ❤️ **Favorites System** - Save and manage your favorite places
- 📱 **Mobile Responsive** - Optimized for all device sizes with Capacitor
- ⚡ **Performance** - React Query for efficient data fetching and caching

### Backend Features
- 🍽️ **Restaurant Management**: CRUD operations for restaurants with rich data models
- 🔐 **Authentication**: JWT-based user authentication and authorization
- 📍 **Google Places Integration**: Sync restaurant data from Google Places API
- 🌍 **Geospatial Queries**: Location-based restaurant search and filtering
- ⭐ **Review System**: Restaurant reviews and ratings
- 📢 **Advertisement System**: Sponsored restaurant listings
- 🖼️ **Image Management**: Restaurant photo handling with Cloudinary
- 📊 **Analytics**: Restaurant statistics and performance metrics

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Axios** - HTTP client
- **Capacitor** - Cross-platform mobile development

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **External APIs**: Google Places API, Google Maps API
- **File Upload**: Multer + Cloudinary
- **Validation**: Built-in Express validation

## 📋 Prerequisites

- Node.js (>= 16.0.0)
- npm or yarn
- MongoDB (local or cloud instance)
- Google Maps API Key

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Madicoye/foylekke-web-mobile.git
cd foy-lekke-web-mobile
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install
```

### 3. Environment Setup

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

# Frontend API URL
REACT_APP_API_URL=http://localhost:9999
```

### 4. Initialize Database
```bash
npm run init-db
```

### 5. Start Development Servers

#### Backend Development
```bash
npm run server:dev
```

#### Frontend Development
```bash
npm run client:dev
```

#### Both Frontend and Backend (Recommended)
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend API at `http://localhost:9999`.

## 📁 Project Structure

```
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── contexts/          # React contexts
├── routes/                # Backend API routes
├── models/                # Database models
├── middleware/            # Express middleware
├── services/              # Backend services
├── scripts/               # Database and sync scripts
└── android/ & ios/        # Mobile app builds
```

## 🔧 Available Scripts

### Backend Scripts
- `npm run server:dev` - Start development server with nodemon
- `npm run server` - Start production server
- `npm run sync-places` - Sync places from Google Places API
- `npm run init-db` - Initialize database
- `npm test` - Run tests

### Frontend Scripts
- `npm run client:dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run cap:sync` - Sync with Capacitor
- `npm run cap:open:ios` - Open iOS project
- `npm run cap:open:android` - Open Android project

### Combined Scripts
- `npm run dev` - Start both frontend and backend in development mode

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Places/Restaurants
- `GET /api/places` - Get all places (with filtering)
- `GET /api/places/:id` - Get single place
- `POST /api/places` - Create new place (authenticated)
- `PUT /api/places/:id` - Update place (authenticated)
- `DELETE /api/places/:id` - Delete place (authenticated)

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

## 🔍 Query Parameters

### Place Filtering
- `type` - Filter by place type (restaurant, park, museum, etc.)
- `region` - Filter by region
- `cuisine` - Filter by cuisine type(s)
- `priceRange` - Filter by price range (low, medium, high)
- `rating` - Filter by minimum rating
- `features` - Filter by features (delivery, takeout, etc.)
- `search` - Text search in name, description, or menu items
- `lat`, `lng`, `radius` - Location-based search
- `sort` - Sort by rating, reviews, name, or date

## 🗄️ Database Models

### Place Schema
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
- Place association
- User reviews and ratings
- Timestamps and moderation

### Advertisement Schema
- Sponsored content management
- Expiry dates and targeting

## 🔄 Google Places Integration

The backend includes a comprehensive Places Sync Service that:

1. **Fetches places** from Google Places API by region
2. **Processes place details** including photos, ratings, and hours
3. **Maps data** to our place schema
4. **Syncs to database** with duplicate prevention
5. **Handles pagination** for large datasets

### Supported Regions
- Dakar, Thiès, Saint-Louis, Ziguinchor
- Kaolack, Louga, Fatick, Kolda
- Matam, Kaffrine, Tambacounda
- Kédougou, Sédhiou, Diourbel

## 📱 Mobile Development

This project uses Capacitor for cross-platform mobile development:

```bash
# Initialize Capacitor
npm run cap:init

# Add platforms
npm run cap:add:ios
npm run cap:add:android

# Sync changes
npm run cap:sync

# Open in native IDEs
npm run cap:open:ios
npm run cap:open:android
```

## 🎨 Styling

The frontend uses Tailwind CSS with custom configuration:

- **Primary Colors**: Orange theme (#ed7519)
- **Secondary Colors**: Blue accent (#0ea5e9)
- **Accent Colors**: Purple highlights (#d946ef)
- **Custom Components**: Pre-built component classes
- **Responsive Design**: Mobile-first approach

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- Rate limiting (can be added)
- Environment variable protection

## 🧪 Testing

```bash
# Backend tests
npm test

# Frontend tests
npm test
```

## 🚀 Deployment

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure proper JWT secret
- Set up Cloudinary credentials
- Configure CORS origins

### Recommended Hosting
- **Backend**: Heroku, Railway, or DigitalOcean
- **Frontend**: Netlify, Vercel, or AWS S3
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions, please open an issue in the repository.
