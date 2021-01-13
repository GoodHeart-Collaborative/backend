"use strict";
import * as Joi from "joi";
import * as config from "@config/index";
import { join } from "path";

// when mediaType =1 then in mediaUrl key you will give image url

// when mediaType =2 then in mediaUrl you will give video url and in thumbnailUrl you will give video thumbnail image url


let AddHome = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    isPostLater: Joi.boolean(),
    // imageUrl: Joi.string(),
    postedAt: Joi.number(),
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
    addedBy: Joi.string().required()
}).unknown()


let getById = Joi.object({
    Id: Joi.string().optional(), // 
})

let GetList = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    searchTerm: Joi.string(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]),
    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
    sortBy: Joi.string().valid([
        'createdAt', 'title', 'description'
    ]),
    type: Joi.number().valid([
        config.CONSTANT.HOME_TYPE.UNICORN,
        config.CONSTANT.HOME_TYPE.INSPIRATION,
        config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
    ]).default(config.CONSTANT.HOME_TYPE.UNICORN).required(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
})

let updateStatus = Joi.object({
    Id: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.DELETED,
        config.CONSTANT.STATUS.BLOCKED
    ])
})

let updateHome = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    isPostLater: Joi.boolean(),
    // imageUrl: Joi.string(),
    postedAt: Joi.number(),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO,
    ]).default(config.CONSTANT.MEDIA_TYPE.IMAGE),
    mediaUrl: Joi.string().allow(''),
    thumbnailUrl: Joi.string().allow(''),
    addedBy: Joi.string()
    // {
    //     name: Joi.string().allow(''),
    //     profilePicture: Joi.string().allow('')
    // }
    // imageUrl: Joi.string()
})
let updateHomeId = Joi.object({
    Id: Joi.string().required()
})

export {
    AddHome,
    getById,
    GetList,
    updateStatus,
    updateHome,
    updateHomeId,

};