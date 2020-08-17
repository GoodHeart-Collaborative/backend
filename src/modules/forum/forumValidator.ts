"use strict";
import * as Joi from "joi";
import * as config from "@config/index";



let addForum = Joi.object({
    categoryId: Joi.string().required(),
    categoryName: Joi.string().optional(), // only for searching
    userId: Joi.string().required(),
    userType: Joi.string().required().allow([
        config.CONSTANT.ACCOUNT_LEVEL.USER
    ]),
    topic: Joi.string().optional(),
    mediaUrl: Joi.string(),
    description: Joi.string().required(),
    postAnonymous: Joi.boolean().default(false),
}).unknown()

let getForum = Joi.object({
    searchTerm: Joi.string(),
    limit: Joi.number().required(),
    page: Joi.number().required(),


})


export {
    addForum,
    getForum
};