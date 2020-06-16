"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { adminController } from "@modules/admin/v1/AdminController";
import { adminDao } from "@modules/admin/v1/AdminDao";
import * as appUtils from "@utils/appUtils";
import { commonController } from "@modules/common/v1/commonController";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { imageUtil } from "@lib/ImageUtil";
import { responseHandler } from "@utils/ResponseHandler";
import { userController } from "@modules/user/v1/UserController";
import * as tokenManager from "@lib/tokenManager";
import { userDao } from "@modules/user/v1/UserDao";

export const commonRoute: ServerRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/common/change-forgot-password`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const query: Device = request.query;
			const payload: ChangeForgotPasswordRequest = request.payload;
			try {
				const tokenData = await tokenManager.verifyToken({ ...query }, "common", false);
				let result;
				if (tokenData.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					result = await adminController.changeForgotPassword(payload, tokenData);
				} else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
					result = await userController.changeForgotPassword(payload, tokenData);
				}
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				let step1;
				const jwtPayload = await tokenManager.decodeToken({ "accessToken": query.accessToken });
				if (jwtPayload.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					step1 = adminDao.emptyForgotToken({ "token": query.accessToken });
				} else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
					step1 = userDao.emptyForgotToken({ "token": query.accessToken });
				}
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Change Forgot Password",
			notes: "Change forgot password API for (admin/user)",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: validator.headerObject["required"],
				query: {
					accessToken: Joi.string().required().description("access token of (admin/user)")
				},
				payload: {
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
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/common/refresh-token`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData = request.auth.credentials.tokenData;
			const query: Device = request.query;
			try {
				let result;
				if (tokenData.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					result = await adminController.refreshToken(tokenData.payload);
				} else {
					result = await userController.refreshToken({ "refreshToken": query.refreshToken }, tokenData.payload);
				}
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Refresh Token",
			notes: "Refresh token (admin/user)",
			auth: {
				strategies: ["RefreshToken"]
			},
			validate: {
				headers: validator.commonAuthorizationHeaderObj,
				query: {
					refreshToken: Joi.string().trim().required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/common/media-upload`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const payload = request.payload;
			try {
				const result = await imageUtil.uploadSingleMediaToS3(payload.file);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Media Upload",
			// notes: "",
			auth: {
				strategies: ["BasicAuth"]
			},
			payload: {
				maxBytes: 1000 * 1000 * 500,
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true,
				timeout: false
			},
			validate: {
				headers: validator.headerObject["required"],
				payload: {
					file: Joi.any()
						.meta({ swaggerType: "file" })
						.required()
						.description("file exprension .csv|.xlsx|.xls")
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
		path: `${config.SERVER.API_BASE_URL}/v1/common/lambda/image-upload`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const payload = request.payload;
				const result = await commonController.uploadImage(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		options: {
			tags: ["api", "common"],
			description: "Image Upload Using Lambda",
			payload: {
				maxBytes: 1000 * 1000 * 500,
				parse: true,
				output: "file"
			},
			validate: {
				headers: validator.headerObject["required"],
				payload: {
					image: Joi.any()
						.meta({ swaggerType: "file" })
						.required()
						.description("file exprension .csv|.xlsx|.xls")
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
		path: `${config.SERVER.API_BASE_URL}/v1/common/deepLink`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const query: DeeplinkRequest = request.query;
				return await commonController.deepLink(query);
			} catch (error) {
				const message = "Your link has been expired. Please regenerate your link again.";
				return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear() });
			}
		},
		options: {
			tags: ["api", "common"],
			description: "Deep Link",
			validate: {
				query: {
					android: Joi.string().trim().optional(),
					ios: Joi.string().trim().optional(),
					fallback: Joi.string().trim().optional(),
					token: Joi.string().trim().optional(),
					name: Joi.string().required(),
					type: Joi.string().trim().valid(["forgot", "login"]).optional(),
					accountLevel: Joi.string().trim().valid([
						config.CONSTANT.ACCOUNT_LEVEL.ADMIN,
						config.CONSTANT.ACCOUNT_LEVEL.USER
					]).required()
				},
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					// payloadType: "form",
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	}
];