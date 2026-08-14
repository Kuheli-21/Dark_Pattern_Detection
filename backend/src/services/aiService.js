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
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const predict = async (textSnippets) => {
  const targetUrl = `${env.AI_SERVICE_URL}/predict`;
  
  // Chunk snippets into batches of 50 to match AI service limits
  const batches = chunkArray(textSnippets, 50);
  
  const predictBatch = async (batch) => {
    const payload = { snippets: batch };
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

  // Run all batches in parallel
  const batchPromises = batches.map(batch => predictBatch(batch));
  const batchResults = await Promise.all(batchPromises);

  // Merge results
  const allResults = [];
  for (const res of batchResults) {
    if (res && Array.isArray(res.results)) {
      allResults.push(...res.results);
    }
  }

  // Format into predictions expected by controller
  return {
    predictions: allResults.map((item) => ({
      text: item.snippet,
      isDarkPattern: item.isDarkPattern,
      patternType: item.patternType,
      confidence: item.confidence,
    })),
  };
};

module.exports = {
  predict,
  AiServiceError,
};
