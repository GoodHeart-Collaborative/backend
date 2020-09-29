"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import { toObjectId } from '../../../utils/appUtils'
import { Query } from "mongoose";
import { config } from "aws-sdk";
import * as notificationConstant from "@modules/notification/notificationConstant";

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
	// async notificationList(params: ListingRequest) {
	// 	try {

	// 	} catch (error) {
	// 		throw error;
	// 	}
	// }

	async notificationList(params: ListingRequest, tokenData: TokenData) {

		const aggPipe = [];
		aggPipe.push({ "$match": { receiverId: await toObjectId(tokenData.userId) } })
		aggPipe.push({ "$sort": { "_id": -1 } });

		let result = await this.paginate('notifications', aggPipe, params.limit, params.pageNo, {}, true)
		// let arr = []
		// result && result.data && result.data.length > 0 && result.data.forEach(data => {
		// 	if (data.isRead === false) {
		// 		arr.push(data._id)
		// 	}
		// });
		// if (arr && arr.length > 0) {
		// 	let query: any = {}
		// 	query = {
		// 		receiverId: await toObjectId(tokenData.userId),
		// 		_id: { "$in": arr }
		// 	}
		// this.update('notifications', query, { "$set": { isRead: true } }, { multi: true })
		this.update('notifications', { receiverId: await toObjectId(tokenData.userId) }, { isRead: true }, { multi: true })
		this.updateOne('users', { _id: await toObjectId(tokenData.userId) }, { badgeCount: 0 }, {});

		// }

		return result
	}

	async clearNotification(tokenData) {
		try {
			const criteria = {
				receiverId: tokenData.userId
			}
			const data = await this.remove('notifications', criteria)
			return notificationConstant.MESSAGES.SUCCESS.NOTIFICATION_DELETE;
		} catch (error) {
			return Promise.reject(error);
		}
	}

	async unreadNotificationCount(userId) {
		try {
			const criteria = {
				isRead: false,
				receiverId: userId.tokenData.userId
			}
			const data = await this.count('notifications', criteria);
			console.log('datadatadata', data);
			return data;
		} catch (error) {
			return Promise.reject(error);

		}
	}
}

export const notificationDao = new NotificationDao();