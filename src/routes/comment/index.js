'use strict'

const express = require('express')
const commentController = require('../../controller/comment.controller')
const router = express.Router()
const asyncHandler = require('../../helpers/asyncHandler');
const { authenticationV2 } = require('../../auth/authUtils')



// authentication
router.use(authenticationV2);
router.post('',  asyncHandler(commentController.createComment))
router.get('',  asyncHandler(commentController.getCommentByParentId))


// query


module.exports = router