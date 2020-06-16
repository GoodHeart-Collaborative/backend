"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import { contactController } from "@modules/contact/v1/ContactController";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const contactRoute: ServerRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/contact/sync`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
			const payload: ContactRequest.Sync = request.payload;
			try {
				const result = await contactController.contactSyncing(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "contact"],
			description: "Contact Syncing",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: validator.userAuthorizationHeaderObj,
				payload: {
					addContact: Joi.array().items(Joi.object({
						sno: Joi.number().required(),
						contactName: Joi.string().trim().required(),
						mobileNo: Joi.string().trim().replace(config.CONSTANT.REGEX.STRING_REPLACE, "").required()
					})),
					updateContact: Joi.array().items(Joi.object({
						sno: Joi.number().required(),
						contactName: Joi.string().trim().required(),
						mobileNo: Joi.string().trim().replace(config.CONSTANT.REGEX.STRING_REPLACE, "").required()
					})),
					deleteContact: Joi.array().optional()
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
		path: `${config.SERVER.API_BASE_URL}/v1/contact`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
			try {
				const result = await contactController.contactList(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "contact"],
			description: "Contact List",
			// notes: "",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: validator.userAuthorizationHeaderObj,
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