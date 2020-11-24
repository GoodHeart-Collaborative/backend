"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import * as appUtils from '@utils/appUtils'
import * as mongoose from "mongoose";


export class UserDao extends BaseDao {

	/**
	 * @function findUserByEmailOrMobileNo
	 */
	async findUserByEmailOrMobileNo(params) {
		try {
			let { mobileNo, countryCode, email } = params
			let query: any = {};
			// if (countryCode && mobileNo) {
			// 	query = { "countryCode": countryCode, "mobileNo": mobileNo }
			// } else {
			// 	query = { "email": email }
			// }
			// query["status"] = { "$ne": config.CONSTANT.STATUS.DELETED };
			query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const options = { lean: true };

			return await this.findOne("users", query, { mobileOtp: 0 }, options, {});
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @description getmember of the day for the homeScreen
	 * @param userId 
	 */

	async getMemberOfDays(userId) {
		try {
			let match: any = {};
			let aggPipe = [];
			let result: any = {}
			match["status"] = config.CONSTANT.STATUS.ACTIVE
			match["isMemberOfDay"] = true
			aggPipe.push({ "$match": match });
			aggPipe.push({
				$lookup: {
					from: "likes",
					let: { "post": "$_id", "user": await appUtils.toObjectId(userId.userId) },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{
											$eq: ["$postId", "$$post"]
										},
										{
											$eq: ["$userId", "$$user"]
										},
										{
											$eq: ["$category", config.CONSTANT.COMMENT_CATEGORY.POST]
										},
										{
											$eq: ["$type", config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY]
										}
									]
								}
							}
						}
					],
					as: "likeData"
				}
			})
			aggPipe.push({
				$lookup: {
					from: "comments",
					let: { "post": "$_id", "user": await appUtils.toObjectId(userId.userId) },
					pipeline: [{
						$match: {
							$expr: {
								$and: [
									{
										$eq: ["$postId", "$$post"]
									},
									{
										$eq: ["$userId", "$$user"]
									},
									{
										$eq: ['$category', config.CONSTANT.COMMENT_CATEGORY.POST]
									},
									{
										$eq: ["$type", config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY]
									}
								]
							}
						}

					}],
					as: "commentData",
				}
			})
			aggPipe.push({ "$addFields": { created: { "$subtract": ["$memberCreatedAt", new Date("1970-01-01")] } } });
			aggPipe.push({
				$lookup: {
					from: "discovers",
					let: { "users": "$_id", "user": mongoose.Types.ObjectId(userId.userId) },
					pipeline: [
						{
							$match: {
								$expr: {
									$or: [
										{
											$and: [
												{
													$eq: ["$followerId", "$$user"]
												},
												{
													$eq: ["$userId", "$$users"]
												}
											]
										},
										{
											$and: [
												{
													$eq: ["$userId", "$$user"]
												},
												{
													$eq: ["$followerId", "$$users"]
												}
											]
										}
									]
								}
							}
						}
					],
					as: "DiscoverData"
				}
			})
			aggPipe.push({ '$unwind': { path: '$DiscoverData', preserveNullAndEmptyArrays: true } })
			const userIdToken = appUtils.toObjectId(userId.userId)
			aggPipe.push({
				$project:
				{
					_id: 1,
					likeCount: 1,
					commentCount: 1,
					created: 1,
					createdAt: 1,
					user: {
						status: "$status",
						_id: "$_id",
						industryType: "$industryType",
						myConnection: "$myConnection",
						experience: "$experience",
						discover_status: { $ifNull: ["$DiscoverData.discover_status", 4] },
						isRequestSendByMe: {
							$cond: {
								if: {
									$eq: ['$DiscoverData.userId', userIdToken]
								}, then: true,
								else: false
							}
						},
						name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
						profilePicUrl: "$profilePicUrl",
						profession: { $ifNull: ["$profession", ""] },
						about: { $ifNull: ["$about", ""] }
					},
					isComment: {
						$cond: { if: { "$eq": [{ $size: "$commentData" }, 0] }, then: false, else: true }
					},
					isLike:
					{
						$cond: { if: { "$eq": [{ $size: "$likeData" }, 0] }, then: false, else: true }
					}
				}
			})
			result = await this.aggregate("users", aggPipe, {})
			console.log('resultresult', result);
			if (result && result.length > 0) {
				result[0]["type"] = config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY
				return result[0]
			}
			return;
		} catch (error) {
			throw error;
		}
	}

	async checkUser(params) {
		try {
			return await this.findOne('users', params, {}, {});
		} catch (error) {
			throw error;
		}
	}
	async updateLikeAndCommentCount(query, update) {
		try {
			return await this.updateOne('users', query, update, {});
		} catch (error) {
			throw error;
		}
	}

	async findVerifiedEmailOrMobile(params: UserRequest.Login) {
		try {
			let query: any = {};


			if (params.email && params.mobileNo && params.countryCode) {
				query["$or"] = [{ "email": params.email, isEmailVerified: true }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true }];

			} else {
				if (params.email) {
					query = { "email": params.email, isEmailVerified: true };
				}
				if (params.mobileNo) {
					query = { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true };
				}
			}

			query["status"] = { "$ne": config.CONSTANT.STATUS.DELETED };
			let options = { lean: true };

			const data = await this.findOne("users", query, { hash: 0, salt: 0, mobileOtp: 0 }, options, {});
			return data;

		} catch (error) {
			throw error;
		}
	}
	// for gorgot password
	async findForGotVerifiedEmailOrMobile(params: ForgotPasswordRequest) {
		try {
			let query: any = {};

			if (params.email && params.mobileNo && params.countryCode) {
				query["$or"] = [{ "email": params.email, isEmailVerified: true }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true }];

			} else {
				if (params.email) {
					query = { "email": params.email, isEmailVerified: true };
				}
				if (params.mobileNo) {
					query = { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true };
				}
			}

			query["status"] = { "$ne": config.CONSTANT.STATUS.DELETED };
			let options = { lean: true };

			const data = await this.findOne("users", query, {}, options, {});
			return data;

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
	async signup(params: UserRequest.Signup, userData?) {
		try {
			// if (userData) {
			// 	if (userData.email === params.email && (!userData.isFacebookLogin || !userData.isGoogleLogin || !userData.isFacebookLogin || !userData.isEmailVerified)) {
			// 		// remove the email from previous one

			// 		const data = userDao.updateOne('users', { _id: userData._id }, { $set: { email: "" } }, {})
			// 	}
			// 	if (userData.mobileNo === params.mobileNo && !userData.isMobileVerified) {
			// 		// remove the email from previous one

			// 		const data = userDao.updateOne('users', { _id: userData._id }, { $set: { mobileNo: "", fullMobileNo: "" } }, {})
			// 	}
			// }

			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			// params.createdAt = Date.now();
			params["created"] = new Date().getTime()
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
			// if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
			// 	query.facebookId = params.socialId;
			// } else {
			// 	query.googleId = params.socialId;
			// }

			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
				query.facebookId = params.socialId;
				// query.isFacebookLogin = true;
			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
				query.appleId = params.socialId;
				// query.isAppleLogin = true;
			} else { // Config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE
				query.googleId = params.socialId;
				// query.isGoogleLogin = true;
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
			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
				params.appleId = params.socialId;
				params.isAppleLogin = true;
			}
			else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE) {
				params.googleId = params.socialId;
				params.isGoogleLogin = true;
			}
			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			params.created = new Date().getTime();
			// params['status'] = config.CONSTANT.STATUS.ACTIVE;

			return await this.save("users", params);
		} catch (error) {
			throw error;
		}
	}

	async mergeAccountAndCheck(step1, params: UserRequest.SocialSignup) {
		try {
			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
				params.facebookId = params.socialId;
				params.isFacebookLogin = true;
			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
				params.appleId = params.socialId;
				params.isAppleLogin = true;
			}
			else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE) {
				params.googleId = params.socialId;
				params.isGoogleLogin = true;
			}
			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			// params.created = new Date();
			if (step1.email === params.email) {
				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
				// return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			}
			else {
				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
				// return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
			}
			return params;
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
	async dashboardGraph() {
		try {
			const promise = [];

			const query = {
				$or: [
					{
						status: config.CONSTANT.STATUS.ACTIVE,
					}, {
						status: config.CONSTANT.STATUS.BLOCKED
					}
				]
			}
			var date = new Date();
			var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

			promise.push(this.count("users", query));

			const newUsers = {
				$or: [
					{
						status: config.CONSTANT.STATUS.ACTIVE,
					}, {
						status: config.CONSTANT.STATUS.BLOCKED
					}
				],
				createdAt: { $gt: firstDay }
			}

			promise.push(this.count("users", newUsers));

			const [userCount, newUser,] = await Promise.all(promise);
			return {
				totalUsers: userCount,
				newUser
			}

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
			params.created = new Date().getTime()
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

	async checkOTP(params: UserRequest.verifyOTP, userData: TokenData) {
		try {
			if (params.mobileNo) {
				const mobleCriteria = {
					_id: userData.userId,
					countryCode: params.countryCode,
					mobileNo: params.mobileNo,
				};
				const options = { lean: true };
				const projection = { mobileOtp: 1 }
				return await this.findOne('users', mobleCriteria, {}, options, {});
			}
			return;
		} catch (error) {
			throw error;
		}
	}

	async checkForgotOtp(params: UserRequest.verifyOTP, userData?: TokenData) {
		try {
			// if (params.mobileNo) {
			const mobleCriteria = {
				countryCode: params.countryCode,
				mobileNo: params.mobileNo,
			};
			const options = { lean: true };
			const projection = { mobileOtp: 1 }
			return await this.findOne('users', mobleCriteria, {}, options, {});

		} catch (error) {
			throw error;
		}
	}

	async getUsers(params) {
		try {
			// let { page, limit, sortBy, sortType } = params;
			// const { searchTerm, userId, type, status, fromDate, toDate, isByAdmin } = params;
			// if (!limit) { limit = config.CONSTANT.PAGINATION.limit }
			// if (!page) { page = 1; }
			// let sortingType = {};
			// sortType = !sortType ? -1 : sortType;
			// const matchObject: any = { $match: {} };
			// let searchCriteria = {};


			// sortingType = {
			// 	createdAt: sortType,
			// };
			// if (searchTerm) {
			// 	// for filtration
			// 	searchCriteria = {
			// 		$match: {
			// 			$or: [
			// 				{ email: new RegExp('.*' + searchTerm + '.*', 'i') },
			// 				{ firstName: new RegExp('.*' + searchTerm + '.*', 'i') },
			// 				{ lastName: new RegExp('.*' + searchTerm + '.*', 'i') },
			// 			],
			// 		},
			// 	};
			// }
			// else {
			// 	searchCriteria = {
			// 		$match: {
			// 		},
			// 	};
			// }

			// if (!status) {
			// 	matchObject.$match = {
			// 		$or: [{
			// 			status: config.CONSTANT.STATUS.ACTIVE,
			// 		}, {
			// 			status: config.CONSTANT.STATUS.BLOCKED,
			// 		},
			// 		],
			// 	};
			// }

			// // if (userId) { matchObject.$match._id = Types.ObjectId(userId); }
			// // if (isByAdmin) {
			// //     matchObject.$match['type'] = { $ne: Constant.DATABASE.USER_TYPE.TENANT.TYPE };
			// // }
			// if (status) { matchObject.$match['status'] = status; }

			// // Date filters
			// if (fromDate && toDate) { matchObject.$match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
			// if (fromDate && !toDate) { matchObject.$match['createdAt'] = { $gte: fromDate }; }
			// if (!fromDate && toDate) { matchObject.$match['createdAt'] = { $lte: toDate }; }

			// const query = [
			// 	matchObject,
			// 	searchCriteria,
			// 	{
			// 		$sort: sortingType,
			// 	},
			// ];
			// const data = await this.paginate('users', query, limit, page, {}, true);
			// return data;

			const { sortBy, sortOrder, limit, page, searchTerm, status, fromDate, toDate } = params;
			const aggPipe = [];


			const match: any = {};
			// match['dob'] = { $exists: true };
			// match['experience'] = { $exists: true };
			// match['profession'] = { $exists: true };

			// match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
			if (status) {
				match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
			} else {
				match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
			}
			if (searchTerm) {
				match['$or'] = [
					{ email: new RegExp('.*' + searchTerm + '.*', 'i') },
					{ firstName: new RegExp('.*' + searchTerm + '.*', 'i') },
					{ lastName: new RegExp('.*' + searchTerm + '.*', 'i') },
				]
			}

			if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
			if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
			if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }
			aggPipe.push({ "$match": match });

			let sort = {};
			if (sortBy && sortOrder) {
				if (sortBy === "name") {
					sort = { "firstName": sortOrder };
				} else {
					sort = { "createdAt": sortOrder };
				}
			} else {
				sort = { "createdAt": -1 };
			}
			aggPipe.push({ "$sort": sort });

			const data = await userDao.paginate('users', aggPipe, limit, page, {}, true);
			return data;

		} catch (error) {
			return Promise.reject(error);
		}
	}
}

export const userDao = new UserDao();