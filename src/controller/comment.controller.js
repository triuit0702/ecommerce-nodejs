'use strict';

const {
    createComment,
    deleteComment,
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

    deleteComment = async (req, res, next) => {
        console.log('delete comment success');
        new SuccessResponse({
            message: 'delete comment success',
            metadata: await deleteComment(req.body)
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