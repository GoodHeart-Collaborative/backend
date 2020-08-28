"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";
import { adminShoutOut } from "./shoutoutController";
import * as appUtils from "@utils/appUtils";
import * as shoutOutValidator from "./shoutoutValidator";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const AdminShoutOut: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/shoutout`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload = request.query;
            // payload['userId'] = tokenData['userId']
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await adminShoutOut.getShoutOut(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "forum"],
            description: "user add forum",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: shoutOutValidator.getShoutOut,
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/shoutout/{cardId}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload = request.params;
            // payload['userId'] = tokenData['userId']
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await adminShoutOut.getShoutOutDetail(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "forum"],
            description: "user add forum",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: shoutOutValidator.getShoutOutById,
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
    //     method: "PATCH",
    //     path: `${config.SERVER.API_BASE_URL}/v1/admin/shoutOut/{postId}`,
    //     handler: async (request: Request, h: ResponseToolkit) => {
    //         const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
    //         const payload = {
    //             ...request.params,
    //             ...request.payload
    //         }
    //         try {
    //             // payload["userId"] = tokenData.userId
    //             // const result = await adminFeedController.updateStatus(payload);
    //             // return responseHandler.sendSuccess(h, result);
    //         } catch (error) {
    //             return responseHandler.sendError(error);
    //         }
    //     },
    //     config: {
    //         tags: ["api", "forum"],
    //         description: "update admin forums topic",
    //         auth: {
    //             strategies: ["AdminAuth"]
    //         },
    //         validate: {
    //             headers: validator.adminAuthorizationHeaderObj,
    //             // params: feedValidator.feedPostId,
    //             // payload: feedValidator.updateFeedStatus,
    //             failAction: appUtils.failActionFunction
    //         },
    //         plugins: {
    //             "hapi-swagger": {
    //                 responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
    //             }
    //         }
    //     }
    // },
];