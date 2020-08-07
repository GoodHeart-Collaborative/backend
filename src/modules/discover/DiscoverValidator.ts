"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let validateAddDiscover = Joi.object({
    followerId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
}).unknown()

let validateEditDiscover = Joi.object({
    discover_status: Joi.number().valid([
        config.CONSTANT.DISCOVER_STATUS.PENDING,
        config.CONSTANT.DISCOVER_STATUS.ACCEPT,
        config.CONSTANT.DISCOVER_STATUS.REJECT
    ]).description("1-pending,  2-accept, 3-reject").optional()
}).unknown()
let validateEditDiscoverParams = Joi.object({
    discoverId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
}).unknown()
let validateListDiscover = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    searchKey: Joi.string().optional().description("Search by Name"),
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    distance: Joi.number().optional(),
}).unknown()

export {
    validateAddDiscover,
    validateEditDiscover,
    validateEditDiscoverParams,
    validateListDiscover
};