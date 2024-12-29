// service tạo những lô hàng nhập hàng
// khi chuan bị hết hàng cho lô hàng nay thì sẽ dùng service này tạo lô hàng mới để nhập vào

'use strict';

const { BadRequestError } = require('../core/error.response');
const {inventory} = require('../models/inventory.model');
const { getProductById } = require('../models/repositories/product.repo');

class InventoryService {
    static async addStockToInventory( {
        stock,
        productId,
        shopId,
        location = '134, Tran Phu, HCM City'
    } ) {
        const product = await getProductById(productId)
        if (!product) {
            throw new BadRequestError('The Product does not exists!');
        }

        const query = { inven_shopId: shopId, inven_productId: productId},
        updateSet = {
            $inc : {
                inven_stock: stock
            },
            $set: {
                inven_location: location
            }
        }, options = {upsert: true, new: true}

        return await inventory.findOneAndUpdate(query, updateSet, options);
    }
}