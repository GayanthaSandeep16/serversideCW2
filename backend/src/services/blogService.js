const sqlite3 = require('sqlite3').verbose();
const { getCountryData } = require('../services/countryService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');
const serverConfig = require('../config/serverConfig');

const db = new sqlite3.Database(serverConfig.dbPath);

/**
 * 
 * Creates a new blog post in the database.
 
 */
async function createBlogPost(userId, title, content, country, dateOfVisit) {
  const countryData = await getCountryData(country);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO posts (user_id, title, content, country, date_of_visit, flag, currency, capital) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, title, content, country, dateOfVisit, countryData.flag, countryData.currency.name, countryData.capital],
      function(err) {
        if (err) {
          console.log(`Error creating blog post: ${err.message}`);
          return reject(new Error('Failed to create blog post'));
        }
        resolve({ id: this.lastID, userId, title, content, country, dateOfVisit, ...countryData });
      }
    );
  });
}

/**
 *  Edits an existing blog post in the database.
 */
async function editBlogPost(postId, userId, title, content, country, dateOfVisit) {
  const countryData = await getCountryData(country);
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE posts SET title = ?, content = ?, country = ?, date_of_visit = ?, flag = ?, currency = ?, capital = ? WHERE id = ? AND user_id = ?',
      [title, content, country, dateOfVisit, countryData.flag, countryData.currency.name, countryData.capital, postId, userId],
      function(err) {
        if (err) {
          console.log(`Error updating blog post: ${err.message}`);
          return reject(new Error('Failed to update blog post'));
        }
        if (this.changes === 0) {
          console.log(`Unauthorized edit attempt or post not found: postId=${postId}, userId=${userId}`);
          return reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
        }
        resolve({ id: postId, userId, title, content, country, dateOfVisit, ...countryData });
      }
    );
  });
}

/**
 * deletes a blog post from the database.
 * @param {*} postId 
 * @param {*} userId 
 * @returns 
 */

async function deleteBlogPost(postId, userId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM posts WHERE id = ? AND user_id = ?',
      [postId, userId],
      function(err) {
        if (err) {
          console.log(`Error deleting blog post: ${err.message}`);
          return reject(new Error('Failed to delete blog post'));
        }
        if (this.changes === 0) {
          console.log(`Unauthorized delete attempt or post not found: postId=${postId}, userId=${userId}`);
          return reject(new Error(ERROR_MESSAGES.UNAUTHORIZED));
        }
        resolve({ id: postId });
      }
    );
  });
}

/**
 * this function retrieves blog posts from the database based on various filters and sorting options.
 * this is using in home page and search page.
 * @param {string} country - The country to filter posts by.  
 * @param {string} username - The username to filter posts by.
 * @param {string} sortBy - The sorting option ('newest', 'mostLiked', 'mostCommented').
 * * @param {*} param0 
 * @returns 
 */
async function getBlogPosts({ country, username, page = 1, limit = 9, sortBy = 'newest' }) {
  const offset = (page - 1) * limit;
  let query = `
    SELECT p.*, u.username,
    SUM(CASE WHEN l.is_like = 1 THEN 1 ELSE 0 END) as like_count,
    SUM(CASE WHEN l.is_like = 0 THEN 1 ELSE 0 END) as dislike_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    LEFT JOIN likes l ON p.id = l.post_id
  `;
  const params = [];
  
  if (country) {
    query += ' WHERE p.country = ?';
    params.push(country);
  } else if (username) {
    query += ' WHERE u.username = ?';
    params.push(username);
  }
  
  query += ' GROUP BY p.id, p.user_id, p.title, p.content, p.country, p.created_at, u.username';
  
  if (sortBy === 'newest') {
    query += ' ORDER BY p.created_at DESC';
  } else if (sortBy === 'mostLiked') {
    query += ' ORDER BY like_count DESC';
  } else if (sortBy === 'mostCommented') {
    query += ' ORDER BY comment_count DESC';
  }
  
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.log(`Error fetching blog posts: ${err.message}`);
        return reject(new Error('Failed to fetch blog posts'));
      }
      resolve(rows);
    });
  });
}
/**
 * 
 * Likes or unlikes a blog post in the database.
 */
