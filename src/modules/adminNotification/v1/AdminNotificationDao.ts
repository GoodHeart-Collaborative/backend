"use strict";

import * as _ from "lodash";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/base/BaseDao";

export class AdminNotificationDao extends BaseDao {

	/**
	 * @function findNotificationById
	 */
	async findNotificationById(params: NotificationRequest.Id) {
		try {
			const query: any = {};
			query._id = params.notificationId;

			const projection = { created: 0, createdAt: 0, updatedAt: 0 };

			const options: any = { lean: true };

			return await this.findOne("admin_notifications", query, projection, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addNotification
	 */
	async addNotification(params: AdminNotificationRequest.Add) {
		try {
            params["created"] = new Date().getTime()
			return await this.save("admin_notifications", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateNotificationCount
	 */
	async updateNotificationCount(params) {
		try {
			const query: any = {};
			query._id = params.notificationId;

			const update = {};
			update["$set"] = {
				"sentCount": params.sentCount
			};

			return await this.updateOne("admin_notifications", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest) {
		try {
			const aggPipe = [];

			if (params.searchKey) {
				const match: any = {};
				match.title = { "$regex": params.searchKey, "$options": "-i" };
				aggPipe.push({ "$match": match });
			}

			let sort = {};
			if (params.sortBy && params.sortOrder) {
				if (params.sortBy === "title") {
					sort = { "title": params.sortOrder };
				} else if (params.sortBy === "sentCount") {
					sort = { "sentCount": params.sortOrder };
				} else {
					sort = { "created": params.sortOrder };
				}
			} else {
				sort = { "created": -1 };
			}
			aggPipe.push({ "$sort": sort });

            return await this.paginate('admin_notifications', aggPipe, params.limit, params.pageNo, {}, true)
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteNotification
	 */
	async deleteNotification(params: NotificationRequest.Id) {
		try {
			const query: any = {};
			query._id = params.notificationId;
			return await this.remove("admin_notifications", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editNotification
	 */
	async editNotification(params: AdminNotificationRequest.Edit) {
		try {
			const query: any = {};
			query._id = params.notificationId;

			let set = {};
			let unset = {};
			const update = {};
			update["$set"] = set;

			const fieldsToFill = ["image", "title", "link", "message", "platform", "fromDate", "toDate", "gender"];
			set = appUtils.setInsertObject(params, set, fieldsToFill);

			unset = appUtils.unsetInsertObject(params, unset, fieldsToFill);
			if (!_.isEmpty(unset)) {
				update["$unset"] = unset;
			}

			const options = { new: true };

			return await this.findOneAndUpdate("admin_notifications", query, update, options);
		} catch (error) {
			throw error;
		}
	}
}

export const adminNotificationDao = new AdminNotificationDao();