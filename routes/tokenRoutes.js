const express = require('express');
const router = express.Router();
const { generateMealToken, verifyMealToken, getMyTokens } = require('../controllers/tokenController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Generate a meal token
router.post('/generate', authenticateToken, generateMealToken);

// Verify a meal token and mark attendance
router.post('/verify', authenticateToken, verifyMealToken);

// Get my tokens
router.get('/my-tokens', authenticateToken, getMyTokens);

module.exports = router;