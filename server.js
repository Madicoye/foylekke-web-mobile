const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const ScheduledSyncService = require('./services/scheduledSync');

// Load environment variables
dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Initialize scheduled sync service (internal only)
const scheduledSync = new ScheduledSyncService(process.env.GOOGLE_MAPS_API_KEY);

// Start scheduled tasks if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Schedule different sync intervals
  scheduledSync.scheduleFullSync();        // Weekly full sync
  scheduledSync.scheduleDailyUpdates();    // Daily updates
  scheduledSync.scheduleHighTrafficSync(); // Hourly updates for high-traffic regions
  
  // Log sync initialization
  console.log('Place sync schedules initialized:');
  console.log('- Full sync: Weekly (Mondays at 2 AM)');
  console.log('- Daily updates: Every day at 3 AM');
  console.log('- High-traffic regions: Hourly');
}

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Foy Lekke Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/places', require('./routes/placeRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes')); // Keep for backward compatibility
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/ads', require('./routes/adRoutes'));
app.use('/api/hangouts', require('./routes/hangoutRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 9999;

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; 