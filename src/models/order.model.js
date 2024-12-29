'use strict';

const { model, Schema, Types} = require('mongoose');

const DOCUMENT_NAME = 'Order'
const COLLECTION_NAME = 'Orders'

// Declare the Schema of the Mongo model
const orderSchema = new Schema({
    order_userId: { type: Number, required: true},
    order_checkout: { type: Object, default: {}},
    /*
        order_checkout = {
            totalPrice,
            totalApplyDiscount,
            feeShip
        }
     */
    order_shipping: {type:Object, default: {}},
    /*
        street,
        city,
        state,
        country
     */
    order_payment: {type:Object, default: {}},
    order_product: {type:Object, required: true},
    order_trackingNumber: { type: String, default: '#0000118052022'}, // #00001DDMMYYYY
    order_status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'cancelled', 'delivered'],
        default: 'pending'}
    

}, {
        collection: COLLECTION_NAME,
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'modifiedOn'
        }
    
});

// Export the model
module.exports = model(DOCUMENT_NAME, orderSchema)