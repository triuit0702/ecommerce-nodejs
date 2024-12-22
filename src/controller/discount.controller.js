'use strict';

const DiscountService = require('../service/discount.service');
const {SuccessResponse} = require('../core/success.response')

class DiscountController {

    createDiscountCode = async (req, res, next) => {
        console.log('sHOPiD 1: ' + req.user.userId);
        new SuccessResponse({
            message: 'Successful Code Generations',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getAllDiscountCodes = async (req, res, next) => {
        console.log('getAllDiscountCodes ');
        new SuccessResponse({
            message: 'Successful Code Found',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res);
    }

    getDiscountAmount = async (req, res, next) => {
        new SuccessResponse({
            message: 'getDiscountAmount success',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body

            })
        }).send(res);
    }

    getAllDiscountCodesWithProduct = async (req, res, next) => {
        new SuccessResponse({
            message: 'getDiscountAmount success',
            metadata: await DiscountService.getAllDiscountCodesWithProduct({
                ...req.query

            })
        }).send(res);
    }
}

module.exports = new DiscountController();