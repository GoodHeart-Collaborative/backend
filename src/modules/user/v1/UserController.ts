"use strict";

import * as _ from "lodash";
import fs = require("fs");
const { Parser } = require("json2csv");
import * as promise from "bluebird";

import * as appUtils from "@utils/appUtils";
import * as config from "@config/index";
import { contactDao } from "@modules/contact/v1/ContactDao";
import * as csv from "@lib/csv";
// import { imageUtil } from "@lib/ImageUtil";
import { logDao } from "@modules/log/LogDao";
import { loginHistoryDao } from "@modules/loginHistory/LoginHistoryDao";
import { mailManager, redisClient } from "@lib/index";
import * as mimeType from "../../../json/mime-type.json";
import { smsManager } from "@lib/SMSManager";
// import * as sns from "@lib/pushNotification/sns";
import * as tokenManager from "@lib/tokenManager";
import * as userConstant from "@modules/user/userConstant";
import { userDao, userMapper } from "@modules/user/index";
import * as xlsx from "@lib/xlsx";

export class UserController {

	/**
	 * @function signup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async signup(params: UserRequest.Signup) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (step1) {
					if (step1.email === params.email) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
					}
				} else {
					const step2 = await userDao.signup(params);
					const salt = await appUtils.CryptDataMD5(step2._id + "." + new Date().getTime() + "." + params.deviceId);
					const tokenData = _.extend(params, {
						"userId": step2._id,
						"firstName": step2.firstName,
						"middleName": step2.middleName,
						"lastName": step2.lastName,
						"countryCode": step2.countryCode,
						"mobileNo": step2.mobileNo,
						"email": step2.email,
						"salt": salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					const userObject = appUtils.buildToken(tokenData);
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_SIGNUP", "object": userObject, "salt": salt });
					let arn;
					if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
						// arn = await sns.registerAndroidUser(params.deviceToken);
						arn = "";
					} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
						// arn = await sns.registerIOSUser(params.deviceToken);
						arn = "";
					}
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": Date.now() });
					const step6 = await loginHistoryDao.createUserLoginHistory(params);
					let step7, step8;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step7 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
						else
							step7 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": step2._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step8 = redisClient.createJobs(jobPayload);
					}
					const step9 = await promise.join(step6, step7, step8);
					return userConstant.MESSAGES.SUCCESS.SIGNUP({ "accessToken": accessToken, "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function login
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async login(params: UserRequest.Login) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (!step1) {
					if (params.email) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
					}
				} else {
					if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
					} else {
						let salt, accessToken;
						if (!step1.hash) {
							return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
						} else {
							params.hash = appUtils.encryptHashPassword(params.password, step1.salt);
							if (
								(config.SERVER.ENVIRONMENT !== "production") ?
									(
										params.password !== config.CONSTANT.DEFAULT_PASSWORD &&
										step1.hash !== params.hash
									) :
									step1.hash !== params.hash
							) {
								return Promise.reject(config.CONSTANT.MESSAGES.ERROR.INCORRECT_PASSWORD);
							} else {
								salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
								const tokenData = _.extend(params, {
									"userId": step1._id,
									"firstName": step1.firstName,
									"middleName": step1.middleName,
									"lastName": step1.lastName,
									"email": step1.email,
									"countryCode": step1.countryCode,
									"mobileNo": step1.mobileNo,
									"salt": salt,
									"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
								});
								const userObject = appUtils.buildToken(tokenData);
								accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
							}
						}
						let arn;
						if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
							// arn = await sns.registerAndroidUser(params.deviceToken);
							arn = "";
						} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
							// arn = await sns.registerIOSUser(params.deviceToken);
							arn = "";
						}
						const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
						let step3;
						if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
							const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
							step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
						} else {
							const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id, "deviceId": params.deviceId });
							step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id, "deviceId": params.deviceId });
						}
						params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": step3 });
						const step4 = loginHistoryDao.createUserLoginHistory(params);
						let step5, step6;
						if (config.SERVER.IS_REDIS_ENABLE) {
							if (!config.SERVER.IN_ACTIVITY_SESSION)
								step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
							else
								step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
							const jobPayload = {
								jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
								time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
								params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
							};
							step6 = redisClient.createJobs(jobPayload);
						}
						const step7 = await promise.join(step4, step5, step6);
						return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
					}
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function socialLogin
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async socialLogin(params: UserRequest.SocialLogin) {
		try {
			const step1 = await userDao.checkSocialId(params);
			if (!step1) {
				return Promise.reject(userConstant.MESSAGES.ERROR.SOCIAL_ACCOUNT_ALREADY_EXIST);
			} else {
				if (step1.status === config.CONSTANT.STATUS.BLOCKED) {
					return Promise.reject(config.CONSTANT.MESSAGES.ERROR.BLOCKED);
				} else {
					const salt = await appUtils.CryptDataMD5(step1._id + "." + new Date().getTime() + "." + params.deviceId);
					const tokenData = _.extend(params, {
						"userId": step1._id,
						"firstName": step1.firstName,
						"middleName": step1.middleName,
						"lastName": step1.lastName,
						"email": step1.email,
						"countryCode": step1.countryCode,
						"mobileNo": step1.mobileNo,
						"salt": salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					const userObject = appUtils.buildToken(tokenData);
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
					let arn;
					if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
						// arn = await sns.registerAndroidUser(params.deviceToken);
						arn = "";
					} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
						// arn = await sns.registerIOSUser(params.deviceToken);
						arn = "";
					}
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					let step3;
					if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id });
					} else {
						const step2 = await loginHistoryDao.removeDeviceById({ "userId": step1._id, "deviceId": params.deviceId });
						step3 = await loginHistoryDao.findDeviceLastLogin({ "userId": step1._id, "deviceId": params.deviceId });
					}
					params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": step3 });
					const step4 = loginHistoryDao.createUserLoginHistory(params);
					let step5, step6;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step5 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
						else
							step5 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step1._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": step1._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step6 = redisClient.createJobs(jobPayload);
					}
					const step7 = await promise.join(step4, step5, step6);
					return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function socialSignup
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeList() function saves value in redis.
	 */
	async socialSignup(params: UserRequest.SocialSignup) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (step1 && !step1.isGoogleLogin && !step1.isFacebookLogin) {
					if (step1.email === params.email) {
						return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);
					}
				} else {
					const step2 = await userDao.socialSignup(params);
					const salt = await appUtils.CryptDataMD5(step2._id + "." + new Date().getTime() + "." + params.deviceId);
					const tokenData = _.extend(params, {
						"userId": step2._id,
						"firstName": step2.firstName,
						"middleName": step2.middleName,
						"lastName": step2.lastName,
						"email": step2.email,
						"countryCode": step2.countryCode,
						"mobileNo": step2.mobileNo,
						"salt": salt,
						"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
					});
					const userObject = appUtils.buildToken(tokenData); // build token data for generating access token
					const accessToken = await tokenManager.generateUserToken({ "type": "USER_LOGIN", "object": userObject, "salt": salt });
					let arn;
					if (params.platform === config.CONSTANT.DEVICE_TYPE.ANDROID) {
						// arn = await sns.registerAndroidUser(params.deviceToken);
						arn = "";
					} else if (params.platform === config.CONSTANT.DEVICE_TYPE.IOS) {
						// arn = await sns.registerIOSUser(params.deviceToken);
						arn = "";
					}
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					params = _.extend(params, { "arn": arn, "salt": salt, "refreshToken": refreshToken, "lastLogin": Date.now() });
					const step3 = loginHistoryDao.createUserLoginHistory(params);
					let step4, step5;
					if (config.SERVER.IS_REDIS_ENABLE) {
						if (!config.SERVER.IN_ACTIVITY_SESSION)
							step4 = redisClient.storeValue(accessToken, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
						else
							step4 = redisClient.setExp(accessToken, config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME / 1000, JSON.stringify({ "deviceId": params.deviceId, "salt": salt, "userId": step2._id }));
						const jobPayload = {
							jobName: config.CONSTANT.JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE,
							time: Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME,
							params: { "userId": step2._id, "deviceId": params.deviceId, "eventAlertTime": Date.now() + config.SERVER.LOGIN_TOKEN_EXPIRATION_TIME }
						};
						step5 = redisClient.createJobs(jobPayload);
					}
					const step6 = await promise.join(step3, step4, step5);
					return userConstant.MESSAGES.SUCCESS.LOGIN({ "accessToken": accessToken, "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function forgotPassword
	 */
	async forgotPassword(params: ForgotPasswordRequest) {
		try {
			if (!params.email && (!params.countryCode || !params.mobileNo)) {
				return Promise.reject(userConstant.MESSAGES.ERROR.EMAIL_OR_PHONE_REQUIRED);
			} else {
				const step1 = await userDao.findUserByEmailOrMobileNo(params);
				if (!step1) {
					if (params.email) {
						return Promise.reject(config.CONSTANT.MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
					} else {
						return Promise.reject(userConstant.MESSAGES.ERROR.MOBILE_NO_NOT_REGISTERED);
					}
				} else {
					if (step1.isGoogleLogin || step1.isFacebookLogin) {
						return Promise.reject(userConstant.MESSAGES.ERROR.CANNOT_CHANGE_PASSWORD);
					} else {
						const tokenData = _.extend(params, {
							"userId": step1._id,
							"name": step1.name,
							"email": step1.email,
							"countryCode": step1.countryCode,
							"mobileNo": step1.mobileNo,
							"accountLevel": config.CONSTANT.ACCOUNT_LEVEL.USER
						});
						const userObject = appUtils.buildToken(tokenData); // build token data for generating access token
						const accessToken = await tokenManager.generateUserToken({ type: "FORGOT_PASSWORD", object: userObject });
						if (params.email) {
							const step2 = userDao.addForgotToken({ "userId": step1._id, "forgotToken": accessToken }); // add forgot token
							const step3 = mailManager.forgotPasswordEmailToUser({ "email": params.email, "firstName": step1.firstName, "middleName": step1.middleName, "lastName": step1.lastName, "accessToken": accessToken });
							return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_EMAIL;
						} else {
							const step2 = smsManager.sendForgotPasswordLink(params.countryCode, params.mobileNo, accessToken);
							return userConstant.MESSAGES.SUCCESS.FORGOT_PASSWORD_ON_PHONE;
						}
					}
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changeForgotPassword
	 */
	async changeForgotPassword(params: ChangeForgotPasswordRequest, tokenData: TokenData) {
		try {
			const step1 = await userDao.findUserById(tokenData); // get user details
			params.hash = appUtils.encryptHashPassword(params.password, step1.salt); // generate hash
			const step2 = userDao.changeForgotPassword(params, tokenData);
			const step3 = userDao.emptyForgotToken({ "userId": tokenData.userId });
			const step4 = await promise.join(step2, step3);
			return userConstant.MESSAGES.SUCCESS.CHANGE_FORGOT_PASSWORD;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function refreshToken
	 */
	async refreshToken(params: RefreshTokenRequest, tokenData: TokenData) {
		try {
			if (!params.refreshToken) {
				return Promise.reject(userConstant.MESSAGES.ERROR.REFRESH_TOKEN_REQUIRED);
			} else {
				const step1 = await loginHistoryDao.findDeviceById(tokenData);
				if (step1.refreshToken !== params.refreshToken) {
					return Promise.reject(userConstant.MESSAGES.ERROR.INVALID_REFRESH_TOKEN);
				} else {
					const accessToken = tokenManager.refreshToken({ "object": tokenData, "salt": step1 ? step1.salt : config.SERVER.JWT_CERT_KEY }, config.CONSTANT.ACCOUNT_LEVEL.USER);
					const refreshToken = appUtils.encodeToBase64(appUtils.genRandomString(32));
					const step2 = loginHistoryDao.updateRefreshToken({
						"deviceId": tokenData.deviceId,
						"userId": tokenData.userId,
						"refreshToken": refreshToken
					});
					const step3 = await promise.join(accessToken, step2);
					return config.CONSTANT.MESSAGES.SUCCESS.REFRESH_TOKEN({ "accessToken": step3[0], "refreshToken": refreshToken });
				}
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function logout
	 */
	async logout(params: Device, tokenData: TokenData) {
		try {
			let step1;
			if (config.SERVER.IS_SINGLE_DEVICE_LOGIN) {
				step1 = loginHistoryDao.removeDeviceById(tokenData);
			} else {
				step1 = loginHistoryDao.removeDeviceById(tokenData);
			}
			let step2;
			if (config.SERVER.IS_REDIS_ENABLE) {
				step2 = redisClient.deleteKey(params.accessToken);
			}
			const step3 = await promise.join(step1, step2);
			return userConstant.MESSAGES.SUCCESS.LOGOUT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userList
	 */
	async userList(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_user") !== -1
			) {
				const step1 = await userDao.userList(params);
				return userConstant.MESSAGES.SUCCESS.USER_LIST({ "userList": step1.data, "totalRecord": step1.total });
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function exportUser
	 */
	async exportUser(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_user") !== -1
			) {
				const step1 = await userDao.exportUser(params);
				const step2 = await userMapper.exportUserResponseMapping(step1);
				const step3 = config.CONSTANT.EXPORT_SHEET.USER_LIST;
				let step4;
				if (params.type === "csv") {
					const valueArray = step3.map(value => value.header);
					const opts = { valueArray };
					const parser = new Parser(opts);
					step4 = parser.parse(step2);
				} else { // xlsx
					const sheetName = "";
					step4 = await appUtils.createStream(step2, step3, sheetName);
				}
				return userConstant.MESSAGES.SUCCESS.EXPORT_USER(step4);
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userListWithElasticSearch
	 */
	async userListWithElasticSearch(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_user") !== -1
			) {
				// If elastic search engine is enabled
				if (config.SERVER.IS_ELASTIC_SEARCH_ENABLE) {
					const step1 = await userDao.userListWithElasticSearch(params);
					params.pageNo = 1;
					params.limit = step1["hits"]["total"];
					const step2 = await userDao.userListWithElasticSearch(params);
					return userMapper.userListResponseMapping(step1, step2);
				} else {
					const step1 = await userDao.userList(params);
					return userConstant.MESSAGES.SUCCESS.USER_LIST({ "userList": step1.data, "totalRecord": step1.total });
				}
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _blockUser
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeSet() function saves value in redis.
	 */
	async _blockUser(params: BlockRequest, tokenData: TokenData) {
		try {
			const step1 = await userDao.blockUnblock(params);
			// store blocked_set as a key and userId as a value (redis SET)
			const step2 = await logDao.updateUser(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK_USER);
			return userConstant.MESSAGES.SUCCESS.BLOCK_USER;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _unblockUser
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.removeFromSet() function removes value in redis.
	 */
	async _unblockUser(params: BlockRequest, tokenData: TokenData) {
		try {
			const step1 = await userDao.blockUnblock(params);
			// remove userId from blocked_set (redis SET)
			const step2 = await logDao.updateUser(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK_USER);
			return userConstant.MESSAGES.SUCCESS.UNBLOCK_USER;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("block_user") !== -1
			) {
				switch (params.status) {
					case config.CONSTANT.STATUS.BLOCKED:
						return this._blockUser(params, tokenData);
					case config.CONSTANT.STATUS.UN_BLOCKED:
						return this._unblockUser(params, tokenData);
				}
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _multiBlockUser
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeSet() function saves value in redis.
	 */
	async _multiBlockUser(params: UserRequest.MultiBlock, tokenData: TokenData) {
		try {
			const userIds: any = params.userIds;
			// block users one by one
			await userIds.forEach(async (userId) => {
				params.userId = userId;
				const step1 = await userDao.multiBlockUnblock(params);
				const step2 = await logDao.updateUser(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.BLOCK_USER);
			});
			return userConstant.MESSAGES.SUCCESS.MULTI_BLOCK_USER;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _multiUnblockUser
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.removeFromSet() function removes value in redis.
	 */
	async _multiUnblockUser(params: UserRequest.MultiBlock, tokenData: TokenData) {
		try {
			const userIds: any = params.userIds;
			// un-block users one by one
			await userIds.forEach(async (userId) => {
				params.userId = userId;
				const step1 = await userDao.multiBlockUnblock(params);
				const step2 = await logDao.updateUser(step1, tokenData, config.CONSTANT.LOG_HISTORY_TYPE.UNBLOCK_USER);
			});
			return userConstant.MESSAGES.SUCCESS.MULTI_UNBLOCK_USER;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function multiBlockUnblock
	 */
	async multiBlockUnblock(params: UserRequest.MultiBlock, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("block_user") !== -1
			) {
				switch (params.status) {
					case config.CONSTANT.STATUS.BLOCKED:
						return this._multiBlockUser(params, tokenData);
					case config.CONSTANT.STATUS.UN_BLOCKED:
						return this._multiUnblockUser(params, tokenData);
				}
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteUser
	 * @description if IS_REDIS_ENABLE set to true,
	 * than redisClient.storeSet() function saves value in redis.
	 */
	async deleteUser(params: UserId, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("deconst e_user") !== -1
			) {
				const step1 = userDao.deleteUser(params);
				// store deconst ed_set as a key and userId as a value (redis SET)
				let step2;
				if (config.SERVER.IS_REDIS_ENABLE) {
					step2 = redisClient.storeSet("deconst ed_set", [params.userId]);
				}
				const step3 = contactDao.deleteContactOnRemoveAccount(params); // update contacts & to change isAppUser=false when the account is removed
				const step4 = loginHistoryDao.removeDeviceById({ "userId": params.userId });
				const step5 = await promise.join(step1, step2, step3, step4);
				const step6 = await logDao.deleteUser(step5[0], tokenData);
				return userConstant.MESSAGES.SUCCESS.DELETE_USER;
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userDetails
	 */
	async userDetails(params: UserId, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("view_user") !== -1
			) {
				const step1 = await userDao.findUserById(params);
				return userConstant.MESSAGES.SUCCESS.USER_DETAILS(step1);
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function profile
	 */
	async profile(tokenData: TokenData) {
		try {
			delete tokenData.deviceId, delete tokenData.deviceToken, delete tokenData.platform, delete tokenData.accountLevel;
			return userConstant.MESSAGES.SUCCESS.PROFILE(tokenData);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function sampleFile
	 */
	async sampleFile(params: ListingRequest, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("import_user") !== -1
			) {
				const step1 = [{ "S No.": "1", "First Name": "John", "Middle Name": "K", "Last Name": "Doe", "DOB": "1570893532681", "Gender": "Male", "Email": "johndoe@yopmail.com", "Country Code": "", "Moblile Number": "" }];
				const step2 = config.CONSTANT.EXPORT_SHEET.FILE_SAMPLE;
				let step3;
				if (params.type === "csv") {
					const valueArray = step2.map(value => value.header);
					const opts = { valueArray };
					const parser = new Parser(opts);
					step3 = parser.parse(step1);
				} else { // xlsx
					const sheetName = "";
					step3 = await appUtils.createStream(step1, step2, sheetName);
				}
				return userConstant.MESSAGES.SUCCESS.EXPORT_USER(step3);
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}

	// /**
	//  * @function _addUserOnImport
	//  */
	// const _addUserOnImport = async function (params) {
	// 	const  step1 = await userDao.findUserByEmailOrMobileNo(params);
	// 	if (!step1) {
	// 		return await userDao.addUser(params);
	// 	} else {
	// 		return await userDao.updateUser(params);
	// 	}
	// };

	/**
	 * @function _addUserOnImport
	 */
	async _addUserOnImport(params) {
		try {
			const array = [];
			const promiseResult = [];
			for (let i = 0; i < params.parseJson.length; i++) {
				const data = params.parseJson[i];
				if (!data["email"] && (!data["countryCode"] || !data["mobileNo"]) || !data["firstName"]) {
					const required = [];
					if (!data["email"] && (!data["countryCode"] || !data["countryCode"])) {
						data.email = "";
						required.push("Email or (Country Code + Phone Number)");
					}
					if (!data["countryCode"] && data["mobileNo"]) {
						data.countryCode = "";
						required.push("Country Code");
					}
					if (!data["mobileNo"] && data["countryCode"]) {
						data.mobileNo = "";
						required.push("Mobile Number");
					}
					if (!data["firstName"]) {
						data.firstName = "";
						required.push("First Name");
					}
					data.sno = i + 1;
					required.length === 1 ? data.reason = required[0] + " is required." : required.reduce((accumulator, currentValue) => data.reason = accumulator + ", " + currentValue + " is required.");
					array.push({
						"S No.": data.sno, "First Name": data.firstName, "Middle Name": data.middleName, "Last Name": data.lastName,
						"DOB": data.dob, "Gender": data.gender, "Country Code": data.countryCode, "Mobile Number": data.mobileNo,
						"Email": data.email, "Failed Reason": data.reason
					});
					promiseResult.push([]);
				} else if (data["email"] ? !appUtils.isValidEmail(data["email"]) : false) {
					data.sno = i + 1;
					data.reason = "Email id is not valid.";
					array.push({
						"S No.": data.sno, "First Name": data.firstName, "Middle Name": data.middleName, "Last Name": data.lastName,
						"DOB": data.dob, "Gender": data.gender, "Country Code": data.countryCode, "Mobile Number": data.mobileNo,
						"Email": data.email, "Failed Reason": data.reason
					});
					promiseResult.push([]);
				} else if ((data["countryCode"] && data["mobileNo"]) ? !appUtils.isValidMobileNumber(data["countryCode"] + "" + data["mobileNo"]) : false) {
					data.sno = i + 1;
					data.reason = "Phone number is not valid.";
					array.push({
						"S No.": data.sno, "First Name": data.firstName, "Middle Name": data.middleName, "Last Name": data.lastName,
						"DOB": data.dob, "Gender": data.gender, "Country Code": data.countryCode, "Mobile Number": data.mobileNo,
						"Email": data.email, "Failed Reason": data.reason
					});
					promiseResult.push([]);
				} else {
					const step1 = await userDao.findUserByEmailOrMobileNo(data);
					if (step1) {
						if (step1.email === data.email) {
							data.sno = i + 1;
							data.reason = "Email id already exist.";
							array.push({
								"S No.": data.sno, "First Name": data.firstName, "Middle Name": data.middleName, "Last Name": data.lastName,
								"DOB": data.dob, "Gender": data.gender, "Country Code": data.countryCode, "Mobile Number": data.mobileNo,
								"Email": data.email, "Failed Reason": data.reason
							});
						} else { // when phone number matched
							data.sno = i + 1;
							data.reason = "Phone number already exist.";
							array.push({
								"S No.": data.sno, "First Name": data.firstName, "Middle Name": data.middleName, "Last Name": data.lastName,
								"DOB": data.dob, "Gender": data.gender, "Country Code": data.countryCode, "Mobile Number": data.mobileNo,
								"Email": data.email, "Failed Reason": data.reason
							});
						}
					} else {
						const required = [];
						if (!data["countryCode"] && data["mobileNo"]) {
							data.countryCode = "";
							required.push("Country Code");
						}
						if (!data["mobileNo"] && data["countryCode"]) {
							data.mobileNo = "";
							required.push("Mobile Number");
						}
						if (required.length) {
							data.sno = i + 1;
							required.length === 1 ? data.reason = required[0] + " is required." : required.reduce((accumulator, currentValue) => data.reason = accumulator + ", " + currentValue + " is required.");
							array.push({
								"S No.": data.sno, "First Name": data.firstName, "Middle Name": data.middleName, "Last Name": data.lastName,
								"DOB": data.dob, "Gender": data.gender, "Country Code": data.countryCode, "Mobile Number": data.mobileNo,
								"Email": data.email, "Failed Reason": data.reason
							});
						} else {
							data.password = appUtils.generatePassword();
							if (data.gender) {
								data.gender = (data.gender === "Male") ? config.CONSTANT.GENDER.MALE : config.CONSTANT.GENDER.FEMALE;
							}
							if (data.dob) {
								data.dob = appUtils.convertStringDateToTimestamp(data.dob);
								data.age = appUtils.calculateAge(data.dob);
							}
							console.log("_addUserOnImport============================>", data);
							const step2 = await userDao.addUser(data);
							if (data.email) {
								const step3 = mailManager.sendPassword({ "email": step2.email, "firstName": step2.firstName, "middleName": step2.middleName, "lastName": step2.lastName, "password": data.password });
							}
							if (data.countryCode && data.mobileNo) {
								const step4 = smsManager.sendPassword({ "email": step2.email, "countryCode": data.countryCode, "mobileNo": data.mobileNo, "password": data.password });
							}
						}
						promiseResult.push([]);
					}
				}
			}
			const step1 = await Promise.all(promiseResult);
			return array;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _importXLSXFile
	 */
	async _importXLSXFile(params: UserRequest.ImportUsers, tokenData: TokenData) {
		try {
			const json = await xlsx.readAndParseXLSX(params.file);
			const parseJson = appUtils.readAndParseJSON(json);
			// await parseJson.forEach(async (data) => {
			// 	const  step1 = await _addUserOnImport(data);
			// });
			const step1 = await this._addUserOnImport({ "parseJson": parseJson });
			console.log("_importXLSXFile===============================>", step1);
			if (step1.length) {
				const step2 = config.CONSTANT.EXPORT_SHEET.FAILED_USER_LIST;
				const sheetName = "";
				const createInstace = await appUtils.createStream(step1, step2, sheetName);
				const dataBuffer: Buffer = await createInstace.writeBuffer();
				const step4 = await mailManager.sendFailedUserSheetToAdmin({ "email": tokenData.email, "name": tokenData.name, "type": "xlsx", "file": params.file, "data": dataBuffer });
				// const fileName: string = new Date().getTime() + "_users";
				// const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}.xlsx`;
				// await createInstace.writeFile(filePath);
				// const  step4 = await mailManager.sendFailedUserSheetToAdmin({ "email": tokenData.email, "name": tokenData.name, "type": "xlsx", "file": params.file, "data": filePath });
				// appUtils.deconst eFiles(filePath);
			}
			return userConstant.MESSAGES.SUCCESS.IMPORT_USER;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function _importCSVFile
	 */
	async _importCSVFile(params: UserRequest.ImportUsers, tokenData: TokenData) {
		try {
			const json = await csv.readAndParseCSV(params.file);
			const parseJson = appUtils.readAndParseJSON(json);
			// await parseJson.forEach(async (data) => {
			// 	const  step1 = await _addUserOnImport(data);
			// });
			const step1 = await this._addUserOnImport({ "parseJson": parseJson });
			console.log("_importCSVFile===============================>", step1);
			if (step1.length) {
				const step2 = config.CONSTANT.EXPORT_SHEET.FAILED_USER_LIST;
				const valueArray = step2.map(value => value.header);
				const opts = { valueArray };
				const parser = new Parser(opts);
				const step3 = parser.parse(step1);
				const fileName: string = new Date().getTime() + "_users";
				const filePath = `${config.SERVER.UPLOAD_DIR}${fileName}.csv`;
				const wstream = fs.createWriteStream(filePath);
				await wstream.write(step3);
				wstream.end();
				const step4 = await mailManager.sendFailedUserSheetToAdmin({ "email": tokenData.email, "name": tokenData.name, "type": "csv", "file": params.file, "url": filePath });
				await appUtils.deleteFiles(filePath);
			}
			return userConstant.MESSAGES.SUCCESS.IMPORT_USER;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function importUsers
	 */
	async importUsers(params: UserRequest.ImportUsers, tokenData: TokenData) {
		try {
			if (
				tokenData.adminType === config.CONSTANT.ADMIN_TYPE.SUPER_ADMIN ||
				tokenData.permission.indexOf("import_user") !== -1
			) {
				const excelMime = mimeType.excel;
				switch (params.file.hapi.headers["content-type"]) {
					case config.CONSTANT.MIME_TYPE.XLSX:
					case excelMime[0].mimetype:
						return this._importXLSXFile(params, tokenData);
					// case config.CONSTANT.MIME_TYPE.XLS:
					// case excelMime[1].mimetype:
					// 	return _importXLSXFile(params, tokenData);
					case config.CONSTANT.MIME_TYPE.CSV1:
					case config.CONSTANT.MIME_TYPE.CSV2:
					case excelMime[2].mimetype:
					case excelMime[3].mimetype:
						return this._importCSVFile(params, tokenData);
				}
			} else {
				return Promise.reject(config.CONSTANT.MESSAGES.ERROR.UNAUTHORIZED_ACCESS);
			}
		} catch (error) {
			throw error;
		}
	}
}

export const userController = new UserController();