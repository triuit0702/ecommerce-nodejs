'use strict'

const express = require('express')
const discountController = require('../../controller/discount.controller')
const router = express.Router()
//const {asyncHandler} = require('../../auth/checkAuth')
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils')

// get amount a discount
router.post('/amount',  asyncHandler(discountController.getDiscountAmount))
router.get('/list_product_code',  asyncHandler(discountController.getAllDiscountCodesWithProduct))


// authentication
router.use(authenticationV2);


router.post('',  asyncHandler(discountController.createDiscountCode))
router.get('',  asyncHandler(discountController.getAllDiscountCodes))


module.exports = router