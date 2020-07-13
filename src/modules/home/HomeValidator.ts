"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validateUserHome = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ])
}).unknown()

export {
    validateUserHome
};