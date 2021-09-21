"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { selfCareController } from "@modules/selfCare/selfCareController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as selfCareValidator from './selfCareValidator';
import * as Joi from "joi";

export const selfCareRoutes: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/self-care`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: SelfCareRequest.AddSelfCare = request.payload;
            payload['userId'] = tokenData['userId'];
            payload['userType'] = config.CONSTANT.ACCOUNT_LEVEL.USER;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await selfCareController.addSelfCare(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "selfCare"],
            description: "add selfCare",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: selfCareValidator.validateAddSelfCare,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/self-care`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: SelfCareRequest.getSelfCare = request.query;
            payload['userId'] = tokenData.userId;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await selfCareController.selfCareList(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "selfCare"],
            description: "get selfCare",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: selfCareValidator.selfCareList,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    // {
    //     method: "GET",
    //     path: `${config.SERVER.API_BASE_URL}/v1/users/events`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
    //         const payload: UserEventRequest.getEvents = request.query;

    //         const xFF = request.headers['x-forwarded-for']
    //         const ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
    //         payload['getIpfromNtwk'] = ip;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await eventController.getEvent(payload, tokenData);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "events"],
    //         description: "get events",
    //         auth: {
    //             strategies: ["UserAuth"]
    //         },
    //         validate: {
    //             headers: validator.userAuthorizationHeaderObj,
    //             query: eventValidator.getEventHomeScreen,
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },
    // {
    //     method: "GET",
    //     path: `${config.SERVER.API_BASE_URL}/v1/users/events/detail/{eventId}`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
    //         const payload: UserEventRequest.getEventDetail = request.params;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await eventController.getEventDetail(payload, tokenData);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "events"],
    //         description: "get events",
    //         auth: {
    //             strategies: ["UserAuth"]
    //         },
    //         validate: {
    //             headers: validator.userAuthorizationHeaderObj,
    //             params: {
    //                 eventId: Joi.string().trim().required().regex(config.CONSTANT.REGEX.MONGO_ID)
    //             },
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },

    // {
    //     method: "GET",
    //     path: `${config.SERVER.API_BASE_URL}/v1/users/events-list`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
    //         const payload: UserEventRequest.getEventList = request.query;

    //         const xFF = request.headers['x-forwarded-for']

    //         const ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
    //         payload['getIpfromNtwk'] = ip;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await eventController.getEventList(payload, tokenData);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "events"],
    //         description: "get events",
    //         auth: {
    //             strategies: ["UserAuth"]
    //         },
    //         validate: {
    //             headers: validator.userAuthorizationHeaderObj,
    //             query: eventValidator.eventViewAllScreen,
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },

    // {
    //     method: "PATCH",
    //     path: `${config.SERVER.API_BASE_URL}/v1/users/event`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
    //         const payload: UserEventRequest.updateEvent = request.payload;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await eventController.updateEvent(payload, tokenData);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "events"],
    //         description: "add events",
    //         auth: {
    //             strategies: ["UserAuth"]
    //         },
    //         validate: {
    //             headers: validator.userAuthorizationHeaderObj,
    //             // params: eventValidator.eventId,
    //             payload: eventValidator.updateEvent,
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // }
];



