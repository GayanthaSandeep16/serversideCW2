const { fetchCountryData, fetchAllCountriesNames } = require('../utils/apiUtils.js');

async function getCountryInfo(countryName) {
    try {
        const countryData = await fetchCountryData(countryName);
        return countryData;
    } catch (error) {
        throw error;
    }
}

async function getAllCountriesNames() {
    try {
        const countries = await fetchAllCountriesNames();
        return countries;
    } catch (error) {
        console.error('Error fetching all country names:', error.message);
        throw new Error('Failed to fetch all country names');
    }
}

module.exports = { getCountryInfo, getAllCountriesNames };