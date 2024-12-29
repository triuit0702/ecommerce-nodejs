'use strict';

const redis = require('redis');``
const { promisify } = require('util');
const { getProductById } = require('../models/repositories/product.repo');
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.PEXPIRE).bind(redisClient);
const setnxAsync = promisify(redisClient.SETNX).bind(redisClient)


// khi một người đang thanh toán thì giữ lại ko cho người khác thanh toán
// nếu người khác vào thì sẽ thử 10 lần
const acquireLock = async (productId, quantity, cardId) => {
    const key = `lock_v2023_${productId}`
    const retryTimes = 10;
    const expireTime = 3000; // 3 seconds tạm  lock

    for (let index = 0; index < retryTimes; index++) {
        // tao mot key, thang nào nắm giữ được vào thanh toán
        const result = await setnxAsync(key, expireTime)
        console.log(`result:::`, result)
        if (result === 1) {
            // thao tác với inventory
            const isReservation = await reservationInventory({
                productId, quantity, cardId
            })
            if (isReservation.modifiedCount) {
                // khoá này sẽ hết hạn trong 3 seconds
                await pexpire(key, expireTime)
                return key;
            }
            return null;
        } else {
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
    }
}

const releaselock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}

module.exports = {
    acquireLock,
    releaselock
}