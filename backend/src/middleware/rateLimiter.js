const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/**
 * Strict rate limiter for scan operations to prevent AI service abuse
 */
const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 10000 : 30, // 10,000 in development, 30 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many scan requests, please try again later.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
});

/**
 * Standard rate limiter for general API routes (auth, dashboard, detections)
 */
const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 10000 : 100, // 10,000 in development, 100 in production
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      message: 'Too many requests from this IP, please try again later.',
      code: 'TOO_MANY_REQUESTS',
    },
  },
});

module.exports = {
  scanRateLimiter,
  standardRateLimiter,
};
