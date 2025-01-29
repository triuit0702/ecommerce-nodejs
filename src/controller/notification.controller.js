'use strict';

const {
    listNotiByUser
} = require('../service/notification.service')

const {SuccessResponse} = require('../core/success.response')

class NotificationController {

    listNotiByUser = async (req, res, next) => {
        new SuccessResponse({
            message: 'list noti success',
            metadata: await listNotiByUser(req.query)
        }).send(res)
    }

}

module.exports = new NotificationController()