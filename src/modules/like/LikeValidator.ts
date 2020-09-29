"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validateUserLike = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),
}).unknown()
let validateUserLikeList = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),
}).unknown()

let validateUserLikeParams = Joi.object({
    type: Joi.number().valid(Object.values(config.CONSTANT.HOME_TYPE)).required().description("1-unicorn, 2-inspiration, 3-daily advice, 4-general gratitude, 5-member of the day, 6-forum, 7-exports, 8-shoutout")
}).unknown()
export {
    validateUserLike,
    validateUserLikeList,
    validateUserLikeParams
};