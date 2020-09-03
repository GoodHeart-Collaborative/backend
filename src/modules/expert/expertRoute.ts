"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { expertController } from "./expertController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as expertValidator from "./expertValidator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { join } from "path";

export const userExpertRoute: ServerRoute[] = [
    {
        method: "GET",
        path: `${config.SERVER.API_BASE_URL}/v1/users/experts`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload = request.query;
            try {
                payload["userId"] = tokenData.userId
                const result = await expertController.getExperts(payload);
                console.log('resultresultresultresult', result);

                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "experts"],
            description: "get experts and category",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    limit: Joi.number(),
                    page: Joi.number(),
                    searchTerm: Joi.string()
                },
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/experts/categoriesList`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload = request.query;
            try {
                payload["userId"] = tokenData.userId
                const result = await expertController.getcategory(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "experts"],
            description: "get experts and category",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    limit: Joi.number(),
                    page: Joi.number(),
                    searchTerm: Joi.string(),
                    screenType: Joi.string().allow(['addPost'])
                },
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/experts/category/ExpertsList`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload = request.query;
            try {
                payload["userId"] = tokenData.userId
                const result = await expertController.getcategoryExperts(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "experts"],
            description: "get experts and category",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    limit: Joi.number(),
                    page: Joi.number(),
                    searchTerm: Joi.string(),
                    categoryId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
                },
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/experts/detail`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload = request.query;
            try {
                payload["userId"] = tokenData.userId
                const result = await expertController.expertDetailWithPost(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "experts"],
            description: "get experts and category",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    limit: Joi.number(),
                    page: Joi.number(),
                    // searchTerm: Joi.string(),
                    // categoryId: Joi.string().required(),
                    expertId: Joi.string().trim().required().regex(config.CONSTANT.REGEX.MONGO_ID),
                    posted: Joi.number().allow([
                        config.CONSTANT.DATE_FILTER.LAST_MONTH,
                        config.CONSTANT.DATE_FILTER.LAST_WEEK
                    ]).description('1-lastWeek, 2-lastMonth'),
                    contentType: Joi.string().description('1-image ,2- video ,3- article')
                    // .allow([
                    // config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE,
                    //     config.CONSTANT.EXPERT_CONTENT_TYPE.IMAGE.VALUE,
                    //     config.CONSTANT.EXPERT_CONTENT_TYPE.VIDEO.VALUE,
                    //     config.CONSTANT.EXPERT_CONTENT_TYPE.VOICE_NOTE.VALUE
                    // ])
                },
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/experts-post/detail`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload = request.query;
            payload['userId'] = tokenData['userId'];
            try {
                payload["userId"] = tokenData.userId
                const result = await expertController.postDetail(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "experts"],
            description: "get experts and category",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    postId: Joi.string().required()
                },
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
        path: `${config.SERVER.API_BASE_URL}/v1/users/experts-search`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
            const payload = request.query;
            try {
                payload["userId"] = tokenData.userId
                const result = await expertController.expertsListSearch(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "experts"],
            description: "get experts and category",
            auth: {
                strategies: ["UserAuth"]
            },
            validate: {
                headers: validator.userAuthorizationHeaderObj,
                query: {
                    searchKey: Joi.string(),
                    limit: Joi.number(),
                    pageNo: Joi.number()
                },
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