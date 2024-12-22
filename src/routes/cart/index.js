'use strict'

const express = require('express')
const cartController = require('../../controller/cart.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler');


router.post('',  asyncHandler(cartController.addToCart))
// delete item product in Cart
router.delete('',  asyncHandler(cartController.delete))
router.post('/update',  asyncHandler(cartController.update))
router.get('',  asyncHandler(cartController.listToCart))



module.exports = router