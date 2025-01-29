'use strict';

const {product, clothing, electronic} = require('../models/product.model');
const { BadRequestError} = require('../core/error.response');
const {
    findAllDraftsForShop, 
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
    
} = require('../models/repositories/product.repo.js'); 
const { removeUndefinedObject, updateNestedObjectParser } = require('../utils/index.js');
const { insertInventory } = require('../models/repositories/inventory.repo.js');
const { pushNotiToSystem } = require('./notification.service.js');

class ProductFactory {

    static productRegistry = {}
    static registerProductType(type, classRef) {
        ProductFactory.productRegistry[type] = classRef;
    }


    static async createProduct(type, payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid product types: ${type}`);
        return new productClass(payload).createProduct();
    }

    static async updateProduct(type, productId,payload) {
        const productClass = ProductFactory.productRegistry[type];
        if (!productClass) throw new BadRequestError(`Invalid product types: ${type}`);
        return new productClass(payload).updateProduct(productId);

    }

    // PUT
    static async publishProductByShop( {product_shop, product_id} ) {
        return await publishProductByShop({product_shop, product_id})

    }

    static async unPublishProductByShop( {product_shop, product_id} ) {
        return await unPublishProductByShop({product_shop, product_id})

    }

    // query 
    static async findAllDraftsForShop( {product_shop, limit=50, skip=0} ) {
        const query = { product_shop, isDraft: true}
        return await findAllDraftsForShop({ query, limit, skip})
    }

    static async findAllPublishForShop( {product_shop, limit=50, skip=0} ) {
        console.log('product_shop: ' ,product_shop);
        const query = { product_shop, isPublished: true}
        return await findAllPublishForShop({ query, limit, skip})
    }

    static async getListSearchProduct ( {keySearch} ) {
        return await searchProductByUser({keySearch});
    }

    static async findAllProducts ( { limit=50, sort='ctime', page=1, filter={isPublished: true} } ) {
        return await findAllProducts({limit, page, sort,filter, 
            select: ['product_name', 'product_price', 'product_thumb' ,'product_shop']
        });
    }

    static async findProduct ( {product_id} ) {
        return await findProduct({product_id, 
            unSelect: ['__v', 'product_variations']
        });
    }
}

class Product {
    constructor({
        product_name, product_thumb, product_description, product_price, 
        product_type, product_shop , product_attributes, product_quantity
    }) {
        this.product_name = product_name;
        this.product_thumb = product_thumb;
        this.product_description = product_description;
        this.product_price = product_price;
        this.product_type = product_type;
        this.product_shop = product_shop;
        this.product_attributes = product_attributes;
        this.product_quantity = product_quantity;
    }

    // create new product
    async createProduct(product_id) {
        const newProduct = await product.create({...this, _id: product_id});
        if (newProduct) {
            // add product_stock in inventory collection
            const invenData = await insertInventory({
                productId: newProduct._id,
                shopId: this.product_shop,
                stock: this.product_quantity
            });

            // push noti to system collection when tạo product thành công
            pushNotiToSystem({
                type: 'SHOP-001',
                receivedId:1,
                senderId: this.product_shop,
                options: {
                    product_name: this.product_name,
                    shope_name: this.product_shop
                }
            }).then(rs => console.log(rs))
            .catch(console.error)
            console.log(`invenData:: `, invenData)
        }
        return newProduct;
    }

    // update product
    async updateProduct(productId, bodyUpdate) {
        return await updateProductById( {productId, bodyUpdate, model: product} );
    }
}

// Define sub-class for different product types clothing
class Clothing extends Product {
    async createProduct() {
        const newClosthing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        });
        if(!newClosthing) throw new BadRequestError('create new clothing error');

        const newProduct = await super.createProduct(newClosthing._id);
        if(!newProduct) throw new BadRequestError('create new product error');

        return newProduct;
    }

    async updateProduct( productId ) {
        // 1. remove attr has null undefined
        const objectParams = this;
        // 2. check xem update cho nao
        if(objectPrams.product_attributes) {
            // update child
            updateProductById( {productId, objectParams, model: clothing} );
        }

        const updateProduct = await super.updateProduct(productId, objectParams)
        return updateProduct;
    }
}

class Electronics extends Product {
    async createProduct() {
        
        const newElectronics = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })

        if(!newElectronics) throw new BadRequestError('create new electronics error');

        //  id of electronic is id of product
        const newProduct = await super.createProduct(newElectronics._id);
        if(!newProduct) throw new BadRequestError('create new product error');

        return newProduct;
    }

    async updateProduct( productId ) {
        // 1. remove attr has null undefined
        const objectParams = removeUndefinedObject(this);
        // 2. check xem update cho nao
        if(objectParams.product_attributes) {
            // update child
            updateProductById( {
                productId, 
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), 
                model: electronic
            } );
        }

        const updateProduct = await super.updateProduct(productId, updateNestedObjectParser(objectParams))
        return updateProduct;
    }
}

// register product types
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);

module.exports = ProductFactory;