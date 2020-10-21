"use strict";
import * as Joi from "joi";
import * as config from "@config/index";


let getEventHomeScreen = Joi.object({
    // pageNo: Joi.number().required(),
    // limit: Joi.number().required(),
    searchKey: Joi.string().optional().description("Search by Address"),
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    distance: Joi.number().optional().default(40),
    eventCategoryId: Joi.number().allow([
        config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
        config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
        config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
        config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE,
        5
    ]).description('5-All'),
    date: Joi.string().allow([
        config.CONSTANT.DATE_FILTER.TODAY,
        config.CONSTANT.DATE_FILTER.TOMORROW,
        config.CONSTANT.DATE_FILTER.WEEKEND
    ]).description('3-today ,4-tomorrow ,5-weekend')
}).unknown()


let eventViewAllScreen = Joi.object({

    pageNo: Joi.number().required(),
    limit: Joi.number().required(),
    searchKey: Joi.string().optional().description("Search by Address"),
    longitude: Joi.number().optional(),
    latitude: Joi.number().optional(),
    distance: Joi.number().optional().default(40),
    eventCategoryId: Joi.number().allow([
        config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
        config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
        config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
        config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE,
        5
    ]).description('5-All'),
    isFeaturedEvent: Joi.number().allow(0, 1),
    date: Joi.string().allow([
        config.CONSTANT.DATE_FILTER.TODAY,
        config.CONSTANT.DATE_FILTER.TOMORROW,
        config.CONSTANT.DATE_FILTER.WEEKEND
    ]).description('3-today ,4-tomorrow ,5-weekend'),
    privacy: Joi.string().allow([
        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
        config.CONSTANT.PRIVACY_STATUS.PUBLIC
    ])
})

let addEvents = Joi.object({
    title: Joi.string(),
    // privacy: Joi.string().allow([
    //     config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    //     config.CONSTANT.PRIVACY_STATUS.PRIVATE,
    //     config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    // ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC),
    startDate: Joi.number().required(),  //Joi.date().required(),
    endDate: Joi.number().required(),//Joi.date().required(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string(),
    // location: Joi.object().keys({
    //     // address: Joi.string().trim(),
    //     type: Joi.string().valid(["Point"]).default('Point'),
    //     coordinates: [{
    //         longitude: Joi.number().precision(8),
    //         latitude: Joi.number().precision(8)
    //     }]
    // }),

    location: Joi.object().keys({
        type: Joi.string().valid(["Point"]),
        coordinates: Joi.array().items(Joi.number())
    }),

    // location: Joi.object().keys({
    //     type: Joi.string().required().valid(["Point"]),
    //     coordinates: Joi.array().items(Joi.number())
    // }),
    address: Joi.string().trim().required(),
    eventCategoryId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    // Joi.number().allow([
    //     config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    // ]).required(),
    allowSharing: Joi.number().allow(0, 1), //boolean().default(true),
    description: Joi.string().required(),
})


let eventId = Joi.object({
    eventId: Joi.string().required()
}).unknown()

let getEventCalendar = Joi.object({
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
    eventId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    title: Joi.string(),
    // privacy: Joi.string().allow([
    //     config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    //     config.CONSTANT.PRIVACY_STATUS.PRIVATE,
    //     config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    // ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC),
    startDate: Joi.number().required(), //Joi.date().required(),
    endDate: Joi.number().required(),
    price: Joi.number(),
    imageUrl: Joi.string(),
    eventUrl: Joi.string().allow(''),
    // location: Joi.object().keys({
    //     address: Joi.string().trim(),
    //     type: Joi.string().required().valid(["Point"]),
    //     coordinates: [{
    //         longitude: Joi.number().precision(8),
    //         latitude: Joi.number().precision(8)
    //     }]
    // }),

    location: Joi.object().keys({
        type: Joi.string().valid(["Point"]).default('Point'),
        coordinates: Joi.array().items(Joi.number())
    }),
    address: Joi.string().trim().required(),
    eventCategoryId: Joi.string().regex(config.CONSTANT.REGEX.MONGO_ID).required(),
    // Joi.number().allow([
    //     config.CONSTANT.EVENT_CATEGORY.CLASSES.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.EVENTS.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.MEETUP.VALUE,
    //     config.CONSTANT.EVENT_CATEGORY.TRAINING.VALUE
    // ]).required(),
    allowSharing: Joi.number().allow(0, 1), //boolean().default(true),
    description: Joi.string().required(),
})

export {
    addEvents,
    // getEvent,
    getEventHomeScreen,
    getEventCalendar,
    eventViewAllScreen,
    eventId,
    updateEvent
};