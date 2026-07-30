const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

class AiServiceError extends Error {
  constructor(message, statusCode = 502, details = null) {
    super(message);
    this.name = 'AiServiceError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Predicts dark patterns for given text snippets via AI FastAPI service.
 * Includes a 5-second timeout and 1 automatic retry on network failure.
 */
const predict = async (textSnippets) => {
  const targetUrl = `${env.AI_SERVICE_URL}/predict`;
  const payload = { textSnippets };

  const attemptRequest = async () => {
    return await axios.post(targetUrl, payload, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  try {
    const response = await attemptRequest();
    return response.data;
  } catch (firstError) {
    logger.warn(`AI service request failed (attempt 1): ${firstError.message}. Retrying once...`);
    try {
      const retryResponse = await attemptRequest();
      return retryResponse.data;
    } catch (retryError) {
      logger.error(`AI service request failed after retry: ${retryError.message}`);
      throw new AiServiceError(
        'External AI classification service is currently unavailable',
        502,
        retryError.message
      );
    }
  }
};

module.exports = {
  predict,
  AiServiceError,
};
