"use strict";

import { ServerRoute, Request, ResponseToolkit } from "hapi";
import * as Joi from "joi";

import * as appUtils from "@utils/appUtils";
import * as validator from "@utils/validator";
import { contentController } from "@modules/content/v1/ContentController";
import * as config from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const contentRoute: ServerRoute = [
	{
		method: "POST",
		path: `${config.SERVER.API_BASE_URL}/v1/content`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: ContentRequest.Add = request.payload;
			try {
				const result = await contentController.addContent(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Add Content",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					title: Joi.string().trim().required(),
					description: Joi.string().trim().required(),
					type: Joi.string()
						.trim()
						.valid([
							config.CONSTANT.CONTENT_TYPE.CONTACT_US,
							config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY,
							config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS,
							config.CONSTANT.CONTENT_TYPE.ABOUT_US,
							config.CONSTANT.CONTENT_TYPE.FAQ,
						])
						.required()
						.description("'1'-Privacy Policy, '2'-Terms & Conditions, '3'-FAQ, '4'-Contact Us")
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
		path: `${config.SERVER.API_BASE_URL}/v1/content`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: ListingRequest = request.query;
			try {
				const result = await contentController.contentList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Content List",
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
					sortBy: Joi.string().trim().valid("title", "created").optional().description("title, created"),
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/{contentId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: ContentRequest.Id = request.params;
			try {
				const result = await contentController.deleteContent(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Delete Content",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					contentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/details`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const query: ContentRequest.Id = request.query;
			try {
				const result = await contentController.contentDetails(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Content Details",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				query: {
					contentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/{contentId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: ContentRequest.Id = request.params;
			const payload: ContentRequest.Edit = request.payload;
			try {
				const result = await contentController.editContent({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Update Content",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					contentId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					title: Joi.string().trim().required(),
					description: Joi.string().trim().required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/view`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const query: ContentRequest.View = request.query;
			try {
				const result = await contentController.viewContent({ ...query });
				console.log('resultresultresult', result);

				return h.view("content-page", { "content": result.data.description });
				// return responseHandler.sendSuccess(h, result);
				// } else {
				// 	return h.view("content-page", { "content": result.data.description });
				// }
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "View Content",
			validate: {
				query: {
					type: Joi.string()
						.trim()
						.valid([
							config.CONSTANT.CONTENT_TYPE.CONTACT_US,
							config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY,
							config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS,
							config.CONSTANT.CONTENT_TYPE.ABOUT_US,
							config.CONSTANT.CONTENT_TYPE.FAQ,
						]).required()
						.description("'1'-Privacy Policy, '2'-Terms & Conditions, '3'-FAQ, '4'-Contact Us"),
					from: Joi.string().allow(['user', 'admin'])
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/faq`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const payload: ContentRequest.AddFaq = request.payload;
			try {
				const result = await contentController.addFaq(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Add Faq",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				payload: {
					question: Joi.string().trim().required(),
					answer: Joi.string().trim().required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/faq`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			try {
				const result = await contentController.faqList(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Faq List",
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
					// payloadType: 'form',
					responseMessages: config.CONSTANT.SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PUT",
		path: `${config.SERVER.API_BASE_URL}/v1/content/faq/{faqId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: ContentRequest.FaqId = request.params;
			const payload: ContentRequest.EditFaq = request.payload;
			try {
				const result = await contentController.editFaq({ ...params, ...payload }, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Edit Faq",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					faqId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
				},
				payload: {
					question: Joi.string().trim().required(),
					answer: Joi.string().trim().required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/faq/{faqId}`,
		handler: async (request: Request, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData.adminData;
			const params: ContentRequest.FaqId = request.params;
			try {
				const result = await contentController.deleteFaq(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "Delete Faq",
			// notes: "",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: validator.adminAuthorizationHeaderObj,
				params: {
					faqId: Joi.string().trim().regex(config.CONSTANT.REGEX.MONGO_ID).required()
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
		path: `${config.SERVER.API_BASE_URL}/v1/content/view/faq`,
		handler: async (request: Request, h: ResponseToolkit) => {
			try {
				const result = await contentController.viewFaq();
				return h.view("faq", { "content": result.data });
			} catch (error) {
				return responseHandler.sendError(error);
			}
		},
		config: {
			tags: ["api", "content"],
			description: "View Faq",
			validate: {
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
	// 	method: "GET",
	// 	path: `${config.SERVER.API_BASE_URL}/v1/users/content/view`,
	// 	handler: async (request: Request, h: ResponseToolkit) => {
	// 		const query: ContentRequest.View = request.query;
	// 		try {
	// 			const result = await contentController.viewContent({ ...query });
	// 			// return h.view("content-page", { "content": result.data.description });
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(error);
	// 		}
	// 	},
	// 	config: {
	// 		tags: ["api", "content"],
	// 		description: "View Content user",
	// 		validate: {
	// 			query: {
	// 				type: Joi.string()
	// 					.trim()
	// 					.valid([
	// 						config.CONSTANT.CONTENT_TYPE.CONTACT_US,
	// 						config.CONSTANT.CONTENT_TYPE.PRIVACY_POLICY,
	// 						config.CONSTANT.CONTENT_TYPE.TERMS_AND_CONDITIONS,
	// 						config.CONSTANT.CONTENT_TYPE.ABOUT_US
	// 					])
	// 					.required()
	// 					.description("'1'-Privacy Policy, '2'-Terms & Conditions, '3'-FAQ, '4'-Contact Us")
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


];