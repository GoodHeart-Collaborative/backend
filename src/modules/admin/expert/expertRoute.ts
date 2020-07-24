"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { expertController } from "@modules/admin/expert/expertController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { join } from "path";

export const expertRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expert`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: InspirationRequest.InspirationAdd = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertController.addExpert(payload);
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
                    catgegoryId: Joi.array().items(Joi.string()),
                    name: Joi.string().required(),
                    email: Joi.string().required(),
                    profession: Joi.string().required(),
                    industry: Joi.string().valid([
                        config.INDUSTRIES.Compassion_Fatigue,
                        config.INDUSTRIES.Experts_in_Executive_Burnout,
                        config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
                        config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
                        config.INDUSTRIES.Wellness_Coaches,
                    ]).required(),
                    bio: Joi.string().required(),
                    experience: Joi.string().required(),
                    // price: Joi.number(),
                    contentId: Joi.number().default(config.CONSTANT.EXPERT_CONTENT_TYPE.ARTICLE.VALUE)
                        .valid([
                            Object.values(config.CONSTANT.EXPERT_CONTENT_TYPE).map(({ VALUE }) => VALUE)
                        ]),
                    // mediaType: Joi.number().valid([
                    //     config.CONSTANT.MEDIA_TYPE.IMAGE,
                    //     config.CONSTANT.MEDIA_TYPE.VIDEO
                    // ]),
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
        path: `${config.SERVER.API_BASE_URL}/v1/admin/expert`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload = request.query;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await expertController.getExpert(payload);
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
                    limit: Joi.number(),
                    page: Joi.number()
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