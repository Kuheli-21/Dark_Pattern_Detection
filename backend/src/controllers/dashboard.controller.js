const Website = require('../models/Website');
const Detection = require('../models/Detection');

/**
 * Get dashboard overview metrics
 */
const getOverview = async (req, res, next) => {
  try {
    const [totalWebsites, highRiskWebsites, websiteAgg, detectionAgg, topPatternTypes, recentDetections] =
      await Promise.all([
        Website.countDocuments(),
        Website.countDocuments({ totalDetections: { $gt: 0 } }),
        Website.aggregate([
          {
            $group: {
              _id: null,
              totalScans: { $sum: '$totalScans' },
              totalDetections: { $sum: '$totalDetections' },
              avgRiskScore: { $avg: '$riskScore' },
            },
          },
        ]),
        Detection.countDocuments({ isDarkPattern: true }),
        Detection.aggregate([
          { $match: { isDarkPattern: true, patternType: { $ne: null } } },
          { $group: { _id: '$patternType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        Detection.find()
          .populate('websiteId', 'domain riskScore')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    const stats = websiteAgg[0] || { totalScans: 0, totalDetections: 0, avgRiskScore: 0 };

    return res.status(200).json({
      summary: {
        totalWebsitesScanned: totalWebsites,
        highRiskWebsitesCount: highRiskWebsites,
        totalScansPerformed: stats.totalScans,
        totalDarkPatternsDetected: stats.totalDetections,
        averageRiskScore: Math.round(stats.avgRiskScore || 0),
      },
      topPatternTypes: topPatternTypes.map((item) => ({
        patternType: item._id,
        count: item.count,
      })),
      binaryModelNote:
        'The AI service operates strictly as a binary classifier. Detected patterns are assigned the standard patternType "dark-pattern".',
      recentDetections,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get website risk scores leaderboard
 */
const getWebsiteScores = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const sortField = req.query.sortBy || 'riskScore';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;

    const sortOption = {};
    sortOption[sortField] = sortOrder;

    const [websites, total] = await Promise.all([
      Website.find().sort(sortOption).skip(skip).limit(limit),
      Website.countDocuments(),
    ]);

    return res.status(200).json({
      websites,
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
 * Get trend analysis aggregated by date
 */
const getTrends = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trends = await Detection.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          totalScannedSnippets: { $sum: 1 },
          darkPatternsDetected: {
            $sum: { $cond: [{ $eq: ['$isDarkPattern', true] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      rangeDays: days,
      trends: trends.map((item) => ({
        date: item._id,
        scannedSnippets: item.totalScannedSnippets,
        darkPatternsDetected: item.darkPatternsDetected,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOverview,
  getWebsiteScores,
  getTrends,
};
