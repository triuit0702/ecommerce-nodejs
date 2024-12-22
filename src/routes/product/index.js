'use strict'

const express = require('express')
const productController = require('../../controller/product.controller')
const router = express.Router()
//const {asyncHandler} = require('../../auth/checkAuth')
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils')

router.get('/search/:keySearch',  asyncHandler(productController.searchProducts))
router.get('',  asyncHandler(productController.findAllProducts))
router.get('/:product_id',  asyncHandler(productController.findProduct))

// authentication
router.use(authenticationV2);
router.post('',  asyncHandler(productController.createProduct))
router.patch('/:productId',  asyncHandler(productController.updateProduct))
router.post('/publish/:id',  asyncHandler(productController.publishProductByShop))
router.post('/unpublish/:id',  asyncHandler(productController.unPublishProductByShop))

// query
router.get('/drafts/all',  asyncHandler(productController.getAllDraftsForShop))
router.get('/published/all',  asyncHandler(productController.getAllPublishForShop))

module.exports = router