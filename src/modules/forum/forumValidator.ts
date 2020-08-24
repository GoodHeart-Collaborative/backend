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
    description: Joi.string().required(),
    thumbnailUrl: Joi.string(),
    medianType: Joi.string().allow([
        config.CONSTANT.MEDIA_TYPE.IMAGE,
        config.CONSTANT.MEDIA_TYPE.VIDEO
    ]),

    postAnonymous: Joi.boolean().default(false),
}).unknown();

let getForum = Joi.object({
    // categoryId: Joi.string().optional(),
    searchTerm: Joi.string(),
    limit: Joi.number().required(),
    page: Joi.number().required(),
})
let updateForum = Joi.object({
    postId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    categoryId: Joi.string().optional(),
    topic: Joi.string().optional(),
    mediaUrl: Joi.string().optional(),
    description: Joi.string().optional(),
    postAnonymous: Joi.boolean().optional(),
}).unknown()


export {
    addForum,
    updateForum,
    getForum
};