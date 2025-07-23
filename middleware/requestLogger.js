const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log request details
  const logData = {
    method: req.method,
    url: req.originalUrl || req.url,
    origin: req.get('origin') || 'No origin',
    userAgent: req.get('user-agent'),
    platform: getPlatformType(req),
    ip: req.ip || req.connection.remoteAddress,
    headers: {
      ...req.headers,
      // Remove sensitive information
      authorization: req.headers.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers.cookie ? '[REDACTED]' : undefined
    },
    body: sanitizeRequestBody(req.body)
  };

  // Log request start
  logger.info(`Incoming ${req.method} request to ${req.originalUrl}`, logData);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseLog = {
      duration,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      statusMessage: res.statusMessage,
      platform: getPlatformType(req)
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(`Server error in ${req.method} ${req.originalUrl}`, responseLog);
    } else if (res.statusCode >= 400) {
      logger.warn(`Client error in ${req.method} ${req.originalUrl}`, responseLog);
    } else {
      logger.info(`Completed ${req.method} ${req.originalUrl}`, responseLog);
    }
  });

  next();
};

// Helper function to determine platform type
const getPlatformType = (req) => {
  const userAgent = req.get('user-agent') || '';
  const origin = req.get('origin') || '';

  if (origin.includes('capacitor://') || origin.includes('ionic://')) {
    return 'mobile-app';
  }

  if (userAgent.includes('Android')) {
    return 'android';
  }

  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'ios';
  }

  return 'web';
};

// Helper function to sanitize request body (remove sensitive data)
const sanitizeRequestBody = (body) => {
  if (!body) return undefined;

  const sanitized = { ...body };
  const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'credit_card'];

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
};

module.exports = requestLogger; 