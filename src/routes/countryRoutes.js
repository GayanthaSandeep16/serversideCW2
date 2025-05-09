const express = require('express');
const router = express.Router();
const { getCountry, getAllCountries } = require('../controllers/countryController');

router.post('/', getCountry);
router.get('/all', getAllCountries);

module.exports = router;