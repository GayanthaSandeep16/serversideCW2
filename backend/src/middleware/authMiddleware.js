const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../utils/constants');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('Authentication token missing');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(`Invalid token: ${err.message}`);
      return res.status(HTTP_STATUS.FORBIDDEN).json({ error: ERROR_MESSAGES.UNAUTHORIZED });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };