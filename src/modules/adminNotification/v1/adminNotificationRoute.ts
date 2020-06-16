"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { adminNotificationController } from "@modules/adminNotification/v1/AdminNotificationController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const adminNotificationRoute: ServerRoute[] = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: AdminNotificationRequest.Add = request.payload;
			try {
				const result = await adminNotificationController.addNotification(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Add Notification",
			notes: "Add and send bulk notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			payload: {
				maxBytes: 1024 * 1024 * 100, // 100MB
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					image: Joi.any().meta({ swaggerType: "file" }).optional().description("Image file"),
					title: Joi.string().trim().required(),
					link: Joi.string().trim().regex(config.CONSTANT.REGEX.URL).optional(),
					message: Joi.string().trim().required(),
					platform: Joi.string()
						.trim()
						.required()
						.valid([
							config.CONSTANT.DEVICE_TYPE.ANDROID,
							config.CONSTANT.DEVICE_TYPE.IOS,
							config.CONSTANT.DEVICE_TYPE.WEB,
							config.CONSTANT.DEVICE_TYPE.ALL
						])
						.description("device OS '1'-Android, '2'-iOS, '4'-all"),
					fromDate: Joi.number().optional().description("in timestamp"),
					toDate: Joi.number().optional().description("in timestamp"),
					gender: Joi.string()
						.trim()
						.lowercase({ force: true })
						.required()
						.valid([
							config.CONSTANT.GENDER.MALE,
							config.CONSTANT.GENDER.FEMALE,
							config.CONSTANT.GENDER.ALL
						])
						.description("male, female, all")
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: ListingRequest = request.query;
			try {
				const result = await adminNotificationController.notificationList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Notification List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					pageNo: Joi.number().required().description("Page no"),
					limit: Joi.number().required().description("limit"),
					searchKey: Joi.string().optional().description("Search by title"),
					sortBy: Joi.string().trim().valid("title", "sentCount", "created").optional().description("title, sentCount, created"),
					sortOrder: Joi.number().optional().description("1 for asc, -1 for desc")
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "DELETE",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification/{notificationId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: NotificationRequest.Id = request.params;
			try {
				const result = await adminNotificationController.deleteNotification(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Notification Delete",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					notificationId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification/details`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: NotificationRequest.Id = request.query;
			try {
				const result = await adminNotificationController.notificationDetails(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Notification Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					notificationId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification/{notificationId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: NotificationRequest.Id = request.params;
			const payload: AdminNotificationRequest.Edit = request.payload;
			try {
				const result = await adminNotificationController.editNotification({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Edit Notification",
			notes: "Edit and send bulk notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			payload: {
				maxBytes: 1024 * 1024 * 100, // 100MB
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					notificationId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					image: Joi.any().meta({ swaggerType: "file" }).optional().description("Image file"),
					title: Joi.string().trim().required(),
					link: Joi.string().trim().regex(config.CONSTANT.REGEX.URL).optional(),
					message: Joi.string().trim().required(),
					platform: Joi.string()
						.trim()
						.required()
						.valid([
							config.CONSTANT.DEVICE_TYPE.ANDROID,
							config.CONSTANT.DEVICE_TYPE.IOS,
							config.CONSTANT.DEVICE_TYPE.WEB,
							config.CONSTANT.DEVICE_TYPE.ALL
						])
						.description("device OS '1'-Android, '2'-iOS, '4'-all"),
					fromDate: Joi.number().optional().description("in timestamp"),
					toDate: Joi.number().optional().description("in timestamp"),
					gender: Joi.string()
						.trim()
						.lowercase({ force: true })
						.required()
						.valid([
							config.CONSTANT.GENDER.MALE,
							config.CONSTANT.GENDER.FEMALE,
							config.CONSTANT.GENDER.ALL
						])
						.description("male, female, all")
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification/send/{userId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: UserId = request.params;
			const payload: AdminNotificationRequest.Send = request.payload;
			try {
				const result = await adminNotificationController.sendOneToOneNotification({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Add Notification",
			notes: "Add and send one to one notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					title: Joi.string().trim().required(),
					link: Joi.string().trim().regex(config.CONSTANT.REGEX.URL).required(),
					message: Joi.string().trim().required()
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin-notification/resend/{notificationId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: NotificationRequest.Id = request.params;
			try {
				const result = await adminNotificationController.sendBulkNotification(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin-notification"],
			description: "Send Notification",
			notes: "Send bulk notification",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					notificationId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	}
];