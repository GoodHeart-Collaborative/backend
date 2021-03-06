"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { unicornController } from "@modules/admin/unicornHumour/v1/UnicornController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const unicornRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/unicorn`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: UnicornRequest.IUnicornAdd = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await unicornController.addPost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "unicorn"],
            description: "Add post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                payload: {
                    title: Joi.string(),
                    // shortDescription: string;
                    imageUrl: Joi.string(),
                    isPostLater: Joi.boolean().default(false),
                    postedAt: Joi.date(),
                    // createdAt: Joi.number()
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/unicorn/{Id}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: UnicornRequest.IUnicornById = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await unicornController.getPostById(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "unicorn"],
            description: "Add unicorn",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: {
                    Id: Joi.string().optional(), // 
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/unicorn`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: UnicornRequest.IGetUnicorn = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await unicornController.getPosts(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "unicorn"],
            description: "Add post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: {
                    limit: Joi.number(),
                    page: Joi.number(),
                    searchTerm: Joi.string(),
                    status: Joi.string().valid([
                        config.CONSTANT.STATUS.ACTIVE,
                        config.CONSTANT.STATUS.BLOCKED,
                        config.CONSTANT.STATUS.DELETED,
                    ]),
                    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
                    sortBy: Joi.string().valid([
                        'createdAt', 'title'
                    ]),
                    fromDate: Joi.number(),
                    toDate: Joi.number(),
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },


    {
        method: "PATCH",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/unicorn/{Id}/status/{status}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: UnicornRequest.IUpdateUnicornStatus = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await unicornController.updateStatus(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "unicorn"],
            description: "get unicorn list",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: {
                    Id: Joi.string().required(),
                    status: Joi.string().valid([
                        config.CONSTANT.STATUS.ACTIVE,
                        config.CONSTANT.STATUS.DELETED,
                        config.CONSTANT.STATUS.BLOCKED
                    ])
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

    {
        method: "PATCH",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/unicorn/{Id}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: UnicornRequest.IUpdateUnicorn = {
                ...request.payload,
                ...request.params
            };
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await unicornController.updatePost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "unicorn"],
            description: "get unicorn list",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: {
                    Id: Joi.string().required()
                },
                payload: {
                    status: Joi.string().valid([
                        config.CONSTANT.STATUS.ACTIVE,
                        config.CONSTANT.STATUS.DELETED,
                        // config.CONSTANT.STATUS.BLOCKED
                    ]),
                    title: Joi.string().required(),
                    // privacy: Joi.string().valid([
                    //     config.CONSTANT.PRIVACY_STATUS.PUBLIC,
                    //     config.CONSTANT.PRIVACY_STATUS.PROTECTED,
                    //     config.CONSTANT.PRIVACY_STATUS.PRIVATE
                    // ]),
                    description: Joi.string(),
                    // shortDescription: string;
                    imageUrl: Joi.string(),
                    isPostLater: Joi.boolean().default(false),
                    postedAt: Joi.date(),
                    // createdAt: Joi.number()
                },
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    // payloadType: 'form',
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },
];