"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import { adminController } from "@modules/admin/users/AdminController";
import { adminDao } from "@modules/admin/users/AdminDao";
import * as appUtils from "@utils/appUtils";
import { commonController } from "@modules/common/commonController";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { userController } from "@modules/user/UserController";
import * as tokenManager from "@lib/tokenManager";
import { userDao } from "@modules/user/UserDao";

export const commonRoute: ServerRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/common/change-forgot-password`,
		handler: async (request: Request, h: ResponseToolkit) => {
			// const query: Device = request.query;
			const payload = request.payload;
			try {
				const tokenData = await tokenManager.verifyToken({ ...payload }, "common", false);
				let result;
				if (tokenData.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					result = await adminController.changeForgotPassword(payload, tokenData);
				} else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
					result = await userController.changeForgotPassword(payload, tokenData);
				}
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				let step1;
				const jwtPayload = await tokenManager.decodeToken({ "accessToken": payload.accessToken });
				if (jwtPayload.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
					step1 = adminDao.emptyForgotToken({ "token": payload.accessToken });
				} else { // config.CONSTANT.ACCOUNT_LEVEL.NORMAL_USER
					step1 = userDao.emptyForgotToken({ "token": payload.accessToken });
				}
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Change Forgot Password",
			notes: "Change forgot password API for (admin/user)",
			// auth: {
			// 	strategies: ["BasicAuth"]
			// },

			validate: {
				// headers: validator.headerObject["required"],
				// query: {
				// 	accessToken: Joi.string().required().description("access token of (admin/user)")
				// },
				payload: {
					accessToken: Joi.string().required().description("access token of (admin/user)"),
					password: Joi.string()
						.trim()
						// .regex(config.CONSTANT.REGEX.PASSWORD)
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
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/v1/common/resetPasswordWeb`,
		handler: async (request: Request, h: ResponseToolkit) => {
			// const query: Device = request.params;
			const payload = request.query;
			try {
				const tokenData = await tokenManager.verifyToken({ ...payload }, "common", false);
				let result;
				result = await userController.redirectResetPassword(payload);
				// const message = "Your link has been expired. Please regenerate your link again.";
				return h.view("reset-password-web", { "name": request.query.name, "message": "message", "year": new Date().getFullYear(), "logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png", token: payload.accessToken, API_URL: config.SERVER.API_URL });
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Change Forgot Password",
			notes: "Change forgot password API for (admin/user)",
			// auth: {
			// },
			validate: {
				query: {
					accessToken: Joi.string().required().description("access token of user")
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
		path: `${config.SERVER.API_BASE_URL}/v1/common/deepLink`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const query: DeeplinkRequest = request.query;
				return await commonController.deepLink(query);
			} catch (error) {
				// const message = "Your link has been expired. Please regenerate your link again.";
				const message = "Hi there, your link has expired because you haven't used it. Link expires in every 10 minutes and can only be used once. Please try again."
				const title = "Link expired";
				return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), "logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png", title: title });
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
					type: Joi.string().trim().valid(["forgot", "login", "event"]).optional(),
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
	},

	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/v1/common/deepLink-share`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const query: DeeplinkRequest = request.query;
				return await commonController.deepLinkShare(query);
			} catch (error) {
				const message = "please check in the mobile version.";
				return h.view("please check in the mobile version.", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), "logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png" });
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
					type: Joi.string().trim().valid(["login", "event"]).optional(),
					eventId: Joi.string().trim()
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
	},


	{
		method: "GET",
		path: `${config.SERVER.API_BASE_URL}/v1/verifyEmail/deepLink`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const query: DeeplinkRequest = request.query;
				return await commonController.veryEmail(query);
			} catch (error) {
				let message;
				let title;
				if (error === "alreadyVerified") {
					message = "Hi your email is already been verified. Please login to continue."
					title = "Email already verified";
					return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), title: title });
				} else {
					// const message = "Your link has been expired. Please regenerate your link again.";
					message = "Hi there, your link has expired because you haven't used it. Link expires in every 10 minutes and can only be used once. Please try again."
					title = "Link expired";
				}
				return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), title: title });
			}
		},
		options: {
			tags: ["api", "user"],
			description: "user verify email register Deep Link",
			validate: {
				query: {
					android: Joi.string().trim().optional(),
					ios: Joi.string().trim().optional(),
					fallback: Joi.string().trim().optional(),
					// token: Joi.string().trim().optional(),
					userId: Joi.string().required(),
					name: Joi.string().required(),
					type: Joi.string().trim().valid(["verifyEmail"]).optional(),
					accountLevel: Joi.string().trim().valid([
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
	},
	// for android email verify
	{
		method: "PATCH",
		path: `${config.SERVER.API_BASE_URL}/v1/verifyEmail`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const query: DeeplinkRequest = request.payload;
				const result = await commonController.veryEmailAndroid(query);
				return responseHandler.sendSuccess(h, result);

			} catch (error) {
				return responseHandler.sendError(error);
				// let message;
				// let title;
				// if (error === "alreadyVerified") {
				// 	message = "Hi your email is already been verified . Please login to continue."
				// 	title = "Email Already verified";
				// 	return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), title: title });
				// } else {
				// 	// const message = "Your link has been expired. Please regenerate your link again.";
				// 	message = "Hi there, your link has expired because you haven't used it. Link expires in every 10 minutes and can only be used once. Please try again."
				// 	title = "Link expired";
				// }
				// return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), title: title });
				// // const message = "Your link has been expired. Please regenerate your link again.";
				// // return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear() });
			}
		},
		options: {
			tags: ["api", "user"],
			description: "user verify email register Deep Link",
			validate: {
				payload: {
					token: Joi.string().trim().optional(),
					userId: Joi.string().required(),
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