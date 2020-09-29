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
            try {
                const result = await subscriptionController.createSubscription({ ...payload, ...{ userId: tokenData.userId } });
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
    }
];