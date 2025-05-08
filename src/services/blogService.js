const sqlite3 = require('sqlite3').verbose();
const { fetchCountryData } = require('../utils/apiUtils');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');


const db = new sqlite3.Database('./data/traveltales.db');

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

async function getBlogPosts({ country, username, page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  let query = 'SELECT p.*, u.username FROM posts p JOIN users u ON p.user_id = u.id';
  const params = [];
  
  if (country) {
    query += ' WHERE p.country = ?';
    params.push(country);
  } else if (username) {
    query += ' WHERE u.username = ?';
    params.push(username);
  }
  
  query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
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

module.exports = { createBlogPost, editBlogPost, deleteBlogPost, getBlogPosts, likePost, createComment, getComments };