'use strict';

const InventoryService = require('../service/inventory.service');
const {SuccessResponse} = require('../core/success.response')

class InventoryController {

    addStockToInventory = async (req, res, next) => {
        new SuccessResponse({
            message: 'create new cart addStockToInventory',
            metadata: await InventoryService.addStockToInventory(req.body)
        }).send(res);
    }

}

module.exports = new InventoryController();