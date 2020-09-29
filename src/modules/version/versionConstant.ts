"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
	},
	SUCCESS: {
		ADD_VERSION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
			"message": "Version added successfully.",
			"type": "ADD_VERSION"
		},
		VERSION_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Version list get successfully.",
				"type": "VERSION_LIST",
				"data": data
			};
		},
		DELETE_VERSION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Version deleted successfully.",
			"type": "DELETE_VERSION"
		},
		VERSION_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Version details get successfully.",
				"type": "VERSION_DETAILS",
				"data": data
			};
		},
		EDIT_VERSION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UPDATED,
			"message": "Version edited successfully.",
			"type": "EDIT_VERSION"
		}
	}
};