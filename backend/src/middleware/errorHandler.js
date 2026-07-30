const { ZodError } = require('zod');
const { AiServiceError } = require('../services/aiService');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error handling request [${req.method} ${req.url}]: ${err.message}`, {
    stack: err.stack,
  });

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error: invalid request payload',
        code: 'VALIDATION_ERROR',
        details: err.errors,
      },
    });
  }

  // AI Service Error (502 Bad Gateway)
  if (err instanceof AiServiceError) {
    return res.status(err.statusCode || 502).json({
      error: {
        message: err.message,
        code: 'BAD_GATEWAY',
        details: err.details || null,
      },
    });
  }

  // JSON Syntax Error
  if (err.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({
      error: {
        message: 'Invalid JSON payload in request body',
        code: 'BAD_REQUEST',
      },
    });
  }

  // Custom Application Errors with status
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      error: {
        message: err.message || 'An error occurred',
        code: err.code || 'BAD_REQUEST',
      },
    });
  }

  // Fallback 500 Internal Server Error
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    },
  });
};

module.exports = errorHandler;
