'use strict';

const {product, electronic, clothing, furniture} = require('../../models/product.model');

const findAllDraftsForShop = async( {query, limit, skip} ) => {
    return await product.find( query ).
    // ppopulate : name email cua tk shop, id thi bỏ ra
    populate('product_shop', 'name email -_id')
    .sort({ updateAt: -1})
    .skip(skip)
    .limit(limit)
    .lean()
    .exec();
}

module.exports= {
    findAllDraftsForShop
}
