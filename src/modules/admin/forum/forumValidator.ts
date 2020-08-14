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


export {
    addForum,
    getForum
};