const express = require('express');
const router = express.Router();
const { getCountry, getAllCountries } = require('../controllers/countryController');

router.get('/', getCountry);
router.get('/all', getAllCountries);

module.exports = router;