# Foy Lekke Frontend

A modern React-based frontend for the Foy Lekke multi-type place discovery application.

## Features

- 🏠 **Beautiful Homepage** - Hero section, featured places, and category exploration
- 🔍 **Advanced Search** - Search modal with filters for place type, region, and rating
- 📍 **Place Discovery** - Browse and filter places by type (restaurants, parks, museums, etc.)
- 🎨 **Modern UI** - Responsive design with Tailwind CSS and Framer Motion animations
- 🔐 **User Authentication** - Login, registration, and profile management
- ❤️ **Favorites System** - Save and manage your favorite places
- 📱 **Mobile Responsive** - Optimized for all device sizes
- ⚡ **Performance** - React Query for efficient data fetching and caching

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on `http://localhost:9999`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:9999
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navbar, Footer)
│   ├── places/         # Place-related components
│   └── search/         # Search components
├── contexts/           # React contexts (Auth)
├── pages/              # Page components
├── services/           # API services
└── index.css          # Global styles
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Features Overview

### Homepage
- Hero section with call-to-action
- Featured places showcase
- Place type categories
- Statistics and social proof

### Places Page
- Advanced filtering by type, region, rating, and price
- Grid and list view modes
- Pagination
- Search functionality
- Sort options

### Search Modal
- Full-text search
- Place type selection with icons
- Region filtering
- Rating filters
- Quick search suggestions

### User Features
- Authentication (login/register)
- Profile management
- Favorite places
- Social hangouts (coming soon)

## API Integration

The frontend integrates with the backend API through the `services/api.js` file, which includes:

- Places API (CRUD operations, filtering, search)
- Authentication API (login, register, profile)
- Reviews API
- Hangouts API
- Advertisements API

## Styling

The app uses Tailwind CSS with custom configuration:

- **Primary Colors**: Orange theme (#ed7519)
- **Secondary Colors**: Blue accent (#0ea5e9)
- **Accent Colors**: Purple highlights (#d946ef)
- **Custom Components**: Pre-built component classes
- **Responsive Design**: Mobile-first approach

## Contributing

1. Follow the existing code style
2. Use TypeScript for new components (optional)
3. Add proper error handling
4. Test on multiple devices
5. Update documentation

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting with React.lazy()
- Image optimization
- Efficient data fetching with React Query
- Optimized bundle size
- Lazy loading for better performance

## Future Enhancements

- [ ] Interactive maps with Mapbox
- [ ] Real-time notifications
- [ ] Social features (following, sharing)
- [ ] Advanced analytics
- [ ] PWA capabilities
- [ ] Offline support
- [ ] Multi-language support 