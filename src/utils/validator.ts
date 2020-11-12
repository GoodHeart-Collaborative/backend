"use strict";

import * as Joi from "joi";

import * as config from "@config/index";

const userAuthorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : of user"),
	platform: Joi.string()
		.trim()
		.optional()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		])
		.description("device OS '1'-Android, '2'-iOS, '3'-WEB"),
	timezone: Joi.string().default("0").optional().description("time zone")
}).unknown();

const adminAuthorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : of admin"),
	platform: Joi.string()
		.trim()
		.optional()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		])
		.description("device OS '1'-Android, '2'-iOS, '3'-WEB"),
	timezone: Joi.string().default("0").optional().description("time zone")
}).unknown();

const commonAuthorizationHeaderObj = Joi.object({
	authorization: Joi.string().required().description("Bearer space accessToken : of admin or user"),
	platform: Joi.string()
		.trim()
		.required()
		.valid([
			config.CONSTANT.DEVICE_TYPE.ANDROID,
			config.CONSTANT.DEVICE_TYPE.IOS,
			config.CONSTANT.DEVICE_TYPE.WEB
		])
		.description("device OS '1'-Android, '2'-iOS, '3'-WEB").error(errors => {
			errors.forEach(err => {
				switch (err.type) {
					case "any.empty":
						err.message = "Platform is required.";
						break;
					case "any.required":
						err.message = "Platform is required.";
						break;
					default:
						break;
				}
			});
			return errors;
		}),
	timezone: Joi.number().default("0").optional().description("time zone")
}).unknown();

const headerObject = {
	"required": Joi.object({
		platform: Joi.string()
			.trim()
			.required()
			.valid([
				config.CONSTANT.DEVICE_TYPE.ANDROID,
				config.CONSTANT.DEVICE_TYPE.IOS,
				config.CONSTANT.DEVICE_TYPE.WEB
			])
			.description("device OS '1'-Android, '2'-iOS, '3'-WEB").error(errors => {
				errors.forEach(err => {
					switch (err.type) {
						case "any.empty":
							err.message = "Platform is required.";
							break;
						case "any.required":
							err.message = "Platform is required.";
							break;
						default:
							break;
					}
				});
				return errors;
			}),
		timezone: Joi.string().default("0").required().description("time zone")
	}).unknown(),

	"optional": Joi.object({
		platform: Joi.string()
			.trim()
			.required()
			.valid([
				config.CONSTANT.DEVICE_TYPE.ANDROID,
				config.CONSTANT.DEVICE_TYPE.IOS,
				config.CONSTANT.DEVICE_TYPE.WEB
			])
			.description("device OS '1'-Android, '2'-iOS, '3'-WEB").error(errors => {
				errors.forEach(err => {
					switch (err.type) {
						case "any.empty":
							err.message = "Platform is required.";
							break;
						case "any.required":
							err.message = "Platform is required.";
							break;
						default:
							break;
					}
				});
				return errors;
			}),
		timezone: Joi.string().default("0").optional().description("time zone")
	}).unknown()
};

export {
	userAuthorizationHeaderObj,
	adminAuthorizationHeaderObj,
	commonAuthorizationHeaderObj,
	headerObject
};