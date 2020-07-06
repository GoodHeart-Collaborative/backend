"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		EMAIL_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this email is already registered.",
			"type": "EMAIL_ALREADY_EXIST"
		},
		USER_ACCOUNT_SCREENING: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Your Account is in screening",
			"type": "BLOCKED_USER"
		},
		MOBILE_NO_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "User with this mobile number is already registered.",
			"type": "MOBILE_NO_ALREADY_EXIST"
		},
		MOBILE_NO_NOT_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Please register your mobile number.",
			"type": "MOBILE_NO_NOT_REGISTERED"
		},
		OTP_NOT_MATCH: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Incorrect Otp",
			"type": "Verify otp not match"
		},
		EMAIL_OR_PHONE_REQUIRED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Either email or phone number is required.",
			"type": "EMAIL_OR_PHONE_REQUIRED"
		},
		SOCIAL_ACCOUNT_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.SOCIAL_ACCOUNT_ALREADY_EXIST,
			"message": "Account with this social id already exist.",
			"type": "SOCIAL_ACCOUNT_ALREADY_EXIST"
		},
		SOCIAL_ACCOUNT_NOT_REGISTERED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.SOCIAL_ACCOUNT_ALREADY_EXIST,
			"message": "Account with this social id not registered.",
			"type": "SOCIAL_ACCOUNT_NOT_REGISTERED"
		},
		REFRESH_TOKEN_REQUIRED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Refresh token is required.",
			"type": "REFRESH_TOKEN_REQUIRED"
		},
		INVALID_REFRESH_TOKEN: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Invalid refresh token.",
			"type": "INVALID_REFRESH_TOKEN"
		},
		CANNOT_CHANGE_PASSWORD: {
			statusCode: config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			message: "You cannot reset your password since you have logged in using Social Account.",
			type: "CANNOT_CHANGE_PASSWORD"
		},
		CANNOT_LOGIN: {
			statusCode: config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			message: "You cannot login since you have logged in using Social Account.",
			type: "CANNOT_LOGIN"
		}
	},
	SUCCESS: {
		DEFAULT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "SUCCESS",
			"type": "DEFAULT"
		},
		PASSWORD_SUCCESSFULLY_CHANGED: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Password successfully changed",
			"type": "DEFAULT"
		},
		DEFAULT_WITH_DATA: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "SUCCESS",
				"type": "DEFAULT",
				"data": data
			}
		},
		SIGNUP: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
				"message": "Your account has been created successfully.",
				"type": "SIGNUP",
				"data": data
			};
		},
		LOGIN: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Logged-In successfully.",
				"type": "LOGIN",
				"data": data
			};
		},
		FORGET_PASSWORD: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Logged-In successfully.",
				"type": "LOGIN",
				"data": data
			};
		},
		FORGOT_PASSWORD_ON_EMAIL: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Please check your e-mail for password reset link.",
			"type": "FORGOT_PASSWORD_ON_EMAIL"
		},
		FORGOT_PASSWORD_ON_PHONE: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Please check your number for password reset link.",
			"type": "FORGOT_PASSWORD_ON_PHONE",
		},
		// FORGET_PASSWORD: {
		// 	"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
		// 	"message": "Please check your number for password reset link.",
		// 	"type": "FORGOT_PASSWORD_ON_PHONE",
		// },
		CHANGE_FORGOT_PASSWORD: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Password changed successfully.",
			"type": "CHANGE_FORGOT_PASSWORD"
		},
		LOGOUT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Logout successfully.",
			"type": "LOGOUT"
		},
		USER_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User list get successfully.",
				"type": "USER_LIST",
				"data": data
			};
		},
		EXPORT_USER: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Users export successfully.",
				"type": "EXPORT_USER",
				"data": data
			};
		},
		BLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User account successfully blocked.",
			"type": "BLOCK_USER"
		},
		UNBLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User account successfully unblocked.",
			"type": "UNBLOCK_USER"
		},
		MULTI_BLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Users account successfully blocked.",
			"type": "BLOCK_USER"
		},
		MULTI_UNBLOCK_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Users account successfully unblocked.",
			"type": "UNBLOCK_USER"
		},
		DELETE_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "User deleted successfully.",
			"type": "DELETE_USER"
		},
		USER_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User details get successfully.",
				"type": "USER_DETAILS",
				"data": data
			};
		},
		PROFILE: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "User profile get successfully.",
				"type": "PROFILE",
				"data": data
			};
		},
		IMPORT_USER: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Users imported successfully.",
			"type": "IMPORT_USER"
		}
	},
	OTP_TEXT: (otp) => {
		return `Your App code is " + ${otp} + ". " + "Welcome to the community!`
	},
};