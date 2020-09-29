"use strict";

import * as appUtils from "@utils/appUtils";
import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class ContactDao extends BaseDao {

	/**
	 * @function deleteContactOnRemoveAccount
	 */
	async deleteContactOnRemoveAccount(params) {
		try {
			const query: any = {};
			query["$or"] = [{ userId: params.userId }, { appUserId: params.userId }];
			return await this.deleteMany("contacts", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addContact
	 */
	async addContact(params: ContactRequest.Sync) {
		try {
			params.created = Date.now();
			const query: any = {};
			query.userId = params.userId;
			query.mobileNo = params.mobileNo;

			const update = {};
			update["$set"] = params;

			const options = { new: true, upsert: true };

			return await this.updateOne("contacts", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteContact
	 */
	async deleteContact(params: ContactRequest.Sync, tokenData: TokenData) {
		try {
			const query: any = {};
			query.userId = tokenData.userId;
			query.deviceId = tokenData.deviceId;
			query.sno = { "$in": params.deleteContact };

			return await this.deleteMany("contacts", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateContact
	 */
	async updateContact(params) {
		try {
			const query: any = {};
			query.userId = params.userId;
			query.deviceId = params.deviceId;
			query.sno = params.sno;

			const update = {};
			let set = {};

			const fieldsToFill = ["contactName", "appUserId", "mobileNo"];
			set = appUtils.setInsertObject(params, set, fieldsToFill);
			update["$set"] = set;

			return await this.updateOne("contacts", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function removeContact
	 */
	async removeContact(params) {
		try {
			const query: any = {};
			query.userId = params.userId;
			query.deviceId = params.deviceId;
			query.sno = params.sno;

			return await this.remove("contacts", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contactList
	 */
	async contactList(params, tokenData: TokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.userId = appUtils.toObjectId(tokenData.userId);
			match.deviceId = tokenData.deviceId;
			if (params.allContacts) {
				match.mobileNo = { "$in": params.allContacts };
			}
			aggPipe.push({ "$match": match });

			aggPipe.push({ "$lookup": { from: "users", localField: "appUserId", foreignField: "_id", as: "users" } });

			aggPipe.push({
				"$project": {
					_id: 1, sno: 1, contactName: 1, mobileNo: 1, appUserId: 1,
					isAppUser: { "$convert": { input: "false", to: "bool" } }, user: { "$arrayElemAt": ["$users", 0] }
				}
			});

			aggPipe.push({ "$match": { "user.status": { "$ne": config.CONSTANT.STATUS.DELETED } } });

			aggPipe.push({
				"$project": {
					_id: 1, sno: 1, contactName: { "$ifNull": ["$user.firstName", "$contactName"] }, mobileNo: 1,
					contactImage: "$user.profilePicture", appUserId: 1, isAppUser: 1
				}
			});

			return this.aggregate("contacts", aggPipe, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function getAppContacts
	 */
	async getAppContacts(params: TokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.userId = appUtils.toObjectId(params.userId);
			match.deviceId = params.deviceId;
			aggPipe.push({ "$match": match });

			aggPipe.push({ "$project": { appUserId: { "$toString": "$appUserId" } } });

			aggPipe.push({ "$group": { _id: null, appUsers: { "$push": "$appUserId" } } });

			const response = await this.aggregate("contacts", aggPipe, {});
			return response[0] ? response[0].appUsers : [];
		} catch (error) {
			throw error;
		}
	}
}

export const contactDao = new ContactDao();