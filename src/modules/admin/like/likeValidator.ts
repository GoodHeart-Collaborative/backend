"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getLikes = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    commentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).optional(),

}).unknown()

export {
    getLikes
};