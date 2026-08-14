const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalScans: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDetections: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastScannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Atomic upsert and rolling Bayesian risk score calculation.
 * Formula: Math.min(100, Math.round(((totalDetections + PRIOR_DETECTIONS) / (totalScans + PRIOR_SCANS)) * 100))
 * PRIOR_DETECTIONS = 1, PRIOR_SCANS = 5
 */
websiteSchema.statics.upsertAndRecalculateScore = async function (domain, snippetCount, detectionCount) {
  const normalizedDomain = domain.toLowerCase().trim();
  const PRIOR_DETECTIONS = 1;
  const PRIOR_SCANS = 5;

  let website;
  try {
    website = await this.findOneAndUpdate(
      { domain: normalizedDomain },
      {
        $inc: {
          totalScans: snippetCount,
          totalDetections: detectionCount,
        },
        $set: { lastScannedAt: new Date() },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    // If a duplicate key error happens due to concurrent upsert race, retry once
    if (error.code === 11000) {
      website = await this.findOneAndUpdate(
        { domain: normalizedDomain },
        {
          $inc: {
            totalScans: snippetCount,
            totalDetections: detectionCount,
          },
          $set: { lastScannedAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      throw error;
    }
  }

  const newScore = Math.min(
    100,
    Math.round(((website.totalDetections + PRIOR_DETECTIONS) / (website.totalScans + PRIOR_SCANS)) * 100)
  );

  website.riskScore = newScore;
  await website.save();

  return website;
};

const Website = mongoose.model('Website', websiteSchema);

module.exports = Website;
