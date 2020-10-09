"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";

import { likeController } from "./LikeController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as likeValidator from "./LikeValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const likeRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/like`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: LikeRequest.AddLikeRequest = request.payload;
            const query: LikeRequest.LikeTypeRequest = request.query;
            try {
                const result = await likeController.addLike({ ...payload, ...query, ...{ userId: tokenData.userId, subscriptionEndDate: tokenData['subscriptionEndDate'] } });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "like"],
            description: "add like",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: likeValidator.validateUserLike,
                query: likeValidator.validateUserLikeParams,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/like`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const query: LikeRequest.AddLikeRequest = request.query;
            try {
                const result = await likeController.getLikeList({ ...query, ...{ userId: tokenData.userId } });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "like"],
            description: "get like list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: likeValidator.validateUserLikeList,
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