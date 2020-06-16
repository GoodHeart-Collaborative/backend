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

export const
	userRoute: ServerRoute = [
		{
			method: "POST",
			path: `${config.SERVER.API_BASE_URL}/v1/user`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const headers: Device = request.headers;
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
					headers: validator.headerObject["required"],
					payload: {
						firstName: Joi.string()
							.trim()
							.min(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH)
							.required(),
						middleName: Joi.string()
							.trim()
							.min(config.CONSTANT.VALIDATION_CRITERIA.MIDDLE_NAME_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.MIDDLE_NAME_MAX_LENGTH)
							.optional(),
						lastName: Joi.string()
							.trim()
							.min(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH)
							.optional(),
						email: Joi.string()
							.trim()
							.lowercase({ force: true })
							.email({ minDomainAtoms: 2 })
							.regex(config.CONSTANT.REGEX.EMAIL)
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
						password: Joi.string()
							.trim()
							.regex(config.CONSTANT.REGEX.PASSWORD)
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
			path: "/v1/user/login",
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
						password: Joi.string()
							.trim()
							.regex(config.CONSTANT.REGEX.PASSWORD)
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
					payload: {
						socialLoginType: Joi.string()
							.trim()
							.lowercase({ force: true })
							.required()
							.valid([
								config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK,
								config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE
							]),
						socialId: Joi.string().trim().required(),
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
					payload: {
						socialLoginType: Joi.string()
							.trim()
							.lowercase({ force: true })
							.required()
							.valid([
								config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK,
								config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE
							]),
						socialId: Joi.string().trim().required(),
						firstName: Joi.string()
							.trim()
							.min(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.FIRST_NAME_MAX_LENGTH)
							.required(),
						middleName: Joi.string()
							.trim()
							.min(config.CONSTANT.VALIDATION_CRITERIA.MIDDLE_NAME_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.MIDDLE_NAME_MAX_LENGTH)
							.optional(),
						lastName: Joi.string()
							.trim()
							.min(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MIN_LENGTH)
							.max(config.CONSTANT.VALIDATION_CRITERIA.LAST_NAME_MAX_LENGTH)
							.optional(),
						email: Joi.string()
							.trim()
							.lowercase({ force: true })
							.email({ minDomainAtoms: 2 })
							.regex(config.CONSTANT.REGEX.EMAIL)
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
						dob: Joi.number().optional(),
						gender: Joi.string()
							.trim()
							.lowercase({ force: true })
							.optional()
							.valid([
								config.CONSTANT.GENDER.MALE,
								config.CONSTANT.GENDER.FEMALE
							]),
						profilePicture: Joi.string().trim().required(),
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
					payload: {
						email: Joi.string()
							.trim()
							.lowercase({ force: true })
							.email({ minDomainAtoms: 2 })
							.regex(config.CONSTANT.REGEX.EMAIL)
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
			method: "GET",
			path: `${config.SERVER.API_BASE_URL}/v1/user/list`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const query: ListingRequest = request.query;
				try {
					const result = await userController.userList(query, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "User List",
				// notes: "",
				auth: {
					strategies: ["AdminAuth"]
				},
				validate: {
					headers: validator.adminAuthorizationHeaderObj,
					query: {
						pageNo: Joi.number().required().description("Page no"),
						limit: Joi.number().required().description("limit"),
						searchKey: Joi.string().optional().description("Search by firstName, middleName, lastName, email"),
						sortBy: Joi.string().trim().lowercase({ force: true }).valid("firstName", "middleName", "lastName", "dob", "created").optional().description("firstName, middleName, lastName, dob, created"),
						sortOrder: Joi.number().optional().description("1 for asc, -1 for desc"),
						status: Joi.string()
							.trim()
							.lowercase({ force: true })
							.optional()
							.valid([
								config.CONSTANT.STATUS.BLOCKED,
								config.CONSTANT.STATUS.UN_BLOCKED
							])
							.description("Status => 'blocked', 'unblocked'"),
						fromDate: Joi.number().optional().description("in timestamp"),
						toDate: Joi.number().optional().description("in timestamp")
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/export`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const query: ListingRequest = request.query;
				try {
					const result = await userController.exportUser(query, tokenData);
					const fileName: string = new Date().getTime() + "_users";
					if (query.type === "csv") {
						const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}.csv`;
						const wstream = fs.createWriteStream(filePath);
						await wstream.write(result.data);
						wstream.end();
						const readStream = fs.createReadStream(filePath);
						const streamData = new Readable().wrap(readStream);
						appUtils.deleteFiles(filePath);
						return h.response(streamData)
							.header("Content-Type", "text/csv")
							.header("Content-Disposition", "attachment; filename= " + fileName + ".csv");
					} else { // xlsx
						const response = request.raw.res;
						const Reportres = result.data;
						response.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
						response.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xlsx");
						response.setHeader("Access-Control-Allow-Origin", "*");
						await Reportres.write(response);
						response.end();
						return h.abandon;
					}
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "Export User",
				// notes: "",
				auth: {
					strategies: ["AdminAuth"]
				},
				validate: {
					headers: validator.adminAuthorizationHeaderObj,
					query: {
						searchKey: Joi.string().optional().description("Search by firstName, middleName, lastName, email"),
						sortBy: Joi.string().trim().lowercase({ force: true }).valid("firstName", "middleName", "lastName", "dob", "created").optional().description("firstName, middleName, lastName, dob, created"),
						sortOrder: Joi.number().optional().description("1 for asc, -1 for desc"),
						status: Joi.string()
							.trim()
							.lowercase({ force: true })
							.optional()
							.valid([
								config.CONSTANT.STATUS.BLOCKED,
								config.CONSTANT.STATUS.UN_BLOCKED
							])
							.description("Status => 'blocked', 'unblocked'"),
						fromDate: Joi.number().optional().description("in timestamp"),
						toDate: Joi.number().optional().description("in timestamp"),
						type: Joi.string().trim().lowercase({ force: true }).valid("csv", "xlsx").required().description("csv, xlsx")
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/elastic-search`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const query: ListingRequest = request.query;
				try {
					const result = await userController.userListWithElasticSearch(query, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "User List",
				// notes: "",
				auth: {
					strategies: ["AdminAuth"]
				},
				validate: {
					headers: validator.adminAuthorizationHeaderObj,
					query: {
						pageNo: Joi.number().required().description("Page no"),
						limit: Joi.number().required().description("limit"),
						searchKey: Joi.string().optional().description("Search by firstName, middleName, lastName, email"),
						sortBy: Joi.string().trim().lowercase({ force: true }).valid("firstName", "middleName", "lastName", "dob", "created").optional().description("firstName, middleName, lastName, dob, created"),
						sortOrder: Joi.number().optional().description("1 for asc, -1 for desc"),
						status: Joi.string()
							.trim()
							.lowercase({ force: true })
							.optional()
							.valid([
								config.CONSTANT.STATUS.BLOCKED,
								config.CONSTANT.STATUS.UN_BLOCKED
							])
							.description("Status => 'blocked', 'unblocked'"),
						fromDate: Joi.number().optional().description("in timestamp"),
						toDate: Joi.number().optional().description("in timestamp"),
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
			method: "POST",
			path: `${config.SERVER.API_BASE_URL}/v1/user/block/{userId}`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const params: UserId = request.params;
				const payload: BlockRequest = request.payload;
				try {
					const result = await userController.blockUnblock({ ...params, ...payload }, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "Block User",
				notes: "Block Unblock User",
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
								config.CONSTANT.STATUS.UN_BLOCKED
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/bulk-block`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const payload: UserRequest.MultiBlock = request.payload;
				try {
					const result = await userController.multiBlockUnblock(payload, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "Block User",
				notes: "Multiple Block Unblock Users",
				auth: {
					strategies: ["AdminAuth"]
				},
				validate: {
					headers: validator.adminAuthorizationHeaderObj,
					payload: {
						userIds: Joi.array().items(Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()).required(),
						status: Joi.string()
							.trim()
							.lowercase({ force: true })
							.required()
							.valid([
								config.CONSTANT.STATUS.BLOCKED,
								config.CONSTANT.STATUS.UN_BLOCKED
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
			path: `${config.SERVER.API_BASE_URL}/v1/user/{userId}`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const params: UserId = request.params;
				try {
					const result = await userController.deleteUser(params, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "Delete User",
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
			method: "GET",
			path: `${config.SERVER.API_BASE_URL}/v1/user/details`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const query: UserId = request.query;
				try {
					const result = await userController.userDetails(query, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			options: {
				tags: ["api", "user"],
				description: "User Details",
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
			method: "GET",
			path: `${config.SERVER.API_BASE_URL}/v1/user/export/import-file-sample`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const query: ListingRequest = request.query;
				try {
					const result = await userController.sampleFile(query, tokenData);
					const fileName: string = new Date().getTime() + "_sample";
					if (query.type === "csv") {
						const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}.csv`;
						const wstream = fs.createWriteStream(filePath);
						await wstream.write(result.data);
						wstream.end();
						const readStream = fs.createReadStream(filePath);
						const streamData = new Readable().wrap(readStream);
						appUtils.deleteFiles(filePath);
						return h.response(streamData)
							.header("Content-Type", config.CONSTANT.MIME_TYPE.CSV2)
							.header("Content-Disposition", "attachment; filename= " + fileName + ".csv");
					} else { // xlsx
						const response = request.raw.res;
						const Reportres = result.data;
						response.setHeader("Content-Type", config.CONSTANT.MIME_TYPE.XLSX);
						response.setHeader("Content-Disposition", "attachment; filename=" + fileName + ".xlsx");
						response.setHeader("Access-Control-Allow-Origin", "*");
						await Reportres.write(response);
						response.end();
						return h.abandon;
					}
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "Sample Export",
				// notes: "",
				auth: {
					strategies: ["AdminAuth"]
				},
				validate: {
					headers: validator.adminAuthorizationHeaderObj,
					query: {
						type: Joi.string().trim().lowercase({ force: true }).valid("csv", "xlsx").required().description("csv, xlsx")
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
			method: "POST",
			path: `${config.SERVER.API_BASE_URL}/v1/user/import`,
			handler: async (request: Request, h: ResponseToolkit) => {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
				const payload: UserRequest.ImportUsers = request.payload;
				try {
					const result = await userController.importUsers(payload, tokenData);
					return responseHandler.sendSuccess(h, result);
				} catch (error) {
					return responseHandler.sendError(error);
				}
			},
			config: {
				tags: ["api", "user"],
				description: "Import User",
				// notes: "",
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
		}
	];