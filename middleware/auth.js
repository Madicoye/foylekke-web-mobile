const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

const auth = async (req, res, next) => {
  try {
    // Get token from multiple sources (mobile-friendly)
    const token = 
      req.header('Authorization')?.replace('Bearer ', '') || 
      req.header('X-Auth-Token') ||
      req.query.token || 
      req.body.token ||
      req.cookies?.token;

    if (!token) {
      logger.warn('No authentication token provided', {
        url: req.originalUrl,
        method: req.method,
        platform: req.get('X-Platform') || 'unknown',
        userAgent: req.get('user-agent')
      });
      return res.status(401).json({ 
        message: 'No authentication token provided',
        code: 'NO_TOKEN'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.warn('Token verification failed', {
        error: error.message,
        url: req.originalUrl,
        method: req.method,
        platform: req.get('X-Platform') || 'unknown'
      });

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(401).json({ 
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }

    // Find user
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('favorites', 'name images')
      .populate('reviews', 'rating content createdAt');

    if (!user) {
      logger.warn('User not found for token', {
        userId: decoded.userId,
        url: req.originalUrl,
        method: req.method
      });
      return res.status(401).json({ 
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      logger.warn('Inactive user attempted access', {
        userId: user._id,
        url: req.originalUrl,
        method: req.method
      });
      return res.status(401).json({ 
        message: 'Account is inactive',
        code: 'ACCOUNT_INACTIVE'
      });
    }

    // Update last active timestamp
    user.lastActive = new Date();
    await user.save();

    // Log successful authentication
    logger.info('User authenticated successfully', {
      userId: user._id,
      email: user.email,
      platform: req.get('X-Platform') || 'unknown',
      url: req.originalUrl,
      method: req.method
    });

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error', {
      error: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method
    });
    res.status(500).json({ 
      message: 'Server error during authentication',
      code: 'AUTH_ERROR'
    });
  }
};

module.exports = auth; 