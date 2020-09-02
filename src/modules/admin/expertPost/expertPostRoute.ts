"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { expertPostController } from "@modules/admin/expertPost/postController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as expertPostValidator from './expertPostValidator'
import { request } from "http";
export const expertPostRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expertPost`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: AdminExpertPostRequest.AddPost = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertPostController.addExpertPost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "expertPost"],
            description: "Add expert post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                payload: expertPostValidator.validaExpertPostAdd,
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expertPost`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: AdminExpertPostRequest.getExpert = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertPostController.getExpertPosts(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "expertPost"],
            description: "Add expert post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: expertPostValidator.getExpertPosts,
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expertpost/{postId}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: any = {
                ...request.payload,
                ...request.params
            };
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertPostController.updatePost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "expertPost"],
            description: "update expert post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: expertPostValidator.exprtPostId,
                payload: expertPostValidator.adminUpdateExpertPost,
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expertpost/{postId}/status/{status}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: AdminExpertPostRequest.updateStatus = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertPostController.updateStatus(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "expertPost"],
            description: "update expert post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: expertPostValidator.updateStatus,
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

    // {
    //     method: "GET",
    //     path: `${config.SERVER.API_BASE_URL}/v1/admin/expertpost/{postId}`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
    //         const payload: any = request.params;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await expertPostController.getPostById(payload);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "expertPost"],
    //         description: "admin get post detail",
    //         auth: {
    //             strategies: ["AdminAuth"]
    //         },
    //         validate: {
    //             headers: validator.adminAuthorizationHeaderObj,
    //             params: {
    //                 postId: Joi.string().required()
    //             },
    //             // params: expertPostValidator.exprtPostId
    //         },
    //         failAction: appUtils.failActionFunction
    //     },
    //     plugins: {
    //         "hapi-swagger": {
    //             // payloadType: 'form',
    //             responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //         }
    //     }
    // }
];