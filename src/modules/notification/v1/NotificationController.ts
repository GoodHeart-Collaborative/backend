"use strict";

import * as notificationConstant from "@modules/notification/notificationConstant";
import { notificationDao } from "@modules/notification/v1/NotificationDao";

export class NotificationController {

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest, tokenData: TokenData) {
		try {
			let step1 = await notificationDao.notificationList(params, tokenData);
			return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step1 });
		} catch (error) {
			throw error;
		}
	}
}

export const notificationController = new NotificationController();