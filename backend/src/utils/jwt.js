const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');

/**
 * Generates SHA-256 hash of a string token for secure storage
 */
const hashToken = (token) => {
  if (!token) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Signs a 15-minute access token
 */
const signAccessToken = (payload) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

/**
 * Signs a 7-day refresh token with unique nonce
 */
const signRefreshToken = (payload) => {
  const tokenPayload = {
    ...payload,
    jti: crypto.randomBytes(16).toString('hex'),
  };
  return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verifies an access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verifies a refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
