"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let addReport = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    reason: Joi.string().required(),
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
        config.CONSTANT.HOME_TYPE.EXPERTS_POST,
        config.CONSTANT.HOME_TYPE.USER,
    ]),
    reportOption: Joi.number().allow([
        config.CONSTANT.REPORT_MESSAGE.Explicit_photos.id,
        config.CONSTANT.REPORT_MESSAGE.Offensive_content.id,
        config.CONSTANT.REPORT_MESSAGE.Impostor_accounts.id,
        config.CONSTANT.REPORT_MESSAGE.Other.id,
        config.CONSTANT.REPORT_MESSAGE.Sexual_reason.id,
        config.CONSTANT.REPORT_MESSAGE.is_Posting_Things_That_Violate_TOS.id,
        config.CONSTANT.REPORT_MESSAGE.trying_to_coax_kids_into_bad_stuff.id

    ],
    ),

}).unknown()

export {
    addReport,
};