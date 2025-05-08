const { createBlogPost, editBlogPost, deleteBlogPost, getBlogPosts, likePost, createComment, getComments } = require('../services/blogService');
const { HTTP_STATUS } = require('../utils/constants');


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

async function editPost(req, res, next) {
  try {
    const { postId, title, content, country, dateOfVisit } = req.body;
    const userId = req.user.id;
    const post = await editBlogPost(postId, userId, title, content, country, dateOfVisit);
    res.status(HTTP_STATUS.OK).json(post);
  } catch (error) {
    next(error);
  }
}

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

async function searchPosts(req, res, next) {
  try {
    const { country, username, page, limit } = req.query;
    const posts = await getBlogPosts({ country, username, page: parseInt(page), limit: parseInt(limit) });
    res.status(HTTP_STATUS.OK).json(posts);
  } catch (error) {
    next(error);
  }
}

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

async function getPostComments(req, res, next) {
  try {
    const { postId } = req.params;
    const { page, limit } = req.query;
    const comments = await getComments(postId, parseInt(page), parseInt(limit));
    res.status(HTTP_STATUS.OK).json(comments);
  } catch (error) {
    next(error);
  }
}

module.exports = { createPost, editPost, deletePost, searchPosts, like, comment, getPostComments };