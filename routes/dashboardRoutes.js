const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Admin only - get dashboard stats
router.get('/stats', authenticateToken, authorizeRole('admin'), getDashboardStats);

module.exports = router;