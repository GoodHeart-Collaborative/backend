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
    title: Joi.string(),
    // privacy: Joi.string().allow([
    //     config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    //     config.CONSTANT.PRIVACY_STATUS.PRIVATE,
    //     config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    // ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
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

    // location: Joi.object().keys({
    //     type: Joi.string().required().valid(["Point"]),
    //     coordinates: Joi.array().items(Joi.number())
    // }),
    address: Joi.string().trim().required(),
    eventCategoryId: Joi.string().required(),
    // Joi.number().allow([
    //     config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    // ]).required(),
    allowSharing: Joi.boolean().default(true),
    description: Joi.string().required(),
})


let eventId = Joi.object({
    eventId: Joi.string().required()
}).unknown()

let getEvent = Joi.object({
    limit: Joi.number(),
    page: Joi.number(),
    // userId: Joi.string(),
    type: Joi.number().allow([
        // 'myInterest', 'myEvent',
        config.CONSTANT.EVENT_INTEREST.INTEREST,
        config.CONSTANT.EVENT_INTEREST.MY_EVENT,
    ]).description(
        'INTEREST- 2, MY_EVENT- 3'
    ),

})

let updateEvent = Joi.object({
    // userId: string,
    // categoryId: Joi.string().required(),
    // name: Joi.string(),
    title: Joi.string(),
    // privacy: Joi.string().allow([
    //     config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    //     config.CONSTANT.PRIVACY_STATUS.PRIVATE,
    //     config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    // ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string(),
    // location: Joi.object().keys({
    //     type: Joi.string().required().valid(["Point"]),
    //     coordinates: Joi.array().items(Joi.number())
    // }).required(),
    address: Joi.string().trim().required(),
    eventCategoryId: Joi.number().allow([
        config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
        config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
        config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
        config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    ]).required(),
    allowSharing: Joi.boolean().default(true),
    description: Joi.string().required(),
})

export {
    addEvents,
    getEvent,
    eventId,
    updateEvent
};