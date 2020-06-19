"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import { ElasticSearch } from "@lib/ElasticSearch";

const elasticSearch = new ElasticSearch();

export class UserDao extends BaseDao {

	/**
	 * @function findUserByEmailOrMobileNo
	 */
	async findUserByEmailOrMobileNo(params) {
		try {
			const query: any = {};
			query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const options = { lean: true };

			return await this.findOne("users", query, {}, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findUserById
	 */
	async findUserById(params: UserId) {
		try {
			const query: any = {};
			query._id = params.userId;
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const projection = { updatedAt: 0 };

			const options = { lean: true };

			return await this.findOne("users", query, projection, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function signup
	 */
	async signup(params: UserRequest.Signup) {
		try {
			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			params.createdAt = Date.now();
			return await this.save("users", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function checkSocialId
	 */
	async checkSocialId(params) {
		try {
			const query: any = {};
			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
				query.facebookId = params.socialId;
			} else {
				query.googleId = params.socialId;
			}
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const options = { lean: true };

			return await this.findOne("users", query, {}, options, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function socialSignup
	 */
	async socialSignup(params: UserRequest.SocialSignup) {
		try {
			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
				params.facebookId = params.socialId;
				params.isFacebookLogin = true;
			} else {
				params.googleId = params.socialId;
				params.isGoogleLogin = true;
			}
			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			params.created = Date.now();
			return await this.save("users", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addForgotToken
	 */
	async addForgotToken(params: ForgotPasswordRequest) {
		try {
			const query: any = {};
			query._id = params.userId;

			const update = {};
			update["$set"] = {
				"forgotToken": params.forgotToken
			};

			return await this.updateOne("users", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function emptyForgotToken
	 */
	async emptyForgotToken(params) {
		try {
			const query: any = {};
			if (params.token) {
				query.forgotToken = params.token;
			}
			if (params.userId) {
				query._id = params.userId;
			}

			const update = {};
			update["$unset"] = {
				"forgotToken": ""
			};

			return await this.updateOne("users", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changeForgotPassword
	 */
	async changeForgotPassword(params: ChangeForgotPasswordRequest, tokenData: TokenData) {
		try {
			const query: any = {};
			query._id = tokenData.userId;

			const update = {};
			update["$set"] = {
				"hash": params.hash
			};

			const options = { new: true };

			return await this.findOneAndUpdate("users", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
		 * @function dashboardGraph
		 */
	async dashboardGraph(params: AdminRequest.Dashboard) {
		try {
			const aggPipe = [];

			const match1: any = {};
			if (params.status) {
				match1["$and"] = [{ status: { "$ne": config.CONSTANT.STATUS.DELETED } }, { status: params.status }];
			} else {
				match1.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			}
			aggPipe.push({ "$match": match1 });

			aggPipe.push({
				"$project": {
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
						users: { "$push": { month: "$month", day: "$day" } }
					}
				});

				aggPipe.push({ "$group": { _id: "$_id.year", data: { "$push": { day: "$_id.day", count: { "$size": "$users" } } } } });

				aggPipe.push({ "$unwind": "$data" });

				aggPipe.push({ "$replaceRoot": { newRoot: "$data" } });
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.WEEKLY) {
				aggPipe.push({ "$match": { year: params.year, month: params.month } });

				aggPipe.push({
					"$group": {
						_id: { year: "$year", month: "$month", week: "$week" },
						users: { "$push": { month: "$month", week: "$week" } }
					}
				});

				aggPipe.push({ "$group": { _id: "$_id.year", data: { "$push": { week: "$_id.week", count: { "$size": "$users" } } } } });

				aggPipe.push({ "$unwind": "$data" });

				aggPipe.push({ "$replaceRoot": { newRoot: "$data" } });
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.MONTHLY) {
				aggPipe.push({ "$match": { year: params.year } });

				aggPipe.push({ "$group": { _id: { year: "$year", month: "$month" }, users: { "$push": { month: "$month" } } } });

				aggPipe.push({ "$group": { _id: "$_id.year", data: { "$push": { month: "$_id.month", count: { "$size": "$users" } } } } });

				aggPipe.push({ "$unwind": "$data" });

				aggPipe.push({ "$replaceRoot": { newRoot: "$data" } });
			}

			if (params.type === config.CONSTANT.GRAPH_TYPE.YEARLY) {
				aggPipe.push({ "$group": { _id: { year: "$year" }, users: { "$push": { year: "$year" } } } });

				aggPipe.push({ "$project": { year: "$_id.year", _id: 0, count: { "$size": "$users" } } });
			}

			return await this.aggregate("users", aggPipe, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function addUser
	 */
	async addUser(params) {
		try {
			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			params.created = Date.now();
			return await this.save("users", params);
		} catch (error) {
			throw error;
		}
	}

	// /**
	//  * @function updateUser
	//  */
	// async updateUser(params) {
	// 	const query: any = {};
	// 	query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
	// 	query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

	// 	const set = {};
	// 	const unset = {};
	// 	const update = {};
	// 	update["$set"] = set;

	// 	const fieldsToFill = ["firstName", "middleName", "lastName", "dob", "age", "gender"];

	// 	set = appUtils.setInsertObject(params, set, fieldsToFill);

	// 	unset = appUtils.unsetInsertObject(params, unset, fieldsToFill);
	// 	if (!_.isEmpty(unset)) {
	// 		update["$unset"] = unset;
	// 	}

	// 	const options = { new: true };

	// 	return await this.findOneAndUpdate("users", query, update, options);
	// }

	async checkOTP(params: UserRequest.verifyOTP) {
		try {
			// const mobleCriteria;
			if (params.mobileNo) {
				const mobleCriteria = {
					countryCode: params.countryCode,
					mobileNo: params.mobileNo,
				};
				const options = { lean: true };
				const projection = { mobileOTP: 1 }
				return await this.findOne('users', mobleCriteria, projection, options, {});

			}
			return;
		} catch (error) {
			throw error;
		}
	}
}

export const userDao = new UserDao();