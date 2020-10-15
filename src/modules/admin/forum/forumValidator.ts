"use strict";
import * as Joi from "joi";
import * as config from "@config/index";



let addForum = Joi.object({
    categoryId: Joi.string().required(),
    // userId: Joi.string().required(),
    // topic: Joi.string().optional().description('optional'),
    mediaUrl: Joi.string(),
    mediaType: Joi.number().allow([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO,
        config.CONSTANT.MEDIA_TYPE.NONE,
    ]).default(config.CONSTANT.MEDIA_TYPE.NONE),
    thumbnailUrl: Joi.string(),
    description: Joi.string().required(),
    postAnonymous: Joi.boolean().default(false),
}).unknown()


let getForum = Joi.object({
    searchTerm: Joi.string(),
    limit: Joi.number().required(),
    page: Joi.number().required(),
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
    ]),
    sortBy: Joi.string().allow([
        'createdAt'
    ]),
    userId: Joi.string(),
    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
    fromDate: Joi.date(),
    toDate: Joi.date(),
    categoryId: Joi.string()

})

let updateForumStatus = Joi.object({
    postId: Joi.string(),
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.DELETED,
        config.CONSTANT.STATUS.BLOCKED,
    ])
})

let forumId = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
}).unknown()

let forumDetail = Joi.object({
    userType: Joi.string().allow([
        config.CONSTANT.ACCOUNT_LEVEL.USER,
        config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
    ]).required()
}).unknown()


let updateForum = Joi.object({
    categoryId: Joi.string().required(),
    // userId: Joi.string().required(),
    userType: Joi.string().required().allow([
        config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
        config.CONSTANT.ACCOUNT_LEVEL.USER
    ]),
    mediaUrl: Joi.string().allow(''),
    mediaType: Joi.number().allow([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO,
        config.CONSTANT.MEDIA_TYPE.NONE,
    ]),
    thumbnailUrl: Joi.string().allow(''),
    topic: Joi.string().optional().description('optional'),
    description: Joi.string().required(),
    postAnonymous: Joi.boolean().default(false),
}).unknown()


export {
    addForum,
    getForum,
    updateForumStatus,
    updateForum,
    forumId,
    forumDetail
};