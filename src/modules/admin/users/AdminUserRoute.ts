"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { adminController } from "@modules/admin/users/AdminController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const adminUser: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/users`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const query = request.query;
            try {
                const result = await adminController.getUserList(query);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "admin", "users"],
            description: "get usetrs list",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: {
                    fromDate: Joi.date(),
                    toDate: Joi.date(),
                    page: Joi.number(),
                    limit: Joi.number(),
                    sortBy: Joi.string().valid('name', 'createdAt').default('createdAt'),
                    sortOrder: Joi.number(),
                    searchTerm: Joi.string(),
                    status: Joi.string().valid([
                        config.CONSTANT.STATUS.BLOCKED,
                        config.CONSTANT.STATUS.ACTIVE,
                    ]),
                    subscriptionType: Joi.number().allow([
                        config.CONSTANT.USER_SUBSCRIPTION_PLAN.FREE.value,
                        config.CONSTANT.USER_SUBSCRIPTION_PLAN.MONTHLY.value,
                        config.CONSTANT.USER_SUBSCRIPTION_PLAN.YEARLY.value,
                        config.CONSTANT.USER_SUBSCRIPTION_PLAN.NONE.value,
                    ]),
                    adminStatus: Joi.string().valid([
                        config.CONSTANT.USER_ADMIN_STATUS.PENDING,
                        config.CONSTANT.USER_ADMIN_STATUS.REJECTED,
                        config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
                    ])
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

    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/users/{userId}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const payload = request.params;
            try {
                const result = await adminController.getUserById(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "admin", "users"],
            description: "get usetrs list",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: {
                    userId: Joi.string().required()
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


    {
        method: "PATCH",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/user/{userId}/status`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;

            const payload = {
                ...request.payload,
                ...request.params
            };
            try {
                const result = await adminController.updateStatus(payload, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "admin", "users"],
            description: "get update user status and verified",
            // notes: "",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                params: {
                    userId: Joi.string().required()
                },
                payload: {
                    status: Joi.string().valid([
                        config.CONSTANT.STATUS.BLOCKED,
                        config.CONSTANT.STATUS.ACTIVE,
                        config.CONSTANT.STATUS.DELETED
                    ]),
                    adminStatus: Joi.string().valid([
                        config.CONSTANT.USER_ADMIN_STATUS.PENDING,
                        config.CONSTANT.USER_ADMIN_STATUS.REJECTED,
                        config.CONSTANT.USER_ADMIN_STATUS.VERIFIED,
                    ]),
                    // isAdminVerified: Joi.boolean(),
                    // isAdminRejected: Joi.boolean()

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
    }
]