'use strict';

const {product, clothing, electronic} = require('../models/product.model');
const { BadRequestError} = require('../core/error.response');

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
        return await product.create({...this, _id: product_id});
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
}

// register product types
ProductFactory.registerProductType('Electronics', Electronics);
ProductFactory.registerProductType('Clothing', Clothing);

module.exports = ProductFactory;