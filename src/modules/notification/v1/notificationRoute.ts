"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { notificationController } from "@modules/notification/v1/NotificationController";
import { responseHandler } from "@utils/ResponseHandler";

export const notificationRoute: ServerRoute = [
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/v1/user/notification`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
			const query: ListingRequest = request.query;
			try {
				const result = await notificationController.notificationList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: validator.userAuthorizationHeaderObj,
				query: {
					pageNo: Joi.number().required().description("Page no"),
					limit: Joi.number().required().description("limit")
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
];