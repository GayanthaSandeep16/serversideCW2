const {  getAllCountriesNames,getCountryData } = require('../services/countryService');
const { HTTP_STATUS } = require('../utils/constants.js');

//get country data from restcountries API or First CW API based on server configuration
async function getCountry(req, res, next) {
  try {
    const country = req.params.country || req.query.country || req.body.country;
    if (!country) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Country parameter is required' });
    }
    const countryInfo = await getCountryData(country);
    res.status(HTTP_STATUS.OK).json(countryInfo);
  } catch (error) {
    next(error);
  }
}

//get all country names from restcountries API
async function getAllCountries(req, res, next) {
  try {
    const countries = await getAllCountriesNames();
    res.status(HTTP_STATUS.OK).json(countries);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCountry,
  getAllCountries,
};