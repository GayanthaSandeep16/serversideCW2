const axios = require('axios');
const https = require('https');
const serverConfig = require('../config/serverConfig');


async function fetchAllCountriesNames() {
    try {
        const response = await axios.get(`${serverConfig.countryApiUrl}/all`);
        return response.data.map(country => country.name.common);
    } catch (error) {
        console.error('Error fetching all country names:', error.message);
        throw new Error('Failed to fetch all country names');
    }
}

async function getCountryDataFromExternal(countryName) {
    try {
        const response = await axios.get(`${serverConfig.countryApiUrl}/name/${countryName}`, {
            timeout: 5000,
            httpsAgent: new https.Agent({
                rejectUnauthorized: true,
                minVersion: 'TLSv1.2',
                keepAlive: true,
            }),
        });
        
        if (!response.data || response.data.length === 0) {
            throw new Error('Country not found');
        }
        const countryData = response.data[0];
        return {
            name: countryData.name.common,
            currency: Object.values(countryData.currencies)[0],
            capital: countryData.capital?.[0] || 'N/A',
            languages: Object.values(countryData.languages),
            flag: countryData.flags.png,
        };
    } catch (error) {
        console.error('Error fetching country data:', error.message);
        throw new Error(`Failed to fetch country data: ${error.message}`);
    }
}

async function getCountryDataFromFirstCw(countryName) {
    try {
        const response = await axios.get(`${serverConfig.internalServiceUrl}/api/country/${countryName}`, {
            headers: {
            'Authorization': serverConfig.authToken,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching country data from First CW:', error.message);
        throw new Error('Failed to fetch country data from First CW');
    }
}

module.exports = { fetchAllCountriesNames, getCountryDataFromExternal, getCountryDataFromFirstCw };