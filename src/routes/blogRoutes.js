const express = require('express');
const router = express.Router();
const { createPost, editPost, deletePost, searchPosts, like, comment, getPostComments } = require('../controllers/blogController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createPost);
router.put('/', authenticateToken, editPost);
router.delete('/', authenticateToken, deletePost);
router.get('/search', searchPosts);
router.post('/like', authenticateToken, like);
router.post('/comment', authenticateToken, comment);
router.get('/:postId/comments', getPostComments);

module.exports = router;