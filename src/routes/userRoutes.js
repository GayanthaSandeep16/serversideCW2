const express = require('express');
const router = express.Router();
const { register, login, follow, unfollow,getProfile,updateProfile,getFollowers,getFollowing } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/follow', authenticateToken, follow);
router.post('/unfollow', authenticateToken, unfollow);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;