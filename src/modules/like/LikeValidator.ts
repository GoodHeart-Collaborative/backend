"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validateUserLike = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),
    // type: Joi.number().valid(Object.values(config.CONSTANT.COMMENT_TYPE)).required().value("1-member of the day, 2-unicorn, 3-inspiration, 4-daily advice, 5-general gratitude")
    // type: Joi.number().valid([
    //     config.CONSTANT.COMMENT_TYPE.MEMBER_OF_DAY,
    //     config.CONSTANT.COMMENT_TYPE.UNICORN,
    //     config.CONSTANT.COMMENT_TYPE.INSPIRATION,
    //     config.CONSTANT.COMMENT_TYPE.DAILY_ADVICE,
    //     config.CONSTANT.COMMENT_TYPE.GENERAL_GRATITUDE
    // ]).("1-member of the day, 2-unicorn, 3-inspiration, 4-daily advice, 5-general gratitude").required()
}).unknown()

let validateUserLikeParams = Joi.object({
    type: Joi.number().valid(Object.values(config.CONSTANT.COMMENT_TYPE)).required().description("1-member of the day, 2-unicorn, 3-inspiration, 4-daily advice, 5-general gratitude")
    // type: Joi.number().valid([
    //     config.CONSTANT.COMMENT_TYPE.MEMBER_OF_DAY,
    //     config.CONSTANT.COMMENT_TYPE.UNICORN,
    //     config.CONSTANT.COMMENT_TYPE.INSPIRATION,
    //     config.CONSTANT.COMMENT_TYPE.DAILY_ADVICE,
    //     config.CONSTANT.COMMENT_TYPE.GENERAL_GRATITUDE
    // ]).("1-member of the day, 2-unicorn, 3-inspiration, 4-daily advice, 5-general gratitude").required()
}).unknown()
export {
    validateUserLike,
    validateUserLikeParams
};