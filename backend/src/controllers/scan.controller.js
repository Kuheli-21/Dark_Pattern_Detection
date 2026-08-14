const { scanSchema } = require('../validators/scan.validators');
const aiService = require('../services/aiService');
const Website = require('../models/Website');
const Detection = require('../models/Detection');

const getCategoryForSnippet = (snippet) => {
  const lower = snippet?.toLowerCase() || '';
  if (lower.includes('risk') || lower.includes('no thanks') || lower.includes('prefer')) return 'Confirmshaming';
  if (lower.includes('warranty') || lower.includes('basket') || lower.includes('add')) return 'Sneak into Basket';
  if (lower.includes('left') || lower.includes('stock') || lower.includes('hurry')) return 'Fake Scarcity';
  if (lower.includes('bill') || lower.includes('recur') || lower.includes('subscribe') || lower.includes('try free')) return 'Subscription Trap';
  if (lower.includes('fee') || lower.includes('charge') || lower.includes('processing')) return 'Hidden Costs';
  if (lower.includes('close') || lower.includes('switch') || lower.includes('bait')) return 'Bait and Switch';
  if (lower.includes('other people') || lower.includes('shoppers') || lower.includes('social proof') || lower.includes('looking at')) return 'Fake Social Proof';
  if (lower.includes('popup') || lower.includes('nag')) return 'Nagging';
  if (lower.includes('preselected') || lower.includes('default') || lower.includes('pre-ticked')) return 'Preselection';
  return 'Forced Action';
};

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

    // Prepare and insert detection documents (only for flagged dark patterns!)
    const flaggedPredictions = validPredictions.filter((item) => item.isDarkPattern === true);
    if (flaggedPredictions.length > 0) {
      const detectionDocs = flaggedPredictions.map((item) => {
        const textSnippet = item.text || item.snippetText || '';
        return {
          websiteId: website._id,
          userId: req.user ? req.user._id : null,
          snippetText: textSnippet,
          patternType: getCategoryForSnippet(textSnippet),
          isDarkPattern: true,
          confidence: Number(item.confidence),
          sourceUrl: validated.url,
        };
      });

      await Detection.insertMany(detectionDocs);
    }

    // Format response
    const results = validPredictions.map((item) => ({
      text: item.text || item.snippetText || '',
      snippet: item.text || item.snippetText || '',
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
