const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { fetchCountryData } = require('../utils/apiUtils');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');


const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'traveltales.db'));

async function createBlogPost(userId, title, content, country, dateOfVisit) {
  const countryData = await fetchCountryData(country);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO posts (user_id, title, content, country, date_of_visit, flag, currency, capital) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, title, content, country, dateOfVisit, countryData.flag, countryData.currency, countryData.capital],
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

async function editBlogPost(postId, userId, title, content, country, dateOfVisit) {
  const countryData = await fetchCountryData(country);
  return new Promise((resolve, reject) => {
    db.run(
      'UPDATE posts SET title = ?, content = ?, country = ?, date_of_visit = ?, flag = ?, currency = ?, capital = ? WHERE id = ? AND user_id = ?',
      [title, content, country, dateOfVisit, countryData.flag, countryData.currency, countryData.capital, postId, userId],
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

async function getBlogPosts({ country, username, page = 1, limit = 10, sortBy = 'newest' }) {
  const offset = (page - 1) * limit;
  let query = 'SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id';
  const params = [];
  
  if (sortBy === 'mostLiked') {
    query = 'SELECT p.*, u.username, SUM(l.is_like) as like_count FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN likes l ON p.id = l.post_id';
  } else if (sortBy === 'mostCommented') {
    query = 'SELECT p.*, u.username, COUNT(c.id) as comment_count FROM posts p JOIN users u ON p.user_id = u.id LEFT JOIN comments c ON p.id = c.post_id';
  }
  
  if (country) {
    query += ' WHERE p.country = ?';
    params.push(country);
  } else if (username) {
    query += ' WHERE u.username = ?';
    params.push(username);
  }
  
  if (sortBy === 'mostLiked' || sortBy === 'mostCommented') {
    query += ' GROUP BY p.id, p.user_id, p.title, p.content, p.country, p.created_at, u.username';
  }
  
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

async function getComments(postId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    db.all(
      'SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at DESC LIMIT ? OFFSET ?',
      [postId, limit, offset],
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

async function removeLikeInPost(userId, postId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId], function(err) {
      if (err) reject(err);
      resolve({ userId, postId });
    });
  });
}

async function getFollowedPosts(userId, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.*, u.username 
       FROM posts p 
       JOIN users u ON p.user_id = u.id 
       JOIN followers f ON p.user_id = f.followee_id 
       WHERE f.follower_id = ? 
       ORDER BY p.created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset],
      (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      }
    );
  });
}

async function deleteCommentInPost(commentId, userId) {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM comments WHERE id = ? AND user_id = ?', [commentId, userId], function(err) {
      if (err) reject(err);
      if (this.changes === 0) reject(new Error('Comment not found or unauthorized'));
      resolve({ commentId });
    });
  });
}

async function getPostLikes(postId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT user_id, is_like FROM likes WHERE post_id = ?', [postId], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

module.exports = { createBlogPost, editBlogPost, deleteBlogPost, getBlogPosts, likePost, createComment, getComments, removeLikeInPost, getFollowedPosts, deleteCommentInPost, getPostLikes };