"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { gratitudeController } from "@modules/admin/gratitudeJournal/gratitudeController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const gratitudeRoute: ServerRoute[] = [
    // {
    //     method: "POST",
    //     path: `${config.SERVER.API_BASE_URL}/v1/admin/gratitude`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
    //         const payload: InspirationRequest.InspirationAdd = request.payload;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await gratitudeController.addGratitude(payload);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "inspiration"],
    //         description: "Add inspiration post",
    //         auth: {
    //             strategies: ["AdminAuth"]
    //         },
    //         validate: {
    //             headers: validator.adminAuthorizationHeaderObj,
    //             payload: {
    //                 // categoryId: Joi.string(),
    //                 // subCategoryId: Joi.string().required(),
    //                 title: Joi.string().required(),
    //                 // privacy: Joi.string().valid([
    //                 //     config.CONSTANT.PRIVACY_STATUS.PUBLIC,
    //                 //     config.CONSTANT.PRIVACY_STATUS.PROTECTED,
    //                 //     config.CONSTANT.PRIVACY_STATUS.PRIVATE
    //                 // ]),
    //                 description: Joi.string().required(),
    //                 // shortDescription: string;
    //                 imageUrl: Joi.string(),
    //                 postedAt: Joi.date(),
    //                 isPostLater: Joi.boolean().default(false),
    //                 // createdAt: Joi.number()
    //             },
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 // payloadType: 'form',
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/gratitude/{Id}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: InspirationRequest.IGetInspirationById = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.getPostById(payload);
                // console.log('resultresultresultresultresult', result);

                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "inspiration"],
            description: "get inspiration by id",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: {
                    Id: Joi.string().required(), // 
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/gratitude`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: InspirationRequest.IGetInspirations = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.getPosts(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "inspiration"],
            description: "get inspiration list",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: {
                    limit: Joi.number(),
                    page: Joi.number(),
                    status: Joi.string().valid([
                        config.CONSTANT.STATUS.ACTIVE,
                        config.CONSTANT.STATUS.BLOCKED,
                        config.CONSTANT.STATUS.DELETED,
                    ]),
                    sortOrder: config.CONSTANT.ENUM.SORT_TYPE,
                    sortBy: Joi.string().valid([
                        'createdAt', 'title'
                    ]),
                    fromDate: Joi.date(),
                    toDate: Joi.date(),
                    searchTerm: Joi.string(),
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/gratitude/{Id}/status/{status}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: InspirationRequest.IUpdateStatus = request.params;
            //     ...request.payload,
            //     ...request.params
            // };
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.updateStatus(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "inspiration"],
            description: "get inspiration list",
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
                // payload: {
                //     status: Joi.string().valid([
                //         config.CONSTANT.STATUS.ACTIVE,
                //         config.CONSTANT.STATUS.DELETED,
                //         config.CONSTANT.STATUS.BLOCKED
                //     ])
                // },
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/gratitude/{Id}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: InspirationRequest.IUpdateInpiration = {
                ...request.payload,
                ...request.params
            };
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.updatePost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "inspiration"],
            description: "get inspiration list",
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
                    description: Joi.string().required(),
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