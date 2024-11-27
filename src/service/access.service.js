'use strict';
const shopModel = require('../models/shop.model');
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const { type } = require('os');
const KeyTokenService = require('./keyToken.service');
const { createTokenPair, verifyJwt } = require('../auth/authUtils');
const { getInfoData } = require('../utils');
const { BadRequestError, ConflictRequestError , AuthFailureError, ForbiddenError} = require('../core/error.response');
const { findByEmail } = require('./shop.service');

const RoleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}

 class AcessService {

    // keyStore is tokenModel
    static handlerRefreshTokenV2 = async ( {refreshToken, user, keyStore} ) => {
        
        const { userId, email } = user;

        if (keyStore.refreshTokensUsed.includes(refreshToken)) {
             // xoa tat ca token nam trong keyStore
             await KeyTokenService.deleteKeyById(userId);
             throw new ForbiddenError('Something wrong happened !! Pls reLogin.');
        }

        if (keyStore.refreshToken != refreshToken) {
            throw new AuthFailureError('Shop not registered 1');
        }

        const foundShop = await findByEmail( {email} );
        if (!foundShop) throw new AuthFailureError('Shop not registered 2');

        // create 1 cap doi, chua luu DB
        const tokens = await createTokenPair( {userId, email}, keyStore.publicKey, keyStore.privateKey);

        console.log('keyStorefdsfds: ', keyStore);
        // update token 
        await keyStore.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });

        return {
            user,
            tokens
        }
    }

    static handlerRefreshToken = async ( refreshToken ) => {
        // check xem token da duoc su dung hay chua
        const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken);
        // if co
        if (foundToken) {
            // decode xem la thang nao
            const {userId, email} = await verifyJwt(refreshToken, foundToken.privateKey);
            console.log({userId, email});
            // xoa tat ca token nam trong keyStore
            await KeyTokenService.deleteKeyById(userId);
            throw new ForbiddenError('Something wrong happened !! Pls reLogin.');
        }

        // Neu chua co token da dung
        const holderToken = await KeyTokenService.findByRefreshToken( refreshToken);
        if (!holderToken) throw new AuthFailureError('Shop not registered 1');

        // verify token
        const {userId, email} = await verifyJwt(refreshToken, holderToken.privateKey);
        console.log('[2]----', {userId, email});
        // check userId
        const foundShop = await findByEmail( {email} );
        if (!foundShop) throw new AuthFailureError('Shop not registered 2');

        // create 1 cap doi, chua luu DB
        const tokens = await createTokenPair( {userId, email}, holderToken.publicKey, holderToken.privateKey);

        // update token 
        await holderToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        });

        return {
            user: { userId, email},
            tokens
        }
    }

    static logout = async ( keyStore ) => {
        console.log("before remove");
        const delKey = await KeyTokenService.removeKeyById(keyStore._id);
        console.log( {delKey} );
        return delKey;

    }
    /*
     * 1 - check email in dbs
     * 2 - match password
     * 3 - create AT and RT and save
     * 4 - generate token 
     * 5 - get data return login
     */
    static login = async ( {email, password, refreshToken = null} ) => {
        // 1
        const foundShop = await findByEmail({email})
        if(!foundShop) {
            throw new BadRequestError('Shop not registered');
        }

        // 2
        const match = bcrypt.compare( password, foundShop.password);
        if (!match) {
            throw new AuthFailureError('Authentication error')
        }

        // 3
        // created private key, public key
        const privateKey = crypto.randomBytes(64).toString('hex');
        const publicKey = crypto.randomBytes(64).toString('hex');

        const {_id : userId} = foundShop._id
        // 4 - generate token
        const tokens = await createTokenPair({userId, email}, publicKey, privateKey)

        const abc = await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey,
            publicKey,
            userId
        })

        console.log("save token db: " + abc.refreshToken);
        return {
                shop: getInfoData({fields: ['_id', 'name' ,'email'], object: foundShop}),
                tokens
        }
    }



    static signUp = async ({name, email, password}) => {
   
            // step1 : check email exist
            console.log("before");
            const holderShop = await shopModel.findOne({email}).lean();
console.log("after");
            if (holderShop) {

                throw new BadRequestError('Error: shop already registered');
            }

            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name,
                email,
                password: passwordHash,
                roles: [RoleShop.SHOP]
            })

            if  (newShop) {
                // create privateKey, publicKey
                // const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {
                //     modulusLength: 4096,
                //     publicKeyEncoding:  {
                //         type: 'pkcs1', // co nhieu loại, có loại pkcs8
                //         format: 'pem'

                //     },
                //     privateKeyEncoding:  {
                //         type: 'pkcs1',
                //         format: 'pem'

                //     }
                // })
                const privateKey = crypto.randomBytes(64).toString('hex');
                const publicKey = crypto.randomBytes(64).toString('hex');
                // Public key Cryptographic Standards !
                

                console.log({privateKey, publicKey}) // save collection KeyStore
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })

                if (!keyStore) {
                    return {
                        code: 'xxx',
                        message: 'create keyToken fail',
                        status: 'error'
                    }
                }

                // console.log("publicKeyString::", publicKeyString);
                // const publicKeyObject = crypto.createPublicKey(publicKeyString)
                // console.log("publicKeyObject::", publicKeyObject);
                // created token pair 
                const tokens = await createTokenPair({userId: newShop._id, email}, publicKey, privateKey)
                console.log(`created token success: `, tokens) // 

                return {
                    code: 201,
                    metadata: {
                        shop: getInfoData({fields: ['_id', 'name' ,'email'], object: newShop}),
                        tokens
                    }
                }

            }

            return {
                code: 200,
                metadata:null
            }

    }
}

module.exports = AcessService;