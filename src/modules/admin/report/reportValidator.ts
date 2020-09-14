"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getReports = Joi.object({
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
        config.CONSTANT.HOME_TYPE.EXPERTS_POST,
        config.CONSTANT.HOME_TYPE.USER,
    ]).required(),
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID),
    searchTerm: Joi.string(),
    fromDate: Joi.number(),
    toDate: Joi.number(),
    limit: Joi.number(),
    page: Joi.number()
}).unknown()


export {
    getReports
};