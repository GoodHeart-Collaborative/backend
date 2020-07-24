"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { expertPostController } from "@modules/admin/expertPost/postController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const expertPostRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expertPost`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: InspirationRequest.InspirationAdd = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertPostController.addExpertPost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "expert"],
            description: "Add expert post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                payload: {
                    expertId: Joi.string(),
                    catgegoryId: Joi.string(),
                    price: Joi.number(),
                    contentId: Joi.number().default(config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE)
                        .valid([
                            Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
                        ]),
                    mediaType: Joi.number().valid([
                        config.CONSTANT.MEDIA_TYPE.IMAGE,
                        config.CONSTANT.MEDIA_TYPE.VIDEO
                    ]),
                    mediaUrl: Joi.string(),
                    thumbnailUrl: Joi.string(),
                    privacy: Joi.string().valid([
                        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
                        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
                        config.CONSTANT.PRIVACY_STATUS.PUBLIC
                    ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC)
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expertPost`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertPostController.getExpertPosts(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "expert"],
            description: "Add expert post",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                query: {
                    expertId: Joi.string().required(),
                    catgegoryId: Joi.string(),
                    contentId: Joi.number()
                        .valid([
                            Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
                        ]),
                    privacy: Joi.string().valid([
                        config.CONSTANT.PRIVACY_STATUS.PRIVATE,
                        config.CONSTANT.PRIVACY_STATUS.PROTECTED,
                        config.CONSTANT.PRIVACY_STATUS.PUBLIC
                    ]).default(config.CONSTANT.PRIVACY_STATUS.PUBLIC),
                    limit: Joi.number(),
                    page: Joi.number(),
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
];