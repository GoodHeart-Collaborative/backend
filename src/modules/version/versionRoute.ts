"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { versionController } from "@modules/version/VersionController";
import { responseHandler } from "@utils/ResponseHandler";

export const versionRoute: ServerRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/version`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: VersionRequest.Add = request.payload;
			try {
				const result = await versionController.addVersion(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "version"],
			description: "Add Version",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					name: Joi.string().trim().required(),
					description: Joi.string().trim().required(),
					platform: Joi.string()
						.trim()
						.required()
						.valid([
							config.CONSTANT.DEVICE_TYPE.ANDROID,
							config.CONSTANT.DEVICE_TYPE.IOS
						])
						.description("device OS '1'-Android, '2'-iOS"),
					updateType: Joi.string().trim().required(),
					currentVersion: Joi.string().trim().required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/version`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: ListingRequest = request.query;
			try {
				const result = await versionController.versionList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "version"],
			description: "Version List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					pageNo: Joi.number().required().description("Page no"),
					limit: Joi.number().required().description("limit"),
					searchKey: Joi.string().optional().description("Search by Version name, title"),
					sortBy: Joi.string().trim().valid("name", "title", "created").optional().description("name, title, created"),
					sortOrder: Joi.number().optional().description("1 for asc, -1 for desc")
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
		method: "DELETE",
		path: `${config.SERVER.API_BASE_URL}/v1/version/{versionId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: VersionRequest.Id = request.params;
			try {
				const result = await versionController.deleteVersion(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "version"],
			description: "Delete Version",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					versionId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/version/details`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: VersionRequest.Id = request.query;
			try {
				const result = await versionController.versionDetails(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "version"],
			description: "Version Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					versionId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/v1/version/{versionId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: VersionRequest.Id = request.params;
			const payload: VersionRequest.Edit = request.payload;
			try {
				const result = await versionController.editVersion({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "version"],
			description: "Update Version",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					versionId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					name: Joi.string().trim().required(),
					description: Joi.string().trim().required(),
					platform: Joi.string()
						.trim()
						.required()
						.valid([
							config.CONSTANT.DEVICE_TYPE.ANDROID,
							config.CONSTANT.DEVICE_TYPE.IOS
						])
						.description("device OS '1'-Android, '2'-iOS"),
					updateType: Joi.string().trim().required(),
					currentVersion: Joi.string().trim().required()
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