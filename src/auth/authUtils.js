'use strict';

const JWT = require('jsonwebtoken');
const asyncHandler = require('../helpers/asyncHandler');
const { AuthFailureError, NotFoundError } = require('../core/error.response');

const {findByUserId} = require('../service/keyToken.service');

const HEADER = {
    API_KEY : 'x-api-key',
    CLIENT_ID : 'x-client-id',
    AUTHORIZATION: 'authorization',
    REFRESHTOKEN: 'x-token-id'
}



const createTokenPair = async ( payload, publicKey, privateKey) => {

    try {
        // access token
        const accessToken = await JWT.sign(payload, publicKey, { 
            expiresIn: '2 days' 
        });

        const refreshToken = await JWT.sign(payload, privateKey, { 
            expiresIn: '7 days' 
        });

        JWT.verify(accessToken, publicKey, (err, decode) => {
            if (err) console.error('err verify : ', err);
            console.log('decode verify:', decode);
        });
        return { accessToken, refreshToken };
    } catch (error) {
        
    }
}

/*
        1 - Check userId missing
        2 - get access token
        3- verify token
        4- check user in dbs
        5 - check KeyStore with this userId
        6 - Ok all -> return next

    */
const authentication = asyncHandler( async (req, res, next) => {
    console.log('authentication start');
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) return new AuthFailureError('Invalid request');

    
 
    // 2
    
    const keyStore = await findByUserId( userId );
    if (!keyStore) throw new NotFoundError('Not found key Store');

    console.log('authentication start 22');
 
    // 3
    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) return new AuthFailureError('Invalid request');
    console.log('authentication pass middle');
    try {
        const decodeUser =  JWT.verify(accessToken, keyStore.publicKey);
        if (userId != decodeUser.userId) {
         throw new AuthFailureError('Invalid UserId');
        }
        req.keyStore = keyStore;
        console.log('authentication end');
        return next();
    } catch (error) {
        throw error;
    }

})

const authenticationV2 = asyncHandler( async (req, res, next) => {
    console.log('authentication start');
    const userId = req.headers[HEADER.CLIENT_ID]
    if (!userId) return new AuthFailureError('Invalid request');

    
 
    // 2
    
    const keyStore = await findByUserId( userId );
    if (!keyStore) throw new NotFoundError('Not found key Store');

    console.log('authentication start 22');
 
    // 3
    if(req.headers[HEADER.REFRESHTOKEN] ) {
        try {
            const refreshToken = req.headers[HEADER.REFRESHTOKEN];
            const decodeUser =  JWT.verify(refreshToken, keyStore.privateKey);
            if (userId != decodeUser.userId) {
             throw new AuthFailureError('Invalid UserId');
            }
            req.keyStore = keyStore;
            req.user = decodeUser;
            req.refreshToken = refreshToken;
            return next();
        } catch (error) {
            throw error;
        }
    }


    const accessToken = req.headers[HEADER.AUTHORIZATION]
    if (!accessToken) return new AuthFailureError('Invalid request');
    console.log('authentication pass middle');
    try {
        const decodeUser =  JWT.verify(accessToken, keyStore.publicKey);
        if (userId != decodeUser.userId) {
         throw new AuthFailureError('Invalid UserId');
        }
        req.keyStore = keyStore;
        console.log('authentication end');
        return next();
    } catch (error) {
        throw error;
    }

})

const verifyJwt = async (token, keySecret) => {
    return await JWT.verify( token, keySecret );

}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJwt
};