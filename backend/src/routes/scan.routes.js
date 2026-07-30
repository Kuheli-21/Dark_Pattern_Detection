const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scan.controller');
const { scanRateLimiter } = require('../middleware/rateLimiter');
const { optionalAuth } = require('../middleware/auth.middleware');

router.post('/', scanRateLimiter, optionalAuth, scanController.handleScan);

module.exports = router;
