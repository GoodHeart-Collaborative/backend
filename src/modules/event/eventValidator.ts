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
    userId: Joi.string().trim().required()
}).unknown()


let addEvents = Joi.object({
    // userId: string,
    // categoryId: Joi.string().required(),
    // name: Joi.string(),
    title: Joi.string(),
    privacy: Joi.string().allow([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]),
    startDate: Joi.date(),
    endDate: Joi.date(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string(),
    // location: Joi.object().keys({
    //     address: Joi.string().trim(),
    //     type: Joi.string().required().valid(["Point"]),
    //     coordinates: [{
    //         longitude: Joi.number().precision(8),
    //         latitude: Joi.number().precision(8)
    //     }]
    // }),
    location: Joi.object().keys({
        type: Joi.string().required().valid(["Point"]),
        coordinates: Joi.array().items(Joi.number())
    }),
    address: Joi.string().trim(),
    eventCategory: Joi.string().allow([
        config.CONSTANT.EVENT_CATEGORY.CLASSES,
        config.CONSTANT.EVENT_CATEGORY.EVENTS,
        config.CONSTANT.EVENT_CATEGORY.MEETUP,
        config.CONSTANT.EVENT_CATEGORY.TRAINING
    ]),
    allowSharing: Joi.boolean().default(true),
    description: Joi.string(),
})


let validateExpertId = Joi.object({
    expertId: Joi.string().required()
}).unknown()

let getEvent = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    // userId: Joi.string(),
    type: Joi.string().allow([
        'going', 'myEvent'
    ]).default('going').required(),

})

let updateStatus = Joi.object({
    expertId: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]).required()
})

export {
    addEvents,
    getEvent
};