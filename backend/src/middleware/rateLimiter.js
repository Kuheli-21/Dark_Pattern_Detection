const rateLimit = require('express-rate-limit');

/**
 * Strict rate limiter for scan operations to prevent AI service abuse
 */
const scanRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 scan requests per window per IP
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
  max: 100, // 100 requests per window per IP
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
