const express = require('express');
const router = express.Router();
const { getCountry } = require('../controllers/countryController');


router.get('/', getCountry);

module.exports = router;