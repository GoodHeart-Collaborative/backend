// "use strict";

// import * as _ from "lodash";

// import { BaseDao } from "@modules/base/BaseDao";
// import * as config from "@config/constant";
// import { ElasticSearch } from "@lib/ElasticSearch";

// const elasticSearch = new ElasticSearch();

// export class UserDao extends BaseDao {

// 	/**
// 	 * @function findUserByEmailOrMobileNo
// 	 */
// 	async findUserByEmailOrMobileNo(params) {
// 		try {
// 			let { mobileNo, countryCode, email } = params
// 			let query: any = {};
// 			// if (countryCode && mobileNo) {
// 			// 	query = { "countryCode": countryCode, "mobileNo": mobileNo }
// 			// } else {
// 			// 	query = { "email": email }
// 			// }
// 			// query["status"] = { "$ne": config.CONSTANT.STATUS.DELETED };
// 			query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
// 			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

// 			const options = { lean: true };

// 			return await this.findOne("users", query, { mobileOtp: 0 }, options, {});
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	async findVerifiedEmailOrMobile(params: UserRequest.Login) {
// 		try {
// 			let query: any = {};

// 			console.log('kkkkkkkkkkkkk', params);

// 			if (params.email && params.mobileNo && params.countryCode) {
// 				query["$or"] = [{ "email": params.email, isEmailVerified: true }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true }];

// 			} else {
// 				if (params.email) {
// 					query = { "email": params.email, isEmailVerified: true };
// 				}
// 				if (params.mobileNo) {
// 					query = { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true };
// 				}
// 			}

// 			query["status"] = { "$ne": config.CONSTANT.STATUS.DELETED };
// 			let options = { lean: true };
// 			console.log('queryqueryquery', query);

// 			const data = await this.findOne("users", query, { hash: 0, salt: 0, mobileOtp: 0 }, options, {});
// 			// console.log('datadata', data);
// 			return data;

// 		} catch (error) {
// 			throw error;
// 		}
// 	}
// 	// for gorgot password
// 	async findForGotVerifiedEmailOrMobile(params: ForgotPasswordRequest) {
// 		try {
// 			let query: any = {};
// 			console.log('kkkkkkkkkkkkk', params);

// 			if (params.email && params.mobileNo && params.countryCode) {
// 				query["$or"] = [{ "email": params.email, isEmailVerified: true }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true }];

// 			} else {
// 				if (params.email) {
// 					query = { "email": params.email, isEmailVerified: true };
// 				}
// 				if (params.mobileNo) {
// 					query = { "countryCode": params.countryCode, "mobileNo": params.mobileNo, isMobileVerified: true };
// 				}
// 			}

// 			query["status"] = { "$ne": config.CONSTANT.STATUS.DELETED };
// 			let options = { lean: true };
// 			console.log('queryqueryquery', query);

// 			const data = await this.findOne("users", query, {}, options, {});
// 			console.log('datadata', data);
// 			return data;

// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function findUserById
// 	 */
// 	async findUserById(params: UserId) {
// 		try {
// 			const query: any = {};
// 			query._id = params.userId;
// 			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

// 			const projection = { updatedAt: 0 };

// 			const options = { lean: true };

// 			return await this.findOne("users", query, projection, options, {});
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function signup
// 	 */
// 	async signup(params: UserRequest.Signup, userData?) {
// 		try {
// 			// if (userData) {
// 			// 	if (userData.email === params.email && (!userData.isFacebookLogin || !userData.isGoogleLogin || !userData.isFacebookLogin || !userData.isEmailVerified)) {
// 			// 		// remove the email from previous one
// 			// 		console.log('LLLLLLLLLLLL');

// 			// 		const data = userDao.updateOne('users', { _id: userData._id }, { $set: { email: "" } }, {})
// 			// 	}
// 			// 	if (userData.mobileNo === params.mobileNo && !userData.isMobileVerified) {
// 			// 		// remove the email from previous one
// 			// 		console.log('LLLLLLLLLLLL', userData.isMobileVerified);

// 			// 		const data = userDao.updateOne('users', { _id: userData._id }, { $set: { mobileNo: "", fullMobileNo: "" } }, {})
// 			// 	}
// 			// }

// 			if (params.countryCode && params.mobileNo) {
// 				params.fullMobileNo = params.countryCode + params.mobileNo;
// 			}
// 			// params.createdAt = Date.now();
// 			return await this.save("users", params);
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function checkSocialId
// 	 */
// 	async checkSocialId(params) {
// 		try {
// 			const query: any = {};
// 			// if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
// 			// 	query.facebookId = params.socialId;
// 			// } else {
// 			// 	query.googleId = params.socialId;
// 			// }
// 			console.log('params.socialLoginTypeparams.socialLoginTypeparams.socialLoginType', params.socialLoginType);

// 			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
// 				console.log('>>>>>>>>>>>>>>>>>>.');

// 				query.facebookId = params.socialId;
// 				// query.isFacebookLogin = true;
// 			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
// 				query.appleId = params.socialId;
// 				// query.isAppleLogin = true;
// 			} else { // Config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE
// 				query.googleId = params.socialId;
// 				// query.isGoogleLogin = true;
// 			}
// 			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

// 			const options = { lean: true };

// 			return await this.findOne("users", query, {}, options, {});
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function socialSignup
// 	 */
// 	async socialSignup(params: UserRequest.SocialSignup) {
// 		try {
// 			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
// 				params.facebookId = params.socialId;
// 				params.isFacebookLogin = true;
// 			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
// 				params.appleId = params.socialId;
// 				params.isAppleLogin = true;
// 			}
// 			else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE) {
// 				params.googleId = params.socialId;
// 				params.isGoogleLogin = true;
// 			}
// 			if (params.countryCode && params.mobileNo) {
// 				params.fullMobileNo = params.countryCode + params.mobileNo;
// 			}
// 			params.created = new Date();
// 			// params['status'] = config.CONSTANT.STATUS.ACTIVE;

// 			// const data= await this.da
// 			return await this.save("users", params);
// 			// return await this.fin
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	async mergeAccountAndCheck(step1, params: UserRequest.SocialSignup) {
// 		try {
// 			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
// 				params.facebookId = params.socialId;
// 				params.isFacebookLogin = true;
// 			} else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.APPLE) {
// 				params.appleId = params.socialId;
// 				params.isAppleLogin = true;
// 			}
// 			else if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.GOOGLE) {
// 				params.googleId = params.socialId;
// 				params.isGoogleLogin = true;
// 			}
// 			if (params.countryCode && params.mobileNo) {
// 				params.fullMobileNo = params.countryCode + params.mobileNo;
// 			}
// 			// params.created = new Date();
// 			if (step1.email === params.email) {
// 				console.log('4444444444444444444444444444444444444444');
// 				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
// 				// return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
// 			}
// 			else {
// 				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
// 				// return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
// 			}
// 			return params;
// 			// params['status'] = config.CONSTANT.STATUS.ACTIVE;

// 			// const data= await this.da
// 			// return await this.save("users", params);

// 			// return await this.fin
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function addForgotToken
// 	 */
// 	async addForgotToken(params: ForgotPasswordRequest) {
// 		try {
// 			const query: any = {};
// 			query._id = params.userId;

// 			const update = {};
// 			update["$set"] = {
// 				"forgotToken": params.forgotToken
// 			};

// 			return await this.updateOne("users", query, update, {});
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function emptyForgotToken
// 	 */
// 	async emptyForgotToken(params) {
// 		try {
// 			const query: any = {};
// 			if (params.token) {
// 				query.forgotToken = params.token;
// 			}
// 			if (params.userId) {
// 				query._id = params.userId;
// 			}

// 			const update = {};
// 			update["$unset"] = {
// 				"forgotToken": ""
// 			};

// 			return await this.updateOne("users", query, update, {});
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 	 * @function changeForgotPassword
// 	 */
// 	async changeForgotPassword(params: ChangeForgotPasswordRequest, tokenData: TokenData) {
// 		try {
// 			const query: any = {};
// 			query._id = tokenData.userId;

// 			const update = {};
// 			update["$set"] = {
// 				"hash": params.hash
// 			};

// 			const options = { new: true };

// 			return await this.findOneAndUpdate("users", query, update, options);
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	/**
// 		 * @function dashboardGraph
// 		 */
// 	async dashboardGraph() {
// 		try {
// 			const promise = [];

// 			const query = {
// 				$or: [
// 					{
// 						status: config.CONSTANT.STATUS.ACTIVE,
// 					}, {
// 						status: config.CONSTANT.STATUS.BLOCKED
// 					}
// 				]
// 			}
// 			var date = new Date();
// 			var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
// 			var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);

// 			promise.push(this.count("users", query));

// 			const newUsers = {
// 				$or: [
// 					{
// 						status: config.CONSTANT.STATUS.ACTIVE,
// 					}, {
// 						status: config.CONSTANT.STATUS.BLOCKED
// 					}
// 				],
// 				createdAt: { $gt: firstDay }
// 			}

// 			promise.push(this.count("users", newUsers));

// 			const [userCount, newUser,] = await Promise.all(promise);

// 			console.log('datadatadatadatadata', userCount);
// 			return {
// 				totalUsers: userCount,
// 				newUser
// 			}

// 		} catch (error) {
// 			throw error;
// 		}
// 	}
// 	/**
// 	 * @function addUser
// 	 */
// 	async addUser(params) {
// 		try {
// 			if (params.countryCode && params.mobileNo) {
// 				params.fullMobileNo = params.countryCode + params.mobileNo;
// 			}
// 			params.created = Date.now();
// 			return await this.save("users", params);
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	// /**
// 	//  * @function updateUser
// 	//  */
// 	// async updateUser(params) {
// 	// 	const query: any = {};
// 	// 	query["$or"] = [{ "email": params.email }, { "countryCode": params.countryCode, "mobileNo": params.mobileNo }];
// 	// 	query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

// 	// 	const set = {};
// 	// 	const unset = {};
// 	// 	const update = {};
// 	// 	update["$set"] = set;

// 	// 	const fieldsToFill = ["firstName", "middleName", "lastName", "dob", "age", "gender"];

// 	// 	set = appUtils.setInsertObject(params, set, fieldsToFill);

// 	// 	unset = appUtils.unsetInsertObject(params, unset, fieldsToFill);
// 	// 	if (!_.isEmpty(unset)) {
// 	// 		update["$unset"] = unset;
// 	// 	}

// 	// 	const options = { new: true };

// 	// 	return await this.findOneAndUpdate("users", query, update, options);
// 	// }

// 	async checkOTP(params: UserRequest.verifyOTP, userData: TokenData) {
// 		try {
// 			if (params.mobileNo) {
// 				const mobleCriteria = {
// 					_id: userData.userId,
// 					countryCode: params.countryCode,
// 					mobileNo: params.mobileNo,
// 				};
// 				const options = { lean: true };
// 				const projection = { mobileOtp: 1 }
// 				return await this.findOne('users', mobleCriteria, {}, options, {});
// 			}
// 			return;
// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	async checkForgotOtp(params: UserRequest.verifyOTP, userData?: TokenData) {
// 		try {
// 			// if (params.mobileNo) {
// 			const mobleCriteria = {
// 				countryCode: params.countryCode,
// 				mobileNo: params.mobileNo,
// 			};
// 			const options = { lean: true };
// 			const projection = { mobileOtp: 1 }
// 			return await this.findOne('users', mobleCriteria, {}, options, {});

// 		} catch (error) {
// 			throw error;
// 		}
// 	}

// 	async getUsers(params) {
// 		try {
// 			// let { page, limit, sortBy, sortType } = params;
// 			// const { searchTerm, userId, type, status, fromDate, toDate, isByAdmin } = params;
// 			// if (!limit) { limit = config.CONSTANT.PAGINATION.limit }
// 			// if (!page) { page = 1; }
// 			// let sortingType = {};
// 			// sortType = !sortType ? -1 : sortType;
// 			// const matchObject: any = { $match: {} };
// 			// let searchCriteria = {};


// 			// sortingType = {
// 			// 	createdAt: sortType,
// 			// };
// 			// if (searchTerm) {
// 			// 	// for filtration
// 			// 	searchCriteria = {
// 			// 		$match: {
// 			// 			$or: [
// 			// 				{ email: new RegExp('.*' + searchTerm + '.*', 'i') },
// 			// 				{ firstName: new RegExp('.*' + searchTerm + '.*', 'i') },
// 			// 				{ lastName: new RegExp('.*' + searchTerm + '.*', 'i') },
// 			// 			],
// 			// 		},
// 			// 	};
// 			// }
// 			// else {
// 			// 	searchCriteria = {
// 			// 		$match: {
// 			// 		},
// 			// 	};
// 			// }

// 			// if (!status) {
// 			// 	matchObject.$match = {
// 			// 		$or: [{
// 			// 			status: config.CONSTANT.STATUS.ACTIVE,
// 			// 		}, {
// 			// 			status: config.CONSTANT.STATUS.BLOCKED,
// 			// 		},
// 			// 		],
// 			// 	};
// 			// }

// 			// // if (userId) { matchObject.$match._id = Types.ObjectId(userId); }
// 			// // if (isByAdmin) {
// 			// //     matchObject.$match['type'] = { $ne: Constant.DATABASE.USER_TYPE.TENANT.TYPE };
// 			// // }
// 			// if (status) { matchObject.$match['status'] = status; }

// 			// // Date filters
// 			// if (fromDate && toDate) { matchObject.$match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
// 			// if (fromDate && !toDate) { matchObject.$match['createdAt'] = { $gte: fromDate }; }
// 			// if (!fromDate && toDate) { matchObject.$match['createdAt'] = { $lte: toDate }; }

// 			// const query = [
// 			// 	matchObject,
// 			// 	searchCriteria,
// 			// 	{
// 			// 		$sort: sortingType,
// 			// 	},
// 			// ];
// 			// const data = await this.paginate('users', query, limit, page, {}, true);
// 			// console.log('datadatadatadata', data);
// 			// return data;

// 			console.log('paramsparamsparamsparams', params);
// 			const { sortBy, sortOrder, limit, page, searchTerm, status, fromDate, toDate } = params;
// 			const aggPipe = [];


// 			const match: any = {};
// 			// match['dob'] = { $exists: true };
// 			// match['experience'] = { $exists: true };
// 			// match['profession'] = { $exists: true };

// 			// match.adminType = config.CONSTANT.ADMIN_TYPE.SUB_ADMIN;
// 			if (status) {
// 				match["$and"] = [{ status: status }, { status: { $ne: config.CONSTANT.STATUS.DELETED } }];
// 			} else {
// 				match.status = { "$ne": config.CONSTANT.STATUS.DELETED };
// 			}
// 			if (searchTerm) {
// 				match['$or'] = [
// 					{ email: new RegExp('.*' + searchTerm + '.*', 'i') },
// 					{ firstName: new RegExp('.*' + searchTerm + '.*', 'i') },
// 					{ lastName: new RegExp('.*' + searchTerm + '.*', 'i') },
// 				]
// 			}

// 			console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);

// 			if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
// 			if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
// 			if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }
// 			aggPipe.push({ "$match": match });

// 			console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

// 			// const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
// 			// aggPipe.push({ "$project": project });

// 			let sort = {};
// 			if (sortBy && sortOrder) {
// 				if (sortBy === "name") {
// 					sort = { "firstName": sortOrder };
// 				} else {
// 					sort = { "createdAt": sortOrder };
// 				}
// 			} else {
// 				sort = { "createdAt": -1 };
// 			}
// 			aggPipe.push({ "$sort": sort });

// 			console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);


// 			const data = await userDao.paginate('users', aggPipe, limit, page, {}, true);
// 			console.log('datadatadata', data);
// 			return data;

// 		} catch (error) {
// 			return Promise.reject(error);
// 		}
// 	}
// }

// export const userDao = new UserDao();
"use strict";

import * as _ from "lodash";

import { BaseDao } from "@modules/base/BaseDao";
import * as config from "@config/constant";
import { ElasticSearch } from "@lib/ElasticSearch";
import * as appUtils from '@utils/appUtils'


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
			query.status = { "$ne": config.CONSTANT.STATUS.DELETED };

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

			console.log('kkkkkkkkkkkkk', params);

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
			console.log('queryqueryquery', query);

			const data = await this.findOne("users", query, { hash: 0, salt: 0, mobileOtp: 0 }, options, {});
			// console.log('datadata', data);
			return data;

		} catch (error) {
			throw error;
		}
	}
	// for gorgot password
	async findForGotVerifiedEmailOrMobile(params: ForgotPasswordRequest) {
		try {
			let query: any = {};
			console.log('kkkkkkkkkkkkk', params);

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
			console.log('queryqueryquery', query);

			const data = await this.findOne("users", query, {}, options, {});
			console.log('datadata', data);
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
			// 		console.log('LLLLLLLLLLLL');

			// 		const data = userDao.updateOne('users', { _id: userData._id }, { $set: { email: "" } }, {})
			// 	}
			// 	if (userData.mobileNo === params.mobileNo && !userData.isMobileVerified) {
			// 		// remove the email from previous one
			// 		console.log('LLLLLLLLLLLL', userData.isMobileVerified);

			// 		const data = userDao.updateOne('users', { _id: userData._id }, { $set: { mobileNo: "", fullMobileNo: "" } }, {})
			// 	}
			// }

			if (params.countryCode && params.mobileNo) {
				params.fullMobileNo = params.countryCode + params.mobileNo;
			}
			// params.createdAt = Date.now();
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
			console.log('params.socialLoginTypeparams.socialLoginTypeparams.socialLoginType', params.socialLoginType);

			if (params.socialLoginType === config.CONSTANT.SOCIAL_LOGIN_TYPE.FACEBOOK) {
				console.log('>>>>>>>>>>>>>>>>>>.');

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
			params.created = new Date();
			// params['status'] = config.CONSTANT.STATUS.ACTIVE;

			// const data= await this.da
			return await this.save("users", params);
			// return await this.fin
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
				console.log('4444444444444444444444444444444444444444');
				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
				// return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			}
			else {
				await userDao.updateOne('users', { _id: step1._id }, { ...params }, {})
				// return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
			}
			return params;
			// params['status'] = config.CONSTANT.STATUS.ACTIVE;

			// const data= await this.da
			// return await this.save("users", params);

			// return await this.fin
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

			console.log('datadatadatadatadata', userCount);
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
			// console.log('datadatadatadata', data);
			// return data;

			console.log('paramsparamsparamsparams', params);
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

			console.log('aggPipeaggPipeaggPipeaggPipe111111111', aggPipe);

			if (fromDate && toDate) { match['createdAt'] = { $gte: fromDate, $lte: toDate }; }
			if (fromDate && !toDate) { match['createdAt'] = { $gte: fromDate }; }
			if (!fromDate && toDate) { match['createdAt'] = { $lte: toDate }; }
			aggPipe.push({ "$match": match });

			console.log('aggPipeaggPipeaggPipeaggPipe3333333333333333', aggPipe);

			// const project = { _id: 1, name: 1, email: 1, created: 1, status: 1 };
			// aggPipe.push({ "$project": project });

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

			console.log('aggPipeaggPipeaggPipeaggPipe', aggPipe);


			const data = await userDao.paginate('users', aggPipe, limit, page, {}, true);
			console.log('datadatadata', data);
			return data;

		} catch (error) {
			return Promise.reject(error);
		}
	}
}

export const userDao = new UserDao();