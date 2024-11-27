'use strict'

const express = require('express')
const accessController = require('../../controller/access.controller')
const router = express.Router()
//const {asyncHandler} = require('../../auth/checkAuth')
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils')


// sign up
router.post('/shop/signup',  asyncHandler(accessController.signUp))
router.post('/shop/login',  asyncHandler(accessController.login))

// authentication
router.use(authenticationV2);
router.post('/shop/logout',  asyncHandler(accessController.logout))
router.post('/shop/handlerRefreshToken',  asyncHandler(accessController.handlerRefreshToken))

module.exports = router