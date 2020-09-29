"use strict";

import * as config from "@config/index";

export const MESSAGES = {
	ERROR: {
	},
	SUCCESS: {
		CONTACT_SYNCING: (data) => {
			return {
				"statusCode": 211,
				"message": "Contacts synchronize successfully.",
				"type": "CONTACT_SYNCING",
				"data": data
			};
		},
		CONTACT_LIST: (data) => {
			return {
				"statusCode": config.CONSTANT.HTTP_STATUS_CODE.OK,
				"message": "Contact list get successfully.",
				"type": "CONTACT_LIST",
				"data": data
			};
		}
	}
};