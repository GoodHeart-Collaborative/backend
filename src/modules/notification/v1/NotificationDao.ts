"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import { toObjectId } from '../../../utils/appUtils'
import { Query } from "mongoose";
import * as config from "@config/constant";
import * as notificationConstant from "@modules/notification/notificationConstant";
import { userController } from "@modules/user";

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

	async notificationList(params: ListingRequest, tokenData) {
		try {

			const aggPipe = [];
			aggPipe.push({ "$match": { receiverId: await toObjectId(tokenData.userId) } })
			aggPipe.push({ "$sort": { "_id": -1 } });
			let memberDetail;

			if (tokenData.isMemberOfDay) {
				memberDetail = await userController.getMemberOfDayDetail({ userId: tokenData.userId });
				aggPipe.push({
					$addFields: {
						isLike: memberDetail.isLike,
						isComment: memberDetail.isComment,
					}
				})
			}
			aggPipe.push({
				$match: {
					status: {
						$ne: config.CONSTANT.STATUS.DELETED
					},
				}
			})

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

				},

			},
			)
			aggPipe.push({ $unwind: { path: '$users', preserveNullAndEmptyArrays: true } })

			// if (tokenData.isMemberOfDay) {
			// 	aggPipe.push({
			// 		$addFields: {
			// 			isLike: memberDetail.isLike,
			// 			isComment: memberDetail.isComment,
			// 			isActive: tokenData.isMemberOfDay
			// 		}
			// 	})
			// }
			aggPipe.push({
				$project: {
					user: {
						_id: '$users._id',
						name: { $concat: [{ $ifNull: ["$users.firstName", ""] }, " ", { $ifNull: ["$users.lastName", ""] }] },
						// name: "$users.firstName",
						profilePicUrl: '$users.profilePicUrl',
						profession: "$users.profession",
						industryType: '$users.industryType',
						experience: '$users.experience',
						about: '$users.about',
						myConnection: '$users.myConnection',
						companyName: '$users.companyName'
					},
					likeCount: '$users.likeCount',
					commentCount: '$users.commentCount',
					isRead: 1,
					title: 1,
					message: 1,
					type: 1,
					created: 1,
					postId: 1,
					receiverId: 1,
					eventId: 1,
					isComment: 1,
					isLike: 1,
					isActive: {
						$cond: {
							if: {
								$eq: [tokenData.isMemberOfDay, true]
							},
							then: true,
							else: false
						},
					}
				}
			})

			aggPipe.push({
				$project: {
					likeCount: '$likeCount',
					commentCount: '$commentCount',
					user: {
						$cond: {
							if: { $eq: ['$user.name', " "] }, then: '$$REMOVE', else: '$user'
						}
					},
					isRead: 1,
					title: 1,
					message: 1,
					type: 1,
					created: 1,
					postId: 1,
					eventId: 1,
					receiverId: 1,
					isComment: 1,
					isLike: 1,
					isActive: 1
				}
			})


			// senderId: 0, receiverId: 0, createdAt: 0, updatedAt: 0 } })

			let result = await this.paginate('notifications', aggPipe, params.limit, params.pageNo, {}, true)

			this.update('notifications', { receiverId: await toObjectId(tokenData.userId) }, { isRead: true }, { multi: true })
			this.updateOne('users', { _id: await toObjectId(tokenData.userId) }, { badgeCount: 0 }, {});

			return result

		} catch (error) {
			return Promise.reject(error);
		}
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
			return data;
		} catch (error) {
			return Promise.reject(error);

		}
	}

	async updatNotificationStatus(params) {
		try {
			const criteria = {
				receiverId: params.userId,
				$or: [{
					type: config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_SEND.type,
				},
				{
					type: config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.type,
				}]
			}

			const criteria1 = {
				receiverId: params.userId,
				$or: [{
					type: config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_SEND.type,
				},
				{
					type: config.CONSTANT.NOTIFICATION_CATEGORY.FRIEND_REQUEST_APPROVED.type,
				}]
			}
			await this.updateMany('notifications', criteria1, { status: config.CONSTANT.STATUS.DELETED }, {})
			await this.updateMany('notifications', criteria, { status: config.CONSTANT.STATUS.DELETED }, {})
		} catch (error) {
			return Promise.reject(error);
		}
	}
}

export const notificationDao = new NotificationDao();