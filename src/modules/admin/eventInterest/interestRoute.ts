"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { eventInterestController } from "./eventInterestController";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as interestValidator from './interestValidator';
import * as appUtils from '@utils/appUtils';
export const adminEventInterest: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/event-interest`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const payload: AdminEventInterest.GetInterest = request.query;
            try {
                // appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventInterestController.getInterests(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "interest"],
            description: "get interested users",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: interestValidator.GetInterestUser,
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    },

];



