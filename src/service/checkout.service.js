'use strict';

const {
    BadRequestError,
    NotFoundError
} = require('../core/error.response')

const { findCartById } = require("../models/repositories/cart.repo");
const { checkProductByServer } = require('../models/repositories/product.repo');
const {getDiscountAmount} = require('./discount.service');
const { acquireLock, releaselock } = require('./redis.service');
const order = require('../models/order.model');

class CheckoutService {

    // login and without login

    /*
        {
            cartId,
            userId,
            shop_order_ids [
                {
                     shopId,
                     shop_discount: [].
                     item_products: [
                        price,
                        quantity,
                        productId
                     ]
                }
            ]
        }
    */
    static async checkoutReview({
        cartId, userId, shop_order_ids
    }) {
        // check carId ton tai khong ?
        const foundCart = await findCartById(cartId)
        if (!foundCart) {
            throw new BadRequestError('Cart does not exists!')
        }

        const checkout_order = {
            totalPrice: 0, // ton tien hang
            feeShip: 0, // phi van chuyen
            totalDiscount: 0, // tong tien discount giam gia
            totalCheckout: 0 // tong thanh toan


        }, shop_order_ids_new = []

        // tinh tong tien bill
        for (let i = 0; i < shop_order_ids.length; i++) {
            const { shopId, shop_discounts = [], item_products = [] } = shop_order_ids[i]
            // check product available
            const checkProductServer = await checkProductByServer(item_products)
            console.log('checkProductServer: ', checkProductServer)
            if(!checkProductServer[0])  throw new BadRequestError('order wrong!')

            // tong tien don hang
            const checkoutPrice = checkProductServer.reduce((acc, product) => {
                return acc + (product.quantity * product.price)
            }, 0)

            // tong tien truoc khi xu ly
            checkout_order.totalPrice =+ checkoutPrice
            console.log("checkout price: " +checkoutPrice);

            const itemCheckout = {
                shopId,
                shop_discounts,
                priceRaw: checkoutPrice, // tien truoc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer

            }

            // NEU shop_discounts ton tai > 0 check xem co hop le hay khong ?
            if (shop_discounts.length > 0) {
                // gia su chi co mot discount
                // get amount discount
                const { toltalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shop_discounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // tong cong discount giam gia
                checkout_order.totalDiscount += discount
                // ney tien giam gia lon hon 0
                if (discount > 0) {
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }
            }

            // tong thanh toan cuoi cung
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)

        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    }

    // order
    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }) {
        const {shop_order_ids_new, checkout_order} = await CheckoutService.checkoutReview({
            cartId, 
            userId, 
            shop_order_ids
        })

        // check lai mot lan nữa xem vượt tồn kho hay khong ?
        // get new array products
        const produts = shop_order_ids_new.flatMap( order => order.item_products);
        console.log(`[1]: `, products)
        const acquireProduct = []
        for ( let i = 0; i < products.length; i++) {
            const { productId, quantity } = products[i];
            const keyLock = await acquireLock(productId, quantity, cartId);
            acquireProduct.push(keyLock ? true : false);
            if (keyLock) {
                await releaselock(keyLock)
            }
        }

        // check if có một sản phẩm hết hàng trong kho
        if (acquireLock.includes(false)) {
            throw new BadRequestError('Mot so san pham da duoc cap nhat, vui long quay lai giao hang...')

        }

        const newOrder = await order.create({
            order_userId: userId,
            order_checkout: orderCheckout,
            order_shipping: user_address,
            order_payment: user_payment,
            order_products: shop_order_ids_new

        });

        // truong hop: nếu insert thành công thì remove product có trong cart
        if (newOrder) {
            // remove product in cart
        }
        return newOrder;
    }

    /*
        1. Query orders [user]

    */
   static async getOrdersByUser() {

   }

   /*
        1. Query order Using Id [user]

    */
    static async getOneOrderByUser() {
    
    }

    /*
     1. cancel order [user]

    */
     static async cancelOrderByUSer() {
    
    }

    /*
    1. update order status [ shop | admin]

    */
    static async updateOrderStatusByShop() {
    
    }
}

module.exports = CheckoutService;