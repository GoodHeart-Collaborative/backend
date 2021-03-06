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
        config.CONSTANT.DISCOVER_STATUS.REJECT,
        config.CONSTANT.DISCOVER_STATUS.NO_ACTION
    ]).description("1-pending,  2-accept, 3-reject, 4-no_action").optional()
}).unknown()
let validateEditDiscoverParams = Joi.object({
    discoverId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
}).unknown()
let validateListUsers = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    searchKey: Joi.string().optional().description("Search by Name"),
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    distance: Joi.number().optional(),
    industryType: Joi.array().items(Joi.number().valid([
        config.INDUSTRIES.NONPROFIT,
        config.INDUSTRIES.EMERGENCY_SERVICES,
        config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
        config.INDUSTRIES.LAW_ENFORCEMENT,
        config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
    ])).optional()
        .description("1-Nonprofit, 2-Emergency services, 3- Social and community services, 4-Law enforcement, 5-Healthcare and community medical services"),
}).unknown()

let validateListDiscover = Joi.object({
    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    // searchKey: Joi.string().optional().description("Search by Name"),
    request_type: Joi.number().valid([
        config.CONSTANT.REQUEST_TYPE.RECEIVED_REQUEST,
        config.CONSTANT.REQUEST_TYPE.SEND_REQUEST
    ]).description("0-received request,  1-send request").required(),
    // industryType: Joi.array().items(Joi.number().valid([
    //     config.INDUSTRIES.NONPROFIT,
    //     config.INDUSTRIES.EMERGENCY_SERVICES,
    //     config.INDUSTRIES.SOCIAL_AND_COMMUNITY_SERVICES,
    //     config.INDUSTRIES.LAW_ENFORCEMENT,
    //     config.INDUSTRIES.HEALTHCARE_AND_COMMUNITY_MEDICAL_SERVICES
    // ])).optional()
    // .description("1-Nonprofit, 2-Emergency services, 3- Social and community services, 4-Law enforcement, 5-Healthcare and community medical services"),
}).unknown()


let otherUserIdDiscoverStatus = Joi.object({
    otherUserId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
}).unknown()

export {
    validateAddDiscover,
    validateEditDiscover,
    validateEditDiscoverParams,
    validateListDiscover,
    validateListUsers,
    otherUserIdDiscoverStatus
};