"use strict";
import * as Joi from "joi";
import * as config from "@config/index";

let validateUserGratitudeJournal = Joi.object({
    startDate: Joi.string().required(),
    endDate: Joi.string().required()

}).unknown()

let validateAddGratitudeJournal = Joi.object({
    description: Joi.string().required(),
    privacy: Joi.string().valid([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]).default(config.CONSTANT.PRIVACY_STATUS.PRIVATE),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        // config.CONSTANT.MEDIA_TYPE.VIDEO,
        config.CONSTANT.MEDIA_TYPE.NONE,
    ]).default(config.CONSTANT.MEDIA_TYPE.IMAGE),
    mediaUrl: Joi.string().allow('').optional(),
    // thumbnailUrl: Joi.string().required(),
    postAt: Joi.string().required()
}).unknown()

let validateEditGratitudeJournal = Joi.object({
    description: Joi.string().optional(),
    privacy: Joi.string().valid([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]).optional(),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        // config.CONSTANT.MEDIA_TYPE.VIDEO,
        config.CONSTANT.MEDIA_TYPE.NONE,
    ]).optional(),
    mediaUrl: Joi.string().allow('').optional(),
    // thumbnailUrl: Joi.string().optional(),
    postAt: Joi.string().optional()
}).unknown()

export {
    validateUserGratitudeJournal,
    validateEditGratitudeJournal,
    validateAddGratitudeJournal
};