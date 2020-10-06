"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import { commentController } from "./CommentController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as commentValidator from "./CommentValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const commentRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/users/comment`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const payload: CommentRequest.AddCommentRequest = request.payload;
            const query: CommentRequest.AddCommentRequest = request.query;
            try {
                const result = await commentController.addComment({ ...payload, ...query, ...tokenData });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "comment"],
            description: "add comment",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                payload: commentValidator.validateUserComment,
                query: commentValidator.validateUserCommentParams,
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/comment`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
            const query: CommentRequest.AddCommentRequest = request.query;
            try {
                const result = await commentController.getCommentList({ ...query, ...{ userId: tokenData.userId } });
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "comment"],
            description: "get comment list",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: commentValidator.validateUserCommentList,
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