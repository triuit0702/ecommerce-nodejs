'use strict';

const { convertToObjectIdMongodb } = require('../../utils');
const { inventory }= require('../inventory.model')

const insertInventory = async({
    productId, shopId, stock, location = 'unKnow'
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })
}

const reservationInventory = async ({ productId, quantity, cartId }) => {
    const query = {
        inven_productId: convertToObjectIdMongodb(productId),
        inven_stock: { $gte: quantity } // query lớn hơn hoặc bằng số lượng người ta mua
    }, updateSet = {
        $inc: { // increment : giảm tồn kho
            inven_stock: -quantity
        },
        $push: { // đưa info người dùng đặt vô
            inven_reservation: {
                quantity,
                cartId,
                createOn: new Date()
            }
        }
    }, options = { upsert: true, new: true}

    return await inventory.updateOne(query, updateSet)
}

module.exports = {
    insertInventory
}