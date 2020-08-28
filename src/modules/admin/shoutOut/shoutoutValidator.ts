"use strict";
import * as Joi from "joi";
import * as config from "@config/index";



let getShoutOut = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
    ]),
    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
    sortBy: Joi.string().valid([
        'createdAt', 'title'
    ]),
    userId: Joi.string().required(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    searchTerm: Joi.string(),
}).unknown()


export {
    getShoutOut,
};