'use strict'
const AcessService = require('../service/access.service');

const {OK, CREATED, SuccessResponse} = require('../core/success.response');

class AccessController {

    handlerRefreshToken = async (req, res, next) => {
        new SuccessResponse({
            message: 'get token success',
            metadata: await AcessService.handlerRefreshTokenV2(  {
                refreshToken: req.refreshToken,
                user: req.user,
                keyStore: req.keyStore

         } )
        }).send(res);
    }

    
    logout = async (req, res, next) => {
        console.log('logout start');
        new SuccessResponse({
            message: 'Logout success',
            metadata: await AcessService.logout( req.keyStore)
        }).send(res);
    }

    login = async (req, res, next) => {
        new SuccessResponse({
            metadata: await AcessService.login( req.body )
        }).send(res);
    }

    signUp = async ( req, res, next ) => {

        new CREATED({
            message: 'Registed OK',
            metadata: await AcessService.signUp(req.body),
            options: {
                limit: 10
            }
        }).send(res);
        // return res.status(201)
        //     .json(await AcessService.signUp(req.body));

    }
}

module.exports = new AccessController()