"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let validaExpertPostAdd = Joi.object({
    expertId: Joi.string(),
    topic: Joi.string().required(),
    categoryId: Joi.string(),
    price: Joi.number(),
    contentId: Joi.number().default(config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE)
        .valid([
            Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
        ]),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO
    ]),
    description: Joi.string(),
    mediaUrl: Joi.string(),
    thumbnailUrl: Joi.string(),
    privacy: Joi.string().valid([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC)
}).unknown()


let getExpertPosts = Joi.object({
    expertId: Joi.string().required(),
    categoryId: Joi.string(),
    contentId: Joi.number()
        .valid([
            Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
        ]),
    privacy: Joi.string().valid([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC),
    limit: Joi.number(),
    page: Joi.number(),
    searchTerm: Joi.string(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    sortBy: Joi.string().valid([
        'createdAt', 'topic'
    ]),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
}).unknown()


let exprtPostId = Joi.object({
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
}).unknown()


let adminUpdateExpertPost = Joi.object({
    categoryId: Joi.string(),
    topic: Joi.string().allow(''),
    price: Joi.number(),
    contentId: Joi.number().default(config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE)
        .valid([
            Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
        ]),
    mediaType: Joi.number().valid([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO
    ]),
    description: Joi.string(),
    mediaUrl: Joi.string(),
    thumbnailUrl: Joi.string(),
    privacy: Joi.string().valid([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC)
}).unknown()


let updateStatus = Joi.object({
    postId: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ])
}).unknown()


export {
    validaExpertPostAdd,
    getExpertPosts,
    exprtPostId,
    adminUpdateExpertPost,
    updateStatus
};