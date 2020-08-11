"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import { toObjectId }  from  '../../../utils/appUtils'
import { Query } from "mongoose";

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
		aggPipe.push({"$match": {receiverId: await toObjectId(tokenData.userId)}})
		aggPipe.push({ "$sort": { "createdAt": -1 } });

		let result =  await this.paginate('notifications', aggPipe, params.limit, params.pageNo, {}, true)
		let arr = []
		result && result.data && result.data.length > 0 && result.data.forEach(data => {
			if(data.isRead === false) {
				arr.push(data._id)
			}
		});
		if(arr && arr.length > 0) {
			let query:any = {}
			query = {
				receiverId: await toObjectId(tokenData.userId),
				_id: { "$in": arr }
			}
			this.update('notifications', query, {"$set": {isRead: true}}, {multi: true})
		}
		return result
	}
}

export const notificationDao = new NotificationDao();