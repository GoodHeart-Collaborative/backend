"use strict";

import * as _ from "lodash";
import * as promise from "bluebird";

import * as adminNotificationConstant from "@modules/adminNotification/adminNotificationConstant";
import { adminNotificationDao } from "@modules/adminNotification/v1/AdminNotificationDao";
import * as config from "@config/constant";
import { imageUtil } from "@lib/ImageUtil";
import { notificationManager } from "@utils/NotificationManager";

class AdminNotificationController {

	/**
	 * @function addNotification
	 */
	async addNotification(params: AdminNotificationRequest.Add, tokenData: TokenData) {
		try {
			console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>...');
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("add_notification") !== -1
			) {
				// if (params.image) {
				// 	const step1: any = await imageUtil.uploadSingleMediaToS3(params.image);
				// 	console.log('step1step1step1step1', step1);
				// 	params.image = step1;
				// }
				const step2 = await adminNotificationDao.addNotification(params);
				console.log('step2step2step2step2step2', step2);
				const notificationData = config.CONSTANT.NOTIFICATION_DATA.BULK_NOTIFICATION(params.title, params.message);
				console.log('notificationDatanotificationDatanotificationData>>>>', notificationData);

				params = _.extend(params, { ...notificationData, "body": notificationData.message });
				const step3 = await notificationManager.sendBulkNotification(params, tokenData);
				console.log('step3step3step3step3step3step3', step3);
				const step4 = await promise.join(step2, step3);
				console.log('step4step4step4step4step4', step4);

				params = _.extend(params, { "notificationId": step4[0]._id, "sentCount": step4[1] });
				console.log('paramsparamsparamsparamsparams', params);

				const step5 = await adminNotificationDao.updateNotificationCount(params);
				console.log('step5step5step5', step5);

				return adminNotificationConstant.MESSAGES.SUCCESS.ADD_NOTIFICATION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_notification") !== -1
			) {
				const step1 = await adminNotificationDao.notificationList(params);
				return adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_LIST({ "notificationList": step1.data, "totalRecord": step1.total });
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteNotification
	 */
	async deleteNotification(params: NotificationRequest.Id, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("edit_notification") !== -1
			) {
				const step1 = adminNotificationDao.deleteNotification(params);
				return adminNotificationConstant.MESSAGES.SUCCESS.DELETE_NOTIFICATION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationDetails
	 */
	async notificationDetails(params: NotificationRequest.Id, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_notification") !== -1
			) {
				const step1 = await adminNotificationDao.findNotificationById(params);
				return adminNotificationConstant.MESSAGES.SUCCESS.NOTIFICATION_DETAILS(step1);
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editNotification
	 */
	async editNotification(params: AdminNotificationRequest.Edit, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("delete_notification") !== -1
			) {
				if (params.image) {
					const step1: any = await imageUtil.uploadSingleMediaToS3(params.image);
					params.image = step1;
				}
				const step2 = adminNotificationDao.editNotification(params);
				const notificationData = config.CONSTANT.NOTIFICATION_DATA.BULK_NOTIFICATION(params.title, params.message);
				params = _.extend(params, { ...notificationData, "body": notificationData.message });
				const step3 = notificationManager.sendBulkNotification(params, tokenData);
				const step4 = await promise.join(step2, step3);
				params = _.extend(params, { "notificationId": step4[0]._id, "sentCount": step4[1] });
				const step5 = adminNotificationDao.updateNotificationCount(params);
				return adminNotificationConstant.MESSAGES.SUCCESS.EDIT_NOTIFICATION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function sendOneToOneNotification
	 */
	async sendOneToOneNotification(params: AdminNotificationRequest.Send, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("send_notification_user") !== -1
			) {
				const notificationData = config.CONSTANT.NOTIFICATION_DATA.ONE_TO_ONE(params.title, params.message);
				params = _.extend(params, { ...notificationData, "body": notificationData.message });
				const step1 = notificationManager.sendOneToOneNotification(params, tokenData);
				return adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function sendBulkNotification
	 */
	async sendBulkNotification(params: AdminNotificationRequest.SendBulkNotification, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("send_notification_user") !== -1
			) {
				const step1 = await adminNotificationDao.findNotificationById(params);
				const notificationData = config.CONSTANT.NOTIFICATION_DATA.BULK_NOTIFICATION(step1.title, step1.message);
				params = _.extend(params, { ...notificationData, "body": notificationData.message });
				// const step2 = await notificationManager.seundBulkNotification(params, tokenData);
				// params = _.extend(params, { "notificationId": step1._id, "sentCount": step2 });
				const step3 = adminNotificationDao.updateNotificationCount(params);
				return adminNotificationConstant.MESSAGES.SUCCESS.SEND_NOTIFICATION;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}
}

export const adminNotificationController = new AdminNotificationController();