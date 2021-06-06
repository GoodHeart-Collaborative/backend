"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";
import * as  appUtils from '@utils/appUtils'
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { cronJob } from "@lib/CronUtils";

export const cronRoute: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/cron`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const payload = request.query;
            try {
                const result = await cronJob.init();

                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "cron"],
            description: "get experts and category",
            // auth: {
            //     strategies: ["BasicAuth"]
            // },
            validate: {
                // headers: validator.headerObject["required"],
                // query: {
                //     type: Joi.string().allow().required(),
                // },
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/cron/eventReminder`,
        handler: async (request: Request, h: ResponseToolkit) => {
            try {
                const result = await cronJob.eventReminder();
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "cron"],
            description: "get experts and category",
            // auth: {
            //     strategies: ["BasicAuth"]
            // },
            validate: {
                // headers: validator.headerObject["required"],
                // query: {
                failAction: appUtils.failActionFunction
            },
            plugins: {
                "hapi-swagger": {
                    responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
                }
            }
        }
    }
]