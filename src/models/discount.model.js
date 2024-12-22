'use strict';

const { model, Schema, Types } = require('mongoose');

const DOCUMENT_NAME = 'Discount'
const COLLECTION_NAME = 'discounts'

// Declare the Schema of the Mongo model
const discountSchema = new Schema({
    discount_name: { type: String, required: true},
    discount_description: { type: String, required: true},
    discount_type: { type: String, default: 'fixed_amount'},// percentage
    discount_value: { type: Number, required: true},
    discount_code: { type: String, required: true},
    discount_start_date: { type: Date, required: true}, // ngày bat dau
    discount_end_date: { type: Date, required: true}, // ngay ket thuc
    discount_max_uses: { type: Number, required: true}, // số discount đã sư dụng
    discount_uses_count: { type: Number, required: true}, // moi su dung tối đa bao nhieu
    discount_users_used: { type: Array, default: []}, // ai da su dung
    discount_max_uses_per_user: { type: Number, required: true}, // so luong cho phép tối đã được sử dụng mỗi user
    discount_min_order_value: { type: Number, required: true},
    discount_shopId: { type: Schema.Types.ObjectId, ref: 'Shop'},
    discount_is_active: { type: Boolean, default: true},
    discount_applies_to: { type: String, required: true, enum: ['all', 'specific']},
    discount_product_ids:{ type: Array, default: [] } // so san pham duoc ap dung

},  {
        timestamps: true,
        collection: COLLECTION_NAME
    
});

// Export the model
module.exports = model(DOCUMENT_NAME, discountSchema)