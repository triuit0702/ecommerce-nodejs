require('dotenv').config({path:'src/.env'})

const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');
const morgan = require('morgan');
const app = express();

//console.log(`Process:: `, process.env);
// init middlewares
app.use(morgan("dev"))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
 
}))
// morgan("combined")
// morgan("common")
// morgan("short")
// morgan("tiny")
// morgan("dev")


// init db
require('./dbs/init.mongodb')
//require('./dbs/init.mongodb.lv0')


// const { checkOverload } = require('./helpers/check.connect')
// checkOverload()

// init route
// app.get('/', ( req, res, next) => {
//     const strCompress = 'Hello fan 2024'
//     return res.status(200).json({
//         message: 'Welcome fan js!',
//         metadata: strCompress.repeat(10000)
//     })
// })
app.use('',require('./routes'))

// handling errors
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})


module.exports = app
