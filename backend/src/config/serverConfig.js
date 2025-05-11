require('dotenv').config();
const path = require('path');

module.exports = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET,
  countryApiUrl: process.env.COUNTRY_API_URL,
  dbDirectory: path.join(__dirname, '../../data'),
  dbPath: path.join(__dirname, '../../data/traveltales.db'),
  sqlScript: path.join(__dirname, '../sql/init-db.sql'),
  authToken: process.env.AUTH_TOKEN,
  internalServiceUrl: process.env.INTERNAL_SERVICE_URL
};