"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { eventController } from "@modules/event/eventController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import * as eventValidator from './eventValidator';
export const userEventRoutes: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/event`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: any = request.payload;
            payload['userId'] = tokenData['userId']
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.addEvent(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "add events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: eventValidator.addEvents,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/events`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: UserEventRequest.userGetEvent = request.query;
            payload['userId'] = tokenData['userId'];
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await eventController.getEvent(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "events"],
            description: "get events",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: eventValidator.getEvent,
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



