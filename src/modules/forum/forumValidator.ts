"use strict";
import * as Joi from "joi";
import * as config from "@config/index";



let addForum = Joi.object({
    categoryId: Joi.string().required(),
    mediaUrl: Joi.string(),
    description: Joi.string().optional(),
    thumbnailUrl: Joi.string().allow(""),
    mediaType: Joi.number().allow([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO
    ]).required(),
    postAnonymous: Joi.boolean().default(false),
}).unknown();

let getForum = Joi.object({
    categoryId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID),
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID),
    searchTerm: Joi.string(),
    limit: Joi.number(),
    page: Joi.number(),
})
let updateForum = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    categoryId: Joi.string().required(),
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

let deleteForum = Joi.object({
    postId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required()
})

export {
    addForum,
    updateForum,
    getForum,
    deleteForum,
    updateForumStatus
};