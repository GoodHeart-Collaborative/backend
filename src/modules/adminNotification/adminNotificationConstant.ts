"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
	},
	SUCCESS: {
		ADD_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.CREATED,
			"message": "Notification added successfully.",
			"type": "ADD_NOTIFICATION"
		},
		NOTIFICATION_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Notification list get successfully.",
				"type": "NOTIFICATION_LIST",
				"data": data
			};
		},
		DELETE_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification deleted successfully.",
			"type": "DELETE_NOTIFICATION"
		},
		NOTIFICATION_DETAILS: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Notification details successfully.",
				"type": "NOTIFICATION_DETAILS",
				"data": data
			};
		},
		EDIT_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.UPDATED,
			"message": "Notification edited and send successfully.",
			"type": "EDIT_NOTIFICATION"
		},
		SEND_NOTIFICATION: {
			"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
			"message": "Notification sent successfully.",
			"type": "SEND_NOTIFICATION"
		}
	}
};