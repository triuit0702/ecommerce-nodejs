'use strict';

const apikeyModel = require('../models/apikey.model');
const crypto = require('crypto');

const findById = async ( key ) => {
    console.log('Searching for key:', key);

    try {
        // tao api key - start
//            const newKey = await apikeyModel.create({key : crypto.randomBytes(64).toString('hex'), permissions: ['0000']});
//    console.log('apiKey: ' + newKey );
   // tao api key - end
        const objectKey = await apikeyModel.findOne({key, status: true}).lean();
        console.log('Found objectKey:', objectKey);

        return objectKey;
    } catch (error) {
        console.error('Error while finding key:', error.message);

    }
    
}

module.exports = {
    findById
}