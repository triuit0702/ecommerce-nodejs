'use strict';

const _ = require('lodash');
const {Types, mongoose} = require('mongoose');

//const convertToObjectIdMongodb = id => Types.Object(id)
const convertToObjectIdMongodb = id => new  mongoose.Types.ObjectId(id)

const getInfoData = ({ fields = [], object = {} }) => {
    return _.pick( object, fields )
}

// ['a', 'b']  => {a: 1, b:1}
const getSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el,1]))
}

// ['a', 'b']  => {a: 0, b:0} => co nghia là nó không lấy ra
const unGetSelectData = (select = []) => {
    return Object.fromEntries(select.map(el => [el,0]))
}

const removeUndefinedObject = obj => {
    Object.keys(obj).forEach( k => {
        if (obj[k] === null) {
            delete obj[k];
        }
    } )

    return obj;
}

/*
    const a = {
        c: {
            d:1
        }
    }
    =>
    db.collection.updateOne({
        'c.d': 1
    })
*/ 
const updateNestedObjectParser = obj => {
    console.log(`[1]::`, obj);
    const final = {}
    Object.keys(obj).forEach( k => {
        if ( typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
            const response = updateNestedObjectParser(obj[k])
            Object.keys(response).forEach(a => {
                final[`${k}.${a}`] = response[a]
            })
        } else {
            final[k] = obj[k]
        }
    })
    console.log(`[2]::`, final);
    return final;
}

module.exports = {
    getInfoData,
    getSelectData,
    unGetSelectData,
    removeUndefinedObject,
    updateNestedObjectParser,
    convertToObjectIdMongodb
}