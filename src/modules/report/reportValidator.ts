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
        config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE,
        config.CONSTANT.HOME_TYPE.UNICORN,
        config.CONSTANT.HOME_TYPE.INSPIRATION,
        config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
    ]),
    reportOption: Joi.number().allow([
        config.CONSTANT.REPORT_MESSAGE.Explicit_photos.id,
        config.CONSTANT.REPORT_MESSAGE.Offensive_content.id,
        config.CONSTANT.REPORT_MESSAGE.Impostor_accounts.id,
        config.CONSTANT.REPORT_MESSAGE.Other.id,

        config.CONSTANT.REPORT_MESSAGE.FAKE_ACCOUNT.id,
        config.CONSTANT.REPORT_MESSAGE.FAKE_NAME.id,
        config.CONSTANT.REPORT_MESSAGE.POSTING_IN_APPROPRIATE_THINGS.id,
        config.CONSTANT.REPORT_MESSAGE.PretendingToBeSomeOne.id,
        config.CONSTANT.REPORT_MESSAGE.SOMETHING_ELSE.id,
    ],
    ),

}).unknown()

export {
    addReport,
};