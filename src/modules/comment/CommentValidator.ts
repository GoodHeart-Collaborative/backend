"use strict";
import * as Joi from "joi";
import * as config from "@config/index";
let validateUserComment = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),
    comment: Joi.string().trim().required()
}).unknown()
let validateUserCommentParams = Joi.object({
    type: Joi.number().valid(Object.values(config.CONSTANT.HOME_TYPE)).required().description("1-unicorn, 2-inspiration, 3-daily advice, 4-general gratitude, 5-member of the day, 6-forum, 7-exports, 8-shoutout , 9-forum topic")
}).unknown()
let validateUserCommentList = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.CONGRATS,
        config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
        config.CONSTANT.HOME_TYPE.EXPERTS_POST,
        config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
        config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE,
        config.CONSTANT.HOME_TYPE.INSPIRATION,
        config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY,
        config.CONSTANT.HOME_TYPE.UNICORN,
    ])
}).unknown()
export {
    validateUserComment,
    validateUserCommentList,
    validateUserCommentParams
};