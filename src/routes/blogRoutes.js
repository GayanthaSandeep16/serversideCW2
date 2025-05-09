const express = require('express');
const router = express.Router();
const { createPost, editPost, deletePost, searchPosts, like, comment, getPostComments, removeLike, getFeed, deleteComment, getLikes } = require('../controllers/blogController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, createPost);
router.put('/', authenticateToken, editPost);
router.delete('/', authenticateToken, deletePost);
router.get('/search', searchPosts);
router.post('/like', authenticateToken, like);
router.post('/comment', authenticateToken, comment);
router.get('/:postId/comments', authenticateToken, getPostComments);
router.delete('/like', authenticateToken, removeLike);
router.get('/feed', authenticateToken, getFeed);
router.delete('/comment', authenticateToken, deleteComment);
router.get('/:postId/likes', authenticateToken, getLikes);
router.get('/search', searchPosts);

module.exports = router;