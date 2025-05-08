require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  countryApiUrl: process.env.COUNTRY_API_URL,
};