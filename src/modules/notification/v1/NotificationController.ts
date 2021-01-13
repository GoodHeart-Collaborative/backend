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
			return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST(step1);
		} catch (error) {
			throw error;
		}
	}

	async clearNotification(tokenData) {
		try {
			return await notificationDao.clearNotification(tokenData);
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

export const notificationController = new NotificationController();