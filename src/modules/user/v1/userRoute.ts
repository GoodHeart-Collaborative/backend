"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
const fs = require("fs");
import * as Joi from "joi";
const { Readable } = require("stream");

import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { userController } from "@modules/user/v1/UserController";
import { join } from "path";
import * as validateUser from '../userValidator';
export const
	userRoute: ServerRoute = [
		{
			method: "POST",
			path: `${config.SERVER.API_BASE_URL}/v1/user/register`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				console.log('headersheadersheadersheadersheadersheadersheaders', headers);
				const payload: UserRequest.Signup = request.payload;
				try {
					const result = await userController.signup({ ...headers, ...payload });
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User signup via (email | mobile) and password",
				// notes: "",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.userAuthorizationHeaderObj,
					payload: validateUser.signUp,
					failAction: appUtils.failActionFunction,
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/login`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				console.log('headersheadersheaders', headers);

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
						// payloadType: 'form',
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
				console.log('headersheadersheadersheadersheadersheadersheaders', headers);

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
				// notes: "",
				// auth: {
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
						// payloadType: 'form',
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
				console.log('userDatauserDatauserDatauserDatauserData>>>>>>>>>', userData);

				const headers: Device = request.headers;
				console.log('headersheadersheaders', headers);


				const payload: UserRequest.verifyOTP = request.payload;
				try {
					const result = await userController.verifyOTP({ ...headers, ...payload }, userData);
					result["data"] = {}
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
					payload: {
						otp: Joi.number().min(1000).max(9999).required(),
						type: Joi.string().valid('email', 'mobile').default('mobile'),
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
			method: "PATCH",
			path: `${config.SERVER.API_BASE_URL}/v1/user/verify-forgotPassword`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
				// const userData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;

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
						// payloadType: 'form',
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
						// payloadType: 'form',
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
				console.log('payloadpayloadpayloadpayloadpayloadpayloadpayloadpayload', payload);
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
					payload: {
						email: Joi.string()
							.trim()
							.lowercase()
							.email()
							.optional(),
						countryCode: Joi.string()
							.trim()
							.regex(config.CONSTANT.REGEX.COUNTRY_CODE)
							.min(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.COUNTRY_CODE_MAX_LENGTH)
							.optional(),
						mobileNo: Joi.string()
							.trim()
							.regex(config.CONSTANT.REGEX.MOBILE_NUMBER)
							.optional(),
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
						// payloadType: 'form',
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
				console.log('payloadpayloadpayloadpayloadpayloadpayload', payload);
				try {
					const result = await userController.resetPassword({ ...payload, ...headers });

					return responseHandler.sendSuccess(h, result);

				} catch (error) {
					console.log('errorerrorerror', error);
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "user reset password",
				// notes: "",
				auth: {
					strategies: ["BasicAuth"]
				},
				validate: {
					headers: validator.headerObject["required"],
					payload: {
						token: Joi.string().required(),
						password: Joi.string()
							.trim()
							// .regex(config.CONSTANT.REGEX.PASSWORD)
							.min(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
							.default(config.CONSTANT.DEFAULT_PASSWORD)
							.required(),
						// countryCode: Joi.string(),
						// mobileNo: Joi.string(),
						type: Joi.string().valid(['mobile', 'email']).required()
						// deviceId: Joi.string(),
						// deviceToken: Joi.string()
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
		// 	method: "DELETE",
		// 	path: `${config.SERVER.API_BASE_URL}/v1/user/{userId}`,
		// 	handler: async (request: Request, h: ResponseToolkit) => {
		// 		const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
		// 		const params: UserId = request.params;
		// 		try {
		// 			const result = await userController.deleteUser(params, tokenData);
		// 			return responseHandler.sendSuccess(h, result);
		// 		} catch (error) {
		// 			return responseHandler.sendError(error);
		// 		}
		// 	},
		// 	options: {
		// 		tags: ["api", "user"],
		// 		description: "Delete User",
		// 		// notes: "",
		// 		auth: {
		// 			strategies: ["AdminAuth"]
		// 		},
		// 		validate: {
		// 			headers: validator.adminAuthorizationHeaderObj,
		// 			params: {
		// 				userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		// 	method: "GET",
		// 	path: `${config.SERVER.API_BASE_URL}/v1/user/details`,
		// 	handler: async (request: Request, h: ResponseToolkit) => {
		// 		const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
		// 		const query: UserId = request.query;
		// 		try {
		// 			const result = await userController.userDetails(query, tokenData);
		// 			return responseHandler.sendSuccess(h, result);
		// 		} catch (error) {
		// 			return responseHandler.sendError(error);
		// 		}
		// 	},
		// 	options: {
		// 		tags: ["api", "user"],
		// 		description: "User Details",
		// 		// notes: "",
		// 		auth: {
		// 			strategies: ["AdminAuth"]
		// 		},
		// 		validate: {
		// 			headers: validator.adminAuthorizationHeaderObj,
		// 			query: {
		// 				userId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		{
			method: "GET",
			path: `${config.SERVER.API_BASE_URL}/v1/user/profile`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.userData;
				try {
					const result = await userController.profile(tokenData);
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
		},
		{
			method: "PATCH",
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
				description: "User Profile",
				// notes: "",
				auth: {
					strategies: ["UserAuth"]
				},
				validate: {
					payload: {
						dob: Joi.string(),
						profession: Joi.string().allow(''),
						// userName: Joi.string(),
						industryType: Joi.string().valid([
							config.INDUSTRIES.Compassion_Fatigue,
							config.INDUSTRIES.Experts_in_Executive_Burnout,
							config.INDUSTRIES.Licensed_Therapists_specializing_in_Vicarious_and_Secondary_Trauma,
							config.INDUSTRIES.Nonprofit_Resiliency_Coaches,
							config.INDUSTRIES.Wellness_Coaches,
						]).allow(''),
						experience: Joi.string().valid([
							'Junior', 'Mid', 'Senior',
						]),
						about: Joi.string().allow('')
					},
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
		},

	];