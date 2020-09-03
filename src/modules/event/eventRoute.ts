"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { eventController } from "@modules/event/eventController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as eventValidator from './eventValidator';
import * as Joi from "joi";

export const userEventRoutes: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/event`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: UserEventRequest.AddEvent = request.payload;
            payload['userId'] = tokenData['userId'];
            payload['userType'] = config.CONSTANT.ACCOUNT_LEVEL.ADMIN;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.addEvent(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "add events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: eventValidator.addEvents,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/events/calender`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: UserEventRequest.userGetEvent = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.calenderEvent(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "get events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: eventValidator.getEvent,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/events`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.getEvent(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "get events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    // pageNo: Joi.number().required(),
                    // limit: Joi.number().required(),
                    searchKey: Joi.string().optional().description("Search by Address"),
                    longitude: Joi.number().optional(),
                    latitude: Joi.number().optional(),
                    distance: Joi.number().optional(),
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
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/events/detail/{eventId}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.getEventDetail(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "get events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                params: {
                    eventId: Joi.string().trim().required().regex(config.CONSTANT.REGEX.MONGO_ID)
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/events-list`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.getEventList(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "get events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    pageNo: Joi.number().required(),
                    limit: Joi.number().required(),
                    searchKey: Joi.string().optional().description("Search by Address"),
                    longitude: Joi.number().optional(),
                    latitude: Joi.number().optional(),
                    distance: Joi.number().optional(),
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
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    {
        method: "PATCH",
        path: `${config.SERVER.API_BASE_URL}/v1/users/event`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.updateEvent(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "add events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                // params: eventValidator.eventId,
                payload: eventValidator.updateEvent,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

];



