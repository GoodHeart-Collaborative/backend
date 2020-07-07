"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { categoryController } from "@modules/catgeory/v1/CategoryController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const categoryRoute: ServerRoute[] = [
    {
        method: "POST",
        path: `${config.SERVER.API_BASE_URL}/v1/admin/category`,
        handler: async (request: Request, h: ResponseToolkit) => {
            const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
            const payload: SubAdminRequest.Create = request.payload;
            try {
                appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
                const result = await categoryController.addCategory(payload);
                return responseHandler.sendSuccess(h, result);
            } catch (error) {
                return responseHandler.sendError(error);
            }
        },
        config: {
            tags: ["api", "category"],
            description: "Add category",
            auth: {
                strategies: ["AdminAuth"]
            },
            validate: {
                headers: validator.adminAuthorizationHeaderObj,
                payload: {
                    // name: Joi.string().lowercase().required(),
                    title: Joi.string().required(),
                    imageUrl: Joi.strig()
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