"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
const fs = require("fs");
import * as Joi from "joi";
const { Readable } = require("stream");

import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { userController } from "@modules/user/UserController";
import * as validateUser from './userValidator';
export const
	userRoute: ServerRoute = [
		{
			method: "POST",
			path: `${config.SERVER.API_BASE_URL}/v1/user/register`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				const payload: UserRequest.Signup = request.payload;
				try {
					console.log(' request.info. request.info.', request.info);
					const xFF = request.headers['x-forwarded-for']
					const ip = xFF ? xFF.split(',')[0] : request.info.remoteAddress;
					payload['getIpfromNtwk'] = ip;

					const result = await userController.signup({ ...headers, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User signup via (email | mobile) and password",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.headerObject["required"],
					payload: validateUser.signUp,
					failAction: appUtils.failActionFunction,
				},
				plugins: {
					"hapi-swagger": {
						responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
					}
				}
			}
		},
		{
			method: "PUT",
			path: `${config.SERVER.API_BASE_URL}/v1/user/location`,
			handler: async (request: Request, h: ResponseToolkit) => {
				let userData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				let payload: UserRequest.Location = request.payload;
				try {
					const result = await userController.updateUserLocation(payload, userData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "Set user location",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					headers: validator.userAuthorizationHeaderObj,
					payload: validateUser.localtion,
					failAction: appUtils.failActionFunction,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/login`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				const requestInfo: Device = request.info;
				const payload: UserRequest.Login = request.payload;
				try {
					const result = await userController.login({ ...headers, ...requestInfo, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User Login",
				notes: "User login via (email | mobile) and password",
				auth: 'BasicAuth',
				validate: {
					headers: validator.headerObject["required"],
					payload: validateUser.login,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/resend-otp`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				const payload: UserRequest.SendOtp = request.payload;
				try {
					const result = await userController.resendOtp({ ...headers, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User signup via (email | mobile) and password",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					payload: validateUser.resendOTP,
					headers: validator.headerObject["optional"],
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/verify-otp`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const userData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;

				const headers = request.headers;
				const payload: UserRequest.verifyOTP = request.payload;
				try {
					const result = await userController.verifyOTP({ ...headers, ...payload }, userData);
					// result["data"] = {}
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User verify OTP (email | mobile) and password",
				// notes: "",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					headers: validator.userAuthorizationHeaderObj,
					payload: validateUser.verifyOtp,
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
			method: "PATCH",
			path: `${config.SERVER.API_BASE_URL}/v1/user/verify-forgotPassword`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				const payload: UserRequest.verifyOTP = request.payload;
				try {
					const result = await userController.verifyForGotOTP({ ...headers, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User signup via (email | mobile) and password",
				// notes: "",
				auth: 'BasicAuth',
				validate: {
					headers: validator.headerObject["required"],
					payload: validateUser.verifyForGotOtp,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/social-login`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				const requestInfo: Device = request.info;
				const payload: UserRequest.SocialLogin = request.payload;
				try {
					const result = await userController.socialLogin({ ...headers, ...requestInfo, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "Social Login",
				notes: "Social Login (facebook/google)",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.headerObject["required"],
					payload: validateUser.socialLogin,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/social-signup`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				const requestInfo: Device = request.info;
				const payload: UserRequest.SocialSignup = request.payload;
				try {
					const result = await userController.socialSignup({ ...headers, ...requestInfo, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "Social Signup",
				notes: "Social Signup (facebook/google)",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.headerObject["required"],
					payload: validateUser.socialSignUp,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/forgot-password`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const payload: ForgotPasswordRequest = request.payload;
				try {
					const result = await userController.forgotPassword(payload);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "Forgot Password",
				notes: "Send Password reset link on (email | mobile)",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.headerObject["optional"],
					payload: validateUser.forGotPassword,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/logout`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const accessToken = request.headers["authorization"].split(" ")[1];
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				try {
					const result = await userController.logout({ "accessToken": accessToken }, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User Logout",
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
						responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
					}
				}
			}
		},

		{
			method: 'PATCH',
			path: `${config.SERVER.API_BASE_URL}/v1/user/reset-password`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				// const requestInfo: Device = request.info;
				const payload = request.payload;
				try {
					const result = await userController.resetPassword({ ...payload, ...headers });

					return responseHandler.sendSuccess(h, result);

				} catch (error) {
					// const message = "Your link has been expired. Please regenerate your link again.";
					// return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear() });
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "user reset password",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.headerObject["required"],
					payload: validateUser.resetPassword,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/profile`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				const userId = request.query.userId;
				try {
					const result = await userController.profile(tokenData, userId);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User Profile",
				// notes: "",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					query: {
						userId: Joi.string()
					},
					headers: validator.userAuthorizationHeaderObj,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/profile`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const userData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				const payload = request.payload
				try {
					const result = await userController.updateProfile(payload, userData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User update Profile from login screen or register screen",
				// notes: "",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					payload: validateUser.updateProfile,
					headers: validator.userAuthorizationHeaderObj,
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
			method: "PATCH",
			path: `${config.SERVER.API_BASE_URL}/v1/user/profile`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const userData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				const payload = request.payload
				try {
					const result = await userController.updateProfileUser(payload, userData, { accessToken: request.headers.authorization });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User update Profile",
				// notes: "",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					payload: validateUser.updateProfileUser,
					headers: validator.userAuthorizationHeaderObj,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/profile/home`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				const query = request.query;
				try {
					if (query && query.userId) {
						query["user"] = query.userId
					}
					const result = await userController.getProfileHome(query, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user", "home"],
				description: "User Profile home",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					query: validateUser.validateProfileHome,
					headers: validator.userAuthorizationHeaderObj,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/member`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				// const params = request.params;
				try {
					const result = await userController.getMemberOfDayDetail(tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user", "home"],
				description: "User Profile home",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					// params: validateUser.memberOfDay,
					headers: validator.userAuthorizationHeaderObj,
					failAction: appUtils.failActionFunction
				},
				plugins: {
					"hapi-swagger": {
						responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
					}
				}
			}
		},


		// {
		// 	method: "GET",
		// 	path: `${config.SERVER.API_BASE_URL}/v1/user/{userId}`,
		// 	handler: async (request: Request, h: ResponseToolkit) => {
		// 		const userId: UserId = request.params;
		// 		try {
		// 			const result = await userController.getUserProfile(userId);
		// 			return responseHandler.sendSuccess(h, result);
		// 		} catch (error) {
		// 			return responseHandler.sendError(error);
		// 		}
		// 	},
		// 	options: {
		// 		tags: ["api", "discover"],
		// 		description: "get User profile",
		// 		auth: {
		// 			strategies: ["UserAuth"]
		// 		},
		// 		validate: {
		// 			headers: validator.userAuthorizationHeaderObj,
		// 			params: validateUser.validateUserIdParams,
		// 			failAction: appUtils.failActionFunction
		// 		},
		// 		plugins: {
		// 			"hapi-swagger": {
		// 				responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
		// 			}
		// 		}
		// 	}
		// },

		{
			method: "PATCH",
			path: `${config.SERVER.API_BASE_URL}/v1/user/change-password`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				const payload = request.payload;
				try {
					const result = await userController.changePassword(payload, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "Change Password",
				notes: "change password",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					headers: validator.userAuthorizationHeaderObj,
					payload: validateUser.changePassword,
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
			method: "PATCH",
			path: `${config.SERVER.API_BASE_URL}/v1/user/test-build`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				const payload = request.payload;
				try {
					const result = await userController.changePassword(payload, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "Change Password",
				notes: "change password",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					headers: validator.userAuthorizationHeaderObj,
					// payload: validateUser.changePassword,
					failAction: appUtils.failActionFunction
				},
				plugins: {
					"hapi-swagger": {
						responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
					}
				}
			}
		},
	];