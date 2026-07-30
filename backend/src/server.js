const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const scanRoutes = require('./routes/scan.routes');
const detectionsRoutes = require('./routes/detections.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();

// Global Security Headers
app.use(helmet());

// CORS Configuration
const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or extension content scripts)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin) ||
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Dark Pattern Detector Backend' });
});

// API Routes Mount
app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/detections', detectionsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Cannot ${req.method} ${req.url}`,
      code: 'NOT_FOUND',
    },
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Connect DB and listen on port if executed directly
if (require.main === module) {
  connectDB().then(() => {
    app.listen(env.PORT, () => {
      logger.info(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  });
}

module.exports = app;
