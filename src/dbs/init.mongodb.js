'use strict'

const mongoose = require('mongoose');
const {db: {host, port, name}} = require('../config/config.mongodb.js')

const connectString = `mongodb://${host}:${port}/${name}`;
//const connectString = `mongodb://127.0.0.1:27017/shopDEV`;
console.log('db: ' +connectString);
console.log('test: test');
const { countConnect } = require('../helpers/check.connect')



class Database {
    constructor() {
        this.connect();
    }

    // connect
    connect(type = 'mongodb') {
        if (1 === 1) {
            mongoose.set('debug', true)
            mongoose.set('debug', {color: true})
        }

        mongoose.connect(connectString, {
            //maxPoolSize: 50
        }).then( _ => {

            //console.log('connected MongoDB Success pro' , countConnect())
            console.log('connected MongoDB Success pro' )
            
        } )
        .catch( err => console.log(`Error Connect!`))
    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database()
        }

        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb