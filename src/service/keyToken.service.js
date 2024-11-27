'use strict'
const keytokenModel = require('../models/keytoken.model');
const { Types} = require('mongoose')

class KeyTokenService {
    static createKeyToken = async ({refreshToken, privateKey, publicKey, userId}) => {
            //create token with level 0
            console.log("created token start ");
            // const tokens = await keytokenModel.create({
            //     user: userId,
            //     publicKey,
            //     privateKey
            // })
            // 
            //return  tokens ? tokens.publicKey : null;

            // level xx
            const filter = { user: userId}, update = {
publicKey, privateKey, refreshTokensUsed: [], refreshToken
            }, options = {upsert: true, new: true}

            const tokens = await keytokenModel.findOneAndUpdate(filter, update, options);
console.log("created token end");
             return tokens  ? tokens.publicKey : null;

    }

    static findByUserId = async (userId) => {
        return await keytokenModel.findOne({user: userId});
    }

    static removeKeyById = async (id) => {
        console.log("removing");
        return await keytokenModel.deleteOne({
            _id:  id
        })
    }

    static findByRefreshTokenUsed = async (refreshToken) => {
        return await keytokenModel.findOne( {refreshTokensUsed: refreshToken}).lean();
    }

    static findByRefreshToken = async (refreshToken) => {
        return await keytokenModel.findOne( {refreshToken});
    }

    static deleteKeyById = async (userId) => {
        return await keytokenModel.deleteOne( {user: userId });
    }
}

module.exports = KeyTokenService;