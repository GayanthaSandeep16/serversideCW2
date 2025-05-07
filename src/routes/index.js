const express = require('express');
const router  = express.Router();
const userRoutes = require('./userRoutes.js');
const blogRoutes = require('./blogRoutes');
const countryRoutes = require('./countryRoutes');


router.use('/users', userRoutes);
router.use('/blogs', blogRoutes);
router.use('/countries', countryRoutes);

module.exports = router;