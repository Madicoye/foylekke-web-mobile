const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./config/logger');
require('dotenv').config();

const app = express();

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost',
      'https://foylekke.com',
      // Add more mobile app origins
      'capacitor://foylekke.app',
      'ionic://foylekke.app',
      'file://',
      'http://localhost:8100', // Ionic dev server
      'http://localhost:8080', // Alternative dev port
      'http://192.168.1.100:3000', // Local network
      'http://192.168.1.101:3000',
      'http://192.168.1.102:3000',
      'http://192.168.1.103:3000',
      'http://192.168.1.104:3000',
      'http://192.168.1.105:3000'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Origin not allowed by CORS'));
    }
  },
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-API-Key',
    'X-Device-ID',
    'X-Platform',
    'X-App-Version',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'X-Current-Page'
  ],
  credentials: true,
  maxAge: 3600,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Add request logger middleware
app.use(requestLogger);

// Add security headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const placeRoutes = require('./routes/placeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adRoutes = require('./routes/adRoutes');
const hangoutRoutes = require('./routes/hangoutRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/hangouts', hangoutRoutes);

// Health check endpoint (mobile-friendly)
app.get('/api/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    platform: req.get('X-Platform') || 'unknown',
    cors: {
      origin: req.get('origin') || 'No origin',
      allowed: true
    }
  };

  logger.info('Health check requested', {
    platform: healthData.platform,
    origin: healthData.cors.origin,
    userAgent: req.get('user-agent')
  });

  res.json(healthData);
});

// Mobile app configuration endpoint
app.get('/api/config', (req, res) => {
  const config = {
    apiVersion: '1.0.0',
    supportedPlatforms: ['ios', 'android', 'web'],
    features: {
      authentication: true,
      places: true,
      reviews: true,
      hangouts: true,
      ads: true,
      payments: true
    },
    limits: {
      maxImageSize: 5 * 1024 * 1024, // 5MB
      maxReviewLength: 1000,
      maxHangoutParticipants: 50
    },
    endpoints: {
      auth: '/api/auth',
      places: '/api/places',
      reviews: '/api/reviews',
      hangouts: '/api/hangouts',
      ads: '/api/ads'
    }
  };

  res.json(config);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const errorDetails = {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.originalUrl || req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    body: req.body
  };

  // Log error with appropriate level
  if (err.status >= 500) {
    logger.error('Server Error', errorDetails);
  } else if (err.status >= 400) {
    logger.warn('Client Error', errorDetails);
  } else {
    logger.error('Unexpected Error', errorDetails);
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error:', { error: err }));

// Start server
const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
}); 