const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Enforces mandatory JWT authentication
 */
const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        error: {
          message: 'Authentication required. Missing access token.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        error: {
          message: 'Invalid or expired access token.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokenHash');
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'User associated with token no longer exists.',
          code: 'UNAUTHORIZED',
        },
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Optional JWT authentication (e.g. for scans from extension)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokenHash');
        if (user) {
          req.user = user;
        }
      }
    }
    return next();
  } catch (error) {
    // Proceed without auth on error
    req.user = null;
    return next();
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
};
