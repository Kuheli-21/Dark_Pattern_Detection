const express = require('express');
const router = express.Router();
const detectionsController = require('../controllers/detections.controller');
const { standardRateLimiter } = require('../middleware/rateLimiter');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(standardRateLimiter);
router.use(requireAuth);

router.get('/', detectionsController.listDetections);
router.get('/:id', detectionsController.getDetectionById);

module.exports = router;