async function likePost(userId, postId, isLike) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT OR REPLACE INTO likes (user_id, post_id, is_like) VALUES (?, ?, ?)',
      [userId, postId, isLike],
      function(err) {
        if (err) {
          console.log(`Error liking post: ${err.message}`);
          return reject(new Error('Failed to like post'));
        }
        resolve({ userId, postId, isLike });
      }
    );
  });
}


/**
 * 
 * Creates a new comment on a blog post in the database.
 */
async function createComment(userId, postId, content) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
      [userId, postId, content],
      function(err) {
        if (err) {
          console.log(`Error creating comment: ${err.message}`);
          return reject(new Error('Failed to create comment'));
        }
        resolve({ id: this.lastID, userId, postId, content });
      }
    );
  });
}

/**
 * 
 * load comments for a specific blog post from the database.
 */
async function getComments(postId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?',
      [parseInt(postId), parseInt(limit), parseInt(offset)],
      (err, rows) => {
        if (err) {
          console.log(`Error fetching comments: ${err.message}`);
          return reject(new Error('Failed to fetch comments'));
        }
        resolve(rows);
      }
    );
  });
}

/**
 * 
 * Removes a like or dislike from a blog post in the database.
 */
async function removeLikeInPost(userId, postId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], function(err) {
      if (err) reject(err);
      resolve({ userId, postId });
    });
  });
}


/**
 * get all posts from users that the user is following.
 * this is unging in feed page.
 * 
 */
async function getFollowedPosts(userId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.*, u.username,
       SUM(CASE WHEN l.is_like = 1 THEN 1 ELSE 0 END) as like_count,
       SUM(CASE WHEN l.is_like = 0 THEN 1 ELSE 0 END) as dislike_count
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       JOIN followers f ON p.user_id = f.followee_id 
       LEFT JOIN likes l ON p.id = l.post_id
       WHERE f.follower_id = ? 
       GROUP BY p.id, p.user_id, p.title, p.content, p.country, p.created_at, u.username
       ORDER BY p.created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
      (err, rows) => {
        if (err) {
          console.log(`Error fetching followed posts: ${err.message}`);
          reject(err);
        }
        resolve(rows);
      }
    );
  });
}

/**
 * 
 * deltes a comment from a blog post in the database.
 */
async function deleteCommentInPost(commentId, userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM comments WHERE id = ? AND user_id = ?', [commentId, userId], function(err) {
      if (err) reject(err);
      if (this.changes === 0) reject(new Error('Comment not found or unauthorized'));
      resolve({ commentId });
    });
  });
}

/**
 * 
 *gets all likes and dislikes for a specific blog post from the database.
 this is used in blog post page.
 */
async function getPostLikes(postId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT user_id, is_like FROM likes WHERE post_id = ?', [postId], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

/**
 * 
 * Retrieves a specific blog post by its ID from the database.
 * this is used in blog post page.
 */
async function getBlogPostById(postId) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        p.*,
        u.username,
        COALESCE(SUM(CASE WHEN l.is_like = 1 THEN 1 ELSE 0 END), 0) as like_count,
        COALESCE(SUM(CASE WHEN l.is_like = 0 THEN 1 ELSE 0 END), 0) as dislike_count
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN likes l ON p.id = l.post_id
      WHERE p.id = ?
      GROUP BY p.id, p.user_id, p.title, p.content, p.country, p.date_of_visit, p.flag, p.currency, p.capital, p.created_at, u.username`,
      [postId],
      (err, row) => {
        if (err) {
          console.log(`Error fetching blog post: ${err.message}`);
          return reject(new Error('Failed to fetch blog post'));
        }
        if (!row) {
          return reject(new Error('Post not found'));
        }
        resolve(row);
      }
    );
  });
}

module.exports = { createBlogPost, editBlogPost, deleteBlogPost, getBlogPosts, likePost, createComment, getComments, removeLikeInPost, getFollowedPosts, deleteCommentInPost, getPostLikes, getBlogPostById };