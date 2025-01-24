const redisPubsubService = require('../service/redisPubsub.service');

class ProductServiceTest {
    purchaseProduct( productId, quantity) {
        const order = {
            productId,
            quantity
        }

        console.log("purchaseProduct start");
        redisPubsubService.publish('purchase-events', JSON.stringify(order));
    }
}

module.exports = new ProductServiceTest();