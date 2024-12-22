'use strict';

const ProductService = require('../service/product.service.xxx');
const {SuccessResponse} = require('../core/success.response')

class ProductController {
    createProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'Create new product success',
            metadata: await ProductService.createProduct(req.body.product_type, {
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    updateProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'update product success',
            metadata: await ProductService.updateProduct(req.body.product_type, req.params.productId ,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    publishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'publishProductByShop success',
            metadata: await ProductService.publishProductByShop( {
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    getAllDraftsForShop = async (req, res, next) => {
        console.log('getAllDraftsForShop: ' + req.user.userId);
        console.log('product_shop: ' + req.user.userId);
        new SuccessResponse({
            message: 'Get list Draft success',
            metadata: await ProductService.findAllDraftsForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }

    getAllPublishForShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list getAllPublishForShop success',
            metadata: await ProductService.findAllPublishForShop({
                product_shop: req.user.userId
            })
        }).send(res);
    }

    unPublishProductByShop = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list unPublishProductByShop success',
            metadata: await ProductService.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res);
    }

    searchProducts = async (req, res, next) => {
        new SuccessResponse({
            message: 'Get list searchProducts success',
            metadata: await ProductService.getListSearchProduct(
                 req.params
            )
        }).send(res);
    }

    findAllProducts = async (req, res, next) => {
        new SuccessResponse({
            message: ' findAllProducts success',
            metadata: await ProductService.findAllProducts(
                 req.query
            )
        }).send(res);
    }

    findProduct = async (req, res, next) => {
        new SuccessResponse({
            message: ' findProduct success',
            metadata: await ProductService.findProduct(
                 {product_id: req.params.product_id}
            )
        }).send(res);
    }

}

module.exports = new ProductController()