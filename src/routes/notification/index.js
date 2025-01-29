'use strict'

const express = require('express')
const NotificationController = require('../../controller/notification.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils')

// Here not login

// authentication
router.use(authenticationV2);

//////////////

router.get('',  asyncHandler(NotificationController.listNotiByUser))


// query


module.exports = router