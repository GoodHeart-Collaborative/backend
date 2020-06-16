"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	SUCCESS: {
		NOTIFICATION_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Notification list get successfully.",
				"type": "NOTIFICATION_LIST",
				"data": data
			};
		}
	}
};