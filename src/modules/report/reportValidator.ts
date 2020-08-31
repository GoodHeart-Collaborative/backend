"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let addReport = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    message: Joi.string().required(),
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.FORUM_TOPIC
    ]),
    prefilledComment: Joi.number().allow([
        config.CONSTANT.REPORT_MESSAGE.Explicit_photos.id,
        config.CONSTANT.REPORT_MESSAGE.Offensive_content.id,
        config.CONSTANT.REPORT_MESSAGE.Impostor_accounts.id,
        config.CONSTANT.REPORT_MESSAGE.Other.id,
    ]), requierd: true

}).unknown()

export {
    addReport,
};