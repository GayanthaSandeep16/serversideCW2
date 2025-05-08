const express = require('express');
const router = express.Router();
const { getCountry,getallCountriesNames } = require('../controllers/countryController');


router.get('/', getCountry);
router.get('/countries', getallCountriesNames);

module.exports = router;