"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { adminController } from "@modules/admin/v1/AdminController";
import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const adminRoute: ServerRoute[] = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/sub-admin`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: SubAdminRequest.Create = request.payload;
			try {
				appUtils.consolelog("This request is on", `${request.path}with parameters ${JSON.stringify(payload)}`, true);
				const result = await adminController.addSubAdmin(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "sub-admin"],
			description: "Add Sub Admin",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					name: Joi.string().trim().min(config.CONSTANT.VALIDATION_CRITERIA.NAME_MIN_LENGTH).required(),
					email: Joi.string()
						.trim()
						.lowercase({ force: true })
						.email({ minDomainAtoms: 2 })
						.regex(config.CONSTANT.REGEX.EMAIL)
						.required(),
					password: Joi.string()
						.trim()
						.regex(config.CONSTANT.REGEX.PASSWORD)
						.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
						.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
						.default(config.CONSTANT.DEFAULT_PASSWORD)
						.required().error(errors => {
							errors.forEach(err => {
								switch (err.type) {
									case "string.regex.base":
										err.message = "Please enter a valid password.";
										break;
									case "string.min":
										err.message = `Password must be between ${config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`;
										break;
									case "string.max":
										err.message = `Password must be between ${config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`;
										break;
									case "any.empty":
										err.message = "Please enter password.";
										break;
									case "any.required":
										err.message = "Please enter password.";
										break;
									default:
										break;
								}
							});
							return errors;
						}),
					permission: Joi.array().optional()
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
		path: `${config.SERVER.API_BASE_URL}/v1/sub-admin`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: ListingRequest = request.query;
			try {
				const result = await adminController.subAdminList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "sub-admin"],
			description: "Sub Admin List",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					pageNo: Joi.number().required().description("Page no"),
					limit: Joi.number().required().description("limit"),
					searchKey: Joi.string().optional().description("Search by Name, email"),
					sortBy: Joi.string().trim().lowercase({ force: true }).valid("name", "created").optional().description("name, created"),
					sortOrder: Joi.number().optional().description("1 for asc, -1 for desc"),
					status: Joi.string()
						.trim()
						.lowercase({ force: true })
						.optional()
						.valid([
							config.CONSTANT.STATUS.BLOCKED,
							config.CONSTANT.STATUS.ACTIVE
						])
						.description("Status => 'blocked', 'unblocked'")
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
		path: `${config.SERVER.API_BASE_URL}/v1/sub-admin/{userId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: UserId = request.params;
			try {
				const result = await adminController.deleteSubAdmin(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "sub-admin"],
			description: "Delete Sub Admin",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/sub-admin/{userId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: UserId = request.params;
			const payload: SubAdminRequest.Edit = request.payload;
			try {
				const result = await adminController.editSubAdmin({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "sub-admin"],
			description: "Edit Sub Admin",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					name: Joi.string().trim().min(config.CONSTANT.VALIDATION_CRITERIA.NAME_MIN_LENGTH).required(),
					email: Joi.string()
						.trim()
						.lowercase({ force: true })
						.email({ minDomainAtoms: 2 })
						.regex(config.CONSTANT.REGEX.EMAIL)
						.required(),
					password: Joi.string()
						.trim()
						.regex(config.CONSTANT.REGEX.PASSWORD)
						.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
						.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
						.optional(),
					permission: Joi.array().optional()
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
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/sub-admin/block/{userId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: UserId = request.params;
			const payload: BlockRequest = request.payload;
			try {
				const result = await adminController.blockUnblock({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "sub-admin"],
			description: "Block Sub Admin",
			notes: "Block Unblock Sub Admin",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					status: Joi.string()
						.trim()
						.lowercase({ force: true })
						.required()
						.valid([
							config.CONSTANT.STATUS.BLOCKED,
							config.CONSTANT.STATUS.ACTIVE
						])
						.description("Status => 'blocked', 'unblocked'")
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
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin/forgot-password`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const payload: ForgotPasswordRequest = request.payload;
			try {
				const result = await adminController.forgotPassword({ ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Forgot Password",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: validator.headerObject["required"],
				payload: {
					email: Joi.string()
						.trim()
						.lowercase({ force: true })
						.email({ minDomainAtoms: 2 })
						.regex(config.CONSTANT.REGEX.EMAIL)
						.required()
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
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin/login`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const headers: Device = request.headers;
			const requestInfo: Device = request.info;
			const payload: AdminRequest.Login = request.payload;
			try {
				const result = await adminController.login({ ...headers, ...requestInfo, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Admin Login",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: validator.headerObject["required"],
				payload: {
					email: Joi.string()
						.trim()
						.lowercase({ force: true })
						.email({ minDomainAtoms: 2 })
						.regex(config.CONSTANT.REGEX.EMAIL)
						.required(),
					password: Joi.string()
						.trim()
						.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
						.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
						.default(config.CONSTANT.DEFAULT_PASSWORD)
						.required(),
					deviceId: Joi.string().trim().required(),
					deviceToken: Joi.string().trim().required()
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
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin/logout`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			try {
				const result = await adminController.logout(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Logout",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
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
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/admin/change-password`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: ChangePasswordRequest = request.payload;
			try {
				const result = await adminController.changePassword(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Change Password",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					oldPassword: Joi.string()
						.trim()
						.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
						.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
						.default(config.CONSTANT.DEFAULT_PASSWORD)
						.required(),
					password: Joi.string()
						.trim()
						.regex(config.CONSTANT.REGEX.PASSWORD)
						.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
						.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
						.default(config.CONSTANT.DEFAULT_PASSWORD)
						.required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/admin/details`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: UserId = request.query;
			try {
				const result = await adminController.adminDetails(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Admin Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/admin/dashboard`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth.credentials.tokenData.adminData;
			const query: AdminRequest.Dashboard = request.query;
			try {
				const result = await adminController.dashboard(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Dashboard",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					year: Joi.number().optional(),
					month: Joi.number().optional(),
					type: Joi.string()
						.trim()
						.required()
						.default(config.CONSTANT.GRAPH_TYPE.YEARLY)
						.valid([
							config.CONSTANT.GRAPH_TYPE.DAILY,
							config.CONSTANT.GRAPH_TYPE.WEEKLY,
							config.CONSTANT.GRAPH_TYPE.MONTHLY,
							config.CONSTANT.GRAPH_TYPE.YEARLY,
						])
						.description("Type => 'Daily', 'Weekly', 'Monthly', 'Yearly'"),
					status: Joi.string()
						.trim()
						.lowercase({ force: true })
						.optional()
						.valid([
							config.CONSTANT.STATUS.BLOCKED,
							config.CONSTANT.STATUS.ACTIVE
						])
						.description("Status => 'blocked', 'unblocked'"),
					fromDate: Joi.number().optional().description("in timestamp"),
					toDate: Joi.number().optional().description("in timestamp")
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
		path: `${config.SERVER.API_BASE_URL}/v1/admin`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: AdminRequest.EditProfile = request.payload;
			try {
				const result = await adminController.editProfile(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "Dashboard",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					name: Joi.string()
						.trim()
						.min(config.CONSTANT.VALIDATION_CRITERIA.NAME_MIN_LENGTH)
						.required(),
					email: Joi.string()
						.trim()
						.lowercase({ force: true })
						.email({ minDomainAtoms: 2 })
						.regex(config.CONSTANT.REGEX.EMAIL)
						.required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/admin/reports/user`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const query: AdminRequest.UserReportGraph = request.query;
			try {
				const result = await adminController.userReportGraph(query);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "admin"],
			description: "User Report Graph",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					year: Joi.number().optional(),
					month: Joi.number().optional(),
					platform: Joi.string()
						.trim()
						.optional()
						.valid([
							config.CONSTANT.DEVICE_TYPE.ANDROID,
							config.CONSTANT.DEVICE_TYPE.IOS,
							config.CONSTANT.DEVICE_TYPE.WEB
						])
						.description("device OS '1'-Android, '2'-iOS, '3'-WEB"),
					type: Joi.string()
						.trim()
						.required()
						.default(config.CONSTANT.GRAPH_TYPE.YEARLY)
						.valid([
							config.CONSTANT.GRAPH_TYPE.DAILY,
							config.CONSTANT.GRAPH_TYPE.WEEKLY,
							config.CONSTANT.GRAPH_TYPE.MONTHLY,
							config.CONSTANT.GRAPH_TYPE.YEARLY,
						])
						.description("Type => 'Daily', 'Weekly', 'Monthly', 'Yearly'"),
					status: Joi.string()
						.trim()
						.lowercase({ force: true })
						.optional()
						.valid([
							config.CONSTANT.STATUS.BLOCKED,
							config.CONSTANT.STATUS.ACTIVE
						])
						.description("Status => 'blocked', 'unblocked'"),
					fromDate: Joi.number().optional().description("in timestamp"),
					toDate: Joi.number().optional().description("in timestamp")
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