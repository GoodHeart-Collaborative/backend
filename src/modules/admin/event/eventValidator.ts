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
        'title', 'createdAt', 'startDate', 'endDate'
    ]),
    sortOrder: Joi.number().valid([
        config.CONSTANT.ENUM.SORT_TYPE
    ]),
    // categoryId: Joi.string().trim(),
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        // config.CONSTANT.STATUS.DELETED ,
    ]),
    userId: Joi.string().trim()
}).unknown()


let validateEventId = Joi.object({
    eventId: Joi.string().required()
}).unknown()



let updateStatus = Joi.object({
    Id: Joi.string().required(),
    status: Joi.string().valid([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
        config.CONSTANT.STATUS.DELETED,
    ]).required()
})


let addEvents = Joi.object({
    // userId: string,
    // categoryId: Joi.string().required(),
    // name: Joi.string(),
    title: Joi.string().required(),
    privacy: Joi.string().allow([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ]),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string(),
    location: Joi.object().keys({
        type: Joi.string().required().valid(["Point"]),
        coordinates: Joi.array().items(Joi.number())
    }),
    address: Joi.string().required().trim(),
    eventCategoryId: Joi.string().allow([
        config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
        config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
        config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
        config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    ]).required(),
    allowSharing: Joi.boolean().default(true),
    description: Joi.string().allow('').required(),
    isFeatured: Joi.boolean().default(false),
})

let updateEvent = Joi.object({
    // userId: string,
    // categoryId: Joi.string().required(),
    // name: Joi.string(),
    title: Joi.string().required(),
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
    location: Joi.object().keys({
        type: Joi.string().required().valid(["Point"]),
        coordinates: Joi.array().items(Joi.number())
        // coordinates: [{
        //     latitude: Joi.number().precision(8)
        // }]
    }),
    address: Joi.string().trim(),
    eventCategoryId: Joi.string().allow([
        config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
        config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
        config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
        config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    ]),
    allowSharing: Joi.boolean().default(true),
    description: Joi.string(),
    isFeatured: Joi.boolean()
})

export {
    getEvents,
    updateStatus,
    validateEventId,
    addEvents,
    updateEvent
};