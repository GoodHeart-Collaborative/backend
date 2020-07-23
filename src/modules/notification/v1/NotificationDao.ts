"use strict";

import { BaseDao } from "@modules/base/BaseDao";

export class NotificationDao extends BaseDao {

	/**
	 * @function addNotification
	 */
	async addNotification(params: NotificationRequest.Add) {
		params["created"] = new Date().getTime()
		return await this.save("notifications", params);
	}

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest, tokenData: TokenData) {
		const query: any = {};
		query.receiverId = tokenData.userId;

		const sort = { created: -1 };

		return await this.find("notifications", query, {}, {}, params, sort, {});
	}
}

export const notificationDao = new NotificationDao();