"use strict";
import * as Joi from "joi";
import * as config from "@config/index";
import { join } from "path";

// when mediaType =1 then in mediaUrl key you will give image url

// when mediaType =2 then in mediaUrl you will give video url and in thumbnailUrl you will give video thumbnail image url




let AddCategory = Joi.object({

    // name: Joi.string().lowercase().required(),
    title: Joi.string().required(),
    imageUrl: Joi.string().allow('')

})


let getCategory = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
    sortBy: Joi.string().valid('title', 'createdAt').default('createdAt'),
    searchTerm: Joi.string(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED
    ]),
    fromDate: Joi.date(),
    toDate: Joi.date()
})

let GetCategoryDetailsList = Joi.object({
    categoryId: Joi.string().required(),
    limit: Joi.number(),
    page: Joi.number(),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
    sortBy: Joi.string().valid('title', 'createdAt').default('createdAt'),
    searchTerm: Joi.string(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED
    ]),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    privacy: Joi.string().allow([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ])
}).unknown()

let GetCategoryId = Joi.object({
    categoryId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
})

let UpdateCategory = Joi.object({
    title: Joi.string().required(),
    imageUrl: Joi.string().allow('')
})


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
        'createdAt', 'title'
    ]),
    type: Joi.number().valid([
        config.CONSTANT.HOME_TYPE.UNICORN,
        config.CONSTANT.HOME_TYPE.INSPIRATION,
        config.CONSTANT.HOME_TYPE.DAILY_ADVICE,
    ]).default(config.CONSTANT.HOME_TYPE.UNICORN).required(),
    fromDate: Joi.number(),
    toDate: Joi.number(),
})

let updateStatus = Joi.object({
    categoryId: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED
    ]).required()
})

let updateHome = Joi.object({
    title: Joi.string(),
    description: Joi.string(),
    isPostLater: Joi.boolean(),
    // imageUrl: Joi.string(),
    postedAt: Joi.date(),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO,
    ]).default(config.CONSTANT.MEDIA_TYPE.IMAGE),
    mediaUrl: Joi.string().allow(''),
    thumbnailUrl: Joi.string().allow(''),
    // imageUrl: Joi.string()
})
let updateHomeId = Joi.object({
    Id: Joi.string().required()
})

export {
    // AddHome,
    getById,
    GetList,
    updateStatus,
    updateHome,
    updateHomeId,


    AddCategory,
    getCategory,
    GetCategoryId,
    UpdateCategory,
    GetCategoryDetailsList

};