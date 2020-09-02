"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import { ElasticSearch } from "@lib/ElasticSearch";
import * as appUtils from '@utils/appUtils'
import * as moment from 'moment'

const elasticSearch = new ElasticSearch();

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
			// query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

			const options = { lean: true };

			return await this.findOne("users", query, { mobileOtp: 0 }, options, {});
		} catch (error) {
			throw error;
		}
	}

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
			aggPipe.push({ '$unwind': { path: '$likeData', preserveNullAndEmptyArrays: true } })

			aggPipe.push({
				$project:
				{
					_id: 1,
					likeCount: 1,
					commentCount: 1,
					created: 1,
					createdAt: 1,
					users: {
						name: { $ifNull: ["$firstName", ""] },
						profilePicture: { $ifNull: ["$profilePicture", ""] }
					},
					isLike:
					{
						$cond: { if: { "$eq": ["$likeData.userId", await appUtils.toObjectId(userId.userId)] }, then: true, else: false }
					}
				}
			})
			result = await this.aggregate("users", aggPipe, {})
			result["type"] = config.CONSTANT.HOME_TYPE.MEMBER_OF_DAY
			return result
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
			params["location"] = {
				"location": "Noida, Uttar Pradesh, India",
				"type": "Point",
				"coordinates": [
					77.3619782,
					28.6060713
				]
			}
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

			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
				query.facebookId = params.socialId;
			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
				query.appleId = params.socialId;
			} else {
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

			// late long
			params["location"] = {
				"location": "Noida, Uttar Pradesh, India",
				"type": "Point",
				"coordinates": [
					77.3619782,
					28.6060713
				]
			}
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
				console.log('22222222222');
				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
				// return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			}
			else {
				userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
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
			var date = new Date();
			const pipeline = [];
			const query = {
				$or: [
					{
						status: config.CONSTANT.STATUS.ACTIVE,
					}, {
						status: config.CONSTANT.STATUS.BLOCKED
					}
				]
			}
			// var firstDay = moment(new Date(date.getFullYear(), date.getMonth(), 1)).format('YYYY-MM-DD')
			let firstDay1 = moment().startOf('month');
			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			console.log('firstDay1', firstDay1);
			pipeline.push(this.count("users", query));

			const newUsers = {
				$and: [{
					$or: [
						{
							status: config.CONSTANT.STATUS.ACTIVE,
						}, {
							status: config.CONSTANT.STATUS.BLOCKED
						}
					],
				},
				{
					createdAt: { $gte: new Date(firstDay1.toISOString()) }
				}
				]
			}

			const userGraphCriteria = [
				{
					$match: {
						createdAt: {
							$gte: new Date(new Date().getFullYear(), 0, 1)
						}
					}
				},
				{
					$project:
						{ month: { $month: { $toDate: '$createdAt' } } },
				},
				{
					$group: {
						_id: { month_joined: '$month' },
						number: { $sum: 1 }
					}
				},
				{ $sort: { '_id.month_joined': 1 } },
			];

			const userGraphLastYearCriteria = [
				{
					$match: {
						createdAt: {
							$gte: new Date(new Date().getFullYear() - 1, 0, 1),
							$lt: new Date(new Date().getFullYear(), 0, 1)
						}
					}
				},
				{
					$project:
						{ month: { $month: { $toDate: '$createdAt' } } },
				},
				{
					$group: {
						_id: { month_joined: '$month' },
						number: { $sum: 1 }
					}
				},
				{ $sort: { '_id.month_joined': 1 } },
			];
			const previousYearTotalUser = {
				createdAt: {
					$gte: new Date(new Date().getFullYear() - 1, 0, 1),
					$lt: new Date(new Date().getFullYear(), 0, 1)
				},
				status: { $ne: config.CONSTANT.STATUS.DELETED }
			};
			const thisYeartotalUser = {
				createdAt: {
					$gte: new Date(new Date().getFullYear(), 0, 1)
				},
				status: { $ne: config.CONSTANT.STATUS.DELETED }
			};

			pipeline.push(this.count("users", newUsers));
			pipeline.push(this.count('users', previousYearTotalUser))
			pipeline.push(this.count('users', thisYeartotalUser))

			const [userCount, newUser, previousYearUserCount, currentYearUserCount] = await Promise.all(pipeline);

			const userGraph = await this.aggregate("users", userGraphCriteria, {});
			const userGraphPreviousYear = await this.aggregate('users', userGraphLastYearCriteria, {})
			console.log('userGraph1userGraph1userGraph1userGraph1', userGraph);


			const userGraphThisYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
			const userGraphLastYear = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };

			userGraph.map(data => {
				userGraphThisYear[data['_id']['month_joined']] = data.number;
			});

			userGraphPreviousYear.map(data => {
				userGraphLastYear[data['_id']['month_joined']] = data.number;
			});

			return {
				totalUsers: userCount,
				newUser,
				userGraphThisYear,
				userGraphLastYear,
				previousYearUserCount,
				currentYearUserCount
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
			const { sortBy, sortOrder, limit, page, searchTerm, status, fromDate, toDate } = params;
			const aggPipe = [];


			const match: any = {};
			// match['dob'] = { $exists: true };
			// match['experience'] = { $exists: true };
			// match['profession'] = { $exists: true };
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

	async pullMember(params) {
		try {
			let query: any = {}
			query = {
				_id: await appUtils.toObjectId(params.userId)
			}
			let update: any = {}
			update["$pull"] = {
				members: await appUtils.toObjectId(params.followerId)
			}
			update["$inc"] = { myConnection: -1 }
			return await this.update('users', query, update, {});
		} catch (error) {
			throw error
		}
	}
	async pushMember(params) {
		try {
			let query: any = {}
			query = {
				_id: await appUtils.toObjectId(params.userId)
			}
			let update: any = {}
			update["$push"] = {
				members: await appUtils.toObjectId(params.followerId)
			}
			update["$inc"] = { myConnection: 1 }
			return await this.update('users', query, update, {});
		} catch (error) {
			throw error
		}
	}

	async getMembers(params) {
		try {
			let { userId, followerId } = params
			let query: any = {}
			query = {
				_id: await appUtils.toObjectId(userId),
				"members": { $all: [await appUtils.toObjectId(followerId)] }
			}
			return await this.findOne('users', query, {}, {});
		} catch (error) {
			throw error;
		}
	}
}

export const userDao = new UserDao();
