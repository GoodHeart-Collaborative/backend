"use strict";
import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { shoutoutController } from "./ShoutoutController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as shoutoutValidator from "./ShoutoutValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const shoutoutRoute: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/shoutout`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const query = request.query;
            try {
                const result = await shoutoutController.getShoutoutData({ ...query }, { userId: tokenData.userId });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "shoutout"],
            description: "get shoutout list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: shoutoutValidator.validateListShoutout,
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
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/shoutout`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: ShoutoutRequest.ShoutoutRequestAdd = request.payload;
            try {
                const result = await shoutoutController.saveShoutoutData({ ...payload }, { userId: tokenData.userId });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "shoutout"],
            description: "save shoutout data",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: shoutoutValidator.validateAddShoutout,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/shoutout/myConnection`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            try {
                const result = await shoutoutController.getShoutouMyConnection({ userId: tokenData.userId });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "shoutout"],
            description: "get shoutout list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    }
    
];