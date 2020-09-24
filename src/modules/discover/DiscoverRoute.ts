"use strict";
import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { discoverController } from "./DiscoverController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as discoverValidator from "./DiscoverValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const discoverRoute: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const query: ListingRequest = request.query;
            try {
                const result = await discoverController.getUserData({ ...query }, { userId: tokenData.userId });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "discover"],
            description: "get users list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: discoverValidator.validateListUsers,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/discover`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const query: ListingRequest = request.query;
            try {
                const result = await discoverController.getDiscoverData({ ...query }, { userId: tokenData.userId });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "discover"],
            description: "get discover list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: discoverValidator.validateListDiscover,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/discover`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: DiscoverRequest.DiscoverRequestAdd = request.payload;
            try {
                const result = await discoverController.saveDiscoverData({ ...payload }, { userId: tokenData.userId }, { name: tokenData.firstName });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "discover"],
            description: "save discover data",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: discoverValidator.validateAddDiscover,
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
        method: "PUT",
        path: `${config.SERVER.API_BASE_URL}/v1/users/discover/{followerId}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: DiscoverRequest.DiscoverRequestEdit = request.payload;
            const followerId: DiscoverRequest.DiscoverRequestEditParams = request.params;
            try {
                const result = await discoverController.updateDiscoverData({ ...payload, ...followerId }, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "discover"],
            description: "edit discover data",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                params: discoverValidator.validateAddDiscover,
                payload: discoverValidator.validateEditDiscover,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/discover-status/{otherUserId}`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: DiscoverRequest.DiscoverRequestAdd = request.params;
            try {
                let result = await discoverController.getDiscoverStatus({ ...payload }, tokenData);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "discover"],
            description: "get discover status",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                params: discoverValidator.otherUserIdDiscoverStatus,
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