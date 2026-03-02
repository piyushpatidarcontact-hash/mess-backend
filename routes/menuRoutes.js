const express = require('express');
const router = express.Router();
const { addMenu, updateMenu, deleteMenu, getMenu } = require('../controllers/menuController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, getMenu);

router.post('/', authenticateToken, authorizeRole('admin'), addMenu);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateMenu);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteMenu);

module.exports = router;