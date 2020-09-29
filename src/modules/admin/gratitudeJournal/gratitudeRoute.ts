"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { gratitudeController } from "@modules/admin/gratitudeJournal/gratitudeController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as gratitudeValidator from './gratitudeValidator'

export const gratitudeRoute: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/gratitude/{Id}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: GratitudeRequest.IgratitudeById = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.getPostById(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "gratitude"],
            description: "get inspiration by id",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: gratitudeValidator.validategetGratituById,
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
            const payload: GratitudeRequest.IGetGratitude = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.getPosts(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "gratitude"],
            description: "get inspiration list",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: gratitudeValidator.GetGratitude,
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
            const payload: GratitudeRequest.IUpdateStatus = request.params;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await gratitudeController.updateStatus(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "gratitude"],
            description: "get inspiration list",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: gratitudeValidator.gratitudestatus,
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
            const payload: GratitudeRequest.updateGratitude = {
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
            tags: ["api", "gratitude"],
            description: "get inspiration list",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: gratitudeValidator.validategetGratituById,
                payload: gratitudeValidator.updateGratitude,
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