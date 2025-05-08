const express = require('express');
const router = express.Router();
const { register, login, follow, unfollow } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/follow', authenticateToken, follow);
router.post('/unfollow', authenticateToken, unfollow);

module.exports = router;