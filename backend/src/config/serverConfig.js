// backend/src/config/serverConfig.js
require('dotenv').config();
const path = require('path');

// In Docker, paths should be relative to the app directory
module.exports = {
  port: process.env.PORT || 3999,
  jwtSecret: process.env.JWT_SECRET,
  countryApiUrl: process.env.COUNTRY_API_URL,
  authToken: process.env.AUTH_TOKEN,
  dbDirectory: process.env.DB_DIRECTORY || path.resolve(__dirname, '../../data'),
  dbPath: path.join(process.env.DB_DIRECTORY || path.resolve(__dirname, '../../data'), 
                   process.env.DB_FILENAME || 'traveltales.db'),
  sqlScript: process.env.SQL_SCRIPT || path.resolve(__dirname, '../sql/init-db.sql'),
};