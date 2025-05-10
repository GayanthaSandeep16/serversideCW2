const axios = require('axios');


async function fetchAllCountriesNames() {
    try {
        const response = await axios.get(`${process.env.COUNTRY_API_URL}/all`);
        return response.data.map(country => country.name.common);
    } catch (error) {
        console.error('Error fetching all country names:', error.message);
        throw new Error('Failed to fetch all country names');
    }
}

module.exports = { fetchAllCountriesNames };