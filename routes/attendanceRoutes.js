const express = require('express');
const router = express.Router();
const { getAllAttendance, getMyAttendance, getAttendanceByDate, getAttendanceByStudent } = require('../controllers/attendanceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Student - view own attendance
router.get('/my', authenticateToken, getMyAttendance);

// Admin - view all attendance
router.get('/all', authenticateToken, authorizeRole('admin'), getAllAttendance);

// Admin - view attendance by date
router.get('/date/:date', authenticateToken, authorizeRole('admin'), getAttendanceByDate);

// Admin - view attendance by student
router.get('/student/:user_id', authenticateToken, authorizeRole('admin'), getAttendanceByStudent);

module.exports = router;