const axios = require('axios');


async  function fetchCountryData(countryName) {
    try {
        const response = await axios.get(`${process.env.COUNTRY_API_URL}/name/${countryName}`);
        const country = response.data[0];
        return{
            name: country.name.common,
            capital: country.capital[0],
            currency: Object.values(country.currencies)[0]?.name,
            flag: country.flags.png
        };

    }catch (error) {
        console.error(`Error fetching data for ${countryName}:`, error.message);
        throw new Error('Failed to fetch country data');
    }
}

module.exports = { fetchCountryData };