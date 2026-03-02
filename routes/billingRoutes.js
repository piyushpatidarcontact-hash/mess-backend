const express = require('express');
const router = express.Router();
const { getMonthlyBill } = require('../controllers/billingController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Admin only - get monthly bill for a student
router.get('/:studentId/:year/:month', authenticateToken, authorizeRole('admin'), getMonthlyBill);

module.exports = router;