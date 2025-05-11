const { createBlogPost, editBlogPost, deleteBlogPost, getBlogPosts, likePost, createComment, getComments, removeLikeInPost, getFollowedPosts, deleteCommentInPost, getPostLikes,getBlogPostById } = require('../services/blogService');
const { HTTP_STATUS } = require('../utils/constants');

//create a new blog post
async function createPost(req, res, next) {
  try {
    const { title, content, country, dateOfVisit } = req.body;
    const userId = req.user.id;
    const post = await createBlogPost(userId, title, content, country, dateOfVisit);
    res.status(HTTP_STATUS.CREATED).json(post);
  } catch (error) {
    next(error);
  }
}

//edit a blog post
async function editPost(req, res, next) {
  try {
    const { postId, title, content, country, dateOfVisit } = req.body;
    const userId = req.user.id;
    const post = await editBlogPost(postId, userId, title, content, country, dateOfVisit);
    res.status(HTTP_STATUS.OK).json(post);
  } catch (error) {
    console.error('Error in editPost:', error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
  }
}
//delete a blog post
async function deletePost(req, res, next) {
  try {
    const { postId } = req.body;
    const userId = req.user.id;
    const result = await deleteBlogPost(postId, userId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Search for blog posts based on country and username or 
 * use in search
 *  */

async function searchPosts(req, res, next) {
  try {
    const { country, username, page, limit } = req.query;
    const posts = await getBlogPosts({ country, username, page: parseInt(page), limit: parseInt(limit) });
    res.status(HTTP_STATUS.OK).json(posts);
  } catch (error) {
    next(error);
  }
}

//like or unlike a blog post
async function like(req, res, next) {
  try {
    const { postId, isLike } = req.body;
    const userId = req.user.id;
    const result = await likePost(userId, postId, isLike);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
}

//comment on a blog post
async function comment(req, res, next) {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;
    const comment = await createComment(userId, postId, content);
    res.status(HTTP_STATUS.CREATED).json(comment);
  } catch (error) {
    next(error);
  }
}

//get comments for a blog post
async function getPostComments(req, res, next) {
  try {
    const postId = parseInt(req.params.postId);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'Invalid postId' });
    }
    const page = isNaN(parseInt(req.query.page)) ? 1 : parseInt(req.query.page);
    const limit = isNaN(parseInt(req.query.limit)) ? 10 : parseInt(req.query.limit);
    const comments = await getComments(postId, page, limit);
    res.status(HTTP_STATUS.OK).json(comments);
  } catch (error) {
    next(error);
  }
}

//remove like from a blog post basically delete the like  from db
async function removeLike(req, res) {
  const { postId } = req.body;
  const userId = req.user.id;
  const result = await removeLikeInPost(userId, postId);
  res.status(200).json(result);
}

//get the feed for the use
async function getFeed(req, res) {
  const { page, limit } = req.query;
  const posts = await getFollowedPosts(req.user.id, parseInt(page), parseInt(limit));
  res.status(200).json(posts);
}

//delete a comment from a blog post
async function deleteComment(req, res) {
  const { commentId } = req.body;
  const userId = req.user.id;
  const result = await deleteCommentInPost(commentId, userId);
  res.status(200).json(result);
}

//get like for a blog post
async function getLikes(req, res) {
  const { postId } = req.params;
  const likes = await getPostLikes(postId);
  res.status(200).json(likes);
}

//this is the main function for searching posts
//it is used in the search page and home page

async function searchPosts(req, res) {
  const { country, username, page, limit, sortBy } = req.query;
  const posts = await getBlogPosts({ country, username, page: parseInt(page), limit: parseInt(limit), sortBy });
  res.status(200).json(posts);
}

async function getPostById(req, res) {
  const postId = parseInt(req.params.postId);
  if (isNaN(postId)) {
    return res.status(400).json({ error: 'Invalid postId' });
  }
  const post = await getBlogPostById(postId);
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  res.status(200).json(post);
}

module.exports = { createPost, editPost, deletePost, searchPosts, like, comment, getPostComments, removeLike, getFeed, deleteComment, getLikes,getPostById };