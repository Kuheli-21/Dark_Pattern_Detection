const Detection = require('../models/Detection');
const Website = require('../models/Website');

/**
 * List detections with pagination and filtering
 */
const listDetections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const query = {};

    if (req.query.isDarkPattern !== undefined) {
      query.isDarkPattern = req.query.isDarkPattern === 'true';
    }

    if (req.query.patternType) {
      query.patternType = req.query.patternType;
    }

    if (req.query.domain) {
      const website = await Website.findOne({ domain: req.query.domain.toLowerCase().trim() });
      if (website) {
        query.websiteId = website._id;
      } else {
        // Domain has no records
        return res.status(200).json({
          detections: [],
          pagination: { total: 0, page, limit, pages: 0 },
        });
      }
    }

    const [detections, total] = await Promise.all([
      Detection.find(query)
        .populate('websiteId', 'domain riskScore')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Detection.countDocuments(query),
    ]);

    return res.status(200).json({
      detections,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 0,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get single detection by ID
 */
const getDetectionById = async (req, res, next) => {
  try {
    const detection = await Detection.findById(req.params.id).populate('websiteId', 'domain riskScore');

    if (!detection) {
      return res.status(404).json({
        error: {
          message: 'Detection event not found',
          code: 'NOT_FOUND',
        },
      });
    }

    return res.status(200).json({ detection });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listDetections,
  getDetectionById,
};
