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
			console.log('payloadpayloadpayload', payload);
			try {
				// const isExpire=  await isExpire.
				const tokenData = await tokenManager.verifyToken({ ...payload }, "common", false);
				console.log('tokenDatatokenDatatokenDatatokenDatatokenData>>>>>>>>>>>>>>>>', tokenData);
				let result;
				result = await userController.redirectResetPassword(payload);
				// const message = "Your link has been expired. Please regenerate your link again.";
				return h.view("reset-password-web", { "name": request.query.name, "message": "message", "year": new Date().getFullYear(), "logoUrl": config.SERVER.UPLOAD_IMAGE_DIR + "womenLogo.png", token: payload.accessToken, API_URL: config.SERVER.API_URL });
				// return responseHandler.sendSuccess(h, result);
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
				// headers: validator.headerObject["required"],
				query: {
					accessToken: Joi.string().required().description("access token of user")
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



	// {
	// 	method: "POST",
	// 	path: `${config.SERVER.API_BASE_URL}/v1/common/refresh-token`,
	// 	handler: async (request: Request, h: ResponseToolkit) => {
	// 		const tokenData = request.auth.credentials.tokenData;
	// 		const query: Device = request.query;
	// 		try {
	// 			let result;
	// 			if (tokenData.payload.accountLevel === config.CONSTANT.ACCOUNT_LEVEL.ADMIN) {
	// 				result = await adminController.refreshToken(tokenData.payload);
	// 			} else {
	// 				result = await userController.refreshToken({ "refreshToken": query.refreshToken }, tokenData.payload);
	// 			}
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	config: {
	// 		tags: ["api", "common"],
	// 		description: "Refresh Token",
	// 		notes: "Refresh token (admin/user)",
	// 		auth: {
	// 			strategies: ["RefreshToken"]
	// 		},
	// 		validate: {
	// 			headers: validator.commonAuthorizationHeaderObj,
	// 			query: {
	// 				refreshToken: Joi.string().trim().required()
	// 			},
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				// payloadType: 'form',
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },


	// {
	// 	method: "POST",
	// 	path: `${config.SERVER.API_BASE_URL}/v1/common/media-upload`,
	// 	handler: async (request: Request, h: ResponseToolkit) => {
	// 		const payload = request.payload;
	// 		try {
	// 			const result = await imageUtil.uploadSingleMediaToS3(payload.file);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	config: {
	// 		tags: ["api", "common"],
	// 		description: "Media Upload",
	// 		// notes: "",
	// 		auth: {
	// 			strategies: ["BasicAuth"]
	// 		},
	// 		payload: {
	// 			maxBytes: 1000 * 1000 * 500,
	// 			output: "stream",
	// 			allow: "multipart/form-data", // important
	// 			parse: true,
	// 			timeout: false
	// 		},
	// 		validate: {
	// 			headers: validator.headerObject["required"],
	// 			payload: {
	// 				file: Joi.any()
	// 					.meta({ swaggerType: "file" })
	// 					.required()
	// 					.description("file exprension .csv|.xlsx|.xls")
	// 			},
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				payloadType: "form",
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },

	// {
	// 	method: "POST",
	// 	path: `${config.SERVER.API_BASE_URL}/v1/common/lambda/image-upload`,
	// 	handler: async (request: Request, h: ResponseToolkit) => {
	// 		try {
	// 			const payload = request.payload;
	// 			const result = await commonController.uploadImage(payload);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "common"],
	// 		description: "Image Upload Using Lambda",
	// 		payload: {
	// 			maxBytes: 1000 * 1000 * 500,
	// 			parse: true,
	// 			output: "file"
	// 		},
	// 		validate: {
	// 			headers: validator.headerObject["required"],
	// 			payload: {
	// 				image: Joi.any()
	// 					.meta({ swaggerType: "file" })
	// 					.required()
	// 					.description("file exprension .csv|.xlsx|.xls")
	// 			},
	// 			failAction: appUtils.failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				payloadType: "form",
	// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
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
					message = "Hi your email is verified . Please login to continue."
					title = "Email Already verified";
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
				let message;
				let title;
				if (error === "alreadyVerified") {
					message = "Hi your email is verified . Please login to continue."
					title = "Email Already verified";
					return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), title: title });
				} else {
					// const message = "Your link has been expired. Please regenerate your link again.";
					message = "Hi there, your link has expired because you haven't used it. Link expires in every 10 minutes and can only be used once. Please try again."
					title = "Link expired";
				}
				return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear(), title: title });
				// const message = "Your link has been expired. Please regenerate your link again.";
				// return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear() });
			}
		},
		options: {
			tags: ["api", "user"],
			description: "user verify email register Deep Link",
			validate: {
				payload: {
					// android: Joi.string().trim().optional(),
					// ios: Joi.string().trim().optional(),
					// fallback: Joi.string().trim().optional(),
					token: Joi.string().trim().optional(),
					userId: Joi.string().required(),
					// name: Joi.string().required(),
					// type: Joi.string().trim().valid(["verifyEmail"]).optional(),
					// accountLevel: Joi.string().trim().valid([
					// config.CONSTANT.ACCOUNT_LEVEL.USER
					// ]).required()
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