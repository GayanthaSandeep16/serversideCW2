const { fetchAllCountriesNames, getCountryDataFromExternal, getCountryDataFromFirstCw } = require('../utils/apiUtils.js');
const serverConfig = require('../config/serverConfig');

const axios = require('axios');

/**
 * get country data from external API or First CW API based on server configuration
 * 
 */
async function getCountryData(countryName) {

    if (serverConfig.authToken === undefined) {
        try {
            console.error('Authorization token is not set in server configuration');
            const response = await getCountryDataFromExternal(countryName);
            return response;
        } catch (error) {
            console.error('Error fetching country data from external API:', error.message);
            throw new Error('Failed to fetch country data');
        }

    }else {
        try {
            console.error('Authorization token is set in server configuration');
            const response = await getCountryDataFromFirstCw(countryName);
            return response;
        } catch (error) {
            console.error('Error fetching country data from server:', error.message);
            throw new Error('Failed to fetch country data');
        }
    }   
   
}


/**
 * 
 * get all country names from restcountries API
 */
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