"use strict";
import * as Joi from "joi";
import * as config from "@config/index";



let addForum = Joi.object({
    categoryId: Joi.string().required(),
    categoryName: Joi.string(), // only for searching
    // userId: Joi.string().required(),
    userType: Joi.string().required().allow([
        config.CONSTANT.ACCOUNT_LEVEL.ADMIN
    ]),
    topic: Joi.string().optional().description('optional'),
    mediaUrl: Joi.string(),
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
    categoryName: Joi.string(), // only for searching
    // userId: Joi.string().required(),
    userType: Joi.string().required().allow([
        config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
        config.CONSTANT.ACCOUNT_LEVEL.USER
    ]),
    topic: Joi.string().optional().description('optional'),
    mediaUrl: Joi.string(),
    description: Joi.string().required(),
    postAnonymous: Joi.boolean().default(false),
}).unknown()

let getFeed = Joi.object({
    searchTerm: Joi.string(),
    limit: Joi.number().required(),
    page: Joi.number().required(),
    type: Joi.string().allow([
        config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE,
        config.CONSTANT.HOME_TYPE.SHOUTOUT,
        // config.CONSTANT.HOME_TYPES.        
    ]),
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
    ]),
    sortBy: Joi.string().allow([
        'createdAt'
    ]),
    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
    fromDate: Joi.date(),
    toDate: Joi.date(),
    privacy: Joi.string().allow([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ])
}).unknown()

let feedPostId = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()

}).unknown()

let updateFeedStatus = Joi.object({
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED
    ]),
    type: Joi.number().allow([
        config.CONSTANT.HOME_TYPE.GENERAL_GRATITUDE,
        config.CONSTANT.HOME_TYPE.SHOUTOUT,
    ]).required(),
})


export {
    getFeed,
    feedPostId,
    updateFeedStatus
};