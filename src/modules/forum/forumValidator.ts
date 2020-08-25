"use strict";
import * as Joi from "joi";
import * as config from "@config/index";



let addForum = Joi.object({
    categoryId: Joi.string().required(),
    // categoryName: Joi.string().optional(), // only for searching
    // userId: Joi.string().required(),
    // userType: Joi.string().required().allow([
    //     config.CONSTANT.ACCOUNT_LEVEL.USER
    // ]),
    // topic: Joi.string().optional(),
    mediaUrl: Joi.string(),
    description: Joi.string().optional(),
    thumbnailUrl: Joi.string(),
    mediaType: Joi.number().allow([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO
    ]).required(),
    postAnonymous: Joi.boolean().default(false),
}).unknown();

let getForum = Joi.object({
    // categoryId: Joi.string().optional(),
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID),
    searchTerm: Joi.string(),
    limit: Joi.number(),
    page: Joi.number(),
})
let updateForum = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    categoryId: Joi.string().optional(),
    // topic: Joi.string().optional(),
    mediaUrl: Joi.string().optional(),
    mediaType: Joi.number().allow([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO,
    ]).required(),
    thumbnailUrl: Joi.string().allow(''),
    description: Joi.string().optional(),
    postAnonymous: Joi.boolean().optional(),
}).unknown()

let updateForumStatus = Joi.object({
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ])
})
export {
    addForum,
    updateForum,
    getForum,
    updateForumStatus
};