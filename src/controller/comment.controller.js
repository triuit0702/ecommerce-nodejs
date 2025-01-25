'use strict';

const {
    createComment,
    getCommentsByParentId
} = require('../service/comment.service')

const {SuccessResponse} = require('../core/success.response')

class CommentController {
    createComment = async (req, res, next) => {
        console.log('createComment controller');
        new SuccessResponse({
            message: 'Create new comment success',
            metadata: await createComment(req.body)
        }).send(res)
    }

    getCommentByParentId = async (req, res, next) => {
        new SuccessResponse({
            message: 'get list comment success',
            metadata: await getCommentsByParentId(req.query)
        }).send(res)
    }
}

module.exports = new CommentController()