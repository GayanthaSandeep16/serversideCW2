const { fetchAllCountriesNames } = require('../utils/apiUtils.js');

require('dotenv').config();
const axios = require('axios');



async function getCountryData(countryName) {
    try {
        const response = await axios.get(`http://localhost:3000/api/country/${countryName}`, {
            headers: {
                'Authorization': process.env.AUTH_TOKEN
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching country data:', error);
        throw new Error('Failed to fetch country data');
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

module.exports = { getCountryData, getAllCountriesNames };