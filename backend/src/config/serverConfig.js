require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET,
  countryApiUrl: process.env.COUNTRY_API_URL,
  dbDirectory: process.env.DB_DIRECTORY || '/app/data',
  dbPath: path.join(process.env.DB_DIRECTORY || '/app/data', process.env.DB_FILENAME || 'traveltales.db'),
  sqlScript: process.env.SQL_SCRIPT || '/app/src/sql/init-db.sql',
  authToken: process.env.AUTH_TOKEN,
  internalServiceUrl: process.env.INTERNAL_SERVICE_URL
};