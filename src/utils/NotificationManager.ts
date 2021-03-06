"use strict";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/constant";
import { baseDao } from "@modules/base/BaseDao";
import { notificationDao } from "@modules/notification/v1/NotificationDao";
import * as pushManager from "@lib/pushNotification/pushManager";

export class NotificationManager {

	async sendBulkNotification(params, tokenData: TokenData) {
		let query: any = {};

		query.status = config.CONSTANT.STATUS.ACTIVE;
		query.adminStatus = config.CONSTANT.USER_ADMIN_STATUS.VERIFIED;
		// query.isEmailVerified = true
		let step1;
		if (params.members) {
			query['_id'] = { $in: params.members }
		}
		step1 = await baseDao.find("users", query, { _id: 1 }, {}, {}, {}, {});

		let bulkNotitification = [];
		if (params.eventId) {
			await step1.forEach(async (data) => {
				bulkNotitification.push({
					"senderId": tokenData.userId,
					"receiverId": data._id,
					"isRead": false,
					"title": params.title,
					"message": params.message,
					"type": params.type,
					eventId: params.eventId,
					created: Date.now(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
			});
		} else {
			await step1.forEach(async (data) => {
				bulkNotitification.push({
					"senderId": tokenData.userId,
					"receiverId": data._id,
					"isRead": false,
					"title": params.title,
					"message": params.message,
					"type": params.type,
					created: Date.now(),
					createdAt: new Date(),
					updatedAt: new Date()
				})
				// const noticiationData = {
				// 	"senderId": tokenData.userId,
				// 	"receiverId": [data._id],
				// 	"title": params.title,
				// 	"message": params.message,
				// 	"type": params.type,
				// 	"isRead" : false,
				// };
				// const step2 = await notificationDao.addNotification(noticiationData);
			});
		}

		const step2 = await notificationDao.insertMany('notifications', bulkNotitification, {});

		const users = [];
		let step3 = [];
		if (step1.length) {
			for (let i = 0; i < step1.length; i++) {
				users.push(step1[i]._id);
			}

			const populateQuery = [
				{ path: "userId", model: config.CONSTANT.DB_MODEL_REF.USER, select: "_id" }
			];
			step3 = await baseDao.find("login_histories", { "userId": { "$in": users }, "isLogin": true }, { userId: 1, platform: 1, deviceToken: 1 }, {}, {}, {}, populateQuery);

			step3 = step3.filter((data) => data.userId !== null);
			const updateUserBadgeCount = await baseDao.updateMany('users', { _id: { '$in': users } }, { $inc: { badgeCount: 1 } }, {});
		}

		// save data to notification history
		const androidUsers = [], iosUsers = [], webUsers = [];
		if (step3.length) {
			for (let i = 0; i < step3.length; i++) {
				// separate user data to android user and ios user
				if (step3[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					androidUsers.push({ "userId": step3[i].userId._id, "deviceToken": step3[i].deviceToken });
				}
				if (step3[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					iosUsers.push({ "userId": step3[i].userId._id, "deviceToken": step3[i].deviceToken });
				}
			}

			// separate android user data and ios user data to android user chunks and ios user chunks
			const androidUserChunks = appUtils.splitArrayInToChunks(androidUsers);
			const iosUserChunks = appUtils.splitArrayInToChunks(iosUsers);

			// create android and ios payload
			let androidPayload, iosPayload, webPayload;
			if (androidUserChunks.length) {
				params['body'] = (params && params.body) ? params.body : {}
				androidPayload = appUtils.createAndroidPushPayload(params);
			}
			if (iosUserChunks.length) {
				iosPayload = appUtils.createIOSPushPayload(params);
			}

			// save android chunk data
			await androidUserChunks.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": data,
					"payload": androidPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
				};
				const step4 = await pushManager.pushNotification(chunkNoticiationPayload);
			});

			// save ios chunk data
			await iosUserChunks.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": data,
					"payload": iosPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
				};
				const step5 = await pushManager.pushNotification(chunkNoticiationPayload);
			});
		}
		return step3.length;
	}

	async sendOneToOneNotification(params, tokenData?: TokenData, otherUserId?: boolean) {

		const populateQuery = [
			{ path: "userId", model: config.CONSTANT.DB_MODEL_REF.USER, match: { status: config.CONSTANT.STATUS.ACTIVE }, select: "_id" }
		];
		let step1 = await baseDao.find("login_histories", { "userId": { "$in": [params.userId] }, "isLogin": true }, { userId: 1, platform: 1, deviceToken: 1 }, {}, {}, {}, populateQuery);
		step1 = step1.filter((data) => data.userId !== null);

		if (step1.length) {
			const noticiationData = {
				"senderId": tokenData.userId,
				"receiverId": [params.userId],
				"title": params.title,
				"message": params.message,
				"type": params.type,
				// postId: params.postId ,
			};
			if (params.eventId) {
				noticiationData['eventId'] = params.eventId
			}
			const step2 = notificationDao.addNotification(noticiationData);
			const updateUserBadgeCount = await baseDao.updateOne('users', { _id: params.userId }, { $inc: { badgeCount: 1 } }, {});

			// save data to notification history
			const androidUsers = [], iosUsers = [], webUsers = [];
			for (let i = 0; i < step1.length; i++) {
				// separate user data to android user and ios user
				if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					androidUsers.push({ "userId": step1[i].userId._id, "deviceToken": step1[i].deviceToken });
				}
				if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					iosUsers.push({ "userId": step1[i].userId._id, "deviceToken": step1[i].deviceToken });
				}
				if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.WEB) {
					webUsers.push({ "userId": step1[i].userId._id, "deviceToken": step1[i].deviceToken });
				}
			}

			if (otherUserId) { params['userId'] = tokenData.userId; }
			// create android and ios payload
			let androidPayload, iosPayload;
			if (androidUsers.length) {
				androidPayload = appUtils.createAndroidPushPayload(params);
			}
			if (iosUsers.length) {
				// const getCountForBadge = await notificationDao.count('notifications', { receiverId: params.userId, isRead: false });
				// params['countForBadge'] = getCountForBadge;
				iosPayload = appUtils.createIOSPushPayload(params);
			}

			// save android chunk data
			await androidUsers.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": [data],
					"payload": androidPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
				};
				const step3 = await pushManager.pushNotification(chunkNoticiationPayload);
			});

			// save ios chunk data
			await iosUsers.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": [data],
					"payload": iosPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
				};
				const step4 = await pushManager.pushNotification(chunkNoticiationPayload);
			});
		}
		return;
	}

	async sendMemberOfDayNotification(params) {
		const populateQuery = [
			{ path: "userId", model: config.CONSTANT.DB_MODEL_REF.USER, match: { status: config.CONSTANT.STATUS.ACTIVE }, select: "_id" }
		];
		let step1 = await baseDao.find("login_histories", { "userId": { "$in": [params.userId] }, "isLogin": true }, { userId: 1, platform: 1, deviceToken: 1 }, {}, {}, {}, populateQuery);
		step1 = step1.filter((data) => data.userId !== null);


		if (step1.length) {
			const noticiationData = {
				"senderId": params.userId,
				"receiverId": [params.userId],
				"title": params.title,
				"message": params.message,
				"type": params.type,
				postId: params.userId
			};
			const step2 = notificationDao.addNotification(noticiationData);
			const updateUserBadgeCount = await baseDao.updateOne('users', { _id: params.userId }, { $inc: { badgeCount: 1 } }, {});

			// save data to notification history
			const androidUsers = [], iosUsers = [], webUsers = [];
			for (let i = 0; i < step1.length; i++) {
				// separate user data to android user and ios user
				if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					androidUsers.push({ "userId": step1[i].userId._id, "deviceToken": step1[i].deviceToken });
				}
				if (step1[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					iosUsers.push({ "userId": step1[i].userId._id, "deviceToken": step1[i].deviceToken });
				}
			}

			// create android and ios payload
			let androidPayload, iosPayload, webPayload;
			if (androidUsers.length) {
				androidPayload = appUtils.createAndroidPushPayload(params);

			}
			if (iosUsers.length) {
				// params['userId'] = tokenData.userId; // need to do work
				iosPayload = appUtils.createIOSPushPayload(params);
			}
			if (webUsers.length) {
				webPayload = appUtils.createWebPushPayload(params);
			}

			// save android chunk data
			await androidUsers.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": [data],
					"payload": androidPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
				};
				const step3 = await pushManager.pushNotification(chunkNoticiationPayload);
			});

			// save ios chunk data
			await iosUsers.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": [data],
					"payload": iosPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
				};

				const step4 = await pushManager.pushNotification(chunkNoticiationPayload);
			});

		}
		return;
	}


	async sendNotificationShoutOut(params, tokenData: TokenData) {
		const query: any = {};
		if (params.fromDate && !params.toDate) {
			query.created = { "$gte": params.fromDate };
		}
		if (params.toDate && !params.fromDate) {
			query.created = { "$lte": params.toDate };
		}
		if (params.fromDate && params.toDate) {
			query.created = { "$gte": params.fromDate, "$lte": params.toDate };
		}
		if (params.gender && params.gender !== config.CONSTANT.GENDER.ALL) {
			query.gender = params.gender;
		}
		query.status = config.CONSTANT.STATUS.ACTIVE;
		const step1 = await baseDao.find("users", query, { _id: 1 }, {}, {}, {}, {});

		let bulkNotitification = [];
		await step1.forEach(async (data) => {
			bulkNotitification.push({
				"senderId": tokenData.userId,
				"receiverId": data._id,
				"isRead": false,
				"title": params.title,
				"message": params.message,
				"type": params.type,
				created: Date.now(),
				createdAt: new Date(),
				updatedAt: new Date()
			})
			// const noticiationData = {
			// 	"senderId": tokenData.userId,
			// 	"receiverId": [data._id],
			// 	"title": params.title,
			// 	"message": params.message,
			// 	"type": params.type,
			// 	"isRead" : false,
			// };
			// const step2 = await notificationDao.addNotification(noticiationData);
		});

		const step2 = await notificationDao.insertMany('notifications', bulkNotitification, {});

		const users = [];
		let step3 = [];
		if (step1.length) {
			for (let i = 0; i < step1.length; i++) {
				users.push(step1[i]._id);
			}

			const populateQuery = [
				{ path: "userId", model: config.CONSTANT.DB_MODEL_REF.USER, select: "_id" }
			];
			step3 = await baseDao.find("login_histories", { "userId": { "$in": users }, "isLogin": true }, { userId: 1, platform: 1, deviceToken: 1 }, {}, {}, {}, populateQuery);
			// step3 = step3.filter((data) => data.userId !== null);
		}

		// save data to notification history
		const androidUsers = [], iosUsers = [], webUsers = [];
		if (step3.length) {
			for (let i = 0; i < step3.length; i++) {
				// separate user data to android user and ios user
				if (step3[i].platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
					androidUsers.push({ "userId": step3[i].userId._id, "deviceToken": step3[i].deviceToken });
				}
				if (step3[i].platform === config.CONSTANT.DEVICE_TYPE.IOS) {
					iosUsers.push({ "userId": step3[i].userId._id, "deviceToken": step3[i].deviceToken });
				}
				if (step3[i].platform === config.CONSTANT.DEVICE_TYPE.WEB) {
					webUsers.push({ "userId": step3[i].userId._id, "deviceToken": step3[i].deviceToken });
				}
			}

			// separate android user data and ios user data to android user chunks and ios user chunks
			const androidUserChunks = appUtils.splitArrayInToChunks(androidUsers);
			const iosUserChunks = appUtils.splitArrayInToChunks(iosUsers);
			const webUserChunks = appUtils.splitArrayInToChunks(webUsers);

			// create android and ios payload
			let androidPayload, iosPayload, webPayload;
			if (androidUserChunks.length) {
				params['body'] = {};
				androidPayload = appUtils.createAndroidPushPayload(params);
			}
			if (iosUserChunks.length) {
				iosPayload = appUtils.createIOSPushPayload(params);
			}
			if (webUserChunks.length) {
				webPayload = appUtils.createWebPushPayload(params);
			}

			// save android chunk data
			await androidUserChunks.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": data,
					"payload": androidPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.ANDROID
				};
				const step4 = await pushManager.pushNotification(chunkNoticiationPayload);
			});

			// save ios chunk data
			await iosUserChunks.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": data,
					"payload": iosPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.IOS
				};
				const step5 = await pushManager.pushNotification(chunkNoticiationPayload);
			});

			// save web chunk data
			await webUserChunks.forEach(async (data) => {
				const chunkNoticiationPayload = {
					"data": data,
					"payload": webPayload,
					"deviceType": config.CONSTANT.DEVICE_TYPE.WEB
				};
				const step6 = await pushManager.pushNotification(chunkNoticiationPayload);
			});
		}
		return step3.length;
	}

}

export const notificationManager = new NotificationManager();