const {fetchCountryData} = require('../utils/apiUtils.js');

async function getCountrtInfo(countyName){
    try{
        const countryData = await fetchCountryData(countyName);
        return countryData;
    }catch(error){
        throw error;
    }
}

module.exports = { getCountrtInfo}