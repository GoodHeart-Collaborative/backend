"use strict";
import * as Joi from "joi";
import * as config from "@config/index";
let validateUserComment = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),
    comment: Joi.string().trim().required()
}).unknown()
let validateUserCommentParams = Joi.object({
    type: Joi.number().valid(Object.values(config.CONSTANT.COMMENT_TYPE)).required().description("1-member of the day, 2-unicorn, 3-inspiration, 4-daily advice, 5-general gratitude")
}).unknown()
export {
    validateUserComment,
    validateUserCommentParams
};