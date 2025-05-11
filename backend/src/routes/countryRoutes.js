const express = require('express');
const router = express.Router();
const { getCountry, getAllCountries } = require('../controllers/countryController');

// Country routes
router.post('/', getCountry);
router.get('/all', getAllCountries);

module.exports = router;