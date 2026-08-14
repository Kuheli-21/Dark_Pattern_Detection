const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { standardRateLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(standardRateLimiter);
router.use(requireAuth);

router.get('/overview', dashboardController.getOverview);
router.get('/website-scores', dashboardController.getWebsiteScores);
router.get('/trends', dashboardController.getTrends);

module.exports = router;
