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

		aggPipe.push({
			$lookup: {
				from: 'users',
				let: { uId: '$senderId' },
				as: 'users',
				pipeline: [{
					$match: {
						$expr: {
							$eq: ['$_id', '$$uId']
						}
					}
				},
					// {
					// 	$project: {
					// 		_id: 1,
					// 		name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
					// 		// name: { $ifNull: ["$firstName", ""] },
					// 		profilePicUrl: 1,
					// 		profession: { $ifNull: ["$profession", ""] },
					// 		insustryType: 1,
					// 		experience: 1,
					// 		about: 1,
					// 		myConnection: 1,
					// 		likeCount: 1,
					// 		commentCount: 1
					// 	}
					// }
				],
			}
		})
		aggPipe.push({ $unwind: { path: '$users', preserveNullAndEmptyArrays: true } })

		aggPipe.push({
			$project: {
				user: {
					_id: '$users._id',
					// name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
					name: "$users.firstName",
					profilePicUrl: '$users.profilePicUrl',
					profession: { $ifNull: ["users.profession", ""] },
					industryType: '$users.industryType',
					experience: '$users.industryType',
					about: '$users.about',
					myConnection: '$users.myConnection',
				},
				likeCount: '$users.likeCount',
				commentCount: '$users.commentCount',
				isRead: 1,
				title: 1,
				message: 1,
				type: 1,
				created: 1,
				postId: 1
			}
		})
		// senderId: 0, receiverId: 0, createdAt: 0, updatedAt: 0 } })

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