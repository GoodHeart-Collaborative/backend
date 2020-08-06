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
        'name', 'createdAt'
    ]),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
    categoryId: Joi.string().trim(),
    userId:Joi.string().trim().required()
}).unknown()


let addEvents=Joi.object({
    // userId: string,
    categoryId: Joi.string().required(),
    name: Joi.string(),

    title: Joi.string(),
    type:Joi.string(),
    startDate:Joi.date(),
    endDate:Joi.date(),
    price:Joi.string(),

   description: Joi.string(),
})


let validateExpertId = Joi.object({
    expertId: Joi.string().required()
}).unknown()



let updateStatus = Joi.object({
    expertId: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]).required()
})

export {
 addEvents
};