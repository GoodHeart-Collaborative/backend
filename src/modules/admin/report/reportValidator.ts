"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getReports = Joi.object({
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.FORUM_TOPIC,
    ]),
    postId: Joi.string().required().regex(config.CONSTANT.REGEX.MONGO_ID)
}).unknown()



export {
    getReports
};