const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema(
  {
    websiteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Website',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    snippetText: {
      type: String,
      required: true,
    },
    patternType: {
      type: String,
      default: null,
    },
    isDarkPattern: {
      type: Boolean,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    sourceUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: { websiteId: 1, createdAt: -1 }
detectionSchema.index({ websiteId: 1, createdAt: -1 });

const Detection = mongoose.model('Detection', detectionSchema);

module.exports = Detection;
