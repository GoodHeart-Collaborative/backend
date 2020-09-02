"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getReports = Joi.object({
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
        config.CONSTANT.HOME_TYPE.EXPERTS_POST,
    ]).required(),
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID)
}).unknown()



export {
    getReports
};