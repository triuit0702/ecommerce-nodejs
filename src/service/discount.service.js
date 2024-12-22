'use strict';

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const {
    convertToObjectIdMongodb
} = require('../utils');

const {
    findAllProducts

}= require('./product.service.xxx');

const {
    findAllDiscountCodesUnselect,
    findAllDiscountCodesSelect,
    checkDiscountExists
} = require('../models/repositories/discount.repo');

const discount = require('../models/discount.model');

/*
    Discount services
    1- Generator discount count [Shop | Admin]
    2- Get discount amount [User] // giá bao nhiêu , có hợp lệ hay khong ?
    3- Get all discount codes [User | Shop]
    4- Verify discount code [User]
    5- Delete discount code [Admin | Shop]
    6- Cancael discount code [user]
    4- 
 */

class DiscountService {
    static async createDiscountCode(payload) {
        
        const {
            code, start_date, end_date, is_active, users_used,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type, value, max_value, max_uses, uses_count, max_uses_per_user
        } = payload;
        console.log('sHOPiD 2: ' + shopId);
        // kiem tra
        // if (new Date() < new Date(start_date) || new Date() >  new Date(end_date)) {
        //     throw new BadRequestError(`Discount codde has expired!`);
        // }

        if (new Date(start_date) >= new Date(end_date)) {
            throw new BadRequestError('Start date must be before end date')
        }
        // create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        if (foundDiscount && foundDiscount.discount_is_active) {
            throw new BadRequestError(`Discount exists!`);
        }

        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_code: code,
            discount_value: value,
            discount_min_order_value: min_order_value,
            discount_max_value: max_value,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_uses_count: uses_count,
            discount_users_used: users_used,
            discount_shopId: shopId,
            discount_max_uses_per_user: max_uses_per_user,
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids
            
        })

        return newDiscount;;
    }

    static async updateDiscountCode() {
        // ...
    }

    /*
        Get all discount codes available with products
     */
    static async getAllDiscountCodesWithProduct({
        code, shopId, userId, limit, page
    }) {
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: convertToObjectIdMongodb(shopId)
        }).lean()

        
        if (!foundDiscount || !foundDiscount.discount_is_active) {
            throw new NotFoundError(`Discount not exists!`);
        }

        const { discount_applies_to, discount_product_ids } = foundDiscount
        let products;
        if (discount_applies_to === 'all') {
            // get all product
            products = await findAllProducts({
                filter: {
                    product_shop: convertToObjectIdMongodb(shopId),
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if (discount_applies_to === 'specific') {
            console.log("vo 222: " );
            // get the products ids
            products = await findAllProducts({
                filter: {
                    _id: { $in: discount_product_ids },
                    isPublished: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        console.log("found product: " +products);

        return products;
    }

    /**
     * get all discount code of shop
     */
    static async getAllDiscountCodesByShop({
        limit, page,
        shopId
    }) {
        const discounts = await findAllDiscountCodesUnselect({
            limit: +limit,
            page: +page,
            filter: {
                discount_shopId: convertToObjectIdMongodb(shopId),
                discount_is_active: true
            },
            unSelect: ['__v', 'discount_shopId'],
            model: discount
        })
        return discounts;
    }

    /*
     * Apply discount code
        products = [
            {
                productId,
                shopId,
                quantity,
                name,
                price
            },
            {
                productId,
                shopId,
                quantity,
                name,
                price
            }
        ]
     */
    static async getDiscountAmount({ codeId, userId, shopId, products }) {
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })

        console.log("fdsfs test TEST f")
        if (!foundDiscount) {
            throw new NotFoundError(`Discount doesn't exists!`);
        }

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_value,
            discount_start_date,
            discount_end_date,
            discount_max_uses_per_user,
            discount_type,
            discount_users_used
        } = foundDiscount

        if (!discount_is_active)  throw new NotFoundError(`Discount expired!`);

        if (!discount_max_uses)  throw new NotFoundError(`Discount are out!`);

        // if (new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)) {
        //     throw new NotFoundError(`Discount code has expired!`);
        // }

        // check xem cos et gia tri toi thieu hay khong
        let totalOrder = 0
        if (discount_min_order_value > 0) {
            // get total 
            totalOrder = products.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            },0)

            console.log("total order: " + totalOrder);
            console.log("discount min order value", + discount_min_order_value);
            if (totalOrder < discount_min_order_value) {
                throw new NotFoundError(`discount requries a minimum order value of ${discount_min_order_value}`);
            }
        }

        if (discount_max_uses_per_user > 0) {
            const userUsedDiscount = discount_users_used.find( user => user.userId === userId)
            if (userUsedDiscount) {
                //...
            }
        }

        // check xem discount nay la fixed_amount - 
        console.log("discount value: "+discount_value);
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({ shopId, codeId }) {
        const deleted = await discount.findOneAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongodb(shopId)
        })

        return deleted
    }

    static async cancelDiscountCode({ codeId, shopId, userId }) {
        const foundDiscount = await checkDiscountExists({
            model: discountModel,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongodb(shopId),
            }
        })

        if (!foundDiscount) {
            throw new NotFoundError(`Discount doesn't exists!`);
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id, {
            $pull: {
                discount_users_used: userId,

            },
            $in: {
                discount_max_uses: 1,
                discount_uses_count: -1,
            }
        })

        return result
    }

}

module.exports = DiscountService;