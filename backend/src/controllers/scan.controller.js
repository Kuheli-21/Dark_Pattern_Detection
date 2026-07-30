const { scanSchema } = require('../validators/scan.validators');
const aiService = require('../services/aiService');
const Website = require('../models/Website');
const Detection = require('../models/Detection');

/**
 * Handles scan requests from the browser extension or client dashboard
 */
const handleScan = async (req, res, next) => {
  try {
    // Support both textSnippets and snippets in body
    const body = {
      url: req.body.url,
      domain: req.body.domain,
      textSnippets: req.body.textSnippets || req.body.snippets || [],
    };

    const validated = scanSchema.parse(body);

    // Call AI microservice
    const aiResponse = await aiService.predict(validated.textSnippets);

    // Normalize AI response predictions array
    const predictions = Array.isArray(aiResponse)
      ? aiResponse
      : aiResponse.predictions || [];

    // Fix 2: Filter out null confidence entries (e.g. empty / whitespace-only snippets)
    const validPredictions = predictions.filter(
      (item) => item && item.confidence !== null && item.confidence !== undefined
    );

    const snippetCount = validPredictions.length;
    const detectionCount = validPredictions.filter((item) => item.isDarkPattern === true).length;

    // Atomically recalculate Website risk score
    const website = await Website.upsertAndRecalculateScore(
      validated.domain,
      snippetCount,
      detectionCount
    );

    // Prepare and insert detection documents
    if (validPredictions.length > 0) {
      const detectionDocs = validPredictions.map((item) => ({
        websiteId: website._id,
        userId: req.user ? req.user._id : null,
        snippetText: item.text || item.snippetText || '',
        patternType: item.isDarkPattern ? 'dark-pattern' : null, // Fix 1: Binary Classification Pattern Limits
        isDarkPattern: Boolean(item.isDarkPattern),
        confidence: Number(item.confidence),
        sourceUrl: validated.url,
      }));

      await Detection.insertMany(detectionDocs);
    }

    // Format response
    const results = validPredictions.map((item) => ({
      text: item.text || item.snippetText || '',
      isDarkPattern: Boolean(item.isDarkPattern),
      patternType: item.isDarkPattern ? 'dark-pattern' : null,
      confidence: Number(item.confidence),
    }));

    return res.status(200).json({
      domain: website.domain,
      riskScore: website.riskScore,
      totalScans: website.totalScans,
      totalDetections: website.totalDetections,
      scannedCount: snippetCount,
      detectedCount: detectionCount,
      results,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  handleScan,
};
