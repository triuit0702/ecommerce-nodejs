'use strict';

const { model, Schema, Types} = require('mongoose');

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Cart'

// Declare the Schema of the Mongo model
const cartSchema = new Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active'
    },
    /*
        [
            {
                productId,
                shopId,
                quantity,
                name,
                price
            }
        ]
     */
    cart_products: {
        type: Array,
        required: true,
        default: []
    },
    cart_count_product: {
        type: Number,
        default: 0
    },
    cart_userId: {
        type: Number,
        required: true
    }

}, {
        collection: COLLECTION_NAME,
        timestamps: {
            createdAt: 'createdOn',
            updatedAt: 'modifiedOn'
        }
    
});

// Export the model
module.exports = model(DOCUMENT_NAME, cartSchema)