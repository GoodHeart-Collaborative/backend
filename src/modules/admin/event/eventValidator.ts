"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getEvents = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    searchTerm: Joi.string(),
    fromDate: Joi.date(),
    toDate: Joi.date(),
    sortBy: Joi.string().valid([
        'title', 'createdAt','startDate','endDate'
    ]),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
    // categoryId: Joi.string().trim(),
    status:Joi.string().allow([
config.CONSTANT.STATUS.ACTIVE,
config.CONSTANT.STATUS.BLOCKED ,
// config.CONSTANT.STATUS.DELETED ,
    ]),
    userId:Joi.string().trim()
}).unknown()


let validateExpertId = Joi.object({
    expertId: Joi.string().required()
}).unknown()



let updateStatus = Joi.object({
    Id: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]).required()
})

export {
 getEvents,
 updateStatus
};