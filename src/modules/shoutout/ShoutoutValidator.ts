"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let validateAddShoutout = Joi.object({
    description: Joi.string().required(),
    title: Joi.string().required(),
    members: Joi.array().items(Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID)).required()
}).unknown()

let validateListShoutout = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required()
}).unknown()

export {
    validateAddShoutout,
    validateListShoutout
};