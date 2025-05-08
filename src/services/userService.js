const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants.js');


const db = new sqlite3.Database('./traveltales.db');

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

module.exports = { registerUser, loginUser, followUser, unfollowUser };