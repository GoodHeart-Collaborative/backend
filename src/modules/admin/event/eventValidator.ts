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
    type: Joi.number().valid([
        config.CONSTANT.CATEGORY_TYPE.EVENT_CAEGORY,
        config.CONSTANT.CATEGORY_TYPE.OTHER_CATEGORY,
    ]),
    // categoryId: Joi.string().trim(),
    status: Joi.string().allow([
        config.CONSTANT.STATUS.ACTIVE,
        config.CONSTANT.STATUS.BLOCKED,
    ]),
    userId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).trim()
}).unknown()


let validateEventId = Joi.object({
    eventId: Joi.string().required()
}).unknown()



let updateStatus = Joi.object({
    Id: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
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
    startDate: Joi.number().required(), //  Joi.date().required(),
    endDate: Joi.number().required(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string().allow(''),
    location: Joi.object().keys({
        type: Joi.string().required().valid(["Point"]),
        coordinates: Joi.array().items(Joi.number())
    }),
    address: Joi.string().required().trim(),
    eventCategoryId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    // .allow([
    //     config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    // ]).required(),
    allowSharing: Joi.number().allow(0, 1).default(1),
    description: Joi.string().allow('').required(),
    isFeatured: Joi.number().allow(0, 1).default(0),
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
    startDate: Joi.number().required(),
    endDate: Joi.number().required(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string().allow(''),
    location: Joi.object().keys({
        type: Joi.string().required().valid(["Point"]),
        coordinates: Joi.array().items(Joi.number())
        // coordinates: [{
        //     latitude: Joi.number().precision(8)
        // }]
    }),
    address: Joi.string().trim(),
    eventCategoryId: Joi.string(),
    //.allow([
    //     config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    // ]),
    allowSharing: Joi.number().allow(0, 1), //.default(true),
    description: Joi.string(),
    isFeatured: Joi.number().allow(0, 1).default(0),
})

// let eventCalender = Joi.object({
//     fromDate: Joi.date(),
//     toDate: Joi.date(),
//     limit: Joi.number(),
//     page: Joi.number()
// })
export {
    getEvents,
    updateStatus,
    validateEventId,
    addEvents,
    updateEvent,
    // eventCalender
};