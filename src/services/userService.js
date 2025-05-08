const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants.js');


const db = new sqlite3.Database(path.join(__dirname, '..', 'data', 'traveltales.db'));

async function registerUser(email, password, username) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (email, password, username) VALUES (?, ?, ?)',
      [email, hashedPassword, username],
      function(err) {
        if (err) {
          console.log(`Error registering user: ${err.message}`);
          return reject(new Error(err.code === 'SQLITE_CONSTRAINT' ? ERROR_MESSAGES.USER_EXISTS : 'Registration failed'));
        }
        resolve({ id: this.lastID, email, username });
      }
    );
  });
}

async function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
       console.log(`Login failed for email: ${email}`);
        return reject(new Error(ERROR_MESSAGES.INVALID_CREDENTIALS));
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        console.log(`Invalid password for email: ${email}`);
        return reject(new Error(ERROR_MESSAGES.INVALID_CREDENTIALS));
      }
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      resolve({ token, user: { id: user.id, email: user.email, username: user.username } });
    });
  });
}

async function followUser(followerId, followeeId) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO followers (follower_id, followee_id) VALUES (?, ?)',
      [followerId, followeeId],
      function(err) {
        if (err) {
          console.log(`Error following user: ${err.message}`);
          return reject(new Error('Failed to follow user'));
        }
        resolve({ followerId, followeeId });
      }
    );
  });
}

async function unfollowUser(followerId, followeeId) {
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM followers WHERE follower_id = ? AND followee_id = ?',
      [followerId, followeeId],
      function(err) {
        if (err) {
          console.log(`Error unfollowing user: ${err.message}`);
          return reject(new Error('Failed to unfollow user'));
        }
        resolve({ followerId, followeeId });
      }
    );
  });
}

async function getUserProfile(userId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT id, email, username FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
}

async function updateUserProfile(userId, { email, username }) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE users SET email = ?, username = ? WHERE id = ?', [email, username, userId], function(err) {
      if (err) reject(err);
      resolve({ id: userId, email, username });
    });
  });
}

async function isTokenBlacklisted(token) {
  return new Promise((resolve, reject) => {
    db.get('SELECT token FROM blacklisted_tokens WHERE token = ?', [token], (err, row) => {
      if (err) reject(err);
      resolve(!!row);
    });
  });
}

async function getFollowersbyId(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT u.id, u.username FROM users u JOIN followers f ON u.id = f.follower_id WHERE f.followee_id = ?', [userId], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

async function getFollowingByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.all('SELECT u.id, u.username FROM users u JOIN followers f ON u.id = f.followee_id WHERE f.follower_id = ?', [userId], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}

module.exports = { registerUser, loginUser, followUser, unfollowUser, getUserProfile, updateUserProfile, isTokenBlacklisted, getFollowersbyId, getFollowingByUserId };