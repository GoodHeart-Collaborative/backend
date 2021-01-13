"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";

import { subscriptionController } from "./subscriptionController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as subscriptionValidator from "./subscriptionValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const subscriptionRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/subscription`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: Subscription.AddSubscription = request.payload;
            const { platform } = request.headers;
            try {
                const result = await subscriptionController.createSubscription({ ...payload, platform, ...{ userId: tokenData.userId } });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "Subscription"],
            description: "Add Subscription for IOS and Android",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: subscriptionValidator.addSubscription,
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
        path: `${config.SERVER.API_BASE_URL}/v1/check-subscription`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: Subscription.AddSubscription = request.payload;
            const { platform } = request.headers;
            try {
                const result = await subscriptionController.checkUserSubscription({ ...payload, platform, ...{ userId: tokenData.userId } });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "Subscription"],
            description: "Check User Subscription for IOS with previous receipt token",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: subscriptionValidator.addSubscription,
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
        path: `${config.SERVER.API_BASE_URL}/v1/subscription/callback`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const payload: any = request.payload;
            const query: any = request.query;
            try {
                const result = await subscriptionController.subscriptionCallback({ ...payload, ...query });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "Subscription"],
            description: "Subscription Callback",
            validate: {
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
        path: `${config.SERVER.API_BASE_URL}/v1/subscription/cron`,
        handler: async (request: Request, h: ResponseToolkit) => {
            try {
                const result = await subscriptionController.verifySubscriptionRenewal();
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "Subscription"],
            description: "Subscription Cron Url",
            validate: {
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