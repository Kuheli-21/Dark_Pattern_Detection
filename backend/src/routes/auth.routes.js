const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { standardRateLimiter } = require('../middleware/rateLimiter');

router.use(standardRateLimiter);

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
