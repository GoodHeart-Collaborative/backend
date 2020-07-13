"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
		CONTENT_ALREADY_EXIST: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Content with this type is already exists.",
			"type": "CONTENT_ALREADY_EXIST"
		},
		CONTENT_NOT_FOUND: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.BAD_REQUEST,
			"message": "Content not fouund.",
			"type": "CONTENT_NOT_FOUND"
		}
	},
	SUCCESS: {
		ADD_CONTENT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
			"message": "Content added successfully.",
			"type": "ADD_CONTENT"
		},
		CONTENT_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Content list get successfully.",
				"type": "CONTENT_LIST",
				"data": data
			};
		},
		DELETE_CONTENT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Content deleted successfully.",
			"type": "DELETE_CONTENT"
		},
		CONTENT_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Content details get successfully.",
				"type": "CONTENT_DETAILS",
				"data": data
			};
		},
		EDIT_CONTENT: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UPDATED,
			"message": "Content edited successfully.",
			"type": "EDIT_CONTENT"
		}
	}
};