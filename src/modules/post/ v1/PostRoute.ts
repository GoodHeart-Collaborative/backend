"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { postController } from "@modules/post/ v1/postController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { join } from "path";

export const postRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/post`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await postController.addPost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "posts"],
            description: "Add post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                payload: {
                    userId: Joi.string().optional(), // 
                    categoryId: Joi.string().required(),
                    // subCategoryId: Joi.string().required(),
                    title: Joi.string(),
                    privacy: Joi.string().valid([
                        config.CONSTANT.PRIVACY_STATUS.PUBLIC,
                        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
                        config.CONSTANT.PRIVACY_STATUS.PRIVATE
                    ]),
                    description: Joi.string(),
                    // shortDescription: string;
                    imageUrl: Joi.string(),
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
    // {
    //     method: "GET",
    //     path: `${config.SERVER.API_BASE_URL}/v1/admin/post/{postId}`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
    //         const payload = request.params;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await postController.getPostById(payload);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "posts"],
    //         description: "Add post",
    //         auth: {
    //             strategies: ["AdminAuth"]
    //         },
    //         validate: {
    //             headers: validator.adminAuthorizationHeaderObj,
    //             params: {
    //                 userId: Joi.string().optional(), // 
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


    // {
    //     method: "GET",
    //     path: `${config.SERVER.API_BASE_URL}/v1/admin/post`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
    //         const payload = request.payload;
    //         try {
    //             appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
    //             const result = await postController.getPosts(payload);
    //             return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "posts"],
    //         description: "Add post",
    //         auth: {
    //             strategies: ["AdminAuth"]
    //         },
    //         validate: {
    //             headers: validator.adminAuthorizationHeaderObj,
    //             payload: {
    //                 limit: Joi.number(),
    //                 page: Joi.number()
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

];