const User = require('../models/User');
const { signupSchema, loginSchema } = require('../validators/auth.validators');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require('../utils/jwt');
const env = require('../config/env');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
};

/**
 * User Signup
 */
const signup = async (req, res, next) => {
  try {
    const validated = signupSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      return res.status(409).json({
        error: {
          message: 'An account with this email already exists',
          code: 'EMAIL_EXISTS',
        },
      });
    }

    const user = new User({
      email: validated.email,
      passwordHash: validated.password,
    });

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * User Login
 */
const login = async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email });
    if (!user) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const isMatch = await user.comparePassword(validated.password);
    if (!isMatch) {
      return res.status(401).json({
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS',
        },
      });
    }

    const payload = { userId: user._id.toString(), email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken,
      user: {
        id: user._id.toString(),
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Refresh Token Rotation
 */
const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      (req.cookies && req.cookies.refreshToken) || (req.body && req.body.refreshToken);

    if (!incomingRefreshToken) {
      return res.status(401).json({
        error: {
          message: 'Refresh token required',
          code: 'MISSING_REFRESH_TOKEN',
        },
      });
    }

    const decoded = verifyRefreshToken(incomingRefreshToken);
    if (!decoded) {
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
      return res.status(401).json({
        error: {
          message: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN',
        },
      });
    }

    const user = await User.findById(decoded.userId);
    const incomingHash = hashToken(incomingRefreshToken);

    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== incomingHash) {
      // Possible token reuse attack - clear cookie and revoke DB hash
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
      res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
      return res.status(401).json({
        error: {
          message: 'Refresh token invalid or revoked',
          code: 'TOKEN_REVOKED',
        },
      });
    }

    // Issue new tokens (Rotation)
    const payload = { userId: user._id.toString(), email: user.email };
    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    return res.status(200).json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * User Logout
 */
const logout = async (req, res, next) => {
  try {
    const incomingRefreshToken =
      (req.cookies && req.cookies.refreshToken) || (req.body && req.body.refreshToken);

    if (incomingRefreshToken) {
      const decoded = verifyRefreshToken(incomingRefreshToken);
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user) {
          user.refreshTokenHash = null;
          await user.save();
        }
      }
    } else if (req.user) {
      const user = await User.findById(req.user._id);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    }

    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
    res.clearCookie('accessToken', CLEAR_COOKIE_OPTIONS);

    return res.status(200).json({
      message: 'Logged out successfully',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
  refresh,
  logout,
};
