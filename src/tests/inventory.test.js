const redisPubsubService = require('../service/redisPubsub.service');

class InventoryServiceTest {

    constructor() {
        redisPubsubService.subscribe('purchase-events', (channel, message) => {
            console.log(`Received message from channel ${channel}: ${message}`);
            InventoryServiceTest.updateInventory(channel);
        })
    }

    static updateInventory({productId, quantity}) {
        console.log(`Updated inventory ${productId} with quantity ${quantity}`)

    }
}

module.exports = new InventoryServiceTest();