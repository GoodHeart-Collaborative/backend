"use strict";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";

export class LoginHistoryDao extends BaseDao {

	/**
	 * @function findDeviceLastLogin
	 */
	async findDeviceLastLogin(params: Device) {
		try {
			const query: any = {};
			query.userId = params.userId;
			if (params.deviceId) {
				query.deviceId = params.deviceId;
			}
			query.isLogin = false;

			const projection = { lastLogin: 1 };

			const options: any = { lean: true };

			const response = await this.find("login_histories", query, projection, options, {}, {}, {});
			return response.length ? response[response.length - 1].lastLogin : Date.now();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createUserLoginHistory
	 */
	async createUserLoginHistory(params: any) { // LoginHistoryRequest
		try {
			params.isLogin = true;
			params["created"] = new Date().getTime()
			return await this.save("login_histories", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function removeDeviceById
	 */
	async removeDeviceById(params: Device) {
		try {
			const query: any = {};
			query.userId = params.userId;
			if (params.deviceId) {
				query.deviceId = params.deviceId;
			}
			query.isLogin = true;

			const update = {};
			update["$set"] = {
				"isLogin": false,
				"lastLogin": Date.now()
			};
			update["$unset"] = { deviceToken: "", arn: "", refreshToken: "" };

			const options: any = { multi: true };

			return await this.updateMany("login_histories", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findDeviceById
	 */
	async findDeviceById(params: Device) {
		try {
			const query: any = {};
			query.deviceId = params.deviceId;
			query.userId = params.userId;
			if (params.salt) {
				query.salt = params.salt;
			}
			query.isLogin = true;

			const projection = { salt: 1, refreshToken: 1, lastLogin: 1 };

			const options = { lean: true };

			return await this.findOne("login_histories", query, projection, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateRefreshToken
	 */
	async updateRefreshToken(params: Device) {
		try {
			const query: any = {};
			query.deviceId = params.deviceId;
			query.userId = params.userId;
			query.isLogin = true;

			const update = {};
			update["$set"] = {
				"refreshToken": params.refreshToken
			};

			return await this.updateOne("login_histories", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userReportGraph
	 */
	async userReportGraph(params: AdminRequest.UserReportGraph) {
		try {
			const aggPipe = [];

			const match1: any = {};
			match1.isLogin = true;
			aggPipe.push({ "$match": match1 });

			aggPipe.push({
				"$project": {
					platform: 1,
					year: { "$year": "$createdAt" }, month: { "$month": "$createdAt" },
					day: { "$dayOfMonth": "$createdAt" },
					week: { "$add": [1, { "$floor": { "$divide": [{ "$dayOfMonth": "$createdAt" }, 7] } }] }, // week starts from monday
					created: 1
				}
			});

			const match2: any = {};
			if (params.fromDate && !params.toDate) {
				match2.created = { "$gte": params.fromDate };
			}
			if (params.toDate && !params.fromDate) {
				match2.created = { "$lte": params.toDate };
			}
			if (params.fromDate && params.toDate) {
				match2.created = { "$gte": params.fromDate, "$lte": params.toDate };
			}
			aggPipe.push({ "$match": match2 });

			if (params.type === config.CONSTANT.GRAPH_TYPE.DAILY) {
				aggPipe.push({ "$match": { year: params.year, month: params.month } });

				aggPipe.push({
					"$group": {
						_id: { year: "$year", month: "$month", day: "$day" },
						iosUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.IOS] },
									{ month: "$month", day: "$day" },
									null
								]
							}
						},
						androidUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.ANDROID] },
									{ month: "$month", day: "$day" },
									null
								]
							}
						},
						webUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.WEB] },
									{ month: "$month", day: "$day" },
									null
								]
							}
						}
					}
				});

				aggPipe.push({
					"$project": {
						_id: 1,
						iosUsers: { "$filter": { input: "$ios", as: "value", cond: { "$ne": ["$$value", null] } } },
						androidUsers: { "$filter": { input: "$android", as: "value", cond: { "$ne": ["$$value", null] } } },
						webUsers: { "$filter": { input: "$web", as: "value", cond: { "$ne": ["$$value", null] } } }
					}
				});

				aggPipe.push({
					"$group": {
						_id: "$_id.year", data: {
							"$push": {
								day: "$_id.day", iosUsersCount: { "$size": "$iosUsers" }, androidUsersCount: { "$size": "$androidUsers" },
								webUsersCount: { "$size": "$webUsers" }
							}
						}
					}
				});
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.WEEKLY) {
				aggPipe.push({ "$match": { year: params.year, month: params.month } });

				aggPipe.push({
					"$group": {
						_id: { year: "$year", month: "$month", week: "$week" },
						iosUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.IOS] },
									{ month: "$month", week: "$week" },
									null
								]
							}
						},
						androidUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.IOS] },
									{ month: "$month", week: "$week" },
									null
								]
							}
						},
						webUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.WEB] },
									{ month: "$month", week: "$week" },
									null
								]
							}
						}
					}
				});

				aggPipe.push({
					"$project": {
						_id: 1,
						iosUsers: { "$filter": { input: "$ios", as: "value", cond: { "$ne": ["$$value", null] } } },
						androidUsers: { "$filter": { input: "$android", as: "value", cond: { "$ne": ["$$value", null] } } },
						webUsers: { "$filter": { input: "$web", as: "value", cond: { "$ne": ["$$value", null] } } }
					}
				});

				aggPipe.push({
					"$group": {
						_id: "$_id.year", data: {
							"$push": {
								week: "$_id.week",
								iosUsersCount: { "$size": "$iosUsers" }, androidUsersCount: { "$size": "$androidUsers" },
								webUsersCount: { "$size": "$webUsers" }
							}
						}
					}
				});
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.MONTHLY) {
				aggPipe.push({ "$match": { year: params.year } });

				aggPipe.push({
					"$group": {
						_id: { year: "$year", month: "$month" },
						iosUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.IOS] },
									{ month: "$month" },
									null
								]
							}
						},
						androidUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.ANDROID] },
									{ month: "$month" },
									null
								]
							}
						},
						webUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.WEB] },
									{ month: "$month" },
									null
								]
							}
						}
					}
				});

				aggPipe.push({
					"$project": {
						_id: 1,
						iosUsers: { "$filter": { input: "$ios", as: "value", cond: { "$ne": ["$$value", null] } } },
						androidUsers: { "$filter": { input: "$android", as: "value", cond: { "$ne": ["$$value", null] } } },
						webUsers: { "$filter": { input: "$web", as: "value", cond: { "$ne": ["$$value", null] } } }
					}
				});

				aggPipe.push({
					"$group": {
						_id: "$_id.year", data: {
							"$push": {
								month: "$_id.month",
								iosUsersCount: { "$size": "$iosUsers" }, androidUsersCount: { "$size": "$androidUsers" },
								webUsersCount: { "$size": "$webUsers" }
							}
						}
					}
				});
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.YEARLY) {
				aggPipe.push({
					"$group": {
						_id: { year: "$year" },
						iosUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.IOS] },
									{ year: "$year" },
									null
								]
							}
						},
						androidUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.ANDROID] },
									{ year: "$year" },
									null
								]
							}
						},
						webUsers: {
							"$push": {
								"$cond": [
									{ "$eq": ["$platform", config.CONSTANT.DEVICE_TYPE.WEB] },
									{ year: "$year" },
									null
								]
							}
						}
					}
				});

				aggPipe.push({
					"$project": {
						_id: 1,
						iosUsers: { "$filter": { input: "$ios", as: "value", cond: { "$ne": ["$$value", null] } } },
						androidUsers: { "$filter": { input: "$android", as: "value", cond: { "$ne": ["$$value", null] } } },
						webUsers: { "$filter": { input: "$web", as: "value", cond: { "$ne": ["$$value", null] } } }
					}
				});

				aggPipe.push({
					"$group": {
						_id: "$_id.year", data: {
							"$push": {
								year: "$_id.year",
								iosUsersCount: { "$size": "$iosUsers" }, androidUsersCount: { "$size": "$androidUsers" },
								webUsersCount: { "$size": "$webUsers" }
							}
						}
					}
				});
			}

			aggPipe.push({ "$unwind": "$data" });

			aggPipe.push({ "$replaceRoot": { newRoot: "$data" } });

			return await this.aggregate("login_histories", aggPipe, {});
		} catch (error) {
			throw error;
		}
	}
}

export const loginHistoryDao = new LoginHistoryDao();