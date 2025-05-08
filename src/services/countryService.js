const { fetchCountryData ,fetchAllCountriesNames } = require('../utils/apiUtils.js');

async function getCountrtInfo(countyName) {
    try {
        const countryData = await fetchCountryData(countyName);
        return countryData;
    } catch (error) {
        throw error;
    }
}

async function getallCountriesName() {
    try {
        const response = await fetchAllCountriesNames();
        return response.data.map(country => country.name.common);

    }
    catch (error) {
        console.error('Error fetching all country names:', error.message);
        throw new Error('Failed to fetch all country names');
    }
}
module.exports = { getCountrtInfo, getallCountriesName };