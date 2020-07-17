"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getComments = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    isPostLater: Joi.boolean(),
    // imageUrl: Joi.string(),
    postedAt: Joi.date(),
    type: Joi.number().valid([
        config.CONSTANT.HOME_TYPE.UNICORN,
        config.CONSTANT.HOME_TYPE.INSPIRATION,
        config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
    ]).default(config.CONSTANT.HOME_TYPE.UNICORN),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO,
    ]).default(config.CONSTANT.MEDIA_TYPE.IMAGE),
    mediaUrl: Joi.string(),
    thumbnailUrl: Joi.string(),
}).unknown()

export {
    getComments

};