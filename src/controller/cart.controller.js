'use strict';

const CartService = require('../service/cart.service');
const {SuccessResponse} = require('../core/success.response')

class CartController {

    addToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'Add to cart success',
            metadata: await CartService.addToCart(req.body)
        }).send(res);
    }

    update = async (req, res, next) => {
        new SuccessResponse({
            message: 'update cart success',
            metadata: await CartService.addToCartV2(req.body)
        }).send(res);
    }

    delete = async (req, res, next) => {
        new SuccessResponse({
            message: 'Delete cart success',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res);
    }

    listToCart = async (req, res, next) => {
        new SuccessResponse({
            message: 'listToCart success',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res);
    }


}

module.exports = new CartController();